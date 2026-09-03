import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  User, 
  Compass, 
  FileText,
  Tag,
  Clock,
  MessageSquareQuote,
  Flame,
  Check,
  Settings,
  ListChecks,
  Timer
} from 'lucide-react';
import { CategoriaAtencion, Prioridad, SystemUser } from '../types';
import { storageService } from '../services/storageService';
import { AreasManagerModal } from './AreasManagerModal';
import { ActividadesManagerModal } from './ActividadesManagerModal';

interface NuevaAtencionModalProps {
  onClose: () => void;
  onSuccess: (atencionCodigo: string) => void;
  currentUser: SystemUser;
  initialTipoOrigen?: 'SOLICITUD' | 'RECORRIDO_OPERATIVO';
  onOpenAreasManager?: () => void;
  onOpenActividadesManager?: () => void;
}

function getFormattedCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return -1;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
}

function addMinutesToTime(timeStr: string, minutesToAdd = 45): string {
  const mins = timeToMinutes(timeStr);
  if (mins === -1) return timeStr;
  const newMins = (mins + minutesToAdd) % (24 * 60);
  const hours = String(Math.floor(newMins / 60)).padStart(2, '0');
  const minutes = String(newMins % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getFormattedFutureTime(minutesAhead = 45): string {
  const future = new Date(Date.now() + minutesAhead * 60 * 1000);
  const hours = String(future.getHours()).padStart(2, '0');
  const minutes = String(future.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getDurationInfo(startStr: string, endStr: string): { isValid: boolean; durationText: string; errorMsg?: string } {
  if (!startStr || !endStr) {
    return { isValid: false, durationText: '', errorMsg: 'Ingrese hora de inicio y término.' };
  }
  const start = timeToMinutes(startStr);
  const end = timeToMinutes(endStr);
  if (start === -1 || end === -1) {
    return { isValid: false, durationText: '', errorMsg: 'Formato de hora no válido.' };
  }
  if (start >= end) {
    return {
      isValid: false,
      durationText: '',
      errorMsg: `La Hora de Inicio (${startStr}) no puede ser igual o posterior a la Hora de Término (${endStr}).`,
    };
  }
  const diff = end - start;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  let text = '';
  if (hours > 0 && mins > 0) {
    text = `${hours} h ${mins} min`;
  } else if (hours > 0) {
    text = `${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    text = `${mins} minutos`;
  }
  return { isValid: true, durationText: text };
}

export const NuevaAtencionModal: React.FC<NuevaAtencionModalProps> = ({
  onClose,
  onSuccess,
  currentUser,
  initialTipoOrigen = 'RECORRIDO_OPERATIVO',
  onOpenAreasManager,
  onOpenActividadesManager,
}) => {
  const [tipoOrigen, setTipoOrigen] = useState<'SOLICITUD' | 'RECORRIDO_OPERATIVO'>(initialTipoOrigen);
  const [areasList, setAreasList] = useState<string[]>(() => storageService.getAreas());
  const [actividadesList, setActividadesList] = useState<string[]>(() => storageService.getActividades());
  
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState(() => {
    const list = storageService.getAreas();
    return list.length > 0 ? list[0] : 'Medicina A';
  });
  const [actividad, setActividad] = useState<string>(() => {
    const acts = storageService.getActividades();
    return acts.length > 0 ? acts[0] : 'Desinfección';
  });
  const [horaInicio, setHoraInicio] = useState(getFormattedCurrentTime());
  const [horaTermino, setHoraTermino] = useState(getFormattedFutureTime(45));
  const [prioridad, setPrioridad] = useState<Prioridad>('MEDIA');
  const [solicitud, setSolicitud] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInternalAreasModal, setShowInternalAreasModal] = useState(false);
  const [showInternalActividadesModal, setShowInternalActividadesModal] = useState(false);

  // Sync areas list
  const refreshAreas = () => {
    const fresh = storageService.getAreas();
    setAreasList(fresh);
    if (fresh.length > 0 && !fresh.includes(area)) {
      setArea(fresh[0]);
    }
  };

  // Sync actividades list
  const refreshActividades = () => {
    const fresh = storageService.getActividades();
    setActividadesList(fresh);
    if (fresh.length > 0 && !fresh.includes(actividad)) {
      setActividad(fresh[0]);
    }
  };

  // Initialize defaults based on tipoOrigen
  useEffect(() => {
    if (tipoOrigen === 'RECORRIDO_OPERATIVO') {
      if (!nombre) {
        setNombre('');
      }
      if (!horaInicio) {
        setHoraInicio(getFormattedCurrentTime());
      }
      if (!horaTermino) {
        setHoraTermino(getFormattedFutureTime(45));
      }
    }
  }, [tipoOrigen]);

  // Handlers for smart time updates
  const handleHoraInicioChange = (newInicio: string) => {
    setHoraInicio(newInicio);
    if (newInicio) {
      const startMins = timeToMinutes(newInicio);
      const endMins = timeToMinutes(horaTermino);
      // If current end time is less than or equal to new start time, automatically push end time forward
      if (endMins === -1 || endMins <= startMins) {
        setHoraTermino(addMinutesToTime(newInicio, 45));
      }
    }
  };

  const handleHoraTerminoChange = (newTermino: string) => {
    setHoraTermino(newTermino);
  };

  const handleAdjustEndTime = (minutesToAdd: number) => {
    if (horaInicio) {
      setHoraTermino(addMinutesToTime(horaInicio, minutesToAdd));
      setError(null);
    }
  };

  const timeValidation = useMemo(() => {
    if (tipoOrigen !== 'RECORRIDO_OPERATIVO') return { isValid: true, durationText: '' };
    return getDurationInfo(horaInicio, horaTermino);
  }, [tipoOrigen, horaInicio, horaTermino]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !area.trim() || !actividad.trim()) {
      setError('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    if (tipoOrigen === 'RECORRIDO_OPERATIVO') {
      if (!horaInicio.trim() || !horaTermino.trim()) {
        setError('Por favor indique tanto la Hora de Inicio como la Hora de Término del recorrido.');
        return;
      }
      const durationCheck = getDurationInfo(horaInicio.trim(), horaTermino.trim());
      if (!durationCheck.isValid) {
        setError(durationCheck.errorMsg || 'Horario ilógico: La hora de inicio debe ser anterior a la hora de término.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = storageService.createAtencion({
        solicitante_nombre: nombre.trim(),
        solicitante_contacto: currentUser.telefono || currentUser.email || 'Canal WhatsApp Salud Ambiental',
        solicitante_area: area.trim(),
        solicitante_ubicacion: area.trim(),
        tipo_origen: tipoOrigen,
        hora_inicio: tipoOrigen === 'RECORRIDO_OPERATIVO' ? horaInicio.trim() : undefined,
        hora_termino: tipoOrigen === 'RECORRIDO_OPERATIVO' ? horaTermino.trim() : undefined,
        categoria: actividad,
        prioridad,
        descripcion: solicitud.trim() || `${actividad.trim()} - ${area.trim()}`,
      }, currentUser);

      onSuccess(res.atencion.codigo_visible);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar la atención.';
      setError(msg);
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    const list = storageService.getAreas();
    const acts = storageService.getActividades();
    if (tipoOrigen === 'RECORRIDO_OPERATIVO') {
      setNombre('Lic. Rosa Mendoza (Jefa de Enfermería)');
      setArea(list.includes('UCI') ? 'UCI' : (list[0] || 'Medicina A'));
      setActividad(acts.includes('Monitoreo de calidad de agua') ? 'Monitoreo de calidad de agua' : (acts[0] || 'Desinfección'));
      setHoraInicio('08:30');
      setHoraTermino('09:45');
      setPrioridad('MEDIA');
      setSolicitud('Monitoreo programado de cloro residual libre (medición colorimétrica DPD) y turbiedad en puntos críticos de la red hospitalaria.');
    } else {
      setNombre('Dr. Carlos Vega (Médico Asistencial)');
      setArea(list.includes('Emergencia') ? 'Emergencia' : (list[0] || 'Medicina A'));
      setActividad(acts.includes('Inspección del manejo de residuos sólidos') ? 'Inspección del manejo de residuos sólidos' : (acts[0] || 'Desinfección'));
      setPrioridad('ALTA');
      setSolicitud('Se requiere inspección técnica urgente y recojo especializado de contenedores rojos con residuos biocontaminados por saturación de capacidad.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div 
          id="modal-nueva-atencion" 
          className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden border border-emerald-600/30 text-white"
        >
          {/* Fixed Header */}
          <div className="shrink-0 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-900/40 shrink-0">
                {tipoOrigen === 'RECORRIDO_OPERATIVO' ? (
                  <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {tipoOrigen === 'RECORRIDO_OPERATIVO' 
                    ? 'Registrar Atención por Recorrido Operativo' 
                    : 'Registrar Atención por Solicitud'}
                </h2>
                <p className="text-[10px] text-slate-400">
                  {tipoOrigen === 'RECORRIDO_OPERATIVO'
                    ? 'atención de servicio por recorrido o actividad de rutina'
                    : 'solicitud de servicio puntual de un área, servicio o usuario'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="btn-fill-demo-new"
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                Ejemplo
              </button>
              <button
                id="btn-close-new-modal"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fixed Origin Switcher */}
          <div className="shrink-0 p-2.5 sm:p-3 bg-slate-950/80 border-b border-slate-800 px-3 sm:px-4">
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
              <button
                type="button"
                id="btn-mode-recorrido"
                onClick={() => setTipoOrigen('RECORRIDO_OPERATIVO')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tipoOrigen === 'RECORRIDO_OPERATIVO'
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>1. Recorrido Operativo</span>
              </button>

              <button
                type="button"
                id="btn-mode-solicitud"
                onClick={() => setTipoOrigen('SOLICITUD')}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tipoOrigen === 'SOLICITUD'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>2. Solicitud</span>
              </button>
            </div>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-3.5 sm:p-5 space-y-3 flex-1">
            {error && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Nombre (Solicitante en Solicitud / Responsable del Área Usuaria en Recorrido Operativo) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                {tipoOrigen === 'RECORRIDO_OPERATIVO' 
                  ? 'Nombre del Responsable del Área Usuaria *' 
                  : 'Nombre del Solicitante *'}
              </label>
              <input
                id="input-solicitante-nombre"
                type="text"
                required
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder={tipoOrigen === 'RECORRIDO_OPERATIVO' ? 'Ej. Dr. Carlos Vega / Lic. Ana Morales' : 'Ej. Dra. Elena Ramos'}
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Recorrido Operativo Time Fields: Hora de Inicio & Hora de Término */}
            {tipoOrigen === 'RECORRIDO_OPERATIVO' && (
              <div className={`p-3 rounded-xl border transition-all ${
                !timeValidation.isValid
                  ? 'bg-rose-950/25 border-rose-600/50'
                  : 'bg-teal-950/30 border-teal-800/40'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    Horario de Recorrido Operativo
                  </span>
                  {timeValidation.isValid ? (
                    <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      Duración: {timeValidation.durationText}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 border border-rose-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
                      Horario Inválido
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                      Hora de Inicio *
                    </label>
                    <input
                      id="input-recorrido-hora-inicio"
                      type="time"
                      required
                      value={horaInicio}
                      onChange={e => handleHoraInicioChange(e.target.value)}
                      className={`w-full text-xs px-2.5 py-1.5 bg-slate-950 rounded-lg text-white font-mono focus:ring-2 focus:outline-hidden transition-colors ${
                        !timeValidation.isValid
                          ? 'border border-rose-500/80 focus:ring-rose-500'
                          : 'border border-teal-700/60 focus:ring-teal-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                      Hora de Término *
                    </label>
                    <input
                      id="input-recorrido-hora-termino"
                      type="time"
                      required
                      value={horaTermino}
                      onChange={e => handleHoraTerminoChange(e.target.value)}
                      className={`w-full text-xs px-2.5 py-1.5 bg-slate-950 rounded-lg text-white font-mono focus:ring-2 focus:outline-hidden transition-colors ${
                        !timeValidation.isValid
                          ? 'border border-rose-500/80 focus:ring-rose-500 text-rose-200'
                          : 'border border-teal-700/60 focus:ring-teal-500 text-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Validation Warning & Quick Adjustment Helpers */}
                {!timeValidation.isValid ? (
                  <div className="mt-2 p-2 bg-rose-950/60 border border-rose-600/40 rounded-lg text-[11px] text-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{timeValidation.errorMsg}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                      <span className="text-[10px] text-slate-400">Corregir:</span>
                      <button
                        type="button"
                        onClick={() => handleAdjustEndTime(15)}
                        className="px-1.5 py-0.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded text-[10px] font-semibold border border-rose-700/50 cursor-pointer transition-colors"
                      >
                        +15 min
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustEndTime(30)}
                        className="px-1.5 py-0.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded text-[10px] font-semibold border border-rose-700/50 cursor-pointer transition-colors"
                      >
                        +30 min
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustEndTime(45)}
                        className="px-1.5 py-0.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded text-[10px] font-semibold border border-rose-700/50 cursor-pointer transition-colors"
                      >
                        +45 min
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustEndTime(60)}
                        className="px-1.5 py-0.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded text-[10px] font-semibold border border-rose-700/50 cursor-pointer transition-colors"
                      >
                        +1 h
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-400">
                    <span>Ajuste rápido de duración:</span>
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAdjustEndTime(15)}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-teal-300 rounded-md border border-teal-800/40 cursor-pointer transition-colors text-[11px] font-semibold"
                        title="Fijar término a 15 minutos después del inicio"
                      >
                        15 min
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustEndTime(30)}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-teal-300 rounded-md border border-teal-800/40 cursor-pointer transition-colors text-[11px] font-semibold"
                        title="Fijar término a 30 minutos después del inicio"
                      >
                        30 min
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustEndTime(45)}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-teal-300 rounded-md border border-teal-800/40 cursor-pointer transition-colors text-[11px] font-semibold"
                        title="Fijar término a 45 minutos después del inicio"
                      >
                        45 min
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustEndTime(60)}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-850 text-teal-300 rounded-md border border-teal-800/40 cursor-pointer transition-colors text-[11px] font-semibold"
                        title="Fijar término a 1 hora después del inicio"
                      >
                        1 hora
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Área (Dropdown con Áreas Hospitalarias) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Área *
                </label>
                {currentUser.rol === 'ADMINISTRADOR' && (
                  <button
                    type="button"
                    id="btn-quick-manage-areas"
                    onClick={() => {
                      if (onOpenAreasManager) {
                        onOpenAreasManager();
                      } else {
                        setShowInternalAreasModal(true);
                      }
                    }}
                    className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-slate-950 hover:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-800 transition-colors cursor-pointer"
                    title="Agregar o quitar áreas hospitalarias"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Gestionar Áreas</span>
                  </button>
                )}
              </div>
              <select
                id="select-solicitante-area"
                required
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden leading-relaxed"
              >
                {areasList.map(areaItem => (
                  <option key={areaItem} value={areaItem}>
                    {areaItem}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Actividad (18 Actividades con Administración Dinámica) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  Actividad *
                </label>
                {currentUser.rol === 'ADMINISTRADOR' && (
                  <button
                    type="button"
                    id="btn-quick-manage-actividades"
                    onClick={() => {
                      if (onOpenActividadesManager) {
                        onOpenActividadesManager();
                      } else {
                        setShowInternalActividadesModal(true);
                      }
                    }}
                    className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-slate-950 hover:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-800 transition-colors cursor-pointer"
                    title="Agregar o quitar actividades del catálogo"
                  >
                    <ListChecks className="w-3 h-3" />
                    <span>Gestionar Actividades ({actividadesList.length})</span>
                  </button>
                )}
              </div>
              <select
                id="select-solicitud-actividad"
                value={actividad}
                onChange={e => setActividad(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden leading-relaxed"
              >
                {actividadesList.map((act, index) => (
                  <option key={act} value={act}>
                    {index + 1}. {act}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Nivel de Prioridad (BAJA, MEDIA, ALTA) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Nivel de Prioridad *
              </label>
              <select
                id="select-solicitud-prioridad"
                value={prioridad}
                onChange={e => setPrioridad(e.target.value as Prioridad)}
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden font-semibold"
              >
                <option value="BAJA">BAJA</option>
                <option value="MEDIA">MEDIA</option>
                <option value="ALTA">ALTA</option>
              </select>
            </div>

            {/* 5. Detalles de la solicitud u observaciones (Opcional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-400" />
                  Detalles de la solicitud u observaciones
                </label>
                <span className="text-[10px] text-slate-400 font-medium bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  Opcional
                </span>
              </div>
              <textarea
                id="input-solicitud-descripcion"
                rows={2}
                value={solicitud}
                onChange={e => setSolicitud(e.target.value)}
                placeholder="Opcional: Describa los detalles de la solicitud u observaciones, requerimiento o labor a realizar..."
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* 6. Nota Informativa de Canalización y Atención en el Mismo Día */}
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Canalización Inmediata & Compromiso de Atención Diaria
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                <strong className="text-emerald-400">Nota:</strong> La solicitud es enviada al WhatsApp para su comunicación directa, canalizada como <span className="font-bold text-white">PENDIENTE</span> en el interfaz del técnico para que tomen dicha solicitud (ellos mediante la comunicación por WhatsApp y la designación por áreas que de manera interna conocen, ya sabrán quién debe tomar la solicitud).
              </p>
              <p className="text-amber-300 font-medium text-[10.5px]">
                ⚠️ Recuerde que la solicitud debe ser atendida o reportada (si ha habido una reprogramación o falta de atención por otros motivos) en el mismo día.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                id="btn-cancel-new-solicitud"
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn-submit-new-solicitud"
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {submitting ? 'Guardando...' : (
                  tipoOrigen === 'RECORRIDO_OPERATIVO' ? 'Registrar Recorrido' : 'Crear Solicitud'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Areas Manager Modal in case opened directly from New Attention */}
      {showInternalAreasModal && (
        <AreasManagerModal
          isOpen={showInternalAreasModal}
          onClose={() => {
            setShowInternalAreasModal(false);
            refreshAreas();
          }}
          currentUser={currentUser}
          onAreasChange={refreshAreas}
        />
      )}

      {/* Actividades Manager Modal in case opened directly from New Attention */}
      {showInternalActividadesModal && (
        <ActividadesManagerModal
          isOpen={showInternalActividadesModal}
          onClose={() => {
            setShowInternalActividadesModal(false);
            refreshActividades();
          }}
          currentUser={currentUser}
          onActividadesChange={refreshActividades}
        />
      )}
    </>
  );
};
