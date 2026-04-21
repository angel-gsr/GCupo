import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CalendarData, CalendarEvent } from './types';
import { calendariosPorSalon } from './data';
import { getSchedules } from '../lib/api';
import { buildCalendariosFromSource } from '../lib/schedules';

interface TeacherCalendarModalProps {
  teacherName: string;
  onClose: () => void;
}

const horasDelDia = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export function TeacherCalendarModal({ teacherName, onClose }: TeacherCalendarModalProps) {
  const [calendarios, setCalendarios] = useState(calendariosPorSalon);

  useEffect(() => {
    let isMounted = true;

    const loadSchedules = async () => {
      try {
        const schedules = await getSchedules();

        if (isMounted) {
          setCalendarios(buildCalendariosFromSource(calendariosPorSalon, schedules));
        }
      } catch (error) {
        console.error('Error loading teacher schedules', error);
      }
    };

    loadSchedules();

    return () => {
      isMounted = false;
    };
  }, []);

  // Obtener todos los eventos del profesor de todos los salones
  const getTeacherSchedule = () => {
    const schedule: { [key: string]: CalendarEvent[] } = {
      Lunes: [],
      Martes: [],
      Miércoles: [],
      Jueves: [],
      Viernes: [],
    };

    Object.entries(calendarios).forEach(([salon, calendario]) => {
      Object.entries(calendario).forEach(([dia, eventos]) => {
        eventos.forEach(evento => {
          if (evento.profesor === teacherName) {
            // Agregar el salón a la información del evento
            schedule[dia].push({
              ...evento,
              // Guardar el salón en una propiedad personalizada
              salon: salon as any,
            });
          }
        });
      });
    });

    return schedule;
  };

  const teacherSchedule = getTeacherSchedule();

  const getEventAtTime = (dia: string, hora: string): (CalendarEvent & { salon?: string }) | null => {
    const eventos = teacherSchedule[dia] || [];
    return eventos.find(evento => {
      const horaNum = parseInt(hora.split(':')[0]);
      const inicioNum = parseInt(evento.horaInicio.split(':')[0]);
      const finNum = parseInt(evento.horaFin.split(':')[0]);
      return horaNum >= inicioNum && horaNum < finNum;
    }) || null;
  };

  const getEventHeight = (evento: CalendarEvent): number => {
    const inicio = parseInt(evento.horaInicio.split(':')[0]);
    const fin = parseInt(evento.horaFin.split(':')[0]);
    const duracion = fin - inicio;
    return duracion;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Calendario - {teacherName}</h2>
            <p className="text-sm text-gray-600 mt-1">Horarios, salones y materias asignadas</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="min-w-[800px]">
            {/* Days Header */}
            <div className="grid grid-cols-6 gap-2 mb-2">
              <div className="text-sm font-medium text-gray-600 text-center">Hora</div>
              {diasSemana.map(dia => (
                <div key={dia} className="text-sm font-medium text-gray-900 text-center bg-orange-50 py-2 rounded-lg">
                  {dia}
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="space-y-0">
              {horasDelDia.map(hora => {
                const renderedEvents = new Set<string>();

                return (
                  <div key={hora} className="grid grid-cols-6 gap-2">
                    <div className="text-sm text-gray-600 font-medium py-3 text-center border-t border-gray-200">
                      {hora}
                    </div>
                    {diasSemana.map(dia => {
                      const evento = getEventAtTime(dia, hora);
                      const eventKey = evento ? `${dia}-${evento.codigo}-${evento.horaInicio}` : null;

                      // Si es la primera hora del evento, renderizarlo
                      if (evento && evento.horaInicio === hora && !renderedEvents.has(eventKey!)) {
                        renderedEvents.add(eventKey!);
                        const altura = getEventHeight(evento);

                        return (
                          <div
                            key={dia}
                            className="relative"
                            style={{ gridRow: `span ${altura}` }}
                          >
                            <div className="absolute inset-0 bg-orange-500 text-white p-2 rounded-lg shadow-sm border border-orange-600 m-0.5">
                              <div className="text-xs font-bold mb-1">{evento.codigo}</div>
                              <div className="text-xs mb-1 line-clamp-2">{evento.materia}</div>
                              <div className="text-xs opacity-90 flex items-center gap-1">
                                <span>📍</span>
                                {(evento as any).salon}
                              </div>
                              <div className="text-xs font-medium mt-1">
                                {evento.horaInicio} - {evento.horaFin}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Si es parte de un evento existente, no renderizar nada
                      if (evento && evento.horaInicio !== hora) {
                        return null;
                      }

                      // Celda vacía
                      return (
                        <div key={dia} className="border-t border-gray-200 py-3 min-h-[60px]"></div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
