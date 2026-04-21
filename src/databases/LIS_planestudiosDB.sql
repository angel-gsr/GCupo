-- =========================================
-- BASE DE DATOS
-- =========================================
DROP DATABASE IF EXISTS plan_sistemas;
CREATE DATABASE plan_sistemas;
USE plan_sistemas;

-- =========================================
-- TABLAS
-- =========================================

-- Semestres
CREATE TABLE semestres (
    id_semestre INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL
);

-- Materias
CREATE TABLE materias (
    id_materia INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(10) UNIQUE,
    nombre VARCHAR(255),
    creditos INT,
    id_semestre INT,
    FOREIGN KEY (id_semestre) REFERENCES semestres(id_semestre)
);

-- Prerrequisitos
CREATE TABLE prerrequisitos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_materia INT,
    id_prerrequisito INT,
    FOREIGN KEY (id_materia) REFERENCES materias(id_materia),
    FOREIGN KEY (id_prerrequisito) REFERENCES materias(id_materia)
);

-- =========================================
-- SEMESTRES
-- =========================================
INSERT INTO semestres (nombre) VALUES
('Primero'),
('Segundo'),
('Tercero'),
('Cuarto'),
('Quinto'),
('Sexto'),
('Séptimo'),
('Octavo');

-- =========================================
-- MATERIAS
-- =========================================

-- 1°
INSERT INTO materias (clave, nombre, creditos, id_semestre) VALUES
('LIS1012','Algoritmos y Programación',6,1),
('MAT1012','Matemáticas Universitarias',6,1);

-- 2°
INSERT INTO materias VALUES
(NULL,'MAT1032','Álgebra Lineal',6,2),
(NULL,'FIS1012','Física General I',6,2),
(NULL,'FIS1022','Laboratorio de Física General I',3,2),
(NULL,'MAT1022','Cálculo I',6,2),
(NULL,'LIS1022','Programación Orientada a Objetos',6,2);

-- 3°
INSERT INTO materias VALUES
(NULL,'LRT2022','Diseño Digital',6,3),
(NULL,'FIS2012','Física General II',6,3),
(NULL,'FIS2022','Laboratorio de Física General II',3,3),
(NULL,'MAT2012','Cálculo II',6,3),
(NULL,'LIS2032','Estructuras de Datos',6,3);

-- 4°
INSERT INTO materias VALUES
(NULL,'MAT2082','Probabilidad y Estadística',6,4),
(NULL,'MAT2052','Ecuaciones Diferenciales Ordinarias',6,4),
(NULL,'LIS2022','Arquitecturas Computacionales',6,4),
(NULL,'LRT2012','Circuitos Eléctricos',6,4),
(NULL,'LRT2032','Laboratorio de Circuitos Eléctricos',2,4),
(NULL,'LIS2062','Sistemas Operativos',6,4);

-- 5°
INSERT INTO materias VALUES
(NULL,'LFA3082','Análisis Numérico',6,5),
(NULL,'LRT3032','Sistemas Embebidos',6,5),
(NULL,'LIS3032','Interacción Humano-Computadora',6,5),
(NULL,'LIS3042','Teoría de la Computación',6,5),
(NULL,'LIS3052','Prácticas en la Profesión 1',6,5),
(NULL,'LIS2082','Bases de Datos',6,5);

-- 6°
INSERT INTO materias VALUES
(NULL,'LIS3012','Bases de Datos Avanzados',6,6),
(NULL,'LIS3082','Inteligencia Artificial',6,6),
(NULL,'LIS3092','Laboratorio de Videojuegos',6,6),
(NULL,'LIS3022','Graficación y Videojuegos',6,6),
(NULL,'LIS3062','Ingeniería de Software',6,6),
(NULL,'LIS3122','Redes y Telecomunicaciones',6,6),
(NULL,'LIS3132','Laboratorio de Redes',2,6);

-- 7°
INSERT INTO materias VALUES
(NULL,'LIS4062','Seguridad Informática',6,7),
(NULL,'LIS4022','Prácticas en la Profesión 2',6,7),
(NULL,'LIS4032','Temas Selectos 1',6,7),
(NULL,'LIS4042','Visión Artificial',6,7),
(NULL,'LIS4052','Sistemas Distribuidos',6,7);

-- 8°
INSERT INTO materias VALUES
(NULL,'LIS4012','Desarrollo de Aplicaciones Móviles',6,8),
(NULL,'LIS4072','Diseño y Gestión de Sistemas',6,8),
(NULL,'LIS4082','Temas Selectos 2',6,8),
(NULL,'LIS4092','Temas Selectos 3',6,8),
(NULL,'LIS4102','Cómputo en la Nube y Datos Masivos',6,8),
(NULL,'LIS4112','Laboratorio de Nube y Datos Masivos',6,8);

-- =========================================
-- PRERREQUISITOS (SERIACIÓN)
-- =========================================

-- POO -> Algoritmos
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='LIS1022' AND p.clave='LIS1012';

-- Cálculo I -> Matemáticas
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='MAT1022' AND p.clave='MAT1012';

-- Física II -> Física I
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='FIS2012' AND p.clave='FIS1012';

-- Estructuras de Datos -> POO
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='LIS2032' AND p.clave='LIS1022';

-- Arquitectura -> POO
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='LIS2022' AND p.clave='LIS1022';

-- Sistemas Operativos -> Estructuras
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='LIS2062' AND p.clave='LIS2032';

-- Bases de Datos Avanzados -> BD
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='LIS3012' AND p.clave='LIS2082';

-- IA -> BD
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='LIS3082' AND p.clave='LIS2082';

-- Redes -> Arquitectura
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='LIS3122' AND p.clave='LIS2022';

-- Seguridad -> Redes
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='LIS4062' AND p.clave='LIS3122';

-- Sistemas Distribuidos -> Redes
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='LIS4052' AND p.clave='LIS3122';

-- Desarrollo móvil -> Redes
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='LIS4012' AND p.clave='LIS3122';

-- Gestión de sistemas -> Ingeniería de Software
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='LIS4072' AND p.clave='LIS3062';