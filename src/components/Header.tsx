import React, { useState } from 'react';
import { 
  ClipboardList, 
  Activity, 
  ShieldCheck, 
  TestTube2, 
  Plus, 
  User, 
  FileSpreadsheet, 
  MessageSquare,
  ChevronDown,
  Leaf,
  Users,
  KeyRound,
  LogOut,
  Menu,
  X,
  UserCheck,
  Building2,
  ListChecks
} from 'lucide-react';
import { SystemUser, UserRole } from '../types';
import { SimulationConfig, storageService } from '../services/storageService';

interface HeaderProps {
  activeTab: 'ATENCIONES' | 'INTEGRACIONES' | 'AUDITORIA' | 'PRUEBAS';
  setActiveTab: (tab: 'ATENCIONES' | 'INTEGRACIONES' | 'AUDITORIA' | 'PRUEBAS') => void;
  currentUser: SystemUser;
  onUserChange: (user: SystemUser) => void;
  config: SimulationConfig;
  onOpenNuevaAtencion: () => void;
  onOpenUsuariosManager: () => void;
  onOpenAreasManager: () => void;
  onOpenActividadesManager: () => void;
  onOpenAdminProfile: () => void;
  onOpenWhatsAppConfig?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onUserChange,
  config,
  onOpenNuevaAtencion,
  onOpenUsuariosManager,
  onOpenAreasManager,
  onOpenActividadesManager,
  onOpenAdminProfile,
  onOpenWhatsAppConfig,
  onLogout,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const users = storageService.getUsers();
  const totalAreas = storageService.getAreas().length;
  const totalActividades = storageService.getActividades().length;
  const atencionesList = storageService.getAtenciones();
  const disponiblesCount = atencionesList.filter(a => 
    (!a.tecnico_id || a.estado_operativo === 'REGISTRADA') && 
    a.estado_operativo !== 'CONFORME_FINALIZADA' && 
    a.estado_operativo !== 'CERRADA_CON_OBSERVACION'
  ).length;

  const roleBadges: Record<UserRole, string> = {
    ADMINISTRADOR: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    COORDINADOR: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    TECNICO: 'bg-lime-500/20 text-lime-300 border-lime-500/40',
    CLIENTE: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  };

