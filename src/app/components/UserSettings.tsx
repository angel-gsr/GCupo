import { useNavigate } from 'react-router';
import { ArrowLeft, User, Mail, Phone, Building, Calendar, Shield } from 'lucide-react';
import logoUdlap from '@/assets/92775d04c7cc079b5a7d99cfa46440040369fda4.png';

export function UserSettings() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'admin';

  // Datos de usuario de ejemplo - en producción vendrían del backend
  const userInfo = {
    nombre: 'Dr. Juan Pérez García',
    usuario: username,
    email: 'juan.perez@udlap.mx',
    telefono: '222-229-2000 ext. 1000',
    departamento: 'Administración Académica',
    rol: 'Administrador del Sistema',
    fechaIngreso: '15 de Enero, 2020',
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
                <h1 className="text-2xl font-bold text-gray-900">Configuración de Usuario</h1>
                <p className="text-sm text-gray-600">Información personal y preferencias</p>
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
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
              <User className="text-orange-600" size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{userInfo.nombre}</h2>
              <p className="text-gray-600 mt-1">{userInfo.rol}</p>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Usuario */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="text-gray-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre de Usuario</p>
                  <p className="font-medium text-gray-900">{userInfo.usuario}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-gray-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Correo Electrónico</p>
                  <p className="font-medium text-gray-900">{userInfo.email}</p>
                </div>
              </div>

              {/* Teléfono */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="text-gray-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium text-gray-900">{userInfo.telefono}</p>
                </div>
              </div>

              {/* Departamento */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Building className="text-gray-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Departamento</p>
                  <p className="font-medium text-gray-900">{userInfo.departamento}</p>
                </div>
              </div>

              {/* Rol */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="text-gray-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rol</p>
                  <p className="font-medium text-gray-900">{userInfo.rol}</p>
                </div>
              </div>

              {/* Fecha de Ingreso */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-gray-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Ingreso</p>
                  <p className="font-medium text-gray-900">{userInfo.fechaIngreso}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias del Sistema</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Notificaciones por correo</p>
                  <p className="text-sm text-gray-600">Recibir alertas sobre cambios en horarios</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Vista compacta</p>
                  <p className="text-sm text-gray-600">Mostrar más información en pantalla</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
