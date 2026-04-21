import { CheckCircle, User, BookOpen, MapPin, Calendar, Clock } from 'lucide-react';
import { Teacher, Classroom, TimeSlot } from '../types';

interface SuccessStepProps {
  teacher: Teacher;
  materia: string;
  classroom: Classroom;
  timeSlots: TimeSlot[];
}

export function SuccessStep({ teacher, materia, classroom, timeSlots }: SuccessStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={48} className="text-green-600" />
      </div>

      {/* Success Message */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Horario Creado Exitosamente!</h3>
      <p className="text-gray-600 mb-8">El nuevo horario ha sido agregado al sistema</p>

      {/* Schedule Summary */}
      <div className="w-full max-w-2xl bg-white border-2 border-green-200 rounded-lg p-6 space-y-4">
        <h4 className="font-semibold text-gray-900 text-lg mb-4 pb-2 border-b border-gray-200">
          Resumen del Horario
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Teacher Info */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <User size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Maestro</p>
              <p className="font-semibold text-gray-900">{teacher.nombre}</p>
              <p className="text-xs text-gray-600">{teacher.departamento}</p>
            </div>
          </div>

          {/* Subject Info */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BookOpen size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Materia</p>
              <p className="font-semibold text-gray-900">{materia}</p>
            </div>
          </div>

          {/* Classroom Info */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MapPin size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Salón</p>
              <p className="font-semibold text-gray-900">{classroom.nombre}</p>
              <p className="text-xs text-gray-600">{classroom.edificio}</p>
            </div>
          </div>

          {/* Schedule Info */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock size={20} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-2">Horarios ({timeSlots.length})</p>
              <div className="space-y-1">
                {timeSlots.map((slot, idx) => (
                  <div key={idx} className="font-semibold text-gray-900">
                    <span className="text-orange-600">{idx + 1}.</span> {slot.dia}, {slot.horaInicio} - {slot.horaFin}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} className="text-gray-400" />
            <span>
              El horario ha sido agregado al calendario del salón <span className="font-medium">{classroom.nombre}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Additional Message */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl">
        <p className="text-sm text-blue-800 text-center">
          Los estudiantes podrán inscribirse a esta materia en el próximo periodo de inscripciones
        </p>
      </div>
    </div>
  );
}
