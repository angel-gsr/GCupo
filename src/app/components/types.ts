export interface Teacher {
  id: string;
  nombre: string;
  departamento: string;
  materias: string[];
  disponible: boolean;
  horasAsignadas: number;
  horasMaximas: number;
  email: string;
  telefono: string;
  especialidad: string;
}

export interface Classroom {
  id: string;
  nombre: string;
  edificio: string;
  capacidad: number;
  ocupacion: number;
  equipamiento: string[];
  disponible: boolean;
}

export interface CalendarEvent {
  materia: string;
  codigo: string;
  profesor: string;
  cupo?: number;
  horaInicio: string;
  horaFin: string;
}

export interface CalendarData {
  Lunes: CalendarEvent[];
  Martes: CalendarEvent[];
  Miércoles: CalendarEvent[];
  Jueves: CalendarEvent[];
  Viernes: CalendarEvent[];
  Sábado: CalendarEvent[];
}

export interface TimeSlot {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

export interface ScheduleData {
  teacher: Teacher;
  materia: string;
  classroom: Classroom;
  timeSlot: TimeSlot;
}
