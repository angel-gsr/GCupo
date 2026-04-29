import { Classroom } from '../components/types';

export type SubjectRecord = {
  clave: string;
  nombre: string;
  creditos: number;
  area: string;
  semestre: string;
  prerrequisitos: string[];
};

export type ScheduleRecord = {
  id: number;
  salon: string;
  materia: string;
  profesor: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
};

export type CreateSchedulePayload = Omit<ScheduleRecord, 'id'>;

type ApiErrorPayload = {
  error?: string;
};

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as ApiErrorPayload;
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Keep fallback message when the server does not return JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getClassrooms(): Promise<Classroom[]> {
  return apiGet<Classroom[]>('/api/classrooms');
}

export function getSubjects(): Promise<SubjectRecord[]> {
  return apiGet<SubjectRecord[]>('/api/subjects');
}

export function getSchedules(): Promise<ScheduleRecord[]> {
  return apiGet<ScheduleRecord[]>('/api/schedules');
}

export async function createSchedules(payloads: CreateSchedulePayload[]): Promise<void> {
  const response = await fetch('/api/schedules', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ schedules: payloads }),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as ApiErrorPayload;
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Keep fallback message when the server does not return JSON.
    }

    throw new Error(message);
  }
}
