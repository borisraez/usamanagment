import React, { useState, useMemo } from 'react';
import { 
  Atencion, 
  SystemUser, 
  EstadoOperativo 
} from '../types';
import { storageService } from '../services/storageService';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Play, 
  Plus, 
  Search, 
  Filter, 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  Tag, 
  AlertCircle, 
  Star, 
  Leaf, 
  LogOut, 
  FileText, 
  ArrowRight,
  ExternalLink,
  Camera,
  Eye,
  CheckCircle,
  Compass,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ChevronDown,
  HelpCircle,
  Info,
  BookOpen,
  X,
  UserCheck
} from 'lucide-react';

interface TecnicoDashboardProps {
  atenciones: Atencion[];
  currentUser: SystemUser;
  onSelectAtencion: (atencion: Atencion) => void;
  onOpenNuevaAtencion: (tipo?: 'SOLICITUD' | 'RECORRIDO_OPERATIVO') => void;
  onOpenPublicConformidad: (tokenHash: string) => void;
  onRefreshData: () => void;
  onLogout: () => void;
}

export const TecnicoDashboard: React.FC<TecnicoDashboardProps> = ({
  atenciones,
  currentUser,
  onSelectAtencion,
  onOpenNuevaAtencion,
  onOpenPublicConformidad,
  onRefreshData,
  onLogout,
}) => {
  // Navigation: 'INICIO' (Simple Main View) vs 'RESUMEN' (Cuadro Resumen de Atenciones)
  const [currentTab, setCurrentTab] = useState<'INICIO' | 'RESUMEN'>('INICIO');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'TODAS' | 'DISPONIBLES' | 'EN_PROCESO' | 'PENDIENTE_QR' | 'CONFORMES' | 'TODAS_HOSPITAL'>('TODAS');
  const [showDropdownNew, setShowDropdownNew] = useState(false);
  const [showGuiaPrioridades, setShowGuiaPrioridades] = useState(false);
  const [showDisponiblesDropdown, setShowDisponiblesDropdown] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Filter ONLY atenciones assigned to or created by THIS technician
  const misAtenciones = useMemo(() => {
    return atenciones.filter(a => 
      a.tecnico_id === currentUser.id || 
      a.tecnico_nombre?.toLowerCase() === currentUser.nombre.toLowerCase()
    );
  }, [atenciones, currentUser]);

  // Solicitudes creadas disponibles para que cualquier técnico las tome (sin asignar o en estado REGISTRADA)
  const solicitudesDisponibles = useMemo(() => {
    return atenciones.filter(a => 
      (!a.tecnico_id || a.estado_operativo === 'REGISTRADA') &&
      a.estado_operativo !== 'CONFORME_FINALIZADA' &&
      a.estado_operativo !== 'CERRADA_CON_OBSERVACION'
    );
  }, [atenciones]);

  // Metrics calculations
  const totalMisAtenciones = misAtenciones.length;
  const enProcesoList = useMemo(() => 
    misAtenciones.filter(a => a.estado_operativo === 'EN_PROCESO' || a.estado_operativo === 'ASIGNADA' || a.estado_operativo === 'REGISTRADA'),
    [misAtenciones]
  );
  const pendientesQrList = useMemo(() => 
    misAtenciones.filter(a => a.estado_operativo === 'CERRADA_PENDIENTE_CONFORMIDAD'),
    [misAtenciones]
  );
  const conformesList = useMemo(() => 
    misAtenciones.filter(a => a.estado_operativo === 'CONFORME_FINALIZADA'),
    [misAtenciones]
  );

  const conformidades = misAtenciones
    .filter(a => a.conformidad && typeof a.conformidad.calificacion === 'number')
    .map(a => a.conformidad!.calificacion);

  const calificacionPromedio = conformidades.length > 0 
    ? (conformidades.reduce((acc, curr) => acc + curr, 0) / conformidades.length).toFixed(1)
    : '5.0';

  // Filtered list for summary view
  const filteredList = useMemo(() => {
    let sourceList = misAtenciones;
    if (activeFilter === 'DISPONIBLES') {
      sourceList = solicitudesDisponibles;
    } else if (activeFilter === 'TODAS_HOSPITAL') {
      sourceList = atenciones;
    }

    return sourceList.filter(a => {
      // Filter by tab
      if (activeFilter === 'EN_PROCESO') {
        if (a.estado_operativo !== 'EN_PROCESO' && a.estado_operativo !== 'ASIGNADA' && a.estado_operativo !== 'REGISTRADA') return false;
      } else if (activeFilter === 'PENDIENTE_QR') {
        if (a.estado_operativo !== 'CERRADA_PENDIENTE_CONFORMIDAD') return false;
      } else if (activeFilter === 'CONFORMES') {
        if (a.estado_operativo !== 'CONFORME_FINALIZADA') return false;
      }

      // Filter by search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchCode = a.codigo_visible.toLowerCase().includes(query);
        const matchName = a.solicitante_nombre.toLowerCase().includes(query);
        const matchArea = (a.solicitante_area || a.solicitante_ubicacion || '').toLowerCase().includes(query);
        const matchCat = a.categoria.toLowerCase().includes(query);
        const matchDesc = (a.descripcion || '').toLowerCase().includes(query);
        const matchTech = (a.tecnico_nombre || '').toLowerCase().includes(query);
        return matchCode || matchName || matchArea || matchCat || matchDesc || matchTech;
      }

      return true;
    });
  }, [misAtenciones, solicitudesDisponibles, atenciones, activeFilter, searchTerm]);

  // Quick Action: Iniciar Atención
  const handleQuickIniciar = (e: React.MouseEvent, atencion: Atencion) => {
    e.stopPropagation();
    try {
      const updated = storageService.iniciarAtencion(atencion.id, currentUser);
      onRefreshData();
      onSelectAtencion(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al iniciar atención');
    }
  };

  // Quick Action: Tomar Solicitud
  const handleTomarSolicitud = (e: React.MouseEvent, atencion: Atencion, autoIniciar: boolean = false) => {
    e.stopPropagation();
    try {
      storageService.asignarTecnico(atencion.id, currentUser, currentUser);
      let updated = storageService.getAtencionById(atencion.id) || atencion;
      if (autoIniciar) {
        updated = storageService.iniciarAtencion(atencion.id, currentUser);
      }
      onRefreshData();
      onSelectAtencion(updated);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al tomar la solicitud');
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICA':
        return 'bg-red-500/20 text-red-300 border-red-500/50 shadow-xs shadow-red-950/40 font-extrabold';
      case 'ALTA':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-xs shadow-rose-950/40 font-extrabold';
      case 'MEDIA':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs shadow-amber-950/40 font-extrabold';
      case 'BAJA':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-xs shadow-emerald-950/40 font-extrabold';
    }
  };

  // Cleaned technician name (without "Téc.", "Tec.", etc.)
  const cleanFullName = useMemo(() => {
    return currentUser.nombre
      .replace(/^(téc\.|tec\.|técnico|tecnico|dr\.|dra\.|lic\.)\s+/i, '')
      .trim() || currentUser.nombre;
  }, [currentUser.nombre]);

  const cleanFirstName = useMemo(() => {
    return cleanFullName.split(' ')[0] || cleanFullName;
  }, [cleanFullName]);

  const getStatusBadge = (estado: EstadoOperativo) => {
    switch (estado) {
      case 'REGISTRADA':
      case 'ASIGNADA':
        return null; // Removido "Por Iniciar" según indicación del usuario
      case 'EN_PROCESO':
        return {
          label: 'En Proceso',
          className: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
        };
      case 'CERRADA_PENDIENTE_CONFORMIDAD':
        return {
          label: 'Esperando Firma QR',
          className: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
      case 'CONFORME_FINALIZADA':
        return {
          label: 'Conforme',
          className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="bg-slate-900/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md w-full shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Identity: Logo icon on mobile, with text label on sm+ screens */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 shrink-0">
              <Leaf className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-extrabold text-xs sm:text-sm text-white tracking-tight leading-tight truncate flex items-center gap-1">
                <span className="text-emerald-400 font-black">ATENSA</span>
                <span className="text-slate-400 font-normal hidden sm:inline">•</span>
                <span className="text-slate-200 hidden sm:inline font-bold">Salud Ambiental</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-300 font-medium leading-tight truncate">
                {cleanFullName}
              </span>
            </div>
          </div>

          {/* Navigation Switch, Solicitudes Disponibles & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Direct Header Button: Solicitudes Disponibles */}
            <div className="relative">
              <button
                id="btn-header-solicitudes-disponibles"
                type="button"
                onClick={() => setShowDisponiblesDropdown(!showDisponiblesDropdown)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  solicitudesDisponibles.length > 0
                    ? 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border-sky-500/50 shadow-md shadow-sky-950/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
                title="Ver solicitudes creadas disponibles para tomar"
              >
                <UserCheck className={`w-3.5 h-3.5 ${solicitudesDisponibles.length > 0 ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="hidden md:inline">Por Tomar</span>
                {solicitudesDisponibles.length > 0 ? (
                  <span className="bg-sky-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse shadow-xs">
                    {solicitudesDisponibles.length}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-medium">0</span>
                )}
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {/* Popover / Modal de Solicitudes Disponibles en Cabecera */}
              {showDisponiblesDropdown && (
                <>
                  {/* Backdrop for closing anywhere and focus control */}
                  <div
                    className="fixed inset-0 bg-black/60 z-45 backdrop-blur-xs transition-opacity"
                    onClick={() => setShowDisponiblesDropdown(false)}
                  />

                  <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-0 top-14 sm:top-full sm:mt-2 w-auto sm:w-[420px] max-h-[85vh] sm:max-h-[80vh] flex flex-col bg-slate-900 border border-sky-500/50 rounded-2xl shadow-2xl z-50 overflow-hidden text-white animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="p-3 sm:p-3.5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/30">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                            <span>Solicitudes Disponibles</span>
                            <span className="bg-sky-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                              {solicitudesDisponibles.length}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 hidden sm:block">
                            Selecciona para tomar o iniciar la atención
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDisponiblesDropdown(false)}
                        className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                        title="Cerrar ventana"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="overflow-y-auto p-2.5 sm:p-3 space-y-2.5 flex-1 divide-y divide-slate-800/40">
                      {solicitudesDisponibles.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                          <p className="font-semibold text-slate-300">¡Todo al día!</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            No hay solicitudes pendientes por tomar en este momento.
                          </p>
                        </div>
                      ) : (
                        solicitudesDisponibles.map(sol => (
                          <div
                            key={sol.id}
                            className="pt-2 first:pt-0 p-3 bg-slate-950/90 hover:bg-slate-950 border border-slate-800/90 hover:border-sky-500/60 rounded-xl space-y-2 transition-all shadow-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[11px] font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                                {sol.codigo_visible}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400">
                                  {new Date(sol.fecha_solicitud).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPriorityBadge(sol.prioridad)}`}>
                                  {sol.prioridad}
                                </span>
                              </div>
                            </div>

                            <div>
                              <div className="text-xs font-bold text-white line-clamp-1">
                                {sol.categoria}
                              </div>
                              <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                                <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                <span className="font-medium text-slate-200 truncate">{sol.solicitante_area || sol.solicitante_ubicacion}</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-slate-400 truncate">{sol.solicitante_nombre}</span>
                              </div>
                              {sol.descripcion && (
                                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 italic bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                                  "{sol.descripcion}"
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowDisponiblesDropdown(false);
                                  onSelectAtencion(sol);
                                }}
                                className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer py-1"
                              >
                                Ver detalles completos
                              </button>

                              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    handleTomarSolicitud(e, sol, false);
                                    setShowDisponiblesDropdown(false);
                                  }}
                                  className="flex-1 sm:flex-none px-3 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                  title="Tomar y autoasignarme esta solicitud"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Tomar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    handleTomarSolicitud(e, sol, true);
                                    setShowDisponiblesDropdown(false);
                                  }}
                                  className="flex-1 sm:flex-none px-3 py-1.5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                  title="Tomar e iniciar atención inmediatamente"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                  <span>Tomar e Iniciar</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {solicitudesDisponibles.length > 0 && (
                      <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDisponiblesDropdown(false);
                            setActiveFilter('DISPONIBLES');
                            setCurrentTab('RESUMEN');
                          }}
                          className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center justify-center gap-1.5 w-full py-1.5 bg-slate-900/80 hover:bg-slate-900 rounded-xl border border-sky-900/40 cursor-pointer transition-colors"
                        >
                          <span>Ver todas en Cuadro Resumen ({solicitudesDisponibles.length})</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <nav className="flex items-center bg-slate-950 p-0.5 sm:p-1 rounded-xl border border-slate-800">
              <button
                id="tab-tecnico-inicio"
                onClick={() => setCurrentTab('INICIO')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                  currentTab === 'INICIO'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Inicio</span>
              </button>

              <button
                id="tab-tecnico-resumen"
                onClick={() => setCurrentTab('RESUMEN')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                  currentTab === 'RESUMEN'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Resumen</span>
                {totalMisAtenciones > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    currentTab === 'RESUMEN' ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {totalMisAtenciones}
                  </span>
                )}
              </button>
            </nav>

            <button
              id="btn-logout-tecnico"
              onClick={onLogout}
              title="Cerrar Sesión"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl border border-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Integrated Notification Banner for Available Solicitudes */}
        {solicitudesDisponibles.length > 0 && !bannerDismissed && (
          <div className="bg-sky-950/90 border-t border-b border-sky-500/30 px-3 sm:px-6 py-2 backdrop-blur-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 sm:gap-2 text-sky-200 min-w-0">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span className="font-bold text-white shrink-0 text-[11px] sm:text-xs">Disponibles:</span>
                <span className="truncate text-sky-200 text-[11px] sm:text-xs">
                  <strong className="text-white font-bold">{solicitudesDisponibles.length}</strong> solicitud{solicitudesDisponibles.length > 1 ? 'es' : ''} en espera
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('DISPONIBLES');
                    setCurrentTab('RESUMEN');
                  }}
                  className="px-2 sm:px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-[10px] sm:text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <span>Ver y Tomar</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setBannerDismissed(true)}
                  className="text-sky-400 hover:text-sky-200 p-0.5 sm:p-1 rounded cursor-pointer"
                  title="Ocultar aviso"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Viewport Content */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 flex-1 flex flex-col">
        {/* ========================================================================= */}
        {/* VIEW 1: SIMPLIFIED MAIN INTERFACE (INICIO)                                */}
        {/* ========================================================================= */}
        {currentTab === 'INICIO' && (
          <div className="space-y-5 sm:space-y-7 flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full py-1 sm:py-4">
            {/* 1. Friendly Compact Greeting & Status Banner */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-4 sm:p-6 backdrop-blur-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Hola, {cleanFirstName}</span>
                    <span className="text-emerald-400">👋</span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Panel simplificado para registro rápido y seguimiento de tus labores de campo.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 text-xs shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-medium">Turno Operativo Activo</span>
                </div>
              </div>

              {/* Pendientes Compact Summary Status */}
              <div className="mt-4 sm:mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Status: Solicitudes en curso / por iniciar */}
                <div 
                  onClick={() => {
                    if (enProcesoList.length > 0) {
                      setActiveFilter('EN_PROCESO');
                      setCurrentTab('RESUMEN');
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    enProcesoList.length > 0
                      ? 'bg-amber-950/20 border-amber-600/30 hover:border-amber-500/60 cursor-pointer'
                      : 'bg-slate-950/60 border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${
                        enProcesoList.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400">Solicitudes en Proceso</div>
                        <div className="text-xs font-bold text-white">
                          {enProcesoList.length > 0 ? (
                            <span className="text-amber-300">
                              {enProcesoList.length} atención{enProcesoList.length > 1 ? 'es' : ''} pendiente{enProcesoList.length > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-slate-400">Sin solicitudes pendientes</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {enProcesoList.length > 0 && (
                      <span className="text-[11px] text-amber-400 font-bold flex items-center gap-0.5">
                        Ver <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Status: Pendientes de Firma de Conformidad QR */}
                <div 
                  onClick={() => {
                    if (pendientesQrList.length > 0) {
                      const firstToken = pendientesQrList[0].token_conformidad?.token_hash;
                      if (firstToken) {
                        onOpenPublicConformidad(firstToken);
                      } else {
                        onSelectAtencion(pendientesQrList[0]);
                      }
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    pendientesQrList.length > 0
                      ? 'bg-purple-950/20 border-purple-600/30 hover:border-purple-500/60 cursor-pointer'
                      : 'bg-slate-950/60 border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${
                        pendientesQrList.length > 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-500'
                      }`}>
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400">Conformidad / Firma QR</div>
                        <div className="text-xs font-bold text-white">
                          {pendientesQrList.length > 0 ? (
                            <span className="text-purple-300">
                              {pendientesQrList.length} esperando firma del usuario
                            </span>
                          ) : (
                            <span className="text-slate-400">Sin firmas QR pendientes</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {pendientesQrList.length > 0 && (
                      <span className="text-[11px] text-purple-400 font-bold flex items-center gap-0.5">
                        Abrir QR <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Primary Action: "NUEVA ATENCIÓN" with 2 Clear Options */}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center max-w-md mx-auto mb-5 sm:mb-6">
                <div className="inline-flex items-center justify-center p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-900/50 mb-2.5">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Nueva Atención
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Selecciona la modalidad para iniciar el registro de la intervención:
                </p>
              </div>

              {/* Two Direct Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Option 1: Recorrido Operativo */}
                <button
                  id="btn-nueva-atencion-recorrido"
                  type="button"
                  onClick={() => onOpenNuevaAtencion('RECORRIDO_OPERATIVO')}
                  className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-teal-500/80 p-4 sm:p-5 rounded-2xl text-left transition-all hover:scale-[1.01] shadow-md flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="p-2 sm:p-2.5 bg-teal-600/20 text-teal-400 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-800 text-teal-300 px-2 py-0.5 rounded-md border border-slate-700">
                        Opción 1
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                      1. Recorrido Operativo
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      atención de servicio por recorrido o actividad de rutina
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:text-teal-300">
                    <span>Iniciar Recorrido</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Option 2: Solicitud */}
                <button
                  id="btn-nueva-atencion-solicitud"
                  type="button"
                  onClick={() => onOpenNuevaAtencion('SOLICITUD')}
                  className="group bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/80 p-4 sm:p-5 rounded-2xl text-left transition-all hover:scale-[1.01] shadow-md flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="p-2 sm:p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-800 text-emerald-300 px-2 py-0.5 rounded-md border border-slate-700">
                        Opción 2
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      2. Solicitud
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      solicitud de servicio puntual de un área, servicio o usuario
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                    <span>Crear Solicitud</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>

            {/* 2.5 Section: Solicitudes Creadas Disponibles para Tomar */}
            <div className="bg-slate-900 border border-sky-500/30 rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Solicitudes Disponibles para Tomar</span>
                      {solicitudesDisponibles.length > 0 ? (
                        <span className="bg-sky-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                          {solicitudesDisponibles.length} por atender
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          0 pendientes
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Requerimientos creados por áreas o usuarios en espera de que algún técnico los tome para su atención.
                    </p>
                  </div>
                </div>

                {solicitudesDisponibles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilter('DISPONIBLES');
                      setCurrentTab('RESUMEN');
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Ver todas ({solicitudesDisponibles.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {solicitudesDisponibles.length === 0 ? (
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400">
                    ✅ No hay solicitudes pendientes de asignación en este momento. Todas las solicitudes están tomadas o atendidas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {solicitudesDisponibles.slice(0, 4).map(sol => (
                    <div
                      key={sol.id}
                      onClick={() => onSelectAtencion(sol)}
                      className="bg-slate-950/90 border border-slate-800 hover:border-sky-500/70 p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                          {sol.codigo_visible}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(sol.prioridad)}`}>
                          {sol.prioridad}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white truncate">
                          {sol.categoria}
                        </div>
                        <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                          <Building2 className="w-3 h-3 text-sky-400 shrink-0" />
                          <span className="truncate">{sol.solicitante_area || sol.solicitante_ubicacion}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 truncate">{sol.solicitante_nombre}</span>
                        </div>
                        {sol.descripcion && (
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                            "{sol.descripcion}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-500">
                          {new Date(sol.fecha_solicitud).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleTomarSolicitud(e, sol, false)}
                            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Tomar y autoasignarme esta solicitud"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Tomar</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleTomarSolicitud(e, sol, true)}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Tomar e iniciar atención inmediatamente"
                          >
                            <Play className="w-3 h-3" />
                            <span>Tomar e Iniciar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Guide & Summary Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1">
              <button
                id="btn-open-guia-prioridades"
                type="button"
                onClick={() => setShowGuiaPrioridades(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/60 px-4 py-2.5 rounded-xl cursor-pointer shadow-sm"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Guía de Prioridades (Baja, Media, Alta)</span>
              </button>

              <button
                id="btn-link-cuadro-resumen"
                type="button"
                onClick={() => setCurrentTab('RESUMEN')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900/60 hover:bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl cursor-pointer"
              >
                <ClipboardList className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ver Cuadro Resumen ({totalMisAtenciones})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal: Guía de Criterios de Prioridad */}
        {showGuiaPrioridades && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div 
              id="modal-guia-prioridades" 
              className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-emerald-600/30 text-white"
            >
              <div className="shrink-0 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-900/40">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Guía de Criterios de Prioridad</h2>
                    <p className="text-[11px] text-slate-400">Criterios técnicos para asignación y atención en Salud Ambiental</p>
                  </div>
                </div>

                <button
                  id="btn-close-guia-prioridades"
                  onClick={() => setShowGuiaPrioridades(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-4 sm:p-5 space-y-3.5 flex-1 text-xs">
                {/* Prioridad ALTA */}
                <div className="p-3.5 bg-rose-950/30 border border-rose-600/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-rose-300 text-xs">
                      <span className="px-2 py-0.5 bg-rose-600 text-white rounded-md text-[10px] uppercase tracking-wider font-extrabold">
                        ALTA
                      </span>
                      <span>Riesgo Sanitario Inminente / Emergencia</span>
                    </div>
                    <span className="text-[10px] text-rose-400 font-semibold bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800/50">
                      Mismo Día (Inmediato)
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Situaciones críticas que comprometen directamente la salud pública o la continuidad operativa de los servicios de salud.
                  </p>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                    <li><strong className="text-white">Agua:</strong> Ausencia total de cloro residual libre o presencia de contaminación en fuentes potables.</li>
                    <li><strong className="text-white">Residuos:</strong> Desborde o saturación de residuos biocontaminados en áreas quirúrgicas/UCI.</li>
                    <li><strong className="text-white">Vectores:</strong> Notificación de brote activo o alto índice larvario de <em>Aedes aegypti</em> (Dengue/Malaria).</li>
                  </ul>
                </div>

                {/* Prioridad MEDIA */}
                <div className="p-3.5 bg-amber-950/30 border border-amber-600/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
                      <span className="px-2 py-0.5 bg-amber-600 text-white rounded-md text-[10px] uppercase tracking-wider font-extrabold">
                        MEDIA
                      </span>
                      <span>Requerimiento Ordinario / Monitoreo Programado</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/50">
                      Mismo Día (Turno Diario)
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Operaciones habituales de control sanitario, vigilancia preventiva o solicitudes estándar de áreas de salud.
                  </p>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                    <li><strong className="text-white">Agua:</strong> Monitoreo programado de cloro residual y turbiedad en puntos de control de la red.</li>
                    <li><strong className="text-white">Residuos:</strong> Recolección rutinaria en rutas programadas de almacenamiento intermedio.</li>
                    <li><strong className="text-white">Inspecciones:</strong> Control rutinario en comedores, almacenes y servicios higiénicos.</li>
                  </ul>
                </div>

                {/* Prioridad BAJA */}
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-600/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-emerald-300 text-xs">
                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] uppercase tracking-wider font-extrabold">
                        BAJA
                      </span>
                      <span>Seguimiento Administrativo / Preventivo</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50">
                      Planificable
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Actividades de soporte, capacitación y verificación documental sin riesgo sanitario activo.
                  </p>
                  <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                    <li><strong className="text-white">Capacitación:</strong> Talleres comunitarios y charlas sobre lavado de manos y manejo de excretas.</li>
                    <li><strong className="text-white">Documentación:</strong> Actualización de rotulación en contenedores o levantamiento de observaciones menores.</li>
                  </ul>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-emerald-400">Compromiso Diario:</strong> Todas las solicitudes recibidas deben ser atendidas o reportadas con su debida justificación o reprogramación en la misma jornada de trabajo.
                  </span>
                </div>
              </div>

              <div className="shrink-0 p-3 bg-slate-950/80 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuiaPrioridades(false)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CUADRO RESUMEN DE ATENCIONES                                      */}
        {/* ========================================================================= */}
        {currentTab === 'RESUMEN' && (
          <div className="space-y-6">
            {/* Header with Title & Quick "Nueva Atención" button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-emerald-400" />
                  <span>Cuadro Resumen de Mis Atenciones</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registro consolidado de solicitudes asignadas, recorridos operativos e historial de firmas.
                </p>
              </div>

              {/* Dropdown "Nueva Atención" */}
              <div className="relative">
                <button
                  id="btn-resumen-nueva-atencion"
                  onClick={() => setShowDropdownNew(!showDropdownNew)}
                  className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Atención</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDropdownNew ? 'rotate-180' : ''}`} />
                </button>

                {showDropdownNew && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdownNew(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 divide-y divide-slate-800/60 max-w-[calc(100vw-2rem)]">
                      <div className="p-1.5 pb-2">
                        <div className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider px-1 mb-1.5">
                          Seleccionar Modalidad
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDropdownNew(false);
                            onOpenNuevaAtencion('RECORRIDO_OPERATIVO');
                          }}
                          className="w-full text-left p-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-950/70 hover:bg-teal-950/40 border border-slate-800 hover:border-teal-500/50 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all shadow-xs"
                        >
                          <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg shrink-0">
                            <Compass className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>1. Recorrido Operativo</span>
                              <span className="text-[9px] bg-teal-950 text-teal-300 font-bold px-1.5 py-0.2 rounded border border-teal-800/60">Opción 1</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                              atención por recorrido o rutina
                            </div>
                          </div>
                        </button>
                      </div>

                      <div className="p-1.5 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDropdownNew(false);
                            onOpenNuevaAtencion('SOLICITUD');
                          }}
                          className="w-full text-left p-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-950/70 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all shadow-xs"
                        >
                          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>2. Solicitud</span>
                              <span className="text-[9px] bg-emerald-950 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-800/60">Opción 2</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                              solicitud de servicio puntual
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Metrics KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
              <div 
                onClick={() => setActiveFilter('TODAS')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeFilter === 'TODAS'
                    ? 'bg-slate-900 border-emerald-500 shadow-md'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Mis Asignadas</span>
                  <ClipboardList className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white mt-2">{totalMisAtenciones}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Mis atenciones</div>
              </div>

              <div 
                onClick={() => setActiveFilter('DISPONIBLES')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeFilter === 'DISPONIBLES'
                    ? 'bg-slate-900 border-sky-500 shadow-md'
                    : 'bg-slate-900/80 border-sky-500/30 hover:border-sky-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-sky-300">Por Tomar</span>
                  <UserCheck className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-sky-400 mt-2">{solicitudesDisponibles.length}</div>
                <div className="text-[10px] text-sky-300/70 mt-0.5">Disponibles para mí</div>
              </div>

              <div 
                onClick={() => setActiveFilter('EN_PROCESO')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeFilter === 'EN_PROCESO'
                    ? 'bg-slate-900 border-amber-500 shadow-md'
                    : 'bg-slate-900/80 border-amber-500/30 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-300">En Proceso</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-2">{enProcesoList.length}</div>
                <div className="text-[10px] text-amber-300/70 mt-0.5">Labor activa</div>
              </div>

              <div 
                onClick={() => setActiveFilter('PENDIENTE_QR')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeFilter === 'PENDIENTE_QR'
                    ? 'bg-slate-900 border-purple-500 shadow-md'
                    : 'bg-slate-900/80 border-purple-500/30 hover:border-purple-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-purple-300">Firma QR</span>
                  <QrCode className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-purple-400 mt-2">{pendientesQrList.length}</div>
                <div className="text-[10px] text-purple-300/70 mt-0.5">Listo para QR</div>
              </div>

              <div 
                onClick={() => setActiveFilter('CONFORMES')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                  activeFilter === 'CONFORMES'
                    ? 'bg-slate-900 border-emerald-500 shadow-md'
                    : 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-300">Conformes</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2">{conformesList.length}</div>
                <div className="text-[10px] text-emerald-300/70 mt-0.5">⭐ {calificacionPromedio}/5</div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="input-tecnico-search"
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar por código (ej. AT-2026-00246), solicitante, área, actividad, personal..."
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    id="filter-tab-todas"
                    onClick={() => setActiveFilter('TODAS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeFilter === 'TODAS'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Mis Atenciones ({totalMisAtenciones})
                  </button>

                  <button
                    id="filter-tab-disponibles"
                    onClick={() => setActiveFilter('DISPONIBLES')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeFilter === 'DISPONIBLES'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-950 text-sky-400 hover:text-sky-300 border border-sky-900/50'
                    }`}
                  >
                    Por Tomar ({solicitudesDisponibles.length})
                  </button>

                  <button
                    id="filter-tab-proceso"
                    onClick={() => setActiveFilter('EN_PROCESO')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeFilter === 'EN_PROCESO'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    En Proceso ({enProcesoList.length})
                  </button>

                  <button
                    id="filter-tab-qr"
                    onClick={() => setActiveFilter('PENDIENTE_QR')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeFilter === 'PENDIENTE_QR'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Firma QR ({pendientesQrList.length})
                  </button>

                  <button
                    id="filter-tab-conformes"
                    onClick={() => setActiveFilter('CONFORMES')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeFilter === 'CONFORMES'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Conformes ({conformesList.length})
                  </button>

                  <button
                    id="filter-tab-todas-hospital"
                    onClick={() => setActiveFilter('TODAS_HOSPITAL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeFilter === 'TODAS_HOSPITAL'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Todo el Hospital ({atenciones.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Atenciones List */}
            {filteredList.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center">
                <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-300">No se encontraron atenciones</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchTerm 
                    ? 'No hay registros que coincidan con tu búsqueda.' 
                    : 'Aún no tienes atenciones registradas o en el estado seleccionado.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredList.map((atencion) => {
                  const statusInfo = getStatusBadge(atencion.estado_operativo);
                  const isPorIniciar = atencion.estado_operativo === 'REGISTRADA' || atencion.estado_operativo === 'ASIGNADA';
                  const isEnProceso = atencion.estado_operativo === 'EN_PROCESO';
                  const isEsperandoQR = atencion.estado_operativo === 'CERRADA_PENDIENTE_CONFORMIDAD';
                  const isConforme = atencion.estado_operativo === 'CONFORME_FINALIZADA';
                  const isRecorrido = atencion.tipo_origen === 'RECORRIDO_OPERATIVO';

                  return (
                    <div
                      key={atencion.id}
                      id={`card-tecnico-atencion-${atencion.id}`}
                      onClick={() => onSelectAtencion(atencion)}
                      className="bg-slate-900/95 border border-slate-800/90 hover:border-emerald-500/50 p-4 sm:p-5 rounded-2xl transition-all hover:shadow-xl hover:shadow-emerald-950/20 cursor-pointer space-y-3.5 group"
                    >
                      {/* Card Header: Code, Priority, Status on Left | Recorrido Highlight & Date on Right */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs sm:text-sm font-extrabold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 tracking-wider shadow-inner">
                            {atencion.codigo_visible}
                          </span>

                          <span className={`text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-md border tracking-wide uppercase ${getPriorityBadge(atencion.prioridad)}`}>
                            {atencion.prioridad}
                          </span>

                          {statusInfo && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusInfo.className}`}>
                              {statusInfo.label}
                            </span>
                          )}
                        </div>

                        {/* Top Right Corner Highlight: Recorrido or Solicitud + Date */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 shrink-0">
                          {isRecorrido ? (
                            <span className="text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/60 shadow-sm shadow-teal-950/60 flex items-center gap-1.5 shrink-0 tracking-wide">
                              <Compass className="w-3.5 h-3.5 text-teal-400" />
                              <span>Recorrido</span>
                            </span>
                          ) : (
                            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-400/40 flex items-center gap-1.5 shrink-0">
                              <FileText className="w-3.5 h-3.5 text-sky-400" />
                              <span>Solicitud</span>
                            </span>
                          )}

                          <span className="text-[10px] sm:text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(atencion.fecha_solicitud).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Card Body: Solicitante, Area, Category & Hours */}
                      <div className="space-y-1.5 text-xs text-slate-300 pt-0.5">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-teal-400 shrink-0" />
                          <span className="font-semibold text-white truncate" title={isRecorrido ? 'Responsable del Área Usuaria' : 'Solicitante'}>
                            {atencion.solicitante_nombre}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-200 font-medium truncate">{atencion.solicitante_area || atencion.solicitante_ubicacion}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isRecorrido && (atencion.hora_inicio || atencion.hora_termino) ? (
                            <span className="text-cyan-300 font-medium truncate flex items-center gap-2">
                              <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                              <span>{atencion.hora_inicio || '--:--'} - {atencion.hora_termino || '--:--'}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300 font-medium truncate flex items-center gap-2">
                              <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>{atencion.categoria}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description snippet */}
                      <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                        {atencion.descripcion || `${atencion.categoria} en ${atencion.solicitante_area || atencion.solicitante_ubicacion}`}
                      </p>

                      {/* Card Footer: Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          {atencion.evidencias.length > 0 && (
                            <span className="flex items-center gap-1 text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                              <Camera className="w-3 h-3 text-emerald-400" />
                              {atencion.evidencias.length} evidencias
                            </span>
                          )}

                          {isConforme && atencion.conformidad && (
                            <span className="flex items-center gap-1 text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              {atencion.conformidad.calificacion}/5 estrellas
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Quick Tomar if unassigned or available */}
                          {(!atencion.tecnico_id || (atencion.estado_operativo === 'REGISTRADA' && atencion.tecnico_id !== currentUser.id)) && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleTomarSolicitud(e, atencion, false)}
                                className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                                title="Tomar y autoasignarme esta solicitud"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Tomar</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleTomarSolicitud(e, atencion, true)}
                                className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                                title="Tomar e iniciar atención inmediatamente"
                              >
                                <Play className="w-3.5 h-3.5" />
                                <span>Tomar e Iniciar</span>
                              </button>
                            </>
                          )}

                          {/* Quick Iniciar */}
                          {isPorIniciar && atencion.tecnico_id === currentUser.id && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickIniciar(e, atencion)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-950/60 flex items-center gap-2 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Iniciar Atención</span>
                            </button>
                          )}

                          {/* Quick QR Open */}
                          {isEsperandoQR && atencion.token_conformidad && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenPublicConformidad(atencion.token_conformidad!.token_hash);
                              }}
                              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-purple-950 cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Abrir QR de Firma</span>
                            </button>
                          )}

                          {/* View Details */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAtencion(atencion);
                            }}
                            className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700/60"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>Ver Detalle</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
