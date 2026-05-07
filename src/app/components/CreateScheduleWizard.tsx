import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Teacher, Classroom, TimeSlot } from './types';
import { maestros, salones as staticSalones } from './data';
import { SelectTeacherStep } from './wizard/SelectTeacherStep';
import { SelectScheduleStep } from './wizard/SelectScheduleStep';
import { SuccessStep } from './wizard/SuccessStep';
import { createSchedules, getClassrooms } from '../lib/api';

interface CreateScheduleWizardProps {
  onClose: () => void;
  preselectedTeacher?: { id: string; name: string } | null;
}

export function CreateScheduleWizard({ onClose, preselectedTeacher }: CreateScheduleWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedMateria, setSelectedMateria] = useState<string>('');
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [salones, setSalones] = useState<Classroom[]>(staticSalones);
  const [salonesError, setSalonesError] = useState('');
  const [isLoadingSalones, setIsLoadingSalones] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Si hay un maestro preseleccionado, seleccionarlo automáticamente
  useEffect(() => {
    let isMounted = true;

    if (preselectedTeacher) {
      const teacher = maestros.find(m => m.id === preselectedTeacher.id);
      if (teacher) {
        setSelectedTeacher(teacher);
      }
    }

    const loadSalones = async () => {
      try {
        const classrooms = await getClassrooms();

        if (isMounted) {
          setSalones(classrooms);
          setSalonesError('');
        }
      } catch (error) {
        console.error('Error loading classrooms for wizard from SQL', error);

        if (isMounted) {
          setSalones(staticSalones);
          setSalonesError('No se pudieron cargar los salones desde la base SQL. Se usó el catálogo local como respaldo.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingSalones(false);
        }
      }
    };

    loadSalones();

    return () => {
      isMounted = false;
    };
  }, [preselectedTeacher]);

  const handleNext = () => {
    if (step === 1 && selectedTeacher && selectedMateria) {
      setStep(2);
    } else if (step === 2 && selectedClassroom && selectedTimeSlots.length > 0) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleFinish = async () => {
    if (!selectedTeacher || !selectedClassroom || selectedTimeSlots.length === 0) {
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      await createSchedules(
        selectedTimeSlots.map((slot) => ({
          salon: selectedClassroom.nombre,
          profesor: selectedTeacher.nombre,
          materia: selectedMateria,
          dia: slot.dia,
          horaInicio: slot.horaInicio,
          horaFin: slot.horaFin,
        })),
      );

      onClose();
    } catch (error) {
      console.error('Error saving wizard schedule', error);
      setSaveError('No se pudo guardar el horario en la base SQL. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Horario</h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 1 && 'Paso 1: Selecciona maestro y materia'}
              {step === 2 && 'Paso 2: Selecciona salón y horario'}
              {step === 3 && '¡Horario creado exitosamente!'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Progress Indicator */}
        {step !== 3 && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-gray-200'}`} />
              <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {salonesError && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {salonesError}
            </div>
          )}

          {saveError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </div>
          )}

          {step === 1 && (
            <SelectTeacherStep
              maestros={maestros}
              selectedTeacher={selectedTeacher}
              selectedMateria={selectedMateria}
              onSelectTeacher={setSelectedTeacher}
              onSelectMateria={setSelectedMateria}
            />
          )}
          {step === 2 && selectedTeacher && !isLoadingSalones && (
            <SelectScheduleStep
              salones={salones}
              selectedClassroom={selectedClassroom}
              selectedTimeSlots={selectedTimeSlots}
              onSelectClassroom={setSelectedClassroom}
              onSelectTimeSlots={setSelectedTimeSlots}
              teacher={selectedTeacher}
              materia={selectedMateria}
            />
          )}
          {step === 2 && selectedTeacher && isLoadingSalones && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-600">
              Cargando salones desde la base SQL...
            </div>
          )}
          {step === 3 && selectedTeacher && selectedClassroom && selectedTimeSlots.length > 0 && (
            <SuccessStep
              teacher={selectedTeacher}
              materia={selectedMateria}
              classroom={selectedClassroom}
              timeSlots={selectedTimeSlots}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          {step === 1 && (
            <>
              <div />
              <button
                onClick={handleNext}
                disabled={!selectedTeacher || !selectedMateria}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Atrás
              </button>
              <button
                onClick={handleNext}
                disabled={!selectedClassroom || selectedTimeSlots.length === 0}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Finalizar
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <div />
              <button
                onClick={handleFinish}
                disabled={isSaving}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
              >
                <CheckCircle size={20} />
                {isSaving ? 'Guardando...' : 'Volver al inicio'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}