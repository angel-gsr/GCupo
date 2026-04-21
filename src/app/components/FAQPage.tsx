import { useNavigate } from 'react-router';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import logoUdlap from '@/assets/92775d04c7cc079b5a7d99cfa46440040369fda4.png';

export function FAQPage() {
  const navigate = useNavigate();

  const faqs = [
    {
      question: '¿Cómo busco un salón disponible?',
      answer: 'Ve a la pestaña "Salones" y utiliza los filtros disponibles. Puedes filtrar por sección (LA, AU, BI, etc.), edificio, equipamiento, capacidad y disponibilidad por fecha/hora. También puedes usar el buscador para encontrar un salón específico por nombre.'
    },
    {
      question: '¿Cómo creo un nuevo horario?',
      answer: 'Haz clic en el botón "Crear un nuevo horario" en la parte superior derecha. Esto abrirá un wizard que te guiará paso a paso: primero seleccionas el maestro y la materia, luego el salón y horario (puedes seleccionar hasta 2 horarios para la misma materia), y finalmente confirmas la creación.'
    },
    {
      question: '¿Cómo veo el horario de un maestro?',
      answer: 'Ve a la pestaña "Maestros Disponibles" y busca al maestro que deseas consultar. Cada maestro tiene un calendario que muestra sus horarios, salones y materias asignadas. También puedes usar el buscador para encontrar maestros por nombre o por las materias que imparten.'
    },
    {
      question: '¿Cómo veo el calendario de un salón?',
      answer: 'En la pestaña "Salones", localiza el salón que deseas consultar y haz clic en el botón "Ver Calendario". Esto mostrará el horario semanal del salón con todas las clases programadas. Desde el calendario también puedes agregar nuevos horarios.'
    },
    {
      question: '¿Cómo busco los horarios de una materia específica?',
      answer: 'Ve a la pestaña "Materias" y utiliza el buscador para encontrar la materia que deseas. Puedes buscar escribiendo el nombre de la materia o seleccionándola del listado. El sistema mostrará todos los horarios, maestros y salones asociados a esa materia.'
    },
    {
      question: '¿Qué equipamiento está disponible en los salones?',
      answer: 'Cada salón tiene listado su equipamiento específico. Los equipamientos comunes incluyen: Proyector, Computadoras, Aire acondicionado, Pizarrón interactivo, y Sistema de audio. Puedes filtrar salones por equipamiento en la pestaña "Salones".'
    },
    {
      question: '¿Cómo asigno un horario a un maestro específico desde su perfil?',
      answer: 'En la pestaña "Maestros Disponibles", cada maestro tiene un botón "Crear Horario". Al hacer clic, se abrirá el wizard de creación de horarios con el maestro ya preseleccionado, facilitando la asignación rápida.'
    },
    {
      question: '¿Puedo filtrar salones por disponibilidad en un horario específico?',
      answer: 'Sí, en la sección de filtros de "Salones" encontrarás la opción "Buscar por Fecha y Hora Disponible". Selecciona el día de la semana y la hora, y el sistema mostrará únicamente los salones disponibles en ese horario.'
    },
    {
      question: '¿Cómo agrego un horario desde el calendario de un salón?',
      answer: 'Cuando veas el calendario de un salón (botón "Ver Calendario"), encontrarás un botón "Agregar Horario". Esto te permitirá asignar un profesor, materia y horario directamente a ese salón específico.'
    },
    {
      question: '¿Dónde puedo actualizar mi información de usuario?',
      answer: 'Haz clic en el icono de usuario en la parte superior derecha del panel. Esto te llevará a la página de configuración donde podrás ver y actualizar tu información personal.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logoUdlap} alt="UDLAP Logo" className="h-20 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Preguntas Frecuentes</h1>
                <p className="text-sm text-gray-600">Sistema de Gestión Académica</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <ArrowLeft size={20} />
              Volver al Panel
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="text-orange-500" size={32} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Centro de Ayuda</h2>
              <p className="text-sm text-gray-600">Encuentra respuestas a las preguntas más comunes</p>
            </div>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">¿Necesitas más ayuda?</h3>
            <p className="text-sm text-gray-600">
              Si tienes alguna pregunta adicional o necesitas asistencia técnica, 
              contacta al departamento de soporte técnico en: <span className="font-medium text-orange-600">soporte@udlap.mx</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
