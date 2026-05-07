BEGIN TRANSACTION;

DROP TABLE IF EXISTS profesor_materias;
DROP TABLE IF EXISTS profesores;

CREATE TABLE profesores (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  departamento TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  horas_asignadas INTEGER NOT NULL DEFAULT 0,
  horas_maximas INTEGER NOT NULL DEFAULT 18,
  disponible INTEGER NOT NULL DEFAULT 1 CHECK (disponible IN (0, 1))
);

CREATE TABLE profesor_materias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profesor_id INTEGER NOT NULL,
  materia TEXT NOT NULL,
  FOREIGN KEY (profesor_id) REFERENCES profesores(id)
);

INSERT INTO profesores (id, nombre, departamento, especialidad, email, telefono, horas_asignadas, horas_maximas, disponible) VALUES
  (1, 'Dr. Roberto Sánchez', 'Ciencia Básica', 'Matemáticas Aplicadas', 'roberto.sanchez@udlap.mx', '222-229-2000 ext. 1234', 12, 18, 1),
  (2, 'Mtra. Ana García', 'Programación y Datos', 'Ingeniería de Software', 'ana.garcia@udlap.mx', '222-229-2000 ext. 2345', 16, 18, 1),
  (3, 'Dr. Carlos Mendoza', 'Tronco Común', 'Historia y Comunicación', 'carlos.mendoza@udlap.mx', '222-229-2000 ext. 3456', 9, 18, 1),
  (4, 'Mtro. Jorge Ramírez', 'Negocios y Gestión', 'Finanzas Corporativas', 'jorge.ramirez@udlap.mx', '222-229-2000 ext. 4567', 8, 18, 1),
  (5, 'Dra. Patricia López', 'Ciencia Básica', 'Química Analítica', 'patricia.lopez@udlap.mx', '222-229-2000 ext. 5678', 14, 18, 1),
  (6, 'Mtra. Laura Hernández', 'Tronco Común', 'Comunicación Estratégica', 'laura.hernandez@udlap.mx', '222-229-2000 ext. 6789', 12, 18, 1),
  (7, 'Dr. Miguel Torres', 'Programación y Datos', 'Sistemas de Información', 'miguel.torres@udlap.mx', '222-229-2000 ext. 7890', 10, 18, 1),
  (8, 'Dr. Fernando Ruiz', 'Economía', 'Teoría Económica', 'fernando.ruiz@udlap.mx', '222-229-2000 ext. 8901', 6, 18, 1),
  (9, 'Mtra. Sofía Martínez', 'Psicología', 'Psicología Clínica', 'sofia.martinez@udlap.mx', '222-229-2000 ext. 9012', 8, 18, 1),
  (10, 'Dr. Ricardo Flores', 'Ingeniería', 'Física Aplicada', 'ricardo.flores@udlap.mx', '222-229-2000 ext. 0123', 12, 18, 1),
  (11, 'Mtro. Diego Navarro', 'Programación y Datos', 'Bases de Datos', 'diego.navarro@udlap.mx', '222-229-2000 ext. 1122', 10, 18, 1),
  (12, 'Dra. Elena Castro', 'Ingeniería de Software', 'Arquitectura de Software', 'elena.castro@udlap.mx', '222-229-2000 ext. 3344', 8, 18, 1),
  (13, 'Mtro. Arturo Pérez', 'Electrónica y Sistemas', 'Circuitos y Sistemas Embebidos', 'arturo.perez@udlap.mx', '222-229-2000 ext. 5566', 7, 18, 1),
  (14, 'Dra. Marisol Vega', 'Ciencia Básica', 'Estadística y Probabilidad', 'marisol.vega@udlap.mx', '222-229-2000 ext. 7788', 6, 18, 1),
  (15, 'Mtro. Sergio León', 'Programación y Datos', 'Inteligencia Artificial', 'sergio.leon@udlap.mx', '222-229-2000 ext. 9900', 9, 18, 1),
  (16, 'Dra. Verónica Ríos', 'Tronco Común', 'Lengua y Redacción', 'veronica.rios@udlap.mx', '222-229-2000 ext. 2211', 5, 18, 1);

INSERT INTO profesor_materias (profesor_id, materia) VALUES
  (1, 'Matemáticas Universitarias'),
  (1, 'Álgebra Lineal'),
  (1, 'Cálculo I'),
  (1, 'Cálculo II'),
  (1, 'Probabilidad y Estadística'),
  (1, 'Ecuaciones Diferenciales'),
  (2, 'Algoritmos y Programación'),
  (2, 'POO'),
  (2, 'Estructuras de Datos'),
  (2, 'Arquitectura Computacional'),
  (3, 'Argumentación Académica'),
  (3, 'Escritura Académica'),
  (3, 'Lengua Extranjera I'),
  (3, 'Lengua Extranjera II'),
  (4, 'Contabilidad Financiera'),
  (4, 'Auditoría'),
  (4, 'Análisis Financiero'),
  (4, 'Gestión de Sistemas'),
  (5, 'Química General'),
  (5, 'Química Orgánica'),
  (5, 'Bioquímica'),
  (5, 'Física General I'),
  (6, 'Comunicación Oral y Escrita'),
  (6, 'Redacción Profesional'),
  (6, 'Periodismo'),
  (6, 'Interacción Humano-Computadora'),
  (7, 'Bases de Datos'),
  (7, 'Bases de Datos Avanzadas'),
  (7, 'Sistemas Operativos'),
  (7, 'Desarrollo Web'),
  (8, 'Microeconomía'),
  (8, 'Macroeconomía'),
  (8, 'Economía Internacional'),
  (9, 'Psicología General'),
  (9, 'Psicología Social'),
  (9, 'Desarrollo Humano'),
  (10, 'Física I'),
  (10, 'Física II'),
  (10, 'Mecánica de Materiales'),
  (11, 'Bases de Datos'),
  (11, 'Redes'),
  (11, 'Cloud y Big Data'),
  (12, 'Ingeniería de Software'),
  (12, 'Sistemas Distribuidos'),
  (12, 'Seguridad Informática'),
  (13, 'Circuitos Eléctricos'),
  (13, 'Lab Circuitos'),
  (13, 'Sistemas Embebidos'),
  (14, 'Matemáticas Universitarias'),
  (14, 'Probabilidad y Estadística'),
  (14, 'Análisis Numérico'),
  (15, 'Inteligencia Artificial'),
  (15, 'Visión Artificial'),
  (15, 'Temas Selectos I'),
  (16, 'Lengua Extranjera III'),
  (16, 'Argumentación Académica'),
  (16, 'Escritura Académica');

COMMIT;