  return (
    <header className="bg-slate-950 text-white border-b border-emerald-950/80 sticky top-0 z-40 shadow-lg shadow-black/40">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Title (Health/Environmental Green) */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md shadow-emerald-900/30 border border-emerald-400/30 shrink-0">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-white truncate flex items-center gap-1">
                  <span className="text-emerald-400 font-black tracking-wider">ATENSA</span>
                  <span className="text-slate-500 font-normal hidden sm:inline">•</span>
                  <span className="text-slate-200 text-xs sm:text-sm font-bold truncate">Salud Ambiental</span>
                </h1>
                <span className="text-[9px] sm:text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded-full font-bold shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  OPERATIVO
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block truncate">
                Atención de Servicios de Salud Ambiental • Registro en Campo & Conformidad Digital
              </p>
            </div>
          </div>

          {/* Right Action Items & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Realtime Integration Status Indicators (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800" title="Estado de Sincronización Google Sheets">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400 text-[11px]">Sheets:</span>
                <span className={`w-2 h-2 rounded-full ${config.sheetsOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              </div>
              <div className="flex items-center gap-1.5 pl-1" title="Estado de Canal WhatsApp">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400 text-[11px]">WhatsApp:</span>
                <span className={`w-2 h-2 rounded-full ${config.whatsAppOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              </div>
            </div>

            {/* Admin Direct Button for Areas & Activities Management */}
            {currentUser.rol === 'ADMINISTRADOR' && (
              <div className="hidden md:flex items-center gap-1.5">
                <button
                  id="btn-header-manage-areas"
                  type="button"
                  onClick={onOpenAreasManager}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-emerald-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 hover:border-emerald-700/50 transition-colors cursor-pointer"
                  title="Administrar catálogo de áreas hospitalarias (agregar o quitar)"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Áreas ({totalAreas})</span>
                </button>

                <button
                  id="btn-header-manage-actividades"
                  type="button"
                  onClick={onOpenActividadesManager}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-emerald-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 hover:border-emerald-700/50 transition-colors cursor-pointer"
                  title="Administrar catálogo de actividades de salud ambiental (agregar o quitar)"
                >
                  <ListChecks className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Actividades ({totalActividades})</span>
                </button>
              </div>
            )}

            {/* Quick Create Button */}
            <button
              id="btn-header-new-atencion"
              onClick={onOpenNuevaAtencion}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/30 flex items-center gap-1 sm:gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline sm:inline">Nueva Solicitud</span>
            </button>

            {/* User Profile & Role Switcher Dropdown (Responsive, No Overflow) */}
            <div className="relative">
              <button
                id="btn-user-profile-toggle"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 hover:bg-slate-850 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-800 hover:border-emerald-700/50 transition-colors cursor-pointer max-w-[140px] sm:max-w-[200px]"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.nombre}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-emerald-500/40 shrink-0"
                />
                <div className="text-left min-w-0 hidden xs:block sm:block">
                  <span className="text-[11px] font-bold text-white block truncate leading-tight">
                    {currentUser.nombre.split(' ')[0]}
                  </span>
                  <span className={`text-[9px] font-semibold px-1 py-0.1 rounded-xs border inline-block ${roleBadges[currentUser.rol]}`}>
                    {currentUser.rol}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-white animate-in fade-in-50 duration-150">
                  <div className="p-3 bg-slate-950/80 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.nombre}
                        className="w-10 h-10 rounded-full object-cover border border-emerald-500/50"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {currentUser.nombre}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {currentUser.email}
                        </p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm border inline-block mt-0.5 ${roleBadges[currentUser.rol]}`}>
                          {currentUser.rol}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    {/* Admin Profile Setup Button */}
                    <button
                      id="dropdown-btn-admin-profile"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenAdminProfile();
                      }}
                      className="w-full px-2.5 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                      <span>Mis Credenciales / Perfil</span>
                    </button>

                    {/* Manage Technicians and Users */}
                    <button
                      id="dropdown-btn-manage-users"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenUsuariosManager();
                      }}
                      className="w-full px-2.5 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Gestión de Cuentas y Técnicos</span>
                    </button>

                    {/* Manage Hospital Areas & Activities */}
                    {currentUser.rol === 'ADMINISTRADOR' && (
                      <>
                        <button
                          id="dropdown-btn-manage-areas"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onOpenAreasManager();
                          }}
                          className="w-full px-2.5 py-2 text-left text-xs text-emerald-300 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Building2 className="w-4 h-4 text-emerald-400" />
                          <span>Gestión de Áreas Hospitalarias ({totalAreas})</span>
                        </button>

                        <button
                          id="dropdown-btn-manage-actividades"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onOpenActividadesManager();
                          }}
                          className="w-full px-2.5 py-2 text-left text-xs text-emerald-300 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <ListChecks className="w-4 h-4 text-emerald-400" />
                          <span>Gestión de Actividades ({totalActividades})</span>
                        </button>

                        {onOpenWhatsAppConfig && (
                          <button
                            id="dropdown-btn-whatsapp-group-config"
                            onClick={() => {
                              setShowUserDropdown(false);
                              onOpenWhatsAppConfig();
                            }}
                            className="w-full px-2.5 py-2 text-left text-xs text-emerald-300 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4 text-emerald-400" />
                            <span>Vincular Grupo de WhatsApp</span>
                          </button>
                        )}
                      </>
                    )}

                    {/* Fast Switch User Section */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                        Cambiar de Cuenta Rápido:
                      </span>
                      <div className="max-h-36 overflow-y-auto space-y-0.5">
                        {users
                          .filter(u => u.estado_aprobacion !== 'PENDIENTE' && u.activo !== false)
                          .map(u => (
                          <button
                            key={u.id}
                            id={`switch-user-option-${u.id}`}
                            onClick={() => {
                              onUserChange(u);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full px-2 py-1.5 text-left text-[11px] rounded-lg flex items-center justify-between transition-colors ${
                              u.id === currentUser.id 
                                ? 'bg-emerald-950/80 text-emerald-300 font-bold' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <span className="truncate mr-1">{u.nombre}</span>
                            <span className="text-[9px] text-slate-400 shrink-0 font-mono">({u.rol})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-2 border-t border-slate-800">
                      <button
                        id="dropdown-btn-logout"
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full px-2.5 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión / Salir</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Nav Toggle */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg sm:hidden"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu (Horizontal Scroll, No Overflow) */}
        <div className="flex items-center gap-1 border-t border-slate-800/80 pt-1 -mb-px overflow-x-auto text-xs no-scrollbar">
          <button
            id="tab-btn-atenciones"
            onClick={() => setActiveTab('ATENCIONES')}
            className={`px-3 sm:px-4 py-2.5 font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ATENCIONES'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Tablero de Atenciones</span>
            {disponiblesCount > 0 && (
              <span className="bg-sky-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse shadow-xs" title="Solicitudes por tomar/asignar">
                {disponiblesCount} por tomar
              </span>
            )}
          </button>

          <button
            id="tab-btn-integraciones"
            onClick={() => setActiveTab('INTEGRACIONES')}
            className={`px-3 sm:px-4 py-2.5 font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'INTEGRACIONES'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Capa de Integraciones (Sheets & WhatsApp)</span>
            <span className="sm:hidden">Integraciones</span>
          </button>

          <button
            id="tab-btn-auditoria"
            onClick={() => setActiveTab('AUDITORIA')}
            className={`px-3 sm:px-4 py-2.5 font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'AUDITORIA'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoría & Trazabilidad</span>
          </button>

          <button
            id="tab-btn-pruebas"
            onClick={() => setActiveTab('PRUEBAS')}
            className={`px-3 sm:px-4 py-2.5 font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'PRUEBAS'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <TestTube2 className="w-4 h-4" />
            <span className="hidden sm:inline">Centro de Pruebas y Resiliencia</span>
            <span className="sm:hidden">Pruebas</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Options */}
      {showMobileMenu && (
        <div className="sm:hidden bg-slate-900 border-b border-slate-800 p-3 space-y-2 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between p-2 bg-slate-950 rounded-xl">
            <div className="flex items-center gap-2">
              <img src={currentUser.avatar} alt={currentUser.nombre} className="w-8 h-8 rounded-full" />
              <div>
                <p className="text-xs font-bold text-white">{currentUser.nombre}</p>
                <p className="text-[10px] text-slate-400">{currentUser.rol}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowMobileMenu(false);
                onLogout();
              }}
              className="text-xs text-rose-400 font-bold px-2 py-1 bg-rose-500/10 rounded-lg"
            >
              Salir
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setShowMobileMenu(false);
                onOpenAdminProfile();
              }}
              className="p-2 bg-slate-800 rounded-xl text-left text-xs text-emerald-400 flex items-center gap-1.5 font-semibold"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Mis Credenciales</span>
            </button>
            <button
              onClick={() => {
                setShowMobileMenu(false);
                onOpenUsuariosManager();
              }}
              className="p-2 bg-slate-800 rounded-xl text-left text-xs text-emerald-400 flex items-center gap-1.5 font-semibold"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Gestión Técnicos</span>
            </button>
            {currentUser.rol === 'ADMINISTRADOR' && (
              <>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onOpenAreasManager();
                  }}
                  className="p-2 bg-slate-800 rounded-xl text-left text-xs text-emerald-400 flex items-center gap-1.5 font-semibold"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Áreas ({totalAreas})</span>
                </button>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onOpenActividadesManager();
                  }}
                  className="p-2 bg-slate-800 rounded-xl text-left text-xs text-emerald-400 flex items-center gap-1.5 font-semibold"
                >
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>Actividades ({totalActividades})</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

