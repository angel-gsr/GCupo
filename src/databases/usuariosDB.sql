BEGIN TRANSACTION;

DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  contrasena TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'admin'
);

INSERT INTO usuarios (id, nombre, contrasena, rol) VALUES
  ('181266', 'Administración 1', 'admin1', 'admin'),
  ('180892', 'Administración 2', 'admin2', 'admin'),
  ('177941', 'Administración 3', 'admin3', 'admin'),
  ('180593', 'Administración 4', 'admin4', 'admin'),
  ('180293', 'Administración 5', 'admin5', 'admin');

COMMIT;
