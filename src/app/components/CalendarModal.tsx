import { X, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CalendarData, CalendarEvent } from './types';
import { calendariosPorSalon, maestros } from './data';
import { SuccessModal } from './SuccessModal';
import { buildCalendariosFromSource } from '../lib/schedules';
import { createSchedules, getSchedules } from '../lib/api';

interface CalendarModalProps {
  salon: string;
  onClose: () => void;
  onAddSchedule?: () => void;
}

const horasDelDia = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function CalendarModal({ salon, onClose, onAddSchedule }: CalendarModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [calendarios, setCalendarios] = useState(calendariosPorSalon);
  const [selectedProfesor, setSelectedProfesor] = useState('');
  const [selectedMateria, setSelectedMateria] = useState('');
  const [selectedDias, setSelectedDias] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [cupo, setCupo] = useState('30');
  const [successData, setSuccessData] = useState<{
    salon: string;
    profesor: string;
    materia: string;
    dias: string[];
    horaInicio: string;
    horaFin: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSchedules = async () => {
      try {
        const schedules = await getSchedules();

        if (isMounted) {
          setCalendarios(buildCalendariosFromSource(calendariosPorSalon, schedules));
        }
      } catch (error) {
        console.error('Error loading schedules for classroom calendar', error);
      }
    };

    loadSchedules();

    return () => {
      isMounted = false;
    };
  }, []);

  const calendario = calendarios[salon] || {
    Lunes: [],
    Martes: [],
    Miércoles: [],
    Jueves: [],
    Viernes: [],
    Sábado: [],
  };

  const getEventAtTime = (dia: string, hora: string): CalendarEvent | null => {
    const eventos = calendario[dia as keyof CalendarData] || [];
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

  const handleAddSchedule = () => {
    const data = {
      salon,
      profesor: selectedProfesor,
      materia: selectedMateria,
      dias: selectedDias,
      horaInicio,
      horaFin,
      cupo: Number(cupo),
    };

    createSchedules(
      selectedDias.map((dia) => ({
        salon,
        profesor: selectedProfesor,
        materia: selectedMateria,
        cupo: Number(cupo),
        dia,
        horaInicio,
        horaFin,
      })),
    )
      .then(() => {
        setShowAddForm(false);
        setShowSuccessModal(true);
        setSuccessData(data);
        setSelectedProfesor('');
        setSelectedMateria('');
        setSelectedDias([]);
        setHoraInicio('');
        setHoraFin('');
        setCupo('30');
      })
      .catch((error) => {
        console.error('Error saving schedule', error);
      });
  };

  const toggleDia = (dia: string) => {
    setSelectedDias(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  };

  const materiasPorProfesor = selectedProfesor
    ? maestros.find(m => m.nombre === selectedProfesor)?.materias || []
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Calendario - Salón {salon}</h2>
            <p className="text-sm text-gray-600 mt-1">Horarios y materias asignadas</p>
          </div>
          <div className="flex items-center gap-2">
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                <Plus size={20} />
                Agregar Horario
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Add Schedule Form */}
        {showAddForm && (
          <div className="p-6 bg-orange-50 border-b border-orange-200">
            <h3 className="font-semibold text-gray-900 mb-4">Agregar Nuevo Horario a {salon}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profesor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profesor</label>
                <select
                  value={selectedProfesor}
                  onChange={(e) => {
                    setSelectedProfesor(e.target.value);
                    setSelectedMateria(''); // Reset materia cuando cambia profesor
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="">Seleccionar profesor</option>
                  {maestros.map(m => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Materia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Materia</label>
                <select
                  value={selectedMateria}
                  onChange={(e) => setSelectedMateria(e.target.value)}
                  disabled={!selectedProfesor}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none disabled:bg-gray-100"
                >
                  <option value="">Seleccionar materia</option>
                  {materiasPorProfesor.map(materia => (
                    <option key={materia} value={materia}>{materia}</option>
                  ))}
                </select>
              </div>

              {/* Hora Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora Inicio</label>
                <select
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="">Seleccionar hora</option>
                  {horasDelDia.map(hora => (
                    <option key={hora} value={hora}>{hora}</option>
                  ))}
                </select>
              </div>

              {/* Hora Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora Fin</label>
                <select
                  value={horaFin}
                  onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="">Seleccionar hora</option>
                  {horasDelDia.map(hora => (
                    <option key={hora} value={hora}>{hora}</option>
                  ))}
                </select>
              </div>

              {/* Cupo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cupo</label>
                <input
                  type="number"
                  min="1"
                  value={cupo}
                  onChange={(e) => setCupo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Ej. 30"
                />
              </div>
            </div>

            {/* Días de la semana */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Días de la semana</label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map(dia => (
                  <button
                    key={dia}
                    onClick={() => toggleDia(dia)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedDias.includes(dia)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddSchedule}
                disabled={!selectedProfesor || !selectedMateria || selectedDias.length === 0 || !horaInicio || !horaFin}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

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
                              <div className="text-xs opacity-90">{evento.profesor}</div>
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

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <SuccessModal
          onClose={() => setShowSuccessModal(false)}
          data={successData}
        />
      )}
    </div>
  );
}