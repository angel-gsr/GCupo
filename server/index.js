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
const usuariosSqlPath = path.join(projectRoot, 'src', 'databases', 'usuariosDB.sql');
const profesoresSqlPath = path.join(projectRoot, 'src', 'databases', 'profesoresDB.sql');
const horariosSqlPath = path.join(projectRoot, 'src', 'databases', 'horariosDB.sql');
const require = createRequire(import.meta.url);

const app = express();
const port = 3001;
let databaseInstance = null;

function normalizePlanStudiesSql(sql) {
  return sql
    .replace(/DROP DATABASE IF EXISTS\s+\w+;\s*/gi, '')
    .replace(/CREATE DATABASE\s+\w+;\s*/gi, '')
    .replace(/USE\s+\w+;\s*/gi, '')
    .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
    .replace(/INSERT\s+INTO\s+prerrequisitos\s*(?=SELECT)/gi, 'INSERT INTO prerrequisitos (id_materia, id_prerrequisito) ')
    .replace(/SELECT\s+m\.id_materia\s*,\s*p\.id_materia\s+WHERE/gi, 'SELECT m.id_materia, p.id_materia FROM materias m, materias p WHERE');
}

function normalizeSql(sql) {
  return sql
    .replace(/DROP DATABASE IF EXISTS\s+\w+;\s*/gi, '')
    .replace(/CREATE DATABASE\s+\w+;\s*/gi, '')
    .replace(/USE\s+\w+;\s*/gi, '')
    .replace(/INT AUTO_INCREMENT PRIMARY KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT');
}

function getExistingSchedules(database) {
  try {
    return rowsFromQuery(
      database,
      `
        SELECT salon, materia, profesor, cupo, dia, horaInicio, horaFin
        FROM horarios
      `,
    );
  } catch {
    return [];
  }
}

function persistDatabase(database) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dbPath, Buffer.from(database.export()));
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
  const planSql = fs.readFileSync(planEstudiosSqlPath, 'utf8');
  const aulasSql = fs.readFileSync(aulasSqlPath, 'utf8');
  const usuariosSql = fs.readFileSync(usuariosSqlPath, 'utf8');
  const profesoresSql = fs.readFileSync(profesoresSqlPath, 'utf8');
  const horariosSql = fs.readFileSync(horariosSqlPath, 'utf8');
  const existingSchedules = [];

  if (fs.existsSync(dbPath)) {
    const existingDb = new SQL.Database(fs.readFileSync(dbPath));
    existingSchedules.push(...getExistingSchedules(existingDb));
    existingDb.close();
  }

  const database = new SQL.Database();
  database.exec(normalizePlanStudiesSql(planSql));
  database.exec(aulasSql);
  database.exec(normalizeSql(usuariosSql));
  database.exec(normalizeSql(profesoresSql));
  database.exec(normalizeSql(horariosSql));

  if (existingSchedules.length > 0) {
    const insertSchedule = database.prepare(
      `
        INSERT INTO horarios (salon, materia, profesor, cupo, dia, horaInicio, horaFin)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    );

    try {
      database.exec('BEGIN TRANSACTION');

      existingSchedules.forEach((schedule) => {
        insertSchedule.run([
          schedule.salon,
          schedule.materia,
          schedule.profesor,
          schedule.cupo,
          schedule.dia,
          schedule.horaInicio,
          schedule.horaFin,
        ]);
      });

      database.exec('COMMIT');
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    } finally {
      insertSchedule.free();
    }
  }

  persistDatabase(database);

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
          a.nombre AS area,
          s.nombre AS semestre,
          COALESCE(GROUP_CONCAT(p.nombre, ' | '), '') AS prerrequisitos
        FROM materias m
        INNER JOIN areas a ON a.id_area = m.id_area
        INNER JOIN semestres s ON s.id_semestre = m.id_semestre
        LEFT JOIN prerrequisitos pr ON pr.id_materia = m.id_materia
        LEFT JOIN materias p ON p.id_materia = pr.id_prerrequisito
        GROUP BY m.id_materia, m.clave, m.nombre, m.creditos, a.nombre, s.nombre, s.id_semestre
        ORDER BY s.id_semestre ASC, m.nombre ASC
      `,
    );

    response.json(
      rows.map((row) => ({
        clave: row.clave,
        nombre: row.nombre,
        creditos: Number(row.creditos),
        area: row.area,
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
        SELECT id, salon, materia, profesor, cupo, dia, horaInicio, horaFin
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
        cupo: Number(row.cupo ?? 0),
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

app.get('/api/teachers', async (_request, response) => {
  try {
    const database = await getDatabase();
    const rows = rowsFromQuery(
      database,
      `
        SELECT
          p.id,
          p.nombre,
          p.departamento,
          p.especialidad,
          p.email,
          p.telefono,
          p.horas_asignadas,
          p.horas_maximas,
          p.disponible,
          COALESCE(GROUP_CONCAT(pm.materia, ' | '), '') AS materias
        FROM profesores p
        LEFT JOIN profesor_materias pm ON pm.profesor_id = p.id
        GROUP BY p.id, p.nombre, p.departamento, p.especialidad, p.email, p.telefono, p.horas_asignadas, p.horas_maximas, p.disponible
        ORDER BY p.departamento ASC, p.nombre ASC
      `,
    );

    response.json(
      rows.map((row) => ({
        id: String(row.id),
        nombre: row.nombre,
        departamento: row.departamento,
        especialidad: row.especialidad,
        email: row.email,
        telefono: row.telefono,
        horasAsignadas: Number(row.horas_asignadas),
        horasMaximas: Number(row.horas_maximas),
        disponible: Number(row.disponible) === 1,
        materias: row.materias ? String(row.materias).split(' | ') : [],
      })),
    );
  } catch (error) {
    console.error('Failed to load teachers', error);
    response.status(500).json({ error: 'No se pudieron cargar los profesores desde la base SQL.' });
  }
});

app.post('/api/login', async (request, response) => {
  try {
    const id = String(request.body?.id ?? '').trim();
    const password = String(request.body?.password ?? '').trim();

    if (!/^\d{6}$/.test(id) || !password) {
      response.status(400).json({ error: 'Debes ingresar un ID de 6 dígitos y una contraseña.' });
      return;
    }

    const database = await getDatabase();
    const statement = database.prepare(
      `
        SELECT id, nombre, rol
        FROM usuarios
        WHERE id = ? AND contrasena = ?
        LIMIT 1
      `,
    );

    try {
      statement.bind([id, password]);
      if (!statement.step()) {
        response.status(401).json({ error: 'ID o contraseña incorrectos.' });
        return;
      }

      const user = statement.getAsObject();
      response.json({
        ok: true,
        user: {
          id: String(user.id),
          nombre: String(user.nombre),
          rol: String(user.rol),
        },
      });
    } finally {
      statement.free();
    }
  } catch (error) {
    console.error('Failed to authenticate user', error);
    response.status(500).json({ error: 'No se pudo validar el acceso del usuario.' });
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
        INSERT INTO horarios (salon, materia, profesor, cupo, dia, horaInicio, horaFin)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    );

    try {
      database.exec('BEGIN TRANSACTION');

      schedules.forEach((schedule) => {
        insert.run([
          schedule.salon,
          schedule.materia,
          schedule.profesor,
          Number(schedule.cupo ?? 0),
          schedule.dia,
          schedule.horaInicio,
          schedule.horaFin,
        ]);
      });

      database.exec('COMMIT');
      persistDatabase(database);
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
