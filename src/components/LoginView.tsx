import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Leaf, 
  User, 
  Lock, 
  ArrowRight, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Phone, 
  CreditCard, 
  Briefcase,
  KeyRound,
  Info
} from 'lucide-react';
import { SystemUser } from '../types';
import { storageService } from '../services/storageService';

interface LoginViewProps {
  onLoginSuccess: (user: SystemUser) => void;
  onOpenAdminSetup?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
}) => {
  // Tabs: 'LOGIN' or 'REGISTER'
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form States
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register Technician Form States: Only Nombres y apellidos, DNI, Teléfono / WhatsApp, Correo electrónico y Contraseña
  const [regNombre, setRegNombre] = useState('');
  const [regDni, setRegDni] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!emailOrUser.trim()) {
      setErrorMessage('Por favor ingrese su correo electrónico institucional.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = storageService.authenticate(emailOrUser, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Credenciales no válidas. Verifique sus datos.');
      }
    }, 200);
  };

  const handleRegisterFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regNombre.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Por favor complete los campos obligatorios (*).');
      return;
    }

    setIsRegistering(true);
    setTimeout(() => {
      const res = storageService.registerTechnician({
        nombre: regNombre.trim(),
        dni: regDni.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        telefono: regTelefono.trim(),
      });

      setIsRegistering(false);

      if (res.success && res.user) {
        setSuccessMessage(
          `¡Solicitud de registro enviada con éxito! Su cuenta de Técnico está en estado PENDIENTE. El Administrador Maestro (Ing. Boris Ráez) revisará y validará su solicitud para habilitar su acceso al sistema.`
        );
        setEmailOrUser(res.user.email);
        setPassword('');
        setActiveTab('LOGIN');
        // Reset form
        setRegNombre('');
        setRegDni('');
        setRegEmail('');
        setRegPassword('');
        setRegTelefono('');
      } else {
        setErrorMessage(res.error || 'No se pudo procesar el registro.');
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-white">
      {/* Background ambient lighting - Emerald/Green Salud Ambiental */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-600/30 mb-3 border border-emerald-400/30">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          
          <div className="inline-block mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full">
              Salud Ambiental & Vigilancia Sanitaria
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Sistema de Gestión y Trazabilidad
          </h2>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Plataforma operativa de atenciones técnicas, registro de evidencias y conformidad digital con firma en campo.
          </p>
        </div>

        {/* Tab Switcher: Iniciar Sesión vs Crear Cuenta */}
        <div className="mt-6 flex bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            id="tab-login-mode"
            type="button"
            onClick={() => {
              setActiveTab('LOGIN');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'LOGIN'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            id="tab-register-mode"
            type="button"
            onClick={() => {
              setActiveTab('REGISTER');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'REGISTER'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Cuenta Técnico</span>
          </button>
        </div>

        {/* Global Notifications */}
        {successMessage && (
          <div className="mt-3 p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-emerald-300 text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Solicitud de Registro Registrada</span>
              <p className="text-[11px] text-emerald-200/90 leading-relaxed">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: INICIO DE SESIÓN */}
        {activeTab === 'LOGIN' && (
          <div className="mt-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl shadow-black/60">
            <form onSubmit={handleLoginFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo Electrónico Institucional o Usuario
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-email"
                    type="text"
                    required
                    value={emailOrUser}
                    onChange={(e) => setEmailOrUser(e.target.value)}
                    placeholder="admin@saludambiental.gob.pe o tec@..."
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Contraseña / Clave de Acceso
                  </label>
                </div>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Ingresar al Sistema</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Subtle Credentials Reference for Quick Testing */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5 bg-slate-950/40 p-3 rounded-xl">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                <span>Credenciales de Acceso al Sistema:</span>
              </div>
              <div className="grid grid-cols-1 gap-1 text-[10px] text-slate-400">
                <p>
                  • <strong className="text-emerald-400">Administrador:</strong> <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">admin@saludambiental.gob.pe</code> (clave: <code className="text-slate-200">admin</code>)
                </p>
                <p>
                  • <strong className="text-emerald-400">Técnico Aprobado:</strong> <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-200">roberto.gomez@saludambiental.gob.pe</code> (clave: <code className="text-slate-200">tec</code>)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CREACIÓN DE CUENTA DE TÉCNICO (Requiere Validación de Administrador) */}
        {activeTab === 'REGISTER' && (
          <div className="mt-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl shadow-black/60">
            <div className="mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" />
                Registro de Nuevo Personal Técnico
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                El rol asignado será de <strong>TÉCNICO OPERATIVO</strong>. Su cuenta será creada en estado pendiente y requerirá validación del Administrador.
              </p>
            </div>

            <form onSubmit={handleRegisterFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Completo y Apellidos *
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-reg-name"
                    type="text"
                    required
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    placeholder="Ej. Téc. Juan Pérez Morales"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    DNI / Documento *
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <input
                      id="input-reg-dni"
                      type="text"
                      required
                      value={regDni}
                      onChange={(e) => setRegDni(e.target.value)}
                      placeholder="Ej. 44892014"
                      className="block w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="input-reg-phone"
                      type="text"
                      required
                      value={regTelefono}
                      onChange={(e) => setRegTelefono(e.target.value)}
                      placeholder="+51 987 654 321"
                      className="block w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo Electrónico Institucional *
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-reg-email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nombre.apellido@saludambiental.gob.pe"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contraseña de Acceso *
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-reg-password"
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-amber-300 text-[11px]">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Flujo de Validación:</strong> Al registrarse, su cuenta quedará en estado <em>Pendiente de Validación</em>. El Administrador Maestro revisará y activará su cuenta para que pueda ingresar.
                </span>
              </div>

              <button
                id="btn-submit-register-tech"
                type="submit"
                disabled={isRegistering}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isRegistering ? (
                  <span>Registrando solicitud...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Enviar Solicitud de Registro de Técnico</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
