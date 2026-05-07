import { useEffect, useState } from 'react';
import { Search, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { Classroom, Teacher, TimeSlot, CalendarData, CalendarEvent } from '../types';
import { calendariosPorSalon } from '../data';
import { getSchedules } from '../../lib/api';
import { buildCalendariosFromSource } from '../../lib/schedules';
import { includesNormalized } from '../../lib/text';

interface SelectScheduleStepProps {
  salones: Classroom[];
  selectedClassroom: Classroom | null;
  selectedTimeSlots: TimeSlot[];
  onSelectClassroom: (classroom: Classroom) => void;
  onSelectTimeSlots: (timeSlots: TimeSlot[]) => void;
  teacher: Teacher;
  materia: string;
}

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const horasDelDia = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

export function SelectScheduleStep({
  salones,
  selectedClassroom,
  selectedTimeSlots,
  onSelectClassroom,
  onSelectTimeSlots,
  teacher,
  materia,
}: SelectScheduleStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [calendarios, setCalendarios] = useState(calendariosPorSalon);
  const MAX_TIME_SLOTS = 2;

  useEffect(() => {
    let isMounted = true;

    const loadSchedules = async () => {
      try {
        const schedules = await getSchedules();

        if (isMounted) {
          setCalendarios(buildCalendariosFromSource(calendariosPorSalon, schedules));
        }
      } catch (error) {
        console.error('Error loading schedules in wizard', error);
      }
    };

    loadSchedules();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSalones = salones.filter((salon) =>
    includesNormalized(`${salon.nombre} ${salon.edificio}`, searchTerm)
  );

  const calendario = selectedClassroom
    ? calendarios[selectedClassroom.nombre] || {
        Lunes: [],
        Martes: [],
        Miércoles: [],
        Jueves: [],
        Viernes: [],
        Sábado: [],
      }
    : null;

  const getEventAtTime = (dia: string, hora: string): CalendarEvent | null => {
    if (!calendario) return null;
    const eventos = calendario[dia as keyof CalendarData] || [];
    return eventos.find(evento => {
      const horaNum = parseInt(hora.split(':')[0]);
      const inicioNum = parseInt(evento.horaInicio.split(':')[0]);
      const finNum = parseInt(evento.horaFin.split(':')[0]);
      return horaNum >= inicioNum && horaNum < finNum;
    }) || null;
  };

  const handleTimeSlotClick = (dia: string, hora: string) => {
    // Verificar si ya hay un evento en ese horario
    const existingEvent = getEventAtTime(dia, hora);
    if (existingEvent) {
      return; // No permitir seleccionar horarios ocupados
    }

    // Calcular hora de fin (1.5 horas después)
    const horaNum = parseInt(hora.split(':')[0]);
    const horaFin = `${String(horaNum + 1).padStart(2, '0')}:30`;

    const newTimeSlot: TimeSlot = {
      dia,
      horaInicio: hora,
      horaFin,
    };

    // Verificar si ya está seleccionado
    const isAlreadySelected = selectedTimeSlots.some(
      slot => slot.dia === dia && slot.horaInicio === hora
    );

    if (isAlreadySelected) {
      // Si ya está seleccionado, quitarlo
      onSelectTimeSlots(selectedTimeSlots.filter(
        slot => !(slot.dia === dia && slot.horaInicio === hora)
      ));
    } else {
      // Si no está seleccionado y no se ha alcanzado el máximo, agregarlo
      if (selectedTimeSlots.length < MAX_TIME_SLOTS) {
        onSelectTimeSlots([...selectedTimeSlots, newTimeSlot]);
      }
    }
  };

  const isTimeSlotSelected = (dia: string, hora: string) => {
    return selectedTimeSlots.some(
      slot => slot.dia === dia && slot.horaInicio === hora
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Maestro:</span> {teacher.nombre} |{' '}
          <span className="font-semibold">Materia:</span> {materia}
        </p>
      </div>

      {/* Search Classroom */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Buscar Salón
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Busca por nombre o edificio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          />
        </div>
      </div>

      {/* Classrooms List */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Selecciona un Salón ({filteredSalones.length} encontrados)
        </label>
        <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
          {filteredSalones.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron salones
            </div>
          ) : (
            filteredSalones.map((salon) => (
              <button
                key={salon.id}
                onClick={() => onSelectClassroom(salon)}
                className={`w-full p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors text-left ${
                  selectedClassroom?.id === salon.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{salon.nombre}</h3>
                      <p className="text-xs text-gray-600">{salon.edificio} • Capacidad: {salon.capacidad}</p>
                    </div>
                  </div>
                  {selectedClassroom?.id === salon.id && (
                    <CheckCircle size={18} className="text-orange-500" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Calendar for selected classroom */}
      {selectedClassroom && calendario && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
            <Calendar size={16} />
            Selecciona Horarios en {selectedClassroom.nombre} (máximo {MAX_TIME_SLOTS})
          </label>
          {selectedTimeSlots.length > 0 && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              {selectedTimeSlots.length} de {MAX_TIME_SLOTS} horarios seleccionados
            </div>
          )}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Days Header */}
                <div className="grid grid-cols-6 gap-1 bg-gray-50 p-2">
                  <div className="text-xs font-medium text-gray-600 text-center">Hora</div>
                  {diasSemana.map(dia => (
                    <div key={dia} className="text-xs font-medium text-gray-900 text-center">
                      {dia}
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
                  {horasDelDia.map(hora => (
                    <div key={hora} className="grid grid-cols-6 gap-1">
                      <div className="text-xs text-gray-600 font-medium text-center py-2">
                        {hora}
                      </div>
                      {diasSemana.map(dia => {
                        const evento = getEventAtTime(dia, hora);
                        const isSelected = isTimeSlotSelected(dia, hora);
                        
                        if (evento && evento.horaInicio === hora) {
                          return (
                            <div
                              key={dia}
                              className="bg-gray-300 text-gray-700 p-1 rounded text-xs border border-gray-400 cursor-not-allowed"
                            >
                              <div className="font-semibold truncate">{evento.codigo}</div>
                              <div className="text-[10px] truncate">{evento.profesor}</div>
                            </div>
                          );
                        }

                        if (evento && evento.horaInicio !== hora) {
                          return <div key={dia} />;
                        }

                        const canSelect = selectedTimeSlots.length < MAX_TIME_SLOTS || isSelected;
                        
                        return (
                          <button
                            key={dia}
                            onClick={() => handleTimeSlotClick(dia, hora)}
                            disabled={!canSelect}
                            className={`p-2 rounded text-xs border-2 transition-all ${
                              isSelected
                                ? 'bg-orange-500 text-white border-orange-600 font-semibold'
                                : canSelect
                                ? 'bg-white border-gray-200 hover:bg-orange-50 hover:border-orange-400'
                                : 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400'
                            }`}
                          >
                            {isSelected ? '✓ Seleccionado' : canSelect ? 'Disponible' : 'Límite alcanzado'}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {selectedTimeSlots.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg space-y-1">
              <p className="text-sm font-semibold text-green-800 mb-2">
                Horarios seleccionados:
              </p>
              {selectedTimeSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm text-green-800">
                  <span>
                    {idx + 1}. {slot.dia}, {slot.horaInicio} - {slot.horaFin}
                  </span>
                  <button
                    onClick={() => onSelectTimeSlots(selectedTimeSlots.filter((_, i) => i !== idx))}
                    className="text-red-600 hover:text-red-700 text-xs"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedClassroom && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <MapPin size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Selecciona un salón para ver su calendario</p>
        </div>
      )}
    </div>
  );
}
