import { useState } from 'react';
import { Search, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Teacher } from '../types';

interface SelectTeacherStepProps {
  maestros: Teacher[];
  selectedTeacher: Teacher | null;
  selectedMateria: string;
  onSelectTeacher: (teacher: Teacher) => void;
  onSelectMateria: (materia: string) => void;
}

export function SelectTeacherStep({
  maestros,
  selectedTeacher,
  selectedMateria,
  onSelectTeacher,
  onSelectMateria,
}: SelectTeacherStepProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMaestros = maestros.filter(maestro =>
    maestro.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTeacherSelect = (teacher: Teacher) => {
    onSelectTeacher(teacher);
    // Si la materia seleccionada no está en las materias del nuevo maestro, resetearla
    if (!teacher.materias.includes(selectedMateria)) {
      onSelectMateria('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Teacher */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Buscar Maestro
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Escribe el nombre del maestro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          />
        </div>
      </div>

      {/* Teachers List */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Selecciona un Maestro ({filteredMaestros.length} encontrados)
        </label>
        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {filteredMaestros.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron maestros con ese nombre
            </div>
          ) : (
            filteredMaestros.map((maestro) => (
              <button
                key={maestro.id}
                onClick={() => handleTeacherSelect(maestro)}
                className={`w-full p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors text-left ${
                  selectedTeacher?.id === maestro.id ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <h3 className="font-semibold text-gray-900">{maestro.nombre}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{maestro.departamento}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{maestro.especialidad}</p>
                  </div>
                  {maestro.disponible ? (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                      <CheckCircle size={12} />
                      Disponible
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                      <XCircle size={12} />
                      Carga completa
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Teacher Details and Availability */}
      {selectedTeacher && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Información del Maestro</h3>
          
          {/* Availability */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700 flex items-center gap-1">
                <Clock size={14} />
                Carga horaria
              </span>
              <span className="text-sm font-medium text-gray-900">
                {selectedTeacher.horasAsignadas}/{selectedTeacher.horasMaximas} hrs
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  selectedTeacher.horasAsignadas >= selectedTeacher.horasMaximas
                    ? 'bg-red-500'
                    : selectedTeacher.horasAsignadas >= selectedTeacher.horasMaximas * 0.8
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${(selectedTeacher.horasAsignadas / selectedTeacher.horasMaximas) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {selectedTeacher.disponible
                ? `Disponible para ${selectedTeacher.horasMaximas - selectedTeacher.horasAsignadas} horas más`
                : 'No tiene horas disponibles'}
            </p>
          </div>

          {/* Select Subject */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Selecciona la Materia
            </label>
            <div className="space-y-2">
              {selectedTeacher.materias.map((materia, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectMateria(materia)}
                  className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                    selectedMateria === materia
                      ? 'border-orange-500 bg-white shadow-sm'
                      : 'border-gray-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{materia}</span>
                    {selectedMateria === materia && (
                      <CheckCircle size={18} className="text-orange-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!selectedTeacher && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <User size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Busca y selecciona un maestro para continuar</p>
        </div>
      )}
    </div>
  );
}
