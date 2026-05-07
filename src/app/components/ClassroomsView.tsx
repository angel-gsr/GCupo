import { MapPin, Check, X, Calendar, Search, XCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CalendarModal } from './CalendarModal';
import { calendariosPorSalon } from './data';
import { CalendarData, Classroom } from './types';
import { getClassrooms, getSchedules } from '../lib/api';
import { buildCalendariosFromSource } from '../lib/schedules';
import { includesNormalized } from '../lib/text';

export function ClassroomsView() {
  const [selectedSalon, setSelectedSalon] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSecciones, setSelectedSecciones] = useState<string[]>([]);
  const [selectedEquipamiento, setSelectedEquipamiento] = useState<string[]>([]);
  const [selectedCapacidad, setSelectedCapacidad] = useState('');
  const [selectedDia, setSelectedDia] = useState('');
  const [selectedHora, setSelectedHora] = useState('');
  const [salones, setSalones] = useState<Classroom[]>([]);
  const [calendarios, setCalendarios] = useState<Record<string, CalendarData>>(calendariosPorSalon);
  const [isLoadingSalones, setIsLoadingSalones] = useState(true);
  const [salonesError, setSalonesError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadSalones = async () => {
      try {
        const classrooms = await getClassrooms();

        if (isMounted) {
          setSalones(classrooms);
          setSalonesError('');
        }
      } catch (error) {
        console.error('Error loading classrooms from SQL', error);

        if (isMounted) {
          setSalonesError('No se pudieron cargar los salones desde la base SQL.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingSalones(false);
        }
      }
    };

    const loadSchedules = async () => {
      try {
        const schedules = await getSchedules();

        if (isMounted) {
          setCalendarios(buildCalendariosFromSource(calendariosPorSalon, schedules));
        }
      } catch (error) {
        console.error('Error loading schedules from SQL', error);
      }
    };

    loadSalones();
    loadSchedules();

    return () => {
      isMounted = false;
    };
  }, []);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const horasDelDia = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  ];

  const secciones = Array.from(new Set(salones.map((s) => s.nombre.split('-')[0])));
  const equipamientos = Array.from(new Set(salones.flatMap((s) => s.equipamiento)));
  const capacidadesDisponibles = [20, 30, 40, 50, 120];

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedSecciones.length > 0 ||
    selectedEquipamiento.length > 0 ||
    Boolean(selectedCapacidad) ||
    Boolean(selectedDia) ||
    Boolean(selectedHora);

  const toggleSeccion = (seccion: string) => {
    setSelectedSecciones((prev) =>
      prev.includes(seccion) ? prev.filter((s) => s !== seccion) : [...prev, seccion],
    );
  };

  const toggleEquipamiento = (equip: string) => {
    setSelectedEquipamiento((prev) =>
      prev.includes(equip) ? prev.filter((e) => e !== equip) : [...prev, equip],
    );
  };

  const isSalonOcupadoEnHorario = (salonNombre: string): boolean => {
    if (!selectedDia || !selectedHora) return false;

    const calendario = calendarios[salonNombre];
    if (!calendario) return false;

    const eventos = calendario[selectedDia as keyof CalendarData] || [];
    const horaNum = parseInt(selectedHora.split(':')[0]);

    return eventos.some((evento) => {
      const inicioNum = parseInt(evento.horaInicio.split(':')[0]);
      const finNum = parseInt(evento.horaFin.split(':')[0]);
      return horaNum >= inicioNum && horaNum < finNum;
    });
  };

  const filteredSalones = salones.filter((salon) => {
    if (!includesNormalized(`${salon.nombre} ${salon.edificio}`, searchTerm)) {
      return false;
    }

    if (selectedSecciones.length > 0) {
      const seccion = salon.nombre.split('-')[0];
      if (!selectedSecciones.includes(seccion)) {
        return false;
      }
    }

    if (selectedEquipamiento.length > 0) {
      const tieneEquipamiento = selectedEquipamiento.every((equip) => salon.equipamiento.includes(equip));
      if (!tieneEquipamiento) {
        return false;
      }
    }

    if (selectedCapacidad && salon.capacidad < Number(selectedCapacidad)) {
      return false;
    }

    if (selectedDia && selectedHora && isSalonOcupadoEnHorario(salon.nombre)) {
      return false;
    }

    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Salones</h2>
        <p className="text-sm text-gray-600 mt-1">
          Buscar y gestionar salones por sección, capacidad, edificio o equipamiento
        </p>
      </div>

      {salonesError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {salonesError}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {isLoadingSalones && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Cargando salones desde la base SQL...
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre de salón..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Sección</label>
          <div className="flex flex-wrap gap-2">
            {secciones.map((seccion) => (
              <button
                key={seccion}
                onClick={() => toggleSeccion(seccion)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedSecciones.includes(seccion)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {seccion}
                {selectedSecciones.includes(seccion) && (
                  <XCircle size={14} className="inline ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Equipamiento</label>
          <div className="flex flex-wrap gap-2">
            {equipamientos.map((equip) => (
              <button
                key={equip}
                onClick={() => toggleEquipamiento(equip)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedEquipamiento.includes(equip)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {equip}
                {selectedEquipamiento.includes(equip) && (
                  <XCircle size={14} className="inline ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Capacidad mínima</label>
          <select
            value={selectedCapacidad}
            onChange={(e) => setSelectedCapacidad(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm bg-white"
          >
            <option value="">Todas las capacidades</option>
            {capacidadesDisponibles.map((capacidad) => (
              <option key={capacidad} value={capacidad}>
                {capacidad}+ estudiantes
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            El filtro usa umbrales de cupo para que el salto sea más racional.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
            <Clock size={16} />
            Buscar por Fecha y Hora Disponible
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Día de la semana</label>
              <select
                value={selectedDia}
                onChange={(e) => setSelectedDia(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
              >
                <option value="">Todos los días</option>
                {diasSemana.map((dia) => (
                  <option key={dia} value={dia}>
                    {dia}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Hora</label>
              <select
                value={selectedHora}
                onChange={(e) => setSelectedHora(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
              >
                <option value="">Todas las horas</option>
                {horasDelDia.map((hora) => (
                  <option key={hora} value={hora}>
                    {hora}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedDia && selectedHora && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              Mostrando salones disponibles el {selectedDia} a las {selectedHora}
            </div>
          )}
        </div>

        {(selectedSecciones.length > 0 || selectedEquipamiento.length > 0 || searchTerm || selectedCapacidad || selectedDia || selectedHora) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setSelectedSecciones([]);
                setSelectedEquipamiento([]);
                setSearchTerm('');
                setSelectedCapacidad('');
                setSelectedDia('');
                setSelectedHora('');
              }}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {hasActiveFilters ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resultados</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{filteredSalones.length}</p>
                </div>
                <MapPin className="text-orange-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Disponibles</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {filteredSalones.filter((s) => s.disponible).length}
                  </p>
                </div>
                <Check className="text-green-500" size={24} />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ocupados</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {filteredSalones.filter((s) => !s.disponible).length}
                  </p>
                </div>
                <X className="text-red-500" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salón
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edificio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipamiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calendario
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSalones.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No se encontraron salones con los filtros seleccionados
                      </td>
                    </tr>
                  ) : (
                    filteredSalones.map((salon) => (
                      <tr key={salon.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{salon.nombre}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{salon.edificio}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{salon.capacidad} estudiantes</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {salon.equipamiento.map((equipo, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {equipo}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedSalon(salon.nombre)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm"
                          >
                            <Calendar size={16} />
                            Ver Calendario
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
          Selecciona uno o más parámetros para desplegar el listado de salones.
        </div>
      )}

      {selectedSalon && (
        <CalendarModal salon={selectedSalon} onClose={() => setSelectedSalon(null)} />
      )}
    </div>
  );
}