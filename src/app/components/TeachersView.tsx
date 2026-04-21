import { GraduationCap, CheckCircle, XCircle, Mail, Phone, Calendar, Plus, Search } from 'lucide-react';
import { maestros } from './data';
import { useState } from 'react';
import { TeacherCalendarModal } from './TeacherCalendarModal';

interface TeachersViewProps {
  onCreateScheduleForTeacher?: (teacherId: string, teacherName: string) => void;
}

export function TeachersView({ onCreateScheduleForTeacher }: TeachersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  
  const maestrosDisponibles = maestros.filter(m => m.disponible);

  // Filtrar maestros por búsqueda (nombre o materias)
  const filteredMaestros = maestros.filter(maestro => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nombreMatch = maestro.nombre.toLowerCase().includes(searchLower);
    const materiaMatch = maestro.materias.some(m => m.toLowerCase().includes(searchLower));
    
    return nombreMatch || materiaMatch;
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Maestros Disponibles</h2>
        <p className="text-sm text-gray-600 mt-1">Profesores y sus materias por departamento</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre de maestro o materia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Maestros</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredMaestros.length}</p>
            </div>
            <GraduationCap className="text-orange-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{maestrosDisponibles.length}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">No Disponibles</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {filteredMaestros.length - maestrosDisponibles.length}
              </p>
            </div>
            <XCircle className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMaestros.length === 0 ? (
          <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No se encontraron maestros con los criterios de búsqueda</p>
          </div>
        ) : (
          filteredMaestros.map((maestro) => (
          <div
            key={maestro.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{maestro.nombre}</h3>
                <p className="text-sm text-gray-600 mt-1">{maestro.departamento}</p>
                <p className="text-xs text-gray-500 mt-1">{maestro.especialidad}</p>
              </div>
              {maestro.disponible ? (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Disponible
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                  <XCircle size={12} />
                  No disponible
                </span>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Materias que imparte:</p>
              <div className="flex flex-wrap gap-2">
                {maestro.materias.map((materia, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded border border-orange-200"
                  >
                    {materia}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} className="text-gray-400" />
                <a href={`mailto:${maestro.email}`} className="hover:text-orange-600 transition-colors">
                  {maestro.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} className="text-gray-400" />
                <span>{maestro.telefono}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedTeacher(maestro.nombre)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm"
              >
                <Calendar size={16} />
                Ver Calendario
              </button>
              <button
                onClick={() => onCreateScheduleForTeacher?.(maestro.id, maestro.nombre)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                <Plus size={16} />
                Crear Horario
              </button>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Teacher Calendar Modal */}
      {selectedTeacher && (
        <TeacherCalendarModal
          teacherName={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
        />
      )}
    </div>
  );
}