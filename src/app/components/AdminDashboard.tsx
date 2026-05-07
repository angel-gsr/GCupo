import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ClassroomsView } from './ClassroomsView';
import { TeachersView } from './TeachersView';
import { SubjectsView } from './SubjectsView';
import { CreateScheduleWizard } from './CreateScheduleWizard';
import { Plus, LogOut, HelpCircle, User } from 'lucide-react';
import logoUdlap from '@/assets/92775d04c7cc079b5a7d99cfa46440040369fda4.png';

type Tab = 'salones' | 'maestros' | 'materias';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('materias');
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [preselectedTeacher, setPreselectedTeacher] = useState<{ id: string; name: string } | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleCreateScheduleForTeacher = (teacherId: string, teacherName: string) => {
    setPreselectedTeacher({ id: teacherId, name: teacherName });
    setShowCreateSchedule(true);
  };

  const handleCloseSchedule = () => {
    setShowCreateSchedule(false);
    setPreselectedTeacher(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logoUdlap} alt="UDLAP Logo" className="h-20 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600">Sistema de Gestión Académica</p>
              </div>
            </div>
            
            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/faq')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Preguntas Frecuentes"
              >
                <HelpCircle className="text-gray-600" size={24} />
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Configuración de Usuario"
              >
                <User className="text-gray-600" size={24} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <LogOut size={20} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('materias')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'materias'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Materias
              </button>
              <button
                onClick={() => setActiveTab('maestros')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'maestros'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Docentes
              </button>
              <button
                onClick={() => setActiveTab('salones')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'salones'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Aulas
              </button>
            </nav>
            <button
              onClick={() => setShowCreateSchedule(true)}
              className="flex items-center gap-3 px-6 py-3 text-base bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold my-2 shadow-sm"
            >
              <Plus size={20} />
              Crear un nuevo horario
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'salones' && <ClassroomsView />}
        {activeTab === 'maestros' && <TeachersView onCreateScheduleForTeacher={handleCreateScheduleForTeacher} />}
        {activeTab === 'materias' && <SubjectsView />}
      </main>

      {/* Create Schedule Wizard */}
      {showCreateSchedule && (
        <CreateScheduleWizard 
          onClose={handleCloseSchedule}
          preselectedTeacher={preselectedTeacher}
        />
      )}
    </div>
  );
}