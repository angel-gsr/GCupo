import { CalendarData, CalendarEvent } from '../components/types';
import { ScheduleRecord } from './api';

type StaticCalendarMap = Record<string, unknown>;

const emptyCalendar = (): CalendarData => ({
  Lunes: [],
  Martes: [],
  Miércoles: [],
  Jueves: [],
  Viernes: [],
  Sábado: [],
});

function normalizeStaticEvent(event: any, fallbackSalon: string): CalendarEvent {
  return {
    materia: event.materia ?? event.titulo ?? '',
    codigo: event.codigo ?? event.id ?? '',
    profesor: event.profesor ?? event.maestro ?? '',
    cupo: typeof event.cupo === 'number' ? event.cupo : undefined,
    horaInicio: event.horaInicio ?? '',
    horaFin: event.horaFin ?? '',
  };
}

export function buildCalendariosFromSource(
  staticCalendarios: StaticCalendarMap,
  persistedSchedules: ScheduleRecord[],
): Record<string, CalendarData> {
  const merged: Record<string, CalendarData> = {};

  Object.entries(staticCalendarios).forEach(([salon, calendario]) => {
    merged[salon] = emptyCalendar();

    const days = calendario as Record<string, any[]>;

    Object.keys(merged[salon]).forEach((dia) => {
      const events = Array.isArray(days[dia]) ? days[dia] : [];
      merged[salon][dia as keyof CalendarData] = events.map((event) => normalizeStaticEvent(event, salon));
    });
  });

  persistedSchedules.forEach((schedule) => {
    if (!merged[schedule.salon]) {
      merged[schedule.salon] = emptyCalendar();
    }

    const event: CalendarEvent = {
      materia: schedule.materia,
      codigo: schedule.materia,
      profesor: schedule.profesor,
      cupo: schedule.cupo,
      horaInicio: schedule.horaInicio,
      horaFin: schedule.horaFin,
    };

    merged[schedule.salon][schedule.dia as keyof CalendarData].push(event);
  });

  return merged;
}
