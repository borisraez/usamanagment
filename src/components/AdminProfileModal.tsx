import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Briefcase, 
  CheckCircle2, 
  Save,
  KeyRound,
  Leaf
} from 'lucide-react';
import { SystemUser } from '../types';
import { storageService } from '../services/storageService';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SystemUser;
  onUserUpdated: (user: SystemUser) => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}) => {
  const [nombre, setNombre] = useState(currentUser.nombre);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState(currentUser.password || 'admin');
  const [telefono, setTelefono] = useState(currentUser.telefono || '+51 984 123 456');
  const [especialidad, setEspecialidad] = useState(currentUser.especialidad || 'Dirección de Salud Ambiental & Sistemas');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updated = storageService.updateUser(currentUser.id, {
      nombre,
      email,
      password,
      telefono,
      especialidad,
    });

    if (updated) {
      onUserUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-emerald-600/40 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Credenciales de Administrador
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  SALUD AMBIENTAL
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Personalice su nombre, correo y contraseña de acceso como Administrador Maestro.
              </p>
            </div>
          </div>
          <button
            id="btn-close-admin-profile"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {savedSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>¡Credenciales de Administrador actualizadas exitosamente!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nombre Completo del Administrador
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="input-admin-name"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Ing. Boris Ráez"
                className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico (Login)
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@saludambiental.gob.pe"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contraseña de Acceso
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-admin-password"
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese contraseña"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Teléfono / WhatsApp de Contacto
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="input-admin-phone"
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+51 984 123 456"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cargo / Especialidad
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  id="input-admin-specialty"
                  type="text"
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                  placeholder="Dirección de Salud Ambiental"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              id="btn-cancel-admin-profile"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-save-admin-profile"
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar Credenciales
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
