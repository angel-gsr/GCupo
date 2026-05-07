BEGIN TRANSACTION;

DROP TABLE IF EXISTS horarios;

CREATE TABLE horarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  salon TEXT NOT NULL,
  materia TEXT NOT NULL,
  profesor TEXT NOT NULL,
  cupo INTEGER NOT NULL,
  dia TEXT NOT NULL,
  horaInicio TEXT NOT NULL,
  horaFin TEXT NOT NULL
);

CREATE INDEX idx_horarios_salon ON horarios (salon);
CREATE INDEX idx_horarios_dia ON horarios (dia);

COMMIT;
