import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  MapPin, 
  Star, 
  Eye, 
  Sparkles,
  Layers,
  ArrowUpDown,
  Phone,
  Leaf,
  Droplet,
  ShieldCheck,
  Flame,
  Check,
  Compass,
  FileText
} from 'lucide-react';
import { Atencion, EstadoOperativo, Prioridad, SystemUser } from '../types';

interface AtencionesListProps {
  atenciones: Atencion[];
  onSelectAtencion: (atencion: Atencion) => void;
  onOpenNuevaAtencion: () => void;
  onOpenPublicConformidad: (tokenHash: string) => void;
  currentUser: SystemUser;
}

export const AtencionesList: React.FC<AtencionesListProps> = ({
  atenciones,
  onSelectAtencion,
  onOpenNuevaAtencion,
  onOpenPublicConformidad,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS');
  const [selectedPrioridad, setSelectedPrioridad] = useState<string>('TODAS');

  // Metrics
  const metrics = useMemo(() => {
    const total = atenciones.length;
    const enProceso = atenciones.filter(a => a.estado_operativo === 'EN_PROCESO' || a.estado_operativo === 'ASIGNADA').length;
    const pendientesQR = atenciones.filter(a => a.estado_operativo === 'CERRADA_PENDIENTE_CONFORMIDAD').length;
    const finalizadas = atenciones.filter(a => a.estado_operativo === 'CONFORME_FINALIZADA').length;
    const resolucionRate = total > 0 ? Math.round((finalizadas / total) * 100) : 0;

    return { total, enProceso, pendientesQR, finalizadas, resolucionRate };
  }, [atenciones]);

  const filteredAtenciones = useMemo(() => {
    return atenciones.filter(a => {
      const matchSearch = 
        a.codigo_visible.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.solicitante_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.tecnico_nombre && a.tecnico_nombre.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchEstado = selectedEstado === 'TODOS' || a.estado_operativo === selectedEstado;
      const matchPrioridad = selectedPrioridad === 'TODAS' || a.prioridad === selectedPrioridad;

      return matchSearch && matchEstado && matchPrioridad;
    });
  }, [atenciones, searchTerm, selectedEstado, selectedPrioridad]);

  const getPriorityClass = (p: Prioridad) => {
    switch (p) {
      case 'CRITICA': return 'bg-red-500/20 text-red-300 border-red-500/50 font-black';
      case 'ALTA': return 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold';
      case 'MEDIA': return 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
      case 'BAJA':
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold';
    }
  };

  const getEstadoBadge = (e: EstadoOperativo) => {
    switch (e) {
      case 'REGISTRADA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">Registrada</span>;
      case 'ASIGNADA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/40">Asignada</span>;
      case 'EN_PROCESO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">En Proceso</span>;
      case 'CERRADA_PENDIENTE_CONFORMIDAD':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente QR</span>;
      case 'CONFORME_FINALIZADA':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Conforme</span>;
      case 'CERRADA_CON_OBSERVACION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">Con Observación</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Metrics Row - Salud Ambiental Green Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 block">Total Atenciones</span>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">{metrics.total}</div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 block">BD Transaccional</span>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[11px] sm:text-xs font-semibold text-teal-400 block">En Curso / Sitio</span>
          <div className="text-xl sm:text-2xl font-bold text-teal-300 mt-1">{metrics.enProceso}</div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 block">Técnicos activos</span>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[11px] sm:text-xs font-semibold text-amber-400 block">Pendientes QR</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-300 mt-1">{metrics.pendientesQR}</div>
          <span className="text-[10px] sm:text-[11px] text-amber-400/70 mt-0.5 block">Token 24h activo</span>
        </div>

        <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-sm">
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 block">Conformes Firmadas</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-300 mt-1">{metrics.finalizadas}</div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 block">Firma digital auditada</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-900 to-teal-950 p-3.5 sm:p-4 rounded-2xl text-white border border-emerald-700/40 shadow-sm">
          <span className="text-[11px] sm:text-xs font-semibold text-emerald-300 block">Efectividad de Cierre</span>
          <div className="text-xl sm:text-2xl font-bold mt-1 text-white">{metrics.resolucionRate}%</div>
          <span className="text-[10px] sm:text-[11px] text-emerald-300/80 mt-0.5 block">Conformidad con QR</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters, New Button */}
      <div className="bg-slate-900/90 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="input-search-atenciones"
              type="text"
              placeholder="Buscar por código (AT-2026-...), solicitante, técnico, área..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Filter Status */}
          <select
            id="select-filter-estado"
            value={selectedEstado}
            onChange={e => setSelectedEstado(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-700 rounded-xl bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="REGISTRADA">Registradas</option>
            <option value="ASIGNADA">Asignadas</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="CERRADA_PENDIENTE_CONFORMIDAD">Pendientes de Firma QR</option>
            <option value="CONFORME_FINALIZADA">Conformes Finalizadas</option>
          </select>

          {/* Filter Priority */}
          <select
            id="select-filter-prioridad"
            value={selectedPrioridad}
            onChange={e => setSelectedPrioridad(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-700 rounded-xl bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="TODAS">Todas las Prioridades</option>
            <option value="CRITICA">🔴 Crítica</option>
            <option value="ALTA">🟠 Alta</option>
            <option value="MEDIA">🟡 Media</option>
            <option value="BAJA">🟢 Baja</option>
          </select>
        </div>

        {/* Action Button */}
        <button
          id="btn-open-new-atencion"
          onClick={onOpenNuevaAtencion}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/30 flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Solicitud</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredAtenciones.length === 0 ? (
          <div className="bg-slate-900/80 p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No se encontraron atenciones registradas</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Intente modificar los filtros o registre una nueva solicitud de Salud Ambiental.
            </p>
          </div>
        ) : (
          filteredAtenciones.map(atencion => (
            <div
              key={atencion.id}
              id={`card-atencion-${atencion.id}`}
              onClick={() => onSelectAtencion(atencion)}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-slate-950 text-emerald-400 border border-slate-800 px-2.5 py-1 rounded-md tracking-wider">
                    {atencion.codigo_visible}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getPriorityClass(atencion.prioridad)}`}>
                    {atencion.prioridad}
                  </span>
                  {atencion.tipo_origen === 'RECORRIDO_OPERATIVO' ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-400/50 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-teal-400" />
                      Recorrido
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-400/30 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-sky-400" />
                      Solicitud
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline-flex items-center gap-1">
                    <Leaf className="w-3 h-3 text-emerald-500" />
                    {atencion.categoria}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getEstadoBadge(atencion.estado_operativo)}
                  <span className="text-[11px] text-slate-500">
                    {new Date(atencion.fecha_solicitud).toLocaleDateString('es-PE')}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 sm:line-clamp-1">
                    {atencion.descripcion || `${atencion.categoria} - ${atencion.solicitante_area || atencion.solicitante_ubicacion}`}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <User className="w-3.5 h-3.5 text-emerald-500" />
                      {atencion.solicitante_nombre}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      {atencion.solicitante_area || atencion.solicitante_ubicacion}
                    </span>
                    {atencion.evidencias.length > 0 && (
                      <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-sm font-medium">
                        📷 {atencion.evidencias.length} evidencias
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side: Personal / QR conformity status */}
                <div className="flex sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Personal de Salud Ambiental:</span>
                    <span className="font-semibold text-slate-200">
                      {atencion.tecnico_nombre || 'Por tomar'}
                    </span>
                  </div>

                  {atencion.conformidad && (
                    <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs mt-1">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                      <span>{atencion.conformidad.calificacion}/5 estrellas</span>
                    </div>
                  )}

                  {atencion.token_conformidad && !atencion.conformidad && !atencion.token_conformidad.invalidado && (
                    <button
                      id={`btn-quick-qr-${atencion.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPublicConformidad(atencion.token_conformidad!.token_hash);
                      }}
                      className="mt-1 px-2.5 py-1 text-[11px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      title="Probar firma de conformidad"
                    >
                      <QrCode className="w-3 h-3 text-amber-400" />
                      Escanear QR
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
