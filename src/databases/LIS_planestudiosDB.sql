-- =========================================
-- BASE DE DATOS
-- =========================================
DROP DATABASE IF EXISTS plan_sistemas_completo;
CREATE DATABASE plan_sistemas_completo;
USE plan_sistemas_completo;

-- =========================================
-- TABLAS
-- =========================================

CREATE TABLE semestres (
    id_semestre INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20)
);

CREATE TABLE areas (
    id_area INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100)
);

CREATE TABLE materias (
    id_materia INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(10),
    nombre VARCHAR(255),
    creditos INT,
    id_semestre INT,
    id_area INT,
    FOREIGN KEY (id_semestre) REFERENCES semestres(id_semestre),
    FOREIGN KEY (id_area) REFERENCES areas(id_area)
);

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
('Primero'),('Segundo'),('Tercero'),('Cuarto'),
('Quinto'),('Sexto'),('Séptimo'),('Octavo');

-- =========================================
-- ÁREAS
-- =========================================
INSERT INTO areas (nombre) VALUES
('Ciencia Básica'),
('Programación y Datos'),
('Ingeniería de Software'),
('Electrónica y Sistemas'),
('Tronco Común'),
('Optativas');

-- =========================================
-- MATERIAS (COMPLETO)
-- =========================================

-- 1° SEMESTRE
INSERT INTO materias VALUES
(NULL,'LIS1012','Algoritmos y Programación',6,1,2),
(NULL,'MAT1012','Matemáticas Universitarias',6,1,1),
(NULL,'INF0012','Tecnologías de la Información',6,1,5),
(NULL,'LEX0112','Lengua Extranjera I',6,1,5),
(NULL,'ESP0012','Argumentación Académica',6,1,5);

-- 2° SEMESTRE
INSERT INTO materias VALUES
(NULL,'MAT1032','Álgebra Lineal',6,2,1),
(NULL,'FIS1012','Física General I',6,2,1),
(NULL,'FIS1022','Lab Física I',3,2,1),
(NULL,'MAT1022','Cálculo I',6,2,1),
(NULL,'LIS1022','POO',6,2,2),
(NULL,'LEX0122','Lengua Extranjera II',6,2,5),
(NULL,'ESP0022','Escritura Académica',6,2,5);

-- 3° SEMESTRE
INSERT INTO materias VALUES
(NULL,'MAT2012','Cálculo II',6,3,1),
(NULL,'LIS2032','Estructuras de Datos',6,3,2),
(NULL,'FIS2012','Física II',6,3,1),
(NULL,'FIS2022','Lab Física II',3,3,1),
(NULL,'LRT2022','Diseño Digital',6,3,4),
(NULL,'LEX0132','Lengua Extranjera III',6,3,5),
(NULL,'LIS2012','Matemáticas Discretas',6,3,1);

-- 4° SEMESTRE
INSERT INTO materias VALUES
(NULL,'MAT2082','Probabilidad y Estadística',6,4,1),
(NULL,'MAT2052','Ecuaciones Diferenciales',6,4,1),
(NULL,'LIS2022','Arquitectura Computacional',6,4,2),
(NULL,'LRT2012','Circuitos Eléctricos',6,4,4),
(NULL,'LRT2032','Lab Circuitos',2,4,4),
(NULL,'LIS2062','Sistemas Operativos',6,4,2);

-- 5° SEMESTRE
INSERT INTO materias VALUES
(NULL,'LIS2082','Bases de Datos',6,5,2),
(NULL,'LFA3082','Análisis Numérico',6,5,1),
(NULL,'LRT3032','Sistemas Embebidos',6,5,4),
(NULL,'LIS3032','Interacción Humano-Computadora',6,5,3),
(NULL,'LIS3042','Teoría de la Computación',6,5,3),
(NULL,'LIS3052','Prácticas Profesionales I',6,5,3);

-- 6° SEMESTRE
INSERT INTO materias VALUES
(NULL,'LIS3012','Bases de Datos Avanzadas',6,6,2),
(NULL,'LIS3082','Inteligencia Artificial',6,6,3),
(NULL,'LIS3022','Graficación y Videojuegos',6,6,3),
(NULL,'LIS3092','Lab Videojuegos',6,6,3),
(NULL,'LIS3062','Ingeniería de Software',6,6,3),
(NULL,'LIS3122','Redes',6,6,2),
(NULL,'LIS3132','Lab Redes',2,6,2);

-- 7° SEMESTRE
INSERT INTO materias VALUES
(NULL,'LIS4062','Seguridad Informática',6,7,2),
(NULL,'LIS4022','Prácticas Profesionales II',6,7,3),
(NULL,'LIS4032','Temas Selectos I',6,7,6),
(NULL,'LIS4042','Visión Artificial',6,7,3),
(NULL,'LIS4052','Sistemas Distribuidos',6,7,2);

-- 8° SEMESTRE
INSERT INTO materias VALUES
(NULL,'LIS4012','Apps Móviles',6,8,3),
(NULL,'LIS4072','Gestión de Sistemas',6,8,3),
(NULL,'LIS4082','Temas Selectos II',6,8,6),
(NULL,'LIS4092','Temas Selectos III',6,8,6),
(NULL,'LIS4102','Cloud y Big Data',6,8,2),
(NULL,'LIS4112','Lab Cloud',6,8,2),

-- OPTATIVAS GENERALES
(NULL,'OPT001','Optativa Ciencias Naturales',6,8,6),
(NULL,'OPT002','Optativa Ciencias Sociales',6,8,6),
(NULL,'OPT003','Optativa Artes',6,8,6),
(NULL,'OPT004','Optativa Humanidades',6,8,6);

-- =========================================
-- PRERREQUISITOS CLAVE
-- =========================================

-- POO ← Algoritmos
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
FROM materias m, materias p
WHERE m.clave='LIS1022' AND p.clave='LIS1012';

-- Estructuras ← POO
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
WHERE m.clave='LIS2032' AND p.clave='LIS1022';

-- SO ← Estructuras
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
WHERE m.clave='LIS2062' AND p.clave='LIS2032';

-- BD Avanzadas ← BD
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
WHERE m.clave='LIS3012' AND p.clave='LIS2082';

-- Redes ← Arquitectura
INSERT INTO prerrequisitos
SELECT m.id_materia, p.id_materia
WHERE m.clave='LIS3122' AND p.clave='LIS2022';