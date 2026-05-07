import { useEffect, useMemo, useState } from 'react';
import { Search, BookOpen, GraduationCap, Layers3, Clock3, Users } from 'lucide-react';
import { maestros, calendariosPorSalon } from './data';
import { getSchedules, getSubjects, type SubjectRecord } from '../lib/api';
import { buildCalendariosFromSource } from '../lib/schedules';
import { includesNormalized } from '../lib/text';

export function SubjectsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMateriaClave, setSelectedMateriaClave] = useState<string | null>(null);
  const [materias, setMaterias] = useState<SubjectRecord[]>([]);
  const [calendarios, setCalendarios] = useState(calendariosPorSalon);
  const [isLoadingMaterias, setIsLoadingMaterias] = useState(true);
  const [materiasError, setMateriasError] = useState('');
  const [selectedSemestre, setSelectedSemestre] = useState('Todos');

  useEffect(() => {
    let isMounted = true;

    const loadSubjects = async () => {
      try {
        const subjectRows = await getSubjects();

        if (isMounted) {
          setMaterias(subjectRows);
          setMateriasError('');
        }
      } catch (error) {
        console.error('Error loading subjects from SQL', error);

        if (isMounted) {
          setMateriasError('No se pudieron cargar las materias desde el plan de estudios SQL.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingMaterias(false);
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
        console.error('Error loading schedules for subjects', error);
      }
    };

    loadSubjects();
    loadSchedules();

    return () => {
      isMounted = false;
    };
  }, []);

  const semestresDisponibles = useMemo(
    () => Array.from(new Set(materias.map((materia) => materia.semestre))),
    [materias],
  );

  const filteredMaterias = materias.filter((materia) => {
    const matchesSearch = includesNormalized(
      `${materia.nombre} ${materia.clave} ${materia.semestre} ${materia.area}`,
      searchTerm,
    );
    const matchesSemestre = selectedSemestre === 'Todos' || materia.semestre === selectedSemestre;

    return matchesSearch && matchesSemestre;
  });

  const materiasPorSemestre = useMemo(
    () =>
      filteredMaterias.reduce<Record<string, SubjectRecord[]>>((accumulator, materia) => {
        if (!accumulator[materia.semestre]) {
          accumulator[materia.semestre] = [];
        }

        accumulator[materia.semestre].push(materia);
        return accumulator;
      }, {}),
    [filteredMaterias],
  );

  const selectedMateria = materias.find((materia) => materia.clave === selectedMateriaClave) || null;

  // Obtener información de horarios de la materia seleccionada
  const getHorariosMateria = (materia: string) => {
    const horarios: Array<{
      salon: string;
      dia: string;
      horaInicio: string;
      horaFin: string;
      profesor: string;
      codigo: string;
    }> = [];

    Object.entries(calendarios).forEach(([salon, calendario]) => {
      Object.entries(calendario).forEach(([dia, eventos]) => {
        eventos.forEach(evento => {
          if (evento.materia === materia) {
            horarios.push({
              salon,
              dia,
              horaInicio: evento.horaInicio,
              horaFin: evento.horaFin,
              profesor: evento.profesor,
              codigo: evento.codigo,
            });
          }
        });
      });
    });

    return horarios;
  };

  const horariosSeleccionados = selectedMateria ? getHorariosMateria(selectedMateria.nombre) : [];

  // Obtener maestros que imparten la materia seleccionada
  const maestrosMateria = selectedMateria
    ? maestros.filter((m) => m.materias.includes(selectedMateria.nombre))
    : [];

  const totalCreditos = filteredMaterias.reduce((sum, materia) => sum + materia.creditos, 0);
  const promedioCreditos = filteredMaterias.length > 0 ? Math.round(totalCreditos / filteredMaterias.length) : 0;
  const totalAreas = new Set(filteredMaterias.map((materia) => materia.area)).size;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Materias</h2>
        <p className="text-sm text-gray-600 mt-1">
          Plan de estudios SQL con materias, semestre, créditos, prerrequisitos, horarios y maestros
        </p>
      </div>

      {materiasError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {materiasError}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar materia por nombre, clave, semestre o área..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semestre</label>
            <select
              value={selectedSemestre}
              onChange={(e) => setSelectedSemestre(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
            >
              <option value="Todos">Todos los semestres</option>
              {semestresDisponibles.map((semestre) => (
                <option key={semestre} value={semestre}>
                  {semestre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Materias visibles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredMaterias.length}</p>
            </div>
            <BookOpen className="text-orange-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Semestres</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{semestresDisponibles.length}</p>
            </div>
            <Layers3 className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Areas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalAreas}</p>
            </div>
            <GraduationCap className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Creditos totales / promedio</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCreditos} / {promedioCreditos}</p>
            </div>
            <Clock3 className="text-amber-500" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Materias */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                Materias del plan ({filteredMaterias.length})
              </h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {isLoadingMaterias ? (
                <div className="p-8 text-center text-gray-500">
                  Cargando materias desde el plan de estudios...
                </div>
              ) : filteredMaterias.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No se encontraron materias
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {Object.entries(materiasPorSemestre).map(([semestre, materiasDelSemestre]) => (
                    <div key={semestre}>
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800">{semestre}</h4>
                        <span className="text-xs text-gray-500">{materiasDelSemestre.length} materias</span>
                      </div>
                      <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white overflow-hidden">
                        {materiasDelSemestre.map((materia) => (
                          <button
                            key={materia.clave}
                            onClick={() => setSelectedMateriaClave(materia.clave)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                              selectedMateriaClave === materia.clave ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <BookOpen
                                className={`flex-shrink-0 mt-1 ${
                                  selectedMateriaClave === materia.clave ? 'text-orange-500' : 'text-gray-400'
                                }`}
                                size={16}
                              />
                              <div className="min-w-0">
                                <span className={`block text-sm ${
                                  selectedMateriaClave === materia.clave ? 'font-medium text-orange-700' : 'text-gray-700'
                                }`}>
                                  {materia.nombre}
                                </span>
                                <span className="block text-xs text-gray-500">
                                  {materia.clave} · {materia.creditos} creditos · {materia.area}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detalles de la Materia */}
        <div className="lg:col-span-2">
          {!selectedMateria ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <BookOpen className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Selecciona una materia
              </h3>
              <p className="text-gray-600">
                Elige una materia del plan para ver su ficha completa, horarios, salones y maestros
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header de la Materia */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedMateria.nombre}</h3>
                {selectedMateria && (
                  <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">
                      {selectedMateria.clave}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                      {selectedMateria.creditos} créditos
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                      {selectedMateria.semestre}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                      {selectedMateria.area}
                    </span>
                  </div>
                )}
                {selectedMateria && selectedMateria.prerrequisitos.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Prerrequisitos</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMateria.prerrequisitos.map((prerrequisito) => (
                        <span
                          key={prerrequisito}
                          className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs text-orange-700"
                        >
                          {prerrequisito}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>{horariosSeleccionados.length} horarios</span>
                  <span>•</span>
                  <span>{maestrosMateria.length} maestro(s)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Semestre</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{selectedMateria.semestre}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{selectedMateria.area}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Prerrequisitos</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{selectedMateria.prerrequisitos.length}</p>
                </div>
              </div>

              {/* Maestros que imparten la materia */}
              {maestrosMateria.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Maestros</h4>
                  <div className="space-y-3">
                    {maestrosMateria.map((maestro) => (
                      <div
                        key={maestro.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{maestro.nombre}</p>
                          <p className="text-sm text-gray-600">{maestro.departamento}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          maestro.disponible
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {maestro.disponible ? 'Disponible' : 'No disponible'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Horarios */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">Horarios en calendario</h4>
                </div>
                {horariosSeleccionados.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No hay horarios programados para esta materia
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Código
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Día
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Horario
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Salón
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Profesor
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {horariosSeleccionados.map((horario, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{horario.codigo}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{horario.dia}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">
                                {horario.horaInicio} - {horario.horaFin}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 bg-orange-50 text-orange-700 text-sm rounded border border-orange-200">
                                {horario.salon}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-900">{horario.profesor}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
