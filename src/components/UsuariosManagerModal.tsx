import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Key, 
  Mail, 
  Phone, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Save, 
  Check, 
  Ban,
  Clock,
  UserCheck,
  UserX,
  CreditCard,
  Lock,
  User
} from 'lucide-react';
import { SystemUser, UserRole } from '../types';
import { storageService } from '../services/storageService';

interface UsuariosManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SystemUser;
  onUsersChange: () => void;
}

export const UsuariosManagerModal: React.FC<UsuariosManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUsersChange,
}) => {
  const [usersList, setUsersList] = useState<SystemUser[]>(() => storageService.getUsers());
  const [activeTab, setActiveTab] = useState<'APROBADOS' | 'PENDIENTES'>('APROBADOS');
  const [isCreating, setIsCreating] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form states for Create/Edit: Only Nombres y apellidos, DNI, Teléfono / WhatsApp, Correo electrónico y Contraseña
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('tec123');
  const [rol, setRol] = useState<UserRole>('TECNICO');
  const [telefono, setTelefono] = useState('');
  const [activo, setActivo] = useState(true);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const refreshList = () => {
    const fresh = storageService.getUsers();
    setUsersList(fresh);
    onUsersChange();
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const pendingUsers = usersList.filter(u => u.estado_aprobacion === 'PENDIENTE');
  const approvedUsers = usersList.filter(u => u.estado_aprobacion !== 'PENDIENTE');

  const handleStartCreate = () => {
    setEditingUserId(null);
    setNombre('');
    setDni('');
    setEmail('');
    setPassword('tec123');
    setRol('TECNICO');
    setTelefono('+51 9');
    setActivo(true);
    setIsCreating(true);
  };

  const handleStartEdit = (user: SystemUser) => {
    setIsCreating(false);
    setEditingUserId(user.id);
    setNombre(user.nombre);
    setDni(user.dni || '');
    setEmail(user.email);
    setPassword(user.password || '');
    setRol(user.rol);
    setTelefono(user.telefono || '');
    setActivo(user.activo !== false);
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingUserId(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim()) {
      showNotification('error', 'El nombre y correo son obligatorios.');
      return;
    }

    try {
      if (isCreating) {
        storageService.createUser({
          nombre: nombre.trim(),
          dni: dni.trim(),
          email: email.trim(),
          password: password || '123456',
          rol,
          telefono: telefono.trim(),
          activo,
          estado_aprobacion: 'APROBADO',
          avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`,
        }, currentUser);

        showNotification('success', `Técnico "${nombre}" registrado exitosamente.`);
        setIsCreating(false);
      } else if (editingUserId) {
        storageService.updateUser(editingUserId, {
          nombre: nombre.trim(),
          dni: dni.trim(),
          email: email.trim(),
          password,
          rol,
          telefono: telefono.trim(),
          activo,
        }, currentUser);

        showNotification('success', `Datos de "${nombre}" actualizados correctamente.`);
        setEditingUserId(null);
      }

      refreshList();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar usuario';
      showNotification('error', msg);
    }
  };

  const handleApproveUser = (user: SystemUser) => {
    try {
      storageService.approveUser(user.id, currentUser);
      showNotification('success', `¡Cuenta de ${user.nombre} APROBADA exitosamente! El técnico ya puede iniciar sesión.`);
      refreshList();
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'Error al aprobar usuario');
    }
  };

  const handleRejectUser = (user: SystemUser) => {
    const motivo = window.prompt(`Indique el motivo del rechazo para ${user.nombre}:`, 'Datos no verificados o personal no autorizado');
    if (motivo !== null) {
      try {
        storageService.rejectUser(user.id, currentUser, motivo);
        showNotification('success', `Solicitud de ${user.nombre} rechazada.`);
        refreshList();
      } catch (err: unknown) {
        showNotification('error', err instanceof Error ? err.message : 'Error al rechazar usuario');
      }
    }
  };

  const handleToggleActivo = (user: SystemUser) => {
    const updated = storageService.updateUser(user.id, {
      activo: !user.activo,
    }, currentUser);
    if (updated) {
      showNotification('success', `Estado de ${user.nombre} cambiado a ${updated.activo ? 'Activo' : 'Inactivo'}.`);
      refreshList();
    }
  };

  const handleDeleteUser = (user: SystemUser) => {
    if (user.id === currentUser.id) {
      showNotification('error', 'No puede eliminar su propia cuenta de Administrador.');
      return;
    }

    if (window.confirm(`¿Está seguro de eliminar al técnico ${user.nombre}? Esta acción no se puede deshacer.`)) {
      try {
        storageService.deleteUser(user.id, currentUser);
        showNotification('success', `Técnico ${user.nombre} eliminado satisfactoriamente.`);
        refreshList();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al eliminar usuario';
        showNotification('error', msg);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-emerald-600/30 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden animate-in fade-in duration-200 text-white max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Gestión de Personal Técnico
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  ADMINISTRADOR
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Administre el personal técnico habilitado para atenciones en campo.
              </p>
            </div>
          </div>
          <button
            id="btn-close-users-manager"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {notification && (
          <div className={`p-3 mx-4 mt-3 rounded-xl flex items-center gap-2 text-xs shrink-0 ${
            notification.type === 'success' 
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Modal Sub-Tabs: Aprobados vs Pendientes */}
        <div className="px-4 sm:px-6 pt-3 flex items-center gap-2 border-b border-slate-800 shrink-0">
          <button
            id="tab-view-approved"
            onClick={() => {
              setActiveTab('APROBADOS');
              setIsCreating(false);
              setEditingUserId(null);
            }}
            className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'APROBADOS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Técnicos Habilitados ({approvedUsers.length})</span>
          </button>

          <button
            id="tab-view-pending"
            onClick={() => {
              setActiveTab('PENDIENTES');
              setIsCreating(false);
              setEditingUserId(null);
            }}
            className={`pb-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer relative ${
              activeTab === 'PENDIENTES'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Solicitudes Pendientes</span>
            {pendingUsers.length > 0 && (
              <span className="ml-1 bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top Actions for Aprobados */}
          {activeTab === 'APROBADOS' && !isCreating && !editingUserId && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Personal Técnico Acreditado
                </h4>
                <p className="text-[11px] text-slate-400">
                  Cuentas habilitadas para atención en campo.
                </p>
              </div>
              <button
                id="btn-create-new-tech"
                onClick={handleStartCreate}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Agregar Técnico</span>
              </button>
            </div>
          )}

          {/* Form: Create or Edit User */}
          {(isCreating || editingUserId) && (
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 sm:p-5 shadow-lg">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h4 className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-2">
                  {isCreating ? <UserPlus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  {isCreating ? 'Registrar Personal Técnico' : 'Editar Datos de Personal Técnico'}
                </h4>
                <button
                  onClick={handleCancelForm}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nombres y apellidos *
                    </label>
                    <input
                      id="input-user-form-name"
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Roberto Gómez"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      DNI *
                    </label>
                    <input
                      id="input-user-form-dni"
                      type="text"
                      required
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      placeholder="Ej. 44892014"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      id="input-user-form-phone"
                      type="text"
                      required
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+51 987 654 321"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Correo electrónico *
                    </label>
                    <input
                      id="input-user-form-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="roberto.gomez@saludambiental.gob.pe"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contraseña *
                  </label>
                  <input
                    id="input-user-form-password"
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña de acceso"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="checkbox-user-form-active"
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded bg-slate-900 border-slate-700 focus:ring-emerald-500"
                  />
                  <label htmlFor="checkbox-user-form-active" className="text-xs text-slate-300 cursor-pointer">
                    Cuenta Habilitada y Activa para asignaciones de campo
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-900/30"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 1 CONTENT: APPROVED USERS TABLE */}
          {activeTab === 'APROBADOS' && !isCreating && !editingUserId && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {approvedUsers.map((user) => {
                  const isSelf = user.id === currentUser.id;
                  const isAdmin = user.rol === 'ADMINISTRADOR';

                  return (
                    <div
                      key={user.id}
                      className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={user.nombre}
                          className="w-10 h-10 rounded-full border border-slate-700 shrink-0 mt-0.5"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white truncate">
                              {user.nombre}
                            </span>
                            {isSelf && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-md font-bold">
                                Tú (Sesión Activa)
                              </span>
                            )}
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              isAdmin 
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}>
                              {user.rol}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                              user.activo !== false 
                                ? 'text-emerald-400 bg-emerald-950/60' 
                                : 'text-rose-400 bg-rose-950/60'
                            }`}>
                              {user.activo !== false ? '• Activo' : '• Inactivo'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                            {user.dni && (
                              <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-300">
                                <CreditCard className="w-3 h-3 text-emerald-500" />
                                DNI: {user.dni}
                              </span>
                            )}
                            {user.telefono && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-500" />
                                {user.telefono}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              {user.email}
                            </span>
                            {user.password && (
                              <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                                <Lock className="w-3 h-3 text-slate-500" />
                                Clave: {user.password}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          id={`btn-edit-user-${user.id}`}
                          onClick={() => handleStartEdit(user)}
                          title="Editar datos y contraseña"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        {!isSelf && (
                          <>
                            <button
                              id={`btn-toggle-active-${user.id}`}
                              onClick={() => handleToggleActivo(user)}
                              title={user.activo !== false ? 'Desactivar cuenta' : 'Activar cuenta'}
                              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                user.activo !== false
                                  ? 'text-amber-400 hover:bg-amber-500/10'
                                  : 'text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                            >
                              {user.activo !== false ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </button>

                            <button
                              id={`btn-delete-user-${user.id}`}
                              onClick={() => handleDeleteUser(user)}
                              title={`Eliminar técnico ${user.nombre}`}
                              className="px-2.5 py-1.5 text-rose-300 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span>Eliminar</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: PENDING REGISTRATIONS REQUIRING APPROVAL */}
          {activeTab === 'PENDIENTES' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Bandeja de Validación de Nuevas Cuentas:</span>
                  <p className="text-[11px] text-amber-200/90 mt-0.5">
                    Estas solicitudes fueron enviadas por técnicos desde el formulario de auto-registro. Al aprobar, el técnico podrá iniciar sesión de inmediato en el portal operativo.
                  </p>
                </div>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-white">No hay solicitudes de registro pendientes</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Todas las solicitudes de cuenta han sido revisadas y procesadas.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                          {user.nombre.charAt(0)}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">
                              {user.nombre}
                            </span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                              PENDIENTE DE APROBACIÓN
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-slate-300">
                            {user.dni && (
                              <span className="flex items-center gap-1 font-mono text-[10px]">
                                <CreditCard className="w-3 h-3 text-slate-500" />
                                DNI: {user.dni}
                              </span>
                            )}
                            {user.telefono && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-500" />
                                {user.telefono}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              {user.email}
                            </span>
                          </div>

                          {user.fecha_solicitud_registro && (
                            <p className="text-[10px] text-slate-500">
                              Solicitud enviada el: {new Date(user.fecha_solicitud_registro).toLocaleDateString()} {new Date(user.fecha_solicitud_registro).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Approval / Rejection Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          id={`btn-approve-user-${user.id}`}
                          onClick={() => handleApproveUser(user)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-900/30"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Aprobar</span>
                        </button>

                        <button
                          id={`btn-reject-user-${user.id}`}
                          onClick={() => handleRejectUser(user)}
                          className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <UserX className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
