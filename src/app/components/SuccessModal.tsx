import { CheckCircle, X } from 'lucide-react';

interface SuccessModalProps {
  onClose: () => void;
  data: {
    salon: string;
    profesor: string;
    materia: string;
    dias: string[];
    horaInicio: string;
    horaFin: string;
  };
}

export function SuccessModal({ onClose, data }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-fadeIn">
        {/* Header con icono de éxito */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3 animate-scaleIn">
              <CheckCircle size={48} className="text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            ¡Horario Creado Exitosamente!
          </h2>
          <p className="text-green-50">
            El nuevo horario ha sido agregado al sistema
          </p>
        </div>

        {/* Detalles del horario */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Salón</p>
              <p className="font-semibold text-gray-900">{data.salon}</p>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm text-gray-600 mb-1">Profesor</p>
              <p className="font-semibold text-gray-900">{data.profesor}</p>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm text-gray-600 mb-1">Materia</p>
              <p className="font-semibold text-gray-900">{data.materia}</p>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm text-gray-600 mb-1">Días</p>
              <div className="flex flex-wrap gap-2">
                {data.dias.map(dia => (
                  <span
                    key={dia}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium"
                  >
                    {dia}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm text-gray-600 mb-1">Horario</p>
              <p className="font-semibold text-gray-900">
                {data.horaInicio} - {data.horaFin}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p>
              El horario se ha registrado correctamente y ya está visible en el calendario del salón.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
