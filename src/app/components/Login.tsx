import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogIn, User, Lock } from 'lucide-react';
import logoUdlap from '@/assets/92775d04c7cc079b5a7d99cfa46440040369fda4.png';
import { loginUser } from '../lib/api';

export function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir al panel
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    loginUser({ id: userId, password })
      .then((response) => {
        if (!response.ok || !response.user) {
          throw new Error('No se pudo iniciar sesión');
        }

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', response.user.id);
        localStorage.setItem('userRole', response.user.rol);
        navigate('/admin');
      })
      .catch((loginError: unknown) => {
        setError(loginError instanceof Error ? loginError.message : 'ID o contraseña incorrectos');
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logoUdlap} alt="UDLAP Logo" className="h-24 w-auto" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel de Administración</h1>
            <p className="text-sm text-gray-600">Sistema de Gestión Académica UDLAP</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                ID de usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="username"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Ingresa tu ID de 6 dígitos"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Ingresa tu contraseña"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <LogIn size={20} />
              Ingresar
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              <span className="font-semibold">Demo:</span> IDs 181266, 180892, 177941, 180593, 180293
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}