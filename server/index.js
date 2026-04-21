import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import initSqlJs from 'sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'admin.sqlite');
const aulasSqlPath = path.join(projectRoot, 'src', 'databases', 'aulasDB.sql');
const planEstudiosSqlPath = path.join(projectRoot, 'src', 'databases', 'LIS_planestudiosDB.sql');
const require = createRequire(import.meta.url);

const app = express();
const port = 3001;
let databaseInstance = null;

function normalizePlanStudiesSql(sql) {
  return sql
    .replace(/DROP DATABASE IF EXISTS plan_sistemas;\s*/gi, '')
    .replace(/CREATE DATABASE plan_sistemas;\s*/gi, '')
    .replace(/USE plan_sistemas;\s*/gi, '')
    .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
    .replace(/INSERT\s+INTO\s+prerrequisitos\s*(?=SELECT)/gi, 'INSERT INTO prerrequisitos (id_materia, id_prerrequisito) ');
}

async function getSqlJs() {
  const sqlJsDir = path.dirname(require.resolve('sql.js/package.json'));
  return initSqlJs({
    locateFile: (file) => path.join(sqlJsDir, 'dist', file),
  });
}

async function getDatabase() {
  if (databaseInstance) {
    return databaseInstance;
  }

  const SQL = await getSqlJs();
  let database;

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    database = new SQL.Database(fileBuffer);
  } else {
    database = new SQL.Database();
    const planSql = fs.readFileSync(planEstudiosSqlPath, 'utf8');
    const aulasSql = fs.readFileSync(aulasSqlPath, 'utf8');
    database.exec(normalizePlanStudiesSql(planSql));
    database.exec(aulasSql);
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(dbPath, Buffer.from(database.export()));
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS horarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      salon TEXT NOT NULL,
      materia TEXT NOT NULL,
      profesor TEXT NOT NULL,
      dia TEXT NOT NULL,
      horaInicio TEXT NOT NULL,
      horaFin TEXT NOT NULL
    );
  `);

  databaseInstance = database;
  return databaseInstance;
}

function rowsFromQuery(database, sql) {
  const statement = database.prepare(sql);
  const rows = [];

  try {
    while (statement.step()) {
      rows.push(statement.getAsObject());
    }
  } finally {
    statement.free();
  }

  return rows;
}

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_request, response) => {
  await getDatabase();
  response.json({ ok: true });
});

app.get('/api/classrooms', async (_request, response) => {
  try {
    const database = await getDatabase();
    const rows = rowsFromQuery(
      database,
      `
        SELECT id, nombre, edificio, capacidad, ocupacion, equipamiento, disponible
        FROM aulas
        ORDER BY nombre ASC
      `,
    );

    response.json(
      rows.map((row) => ({
        id: String(row.id),
        nombre: row.nombre,
        edificio: row.edificio,
        capacidad: Number(row.capacidad),
        ocupacion: Number(row.ocupacion),
        equipamiento: String(row.equipamiento)
          .split(',')
          .map((item) => item.trim()),
        disponible: Number(row.disponible) === 1,
      })),
    );
  } catch (error) {
    console.error('Failed to load classrooms', error);
    response.status(500).json({ error: 'No se pudieron cargar los salones desde la base SQL.' });
  }
});

app.get('/api/subjects', async (_request, response) => {
  try {
    const database = await getDatabase();
    const rows = rowsFromQuery(
      database,
      `
        SELECT
          m.clave,
          m.nombre,
          m.creditos,
          s.nombre AS semestre,
          COALESCE(GROUP_CONCAT(p.nombre, ' | '), '') AS prerrequisitos
        FROM materias m
        INNER JOIN semestres s ON s.id_semestre = m.id_semestre
        LEFT JOIN prerrequisitos pr ON pr.id_materia = m.id_materia
        LEFT JOIN materias p ON p.id_materia = pr.id_prerrequisito
        GROUP BY m.id_materia, m.clave, m.nombre, m.creditos, s.nombre, s.id_semestre
        ORDER BY s.id_semestre ASC, m.nombre ASC
      `,
    );

    response.json(
      rows.map((row) => ({
        clave: row.clave,
        nombre: row.nombre,
        creditos: Number(row.creditos),
        semestre: row.semestre,
        prerrequisitos: row.prerrequisitos ? String(row.prerrequisitos).split(' | ') : [],
      })),
    );
  } catch (error) {
    console.error('Failed to load subjects', error);
    response.status(500).json({ error: 'No se pudieron cargar las materias desde el plan de estudios SQL.' });
  }
});

app.get('/api/schedules', async (_request, response) => {
  try {
    const database = await getDatabase();
    const rows = rowsFromQuery(
      database,
      `
        SELECT id, salon, materia, profesor, dia, horaInicio, horaFin
        FROM horarios
        ORDER BY salon ASC, dia ASC, horaInicio ASC
      `,
    );

    response.json(
      rows.map((row) => ({
        id: Number(row.id),
        salon: row.salon,
        materia: row.materia,
        profesor: row.profesor,
        dia: row.dia,
        horaInicio: row.horaInicio,
        horaFin: row.horaFin,
      })),
    );
  } catch (error) {
    console.error('Failed to load schedules', error);
    response.status(500).json({ error: 'No se pudieron cargar los horarios desde la base SQL.' });
  }
});

app.post('/api/schedules', async (request, response) => {
  try {
    const schedules = Array.isArray(request.body?.schedules) ? request.body.schedules : [];

    if (schedules.length === 0) {
      response.status(400).json({ error: 'Debes enviar al menos un horario.' });
      return;
    }

    const database = await getDatabase();
    const insert = database.prepare(
      `
        INSERT INTO horarios (salon, materia, profesor, dia, horaInicio, horaFin)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
    );

    try {
      database.exec('BEGIN TRANSACTION');

      schedules.forEach((schedule) => {
        insert.run([
          schedule.salon,
          schedule.materia,
          schedule.profesor,
          schedule.dia,
          schedule.horaInicio,
          schedule.horaFin,
        ]);
      });

      database.exec('COMMIT');
      fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(dbPath, Buffer.from(database.export()));
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    } finally {
      insert.free();
    }

    response.status(201).json({ ok: true });
  } catch (error) {
    console.error('Failed to save schedules', error);
    response.status(500).json({ error: 'No se pudieron guardar los horarios en la base SQL.' });
  }
});

app.listen(port, () => {
  console.log(`SQL API running at http://localhost:${port}`);
});
