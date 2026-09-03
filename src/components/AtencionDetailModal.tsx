import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Clock, 
  Calendar, 
  User, 
  Building2,
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  QrCode, 
  Camera, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck,
  Share2, 
  ExternalLink, 
  Copy, 
  Check, 
  FileText, 
  Send,
  Star,
  Play,
  CheckSquare,
  KeyRound,
  Lock,
  Smartphone,
  Layers,
  Sparkles,
  Info,
  Shield,
  Pencil,
  Trash2,
  Save,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  Compass,
  ChevronRight
} from 'lucide-react';
import { Atencion, Evidencia, SystemUser, UserRole, Prioridad, EstadoOperativo } from '../types';
import { storageService } from '../services/storageService';

interface AtencionDetailModalProps {
  atencion: Atencion;
  onClose: () => void;
  onUpdate: () => void;
  currentUser: SystemUser;
  onOpenPublicConformidad: (tokenHash: string) => void;
}

export const AtencionDetailModal: React.FC<AtencionDetailModalProps> = ({
  atencion,
  onClose,
  onUpdate,
  currentUser,
  onOpenPublicConformidad,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [showFinishForm, setShowFinishForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showHorariosForm, setShowHorariosForm] = useState(false);
  const [qrDocTab, setQrDocTab] = useState<'PERSONAL' | 'ADMIN'>('PERSONAL');

  // Admin Edit & Delete States
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Admin Edit Form States
  const [editNombre, setEditNombre] = useState(atencion.solicitante_nombre);
  const [editArea, setEditArea] = useState(atencion.solicitante_area || atencion.solicitante_ubicacion);
  const [editContacto, setEditContacto] = useState(atencion.solicitante_contacto);
  const [editCategoria, setEditCategoria] = useState(atencion.categoria);
  const [editPrioridad, setEditPrioridad] = useState<Prioridad>(atencion.prioridad);
  const [editEstado, setEditEstado] = useState<EstadoOperativo>(atencion.estado_operativo);
  const [editTecnicoId, setEditTecnicoId] = useState<string>(atencion.tecnico_id || '');
  const [editHoraInicio, setEditHoraInicio] = useState(atencion.hora_inicio || '');
  const [editHoraTermino, setEditHoraTermino] = useState(atencion.hora_termino || '');
  const [editDescripcion, setEditDescripcion] = useState(atencion.descripcion);
  const [editNotasTecnicas, setEditNotasTecnicas] = useState(atencion.notas_tecnicas || '');
  const [editTipoOrigen, setEditTipoOrigen] = useState<'SOLICITUD' | 'RECORRIDO_OPERATIVO'>(atencion.tipo_origen || 'SOLICITUD');

  // Evidence state
  const [eviTitulo, setEviTitulo] = useState('');
  const [eviTipo, setEviTipo] = useState<Evidencia['tipo']>('FOTO_FINAL');
  const [eviDesc, setEviDesc] = useState('');
  const [eviUrl, setEviUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80');

  // Finish State
  const [finalNotas, setFinalNotas] = useState(atencion.notas_tecnicas || '');
  const [selectedTech, setSelectedTech] = useState<string>(currentUser.id);

  const isAdmin = currentUser.rol === 'ADMINISTRADOR' || currentUser.rol === 'COORDINADOR';

  // Synchronize edit fields when selected atencion changes
  useEffect(() => {
    setEditNombre(atencion.solicitante_nombre);
    setEditArea(atencion.solicitante_area || atencion.solicitante_ubicacion);
    setEditContacto(atencion.solicitante_contacto);
    setEditCategoria(atencion.categoria);
    setEditPrioridad(atencion.prioridad);
    setEditEstado(atencion.estado_operativo);
    setEditTecnicoId(atencion.tecnico_id || '');
    setEditHoraInicio(atencion.hora_inicio || '');
    setEditHoraTermino(atencion.hora_termino || '');
    setEditDescripcion(atencion.descripcion);
    setEditNotasTecnicas(atencion.notas_tecnicas || '');
    setEditTipoOrigen(atencion.tipo_origen || 'SOLICITUD');
  }, [atencion]);

  const tokenHash = atencion.token_conformidad?.token_hash;
  const conformityUrl = tokenHash ? `${window.location.origin}/?token=${tokenHash}` : '';

  useEffect(() => {
    if (tokenHash) {
      QRCode.toDataURL(conformityUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).then(url => {
        setQrDataUrl(url);
      }).catch(console.error);
    }
  }, [tokenHash, conformityUrl]);

  const handleCopyLink = () => {
    if (!conformityUrl) return;
    navigator.clipboard.writeText(conformityUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateDurationMinutes = (inicio: string, termino: string): number | null => {
    if (!inicio || !termino) return null;
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = termino.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null;
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;
    return diff;
  };

  const handleOpenHorariosForm = () => {
    setShowHorariosForm(true);
    setTimeout(() => {
      const el = document.getElementById('seccion-horarios-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const inputInicio = document.getElementById('input-modal-hora-inicio') as HTMLInputElement | null;
      const inputTermino = document.getElementById('input-modal-hora-termino') as HTMLInputElement | null;
      if (inputInicio && !inputInicio.value) {
        inputInicio.focus();
      } else if (inputTermino) {
        inputTermino.focus();
      }
    }, 100);
  };

  const handleIniciarAtencion = () => {
    storageService.iniciarAtencion(atencion.id, currentUser, editHoraInicio || undefined, editHoraTermino || undefined);
    handleOpenHorariosForm();
    onUpdate();
  };

  const handleTomarSolicitud = () => {
    storageService.asignarTecnico(atencion.id, currentUser, currentUser);
    onUpdate();
  };

  const handleTomarEIniciar = () => {
    storageService.asignarTecnico(atencion.id, currentUser, currentUser);
    storageService.iniciarAtencion(atencion.id, currentUser, editHoraInicio || undefined, editHoraTermino || undefined);
    handleOpenHorariosForm();
    onUpdate();
  };

  const handleSaveHorarios = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editHoraInicio.trim() || !editHoraTermino.trim()) {
      alert('Por favor complete la hora de inicio y la hora de término.');
      return;
    }
    storageService.actualizarHorariosAtencion(
      atencion.id,
      editHoraInicio,
      editHoraTermino,
      editNotasTecnicas || atencion.notas_tecnicas,
      currentUser
    );
    setShowHorariosForm(false);
    onUpdate();
  };

  const handleAdjustEditTime = (minutes: number) => {
    const base = editHoraInicio ? new Date(`1970-01-01T${editHoraInicio}:00`) : new Date();
    if (isNaN(base.getTime())) return;
    const future = new Date(base.getTime() + minutes * 60 * 1000);
    const hh = String(future.getHours()).padStart(2, '0');
    const mm = String(future.getMinutes()).padStart(2, '0');
    setEditHoraTermino(`${hh}:${mm}`);
  };

  const handleAsignarTecnico = () => {
    const allUsers = storageService.getUsers().filter(u => u.rol === 'TECNICO' || u.rol === 'COORDINADOR' || u.rol === 'ADMINISTRADOR');
    const techUser = allUsers.find(u => u.id === selectedTech) || currentUser;
    storageService.asignarTecnico(atencion.id, techUser, currentUser);
    setShowAssignForm(false);
    onUpdate();
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eviTitulo.trim()) return;

    storageService.agregarEvidencia(atencion.id, {
      tipo: eviTipo,
      titulo: eviTitulo,
      url_preview: eviUrl,
      descripcion: eviDesc,
      archivo_nombre: `evidencia_${Date.now()}.jpg`,
    }, currentUser);

    setEviTitulo('');
    setEviDesc('');
    setShowAddEvidence(false);
    onUpdate();
  };

  const handleFinalizar = (e: React.FormEvent) => {
    e.preventDefault();

    const updated = storageService.finalizarAtencion(atencion.id, atencion.notas_tecnicas || '', currentUser);
    setShowFinishForm(false);
    onUpdate();

    // Check if auto-notify to WhatsApp is enabled
    const appConfig = storageService.getConfig();
    if (appConfig.whatsAppAutoNotifyOnFinish !== false) {
      const generatedTokenHash = updated.token_conformidad?.token_hash;
      const genConformityUrl = generatedTokenHash ? `${window.location.origin}/?token=${generatedTokenHash}` : '';
      const waInfo = storageService.generateWhatsAppNotificationUrl(updated, genConformityUrl);
      if (waInfo.url) {
        window.open(waInfo.url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleRegenerarToken = () => {
    if (confirm('¿Desea invalidar el token actual y generar uno nuevo con 24 horas de validez?')) {
      storageService.regenerarToken(atencion.id, currentUser);
      onUpdate();
    }
  };

  const handleInvalidarToken = () => {
    if (confirm('¿Está seguro de invalidar manualmente este token? El cliente ya no podrá usar el QR actual.')) {
      storageService.invalidarToken(atencion.id, currentUser);
      onUpdate();
    }
  };

  const handleSaveAdminEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNombre.trim() || !editArea.trim() || !editCategoria.trim()) {
      alert('Por favor complete los campos obligatorios (Responsable, Área y Actividad).');
      return;
    }

    const allUsers = storageService.getUsers();
    const techUser = editTecnicoId ? allUsers.find(u => u.id === editTecnicoId) : undefined;

    storageService.editarAtencionAdmin(atencion.id, {
      solicitante_nombre: editNombre,
      solicitante_area: editArea,
      solicitante_ubicacion: editArea,
      solicitante_contacto: editContacto,
      categoria: editCategoria,
      prioridad: editPrioridad,
      estado_operativo: editEstado,
      tecnico_id: editTecnicoId || undefined,
      tecnico_nombre: techUser ? techUser.nombre : (editTecnicoId ? 'Personal Asignado' : undefined),
      hora_inicio: editHoraInicio || undefined,
      hora_termino: editHoraTermino || undefined,
      descripcion: editDescripcion,
      notas_tecnicas: editNotasTecnicas,
      tipo_origen: editTipoOrigen
    }, currentUser);

    setIsEditingAdmin(false);
    onUpdate();
  };

  const handleConfirmDelete = () => {
    storageService.eliminarAtencionAdmin(atencion.id, currentUser);
    setShowDeleteConfirm(false);
    onUpdate();
    onClose();
  };

  // WhatsApp Assisted Message Generator (Official-friendly Click-to-chat fallback with Group/Config awareness)
  const getWhatsAppShareUrl = () => {
    const waInfo = storageService.generateWhatsAppNotificationUrl(atencion, conformityUrl);
    return waInfo.url;
  };

  const getWhatsAppTargetLabel = () => {
    const waInfo = storageService.generateWhatsAppNotificationUrl(atencion, conformityUrl);
    return waInfo.targetLabel;
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICA': return 'bg-red-500/20 text-red-300 border-red-500/50 font-black';
      case 'ALTA': return 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold';
      case 'MEDIA': return 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
      case 'BAJA':
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold';
    }
  };

  const getEstadoBadge = (e: string) => {
    switch (e) {
      case 'REGISTRADA': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'ASIGNADA': return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'EN_PROCESO': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CERRADA_PENDIENTE_CONFORMIDAD': return 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse';
      case 'CONFORME_FINALIZADA': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'CERRADA_CON_OBSERVACION': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const isAtencionPendiente = !atencion.fecha_inicio || atencion.estado_operativo === 'REGISTRADA' || atencion.estado_operativo === 'ASIGNADA';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div id="modal-atencion-detail" className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="font-mono font-extrabold text-sm sm:text-base bg-emerald-600 px-3.5 py-1 rounded-lg tracking-wider text-white shadow-xs">
              {atencion.codigo_visible}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Admin Management Buttons */}
            {isAdmin && !isEditingAdmin && (
              <>
                <button
                  id="btn-admin-edit-atencion"
                  onClick={() => setIsEditingAdmin(true)}
                  className="px-3 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Editar o corregir datos de la atención"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Corregir / Editar</span>
                </button>
                <button
                  id="btn-admin-delete-atencion"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-2.5 py-1.5 bg-rose-900/40 hover:bg-rose-900/80 text-rose-300 border border-rose-700/60 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Eliminar atención del sistema"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
              </>
            )}

            <button
              id="btn-close-detail-modal"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* ADMIN EDIT / CORRECTION FORM */}
          {isAdmin && isEditingAdmin ? (
            <form onSubmit={handleSaveAdminEdit} className="bg-blue-50/70 border-2 border-blue-300 rounded-2xl p-5 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                  <Pencil className="w-4 h-4 text-blue-700" />
                  <span>Modo Administrador: Corregir y Actualizar Atención {atencion.codigo_visible}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingAdmin(false)}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold cursor-pointer"
                >
                  Cancelar Edición
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {/* 1. Responsable del Área */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Responsable del Área Usuaria *
                  </label>
                  <input
                    id="edit-input-solicitante"
                    type="text"
                    required
                    value={editNombre}
                    onChange={e => setEditNombre(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 2. Área Usuaria */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Área Usuaria *
                  </label>
                  <input
                    id="edit-input-area"
                    type="text"
                    required
                    list="edit-areas-datalist"
                    value={editArea}
                    onChange={e => setEditArea(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="edit-areas-datalist">
                    {storageService.getAreas().map(areaName => <option key={areaName} value={areaName} />)}
                  </datalist>
                </div>

                {/* 3. Actividad */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Actividad de Salud Ambiental *
                  </label>
                  <select
                    id="edit-select-categoria"
                    value={editCategoria}
                    onChange={e => setEditCategoria(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {storageService.getActividades().map(actName => (
                      <option key={actName} value={actName}>{actName}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Teléfono / Contacto */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Teléfono / Contacto
                  </label>
                  <input
                    id="edit-input-contacto"
                    type="text"
                    value={editContacto}
                    onChange={e => setEditContacto(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 5. Prioridad */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Prioridad Operativa
                  </label>
                  <select
                    id="edit-select-prioridad"
                    value={editPrioridad}
                    onChange={e => setEditPrioridad(e.target.value as Prioridad)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BAJA">BAJA</option>
                    <option value="MEDIA">MEDIA</option>
                    <option value="ALTA">ALTA</option>
                    <option value="CRITICA">CRÍTICA</option>
                  </select>
                </div>

                {/* 6. Estado Operativo */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Estado Operativo
                  </label>
                  <select
                    id="edit-select-estado"
                    value={editEstado}
                    onChange={e => setEditEstado(e.target.value as EstadoOperativo)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="REGISTRADA">REGISTRADA</option>
                    <option value="ASIGNADA">ASIGNADA</option>
                    <option value="EN_PROCESO">EN PROCESO</option>
                    <option value="CERRADA_PENDIENTE_CONFORMIDAD">CERRADA PENDIENTE CONFORMIDAD (QR)</option>
                    <option value="CONFORME_FINALIZADA">CONFORME FINALIZADA</option>
                    <option value="CERRADA_CON_OBSERVACION">CERRADA CON OBSERVACIÓN</option>
                  </select>
                </div>

                {/* 7. Personal Asignado */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Personal de Salud Ambiental Asignado
                  </label>
                  <select
                    id="edit-select-tecnico"
                    value={editTecnicoId}
                    onChange={e => setEditTecnicoId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Sin asignar (Por tomar) --</option>
                    {storageService.getUsers().filter(u => u.rol === 'TECNICO' || u.rol === 'COORDINADOR' || u.rol === 'ADMINISTRADOR').map(u => (
                      <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                    ))}
                  </select>
                </div>

                {/* 8. Hora de Inicio */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hora de Inicio
                  </label>
                  <input
                    id="edit-input-hora-inicio"
                    type="time"
                    value={editHoraInicio}
                    onChange={e => setEditHoraInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 9. Hora de Término */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Hora de Término
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAdjustEditTime(15)}
                        className="px-1 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                        title="Fijar a 15 min"
                      >
                        15m
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustEditTime(30)}
                        className="px-1 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                        title="Fijar a 30 min"
                      >
                        30m
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustEditTime(45)}
                        className="px-1 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                        title="Fijar a 45 min"
                      >
                        45m
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustEditTime(60)}
                        className="px-1 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                        title="Fijar a 1 hora"
                      >
                        1h
                      </button>
                    </div>
                  </div>
                  <input
                    id="edit-input-hora-termino"
                    type="time"
                    value={editHoraTermino}
                    onChange={e => setEditHoraTermino(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 10. Detalles de la Solicitud */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Detalles de la solicitud u observaciones
                </label>
                <textarea
                  id="edit-textarea-descripcion"
                  rows={2}
                  value={editDescripcion}
                  onChange={e => setEditDescripcion(e.target.value)}
                  placeholder="Detalles registrados de la solicitud..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 11. Informe Técnico & Trabajos Ejecutados */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Informe Técnico & Trabajos Ejecutados
                </label>
                <textarea
                  id="edit-textarea-notas"
                  rows={2}
                  value={editNotasTecnicas}
                  onChange={e => setEditNotasTecnicas(e.target.value)}
                  placeholder="Acciones realizadas, solución o parámetros técnicos..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Edit Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-blue-200">
                <button
                  type="button"
                  onClick={() => setIsEditingAdmin(false)}
                  className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-save-admin-edit"
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Correcciones</span>
                </button>
              </div>
            </form>
          ) : (
            /* Main Info Banner - Minimalist Uniform Layout */
            <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {/* 1. Responsable del Área Usuaria & Área (Formato Fila Uniforme) */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-center space-y-3">
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <span className="text-slate-500 font-medium max-w-[125px] leading-snug shrink-0">
                      Responsable del área usuaria:
                    </span>
                    <span className="font-semibold text-slate-900 text-right leading-snug flex-1">
                      {atencion.solicitante_nombre || 'No especificado'}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 font-medium shrink-0">Área:</span>
                    <span className="font-semibold text-slate-900 text-right leading-snug flex-1">
                      {atencion.solicitante_area || atencion.solicitante_ubicacion || 'General'}
                    </span>
                  </div>
                </div>

                {/* 2. Actividad & Personal de la Unidad de Salud Ambiental (Formato Fila Uniforme) */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-center space-y-3">
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <span className="text-slate-500 font-medium shrink-0">Actividad:</span>
                    <span className="font-semibold text-slate-900 text-right leading-snug flex-1">
                      {atencion.categoria}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-start justify-between gap-2 text-xs">
                    <span className="text-slate-500 font-medium max-w-[125px] leading-snug shrink-0">
                      Personal de salud ambiental:
                    </span>
                    <span className="font-semibold text-slate-900 text-right leading-snug flex-1">
                      {atencion.tecnico_nombre || <span className="text-slate-400 font-normal italic">Por tomar</span>}
                    </span>
                  </div>
                </div>

                {/* 3. Apartado de Tiempos & Horarios (Línea de Tiempo Registrada) */}
                <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-2.5">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-2 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Línea de tiempo registrada
                    </span>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-2 text-slate-700">
                        <span className="text-slate-500 font-medium shrink-0">Registro:</span>
                        <span className="font-semibold text-slate-900 text-right">
                          {new Date(atencion.fecha_solicitud).toLocaleString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-slate-700">
                        <span className="text-slate-500 font-medium shrink-0">Hora de atención:</span>
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="font-semibold text-slate-900 text-right">
                            {atencion.hora_inicio || atencion.hora_termino
                              ? `${atencion.hora_inicio || '--:--'} a ${atencion.hora_termino || '--:--'}`
                              : (atencion.fecha_inicio ? new Date(atencion.fecha_inicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : 'Sin registrar')}
                          </span>
                          <button
                            id="btn-timeline-edit-horarios"
                            type="button"
                            onClick={handleOpenHorariosForm}
                            className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 hover:text-teal-900 rounded-lg cursor-pointer transition-all border border-teal-200 hover:scale-105 active:scale-95 shadow-2xs"
                            title="Abrir formulario para registrar / regularizar horario de inicio y término"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estado de la atención / Falta conformidad */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                    <span className="text-slate-500 font-medium text-xs shrink-0">Estado de la atención:</span>
                    {atencion.fecha_cierre || atencion.estado_operativo === 'CONFORME_FINALIZADA' ? (
                      <span className="font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Finalizada
                      </span>
                    ) : atencion.tipo_origen === 'RECORRIDO_OPERATIVO' || atencion.estado_operativo === 'CERRADA_PENDIENTE_CONFORMIDAD' ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (tokenHash) {
                            onOpenPublicConformidad(tokenHash);
                          }
                        }}
                        className="font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 border border-amber-300 px-2 py-0.5 rounded-md text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                        title="Abrir formulario y QR para registrar la conformidad"
                      >
                        <QrCode className="w-3 h-3 text-amber-800 shrink-0" />
                        <span className="whitespace-nowrap">Falta conformidad</span>
                        <ChevronRight className="w-3 h-3 text-amber-700 shrink-0" />
                      </button>
                    ) : atencion.estado_operativo === 'EN_PROCESO' ? (
                      <span className="font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 shrink-0">
                        <Play className="w-3 h-3 text-blue-600" />
                        En proceso
                      </span>
                    ) : (
                      <span className="font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1 shrink-0">
                        <AlertCircle className="w-3 h-3 text-amber-700" />
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description / Request Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Detalles de la solicitud u observaciones
            </h3>
            <div className="text-sm bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              {/* Header inside the box with Activity & Area */}
              <div className="bg-slate-50/80 px-3.5 py-2 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 font-medium">
                <div>
                  <span className="text-slate-400">Actividad:</span> <strong className="text-slate-800 font-semibold">{atencion.categoria}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Área:</span> <strong className="text-slate-800 font-semibold">{atencion.solicitante_area || atencion.solicitante_ubicacion || 'General'}</strong>
                </div>
              </div>
              
              {/* Additional registered information as separate body */}
              <div className="p-3.5 text-slate-800 leading-relaxed text-xs sm:text-sm">
                <p className="whitespace-pre-line">
                  {atencion.descripcion || <span className="text-slate-400 italic">Sin detalles u observaciones adicionales registradas.</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Technical Notes */}
          {atencion.notas_tecnicas && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Informe Técnico & Trabajos Ejecutados
              </h3>
              <p className="text-sm bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-200 text-slate-800 leading-relaxed whitespace-pre-line">
                {atencion.notas_tecnicas}
              </p>
            </div>
          )}

          {/* Action Bar based on State */}
          <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
            {/* Primary & Required Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <span className="text-xs font-bold text-slate-700 mr-1 hidden sm:inline">Acciones:</span>

              {/* Tomar Solicitud (Autoasignarme a mí) */}
              {(atencion.estado_operativo === 'REGISTRADA' || !atencion.tecnico_id || (atencion.tecnico_id !== currentUser.id && atencion.estado_operativo !== 'CONFORME_FINALIZADA' && atencion.estado_operativo !== 'CERRADA_CON_OBSERVACION')) && (
                <>
                  <button
                    id="btn-action-tomar-solicitud"
                    onClick={handleTomarSolicitud}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Tomar y autoasignarme esta solicitud a mi cuenta"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Tomar Solicitud</span>
                  </button>

                  {(atencion.estado_operativo === 'REGISTRADA' || !atencion.fecha_inicio) && (
                    <button
                      id="btn-action-tomar-e-iniciar"
                      onClick={handleTomarEIniciar}
                      className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Tomar la solicitud e iniciar inmediatamente las labores en campo"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Tomar e Iniciar Atención</span>
                    </button>
                  )}
                </>
              )}

              {atencion.estado_operativo === 'REGISTRADA' && (
                <button
                  id="btn-action-assign"
                  onClick={() => setShowAssignForm(!showAssignForm)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Asignar a Personal</span>
                </button>
              )}

              {atencion.estado_operativo === 'ASIGNADA' && (
                <button
                  id="btn-action-start"
                  onClick={handleIniciarAtencion}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Iniciar en Sitio</span>
                </button>
              )}

              {atencion.estado_operativo === 'EN_PROCESO' && (
                <button
                  id="btn-action-finish"
                  onClick={() => setShowFinishForm(!showFinishForm)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Finalizar Atención y Generar QR</span>
                </button>
              )}

              {/* Horarios Obligatorio Button */}
              <button
                id="btn-action-ajustar-horarios"
                type="button"
                onClick={handleOpenHorariosForm}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border ${
                  atencion.hora_inicio && atencion.hora_termino
                    ? 'bg-teal-700 hover:bg-teal-800 text-white border-teal-600'
                    : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500 ring-2 ring-amber-400/40 animate-pulse'
                }`}
                title="Registrar o regularizar hora de inicio y término de la atención (Obligatorio)"
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{atencion.hora_inicio && atencion.hora_termino ? 'Modificar Horario' : 'Registrar Horario'}</span>
                <span className="text-[9px] bg-white/25 text-white px-1.5 py-0.5 rounded-sm font-black uppercase tracking-wider">
                  Obligatorio
                </span>
              </button>
            </div>

            {/* Optional Actions (Side / Secondary) */}
            {atencion.estado_operativo === 'EN_PROCESO' && (
              <div className="flex items-center justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <button
                  id="btn-action-add-evidence"
                  onClick={() => setShowAddEvidence(!showAddEvidence)}
                  className="w-full sm:w-auto px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Adjuntar fotografías del servicio (Opcional)"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>Adjuntar Evidencia</span>
                  <span className="text-[10px] text-slate-400 font-normal">(Opcional)</span>
                </button>
              </div>
            )}
          </div>

          {/* Horarios Inline Form */}
          {showHorariosForm && (
            <form
              id="seccion-horarios-form"
              onSubmit={handleSaveHorarios}
              className="p-4 sm:p-5 bg-teal-50/90 border border-teal-300 rounded-2xl space-y-3.5 shadow-sm animate-in fade-in zoom-in-95 scroll-mt-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-teal-600 text-white rounded-xl shadow-xs">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-teal-950">
                      Registrar / Regularizar Horario de Atención
                    </h4>
                    <p className="text-[11px] text-teal-800">
                      Indique con exactitud la hora de inicio y término de la labor ejecutada.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHorariosForm(false)}
                  className="text-teal-700 hover:text-teal-950 text-xs font-bold px-2 py-1 bg-white border border-teal-200 rounded-lg cursor-pointer"
                >
                  ✕ Cerrar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-teal-950 mb-1">
                    Hora de Inicio (HH:mm) *
                  </label>
                  <input
                    id="input-modal-hora-inicio"
                    type="time"
                    required
                    value={editHoraInicio}
                    onChange={e => setEditHoraInicio(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-teal-300 rounded-xl bg-white font-mono text-slate-900 focus:ring-2 focus:ring-teal-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-teal-950 mb-1">
                    Hora de Término (HH:mm) *
                  </label>
                  <input
                    id="input-modal-hora-termino"
                    type="time"
                    required
                    value={editHoraTermino}
                    onChange={e => setEditHoraTermino(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-teal-300 rounded-xl bg-white font-mono text-slate-900 focus:ring-2 focus:ring-teal-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Duration calculation & shortcuts */}
              <div className="p-3 bg-white border border-teal-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
                <div className="flex items-center gap-1.5 text-teal-950 font-medium">
                  {editHoraInicio && editHoraTermino ? (
                    (() => {
                      const duration = calculateDurationMinutes(editHoraInicio, editHoraTermino);
                      if (duration === null) return <span className="text-slate-500">Horas incompletas</span>;
                      const hours = Math.floor(duration / 60);
                      const mins = duration % 60;
                      return (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Tiempo calculado:</span>
                          <strong className="text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md font-bold text-xs">
                            {hours > 0 ? `${hours} h ` : ''}{mins} min ({duration} minutos)
                          </strong>
                        </div>
                      );
                    })()
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">
                      Coloque la hora de inicio y término para registrar la duración
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Atajo:</span>
                  <button
                    type="button"
                    onClick={() => handleAdjustEditTime(15)}
                    className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-md text-[10px] font-bold border border-teal-200 cursor-pointer transition-colors"
                  >
                    +15m
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustEditTime(30)}
                    className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-md text-[10px] font-bold border border-teal-200 cursor-pointer transition-colors"
                  >
                    +30m
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustEditTime(45)}
                    className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-md text-[10px] font-bold border border-teal-200 cursor-pointer transition-colors"
                  >
                    +45m
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustEditTime(60)}
                    className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-md text-[10px] font-bold border border-teal-200 cursor-pointer transition-colors"
                  >
                    +1h
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowHorariosForm(false)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirm-save-horarios"
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar Horario en la Ficha
                </button>
              </div>
            </form>
          )}

          {/* Assign Tech Inline Form */}
          {showAssignForm && (
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-sky-900">Seleccionar Personal de Salud Ambiental Asignado:</h4>
              <div className="flex items-center gap-3">
                <select
                  id="select-tecnico-asignar"
                  value={selectedTech}
                  onChange={e => setSelectedTech(e.target.value)}
                  className="text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {storageService.getUsers()
                    .filter(u => (u.rol === 'TECNICO' || u.rol === 'COORDINADOR' || u.rol === 'ADMINISTRADOR') && u.activo !== false)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} ({u.especialidad || u.rol})
                      </option>
                    ))}
                </select>
                <button
                  id="btn-confirm-assign"
                  onClick={handleAsignarTecnico}
                  className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Confirmar Asignación
                </button>
              </div>
            </div>
          )}

          {/* Add Evidence Inline Form */}
          {showAddEvidence && (
            <form onSubmit={handleAddEvidence} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-900">Cargar Nueva Evidencia Fotográfica / Reporte</h4>
                <button type="button" onClick={() => setShowAddEvidence(false)} className="text-slate-400 hover:text-slate-600 text-xs">Cancelar</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Título de Evidencia *</label>
                  <input
                    id="input-evidence-title"
                    type="text"
                    required
                    placeholder="Ej. Medición de cloro residual o Prueba técnica"
                    value={eviTitulo}
                    onChange={e => setEviTitulo(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tipo de Evidencia</label>
                  <select
                    id="select-evidence-type"
                    value={eviTipo}
                    onChange={e => setEviTipo(e.target.value as Evidencia['tipo'])}
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="FOTO_INICIAL">Foto Inicial / Condición</option>
                    <option value="DIAGNOSTICO">Diagnóstico / Medición</option>
                    <option value="FOTO_FINAL">Foto Final / Solución</option>
                    <option value="REPORTE_TECNICO">Reporte / Guía</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Descripción de la Evidencia</label>
                <input
                  id="input-evidence-desc"
                  type="text"
                  placeholder="Detalle técnico de la fotografía o medición realizada..."
                  value={eviDesc}
                  onChange={e => setEviDesc(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end">
                <button
                  id="btn-submit-evidence"
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Guardar Evidencia en BD
                </button>
              </div>
            </form>
          )}

          {/* Finish Attention Minimalist Confirmation Card */}
          {showFinishForm && (
            <form
              id="form-finish-atencion"
              onSubmit={handleFinalizar}
              className="p-4 sm:p-5 bg-emerald-50/90 border border-emerald-300 rounded-2xl space-y-3.5 shadow-sm animate-in fade-in zoom-in-95"
            >
              <div className="flex justify-between items-center pb-1 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-2xs">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                    Finalizar Atención y Generar Código QR
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFinishForm(false)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-white px-2 py-1 rounded-lg border border-emerald-200 cursor-pointer"
                >
                  ✕ Cancelar
                </button>
              </div>

              {/* Minimalist Summary of Schedule Status */}
              <div className="p-3 bg-white/90 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-950">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Horario establecido:</strong>{' '}
                    <span className="font-mono bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-900 font-bold">
                      {atencion.hora_inicio || '--:--'} a {atencion.hora_termino || '--:--'}
                    </span>
                  </span>
                </div>
                {(!atencion.hora_inicio || !atencion.hora_termino) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowFinishForm(false);
                      setShowHorariosForm(true);
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 cursor-pointer"
                  >
                    ⚠️ Regularizar Horario
                  </button>
                )}
              </div>

              {/* Auto WhatsApp Dispatch Notice */}
              <div className="p-3 bg-emerald-100/70 border border-emerald-300/80 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Notificación Automatizada: </span>
                  Al confirmar, se generará el <strong>Código QR de Conformidad</strong> y se remitirá automáticamente el reporte de término con el enlace de validación al <strong>{getWhatsAppTargetLabel()}</strong>.
                </div>
              </div>

              {/* Confirmation Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowFinishForm(false)}
                  className="px-4 py-2 border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirm-finish"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Confirmar Cierre y Generar QR</span>
                </button>
              </div>
            </form>
          )}

          {/* Evidence Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Evidencias del Servicio ({atencion.evidencias.length})
            </h3>

            {atencion.evidencias.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                No se han cargado evidencias fotográficas aún.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {atencion.evidencias.map(evi => (
                  <div key={evi.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <img src={evi.url_preview} alt={evi.titulo} className="w-full h-32 object-cover" />
                    <div className="p-2.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-sm">
                        {evi.tipo}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 truncate">{evi.titulo}</h4>
                      {evi.descripcion && <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{evi.descripcion}</p>}
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {new Date(evi.timestamp).toLocaleTimeString('es-PE')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QR CONFORMITY & SECURITY MODULE WITH DUAL VIEWS */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  Módulo de Conformidad Criptosegura mediante QR
                </h3>
                <p className="text-xs text-slate-500">
                  Acceso desacoplado mediante token de alta entropía (64 caracteres) con validación instantánea.
                </p>
              </div>

              {/* View Switcher: Personal Responsable vs Administrador (ONLY VISIBLE FOR ADMINS) */}
              {isAdmin && (
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                  <button
                    id="tab-qr-doc-personal"
                    type="button"
                    onClick={() => setQrDocTab('PERSONAL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      qrDocTab === 'PERSONAL'
                        ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Para el Personal Responsable</span>
                  </button>
                  <button
                    id="tab-qr-doc-admin"
                    type="button"
                    onClick={() => setQrDocTab('ADMIN')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      qrDocTab === 'ADMIN'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Para el Administrador</span>
                  </button>
                </div>
              )}
            </div>

            {/* DOCUMENTATION PANEL - CONDITIONAL FOR TECH VS ADMIN */}
            {(!isAdmin || qrDocTab === 'PERSONAL') ? (
              /* --- VISTA: PERSONAL RESPONSABLE (LENGUAJE SENCILLO & FLUJO EN 3 PASOS) --- */
              <div className="bg-emerald-950/5 border border-emerald-600/30 p-4 sm:p-5 rounded-2xl space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                      Validación de Conformidad por QR
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Firma digital y constancia inmediata en el punto de atención por el responsable del área.
                    </p>
                  </div>
                </div>

                {/* Banner: Activación al guardar informe */}
                <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Activación automática:</strong> El código QR se activa inmediatamente al registrar y guardar el informe técnico de la atención.
                  </span>
                </div>

                {/* 3 Simple Operational Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                      <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                      <span>Registrar informe</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Ingrese las acciones ejecutadas y el diagnóstico técnico en el botón <em>Finalizar Atención</em>.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                      <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                      <span>Mostrar QR</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Muestre el código QR generado en pantalla al responsable del área usuaria en el establecimiento.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                      <span className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">3</span>
                      <span>Confirmación del cliente</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      El responsable escanea el QR desde su celular, califica el servicio y firma digitalmente.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* --- VISTA: ADMINISTRADOR (ESPECIFICACIÓN TÉCNICA EN BACKEND & CRIPTOGRAFÍA) --- */
              <div className="bg-slate-900 text-white border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>Configuración Técnica de Seguridad en Backend</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
                        CSPRNG SHA-256
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Arquitectura transaccional de tokens criptográficos desacoplados y prevención de ataques.
                    </p>
                  </div>
                </div>

                {/* 4 Technical Architecture Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Token Criptoseguro (64 caracteres)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Generado mediante generadores de números pseudoaleatorios criptográficamente seguros (Web Crypto CSPRNG / 256 bits de entropía hexadecimal impredecible).
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Protección Anti-Enumeration</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Desacoplado de los correlativos de Base de Datos (<code className="text-emerald-300 font-mono">AT-2026-XXXXX</code>), imposibilitando ataques de fuerza bruta o escaneo secuencial no autorizado.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Uso Único (One-Time Token)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      El token se consume y bloquea atómicamente en la primera firma digital (<code className="text-amber-300 font-mono">consumido: true</code>), impidiendo reenvíos o duplicidad de conformidad.
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Activación Automática en Backend</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Disparador transaccional vinculado a la transición de estado hacia <code className="text-purple-300 font-mono">CERRADA_PENDIENTE_CONFORMIDAD</code> / Finalizado con TTL de 24 horas y revocación instantánea.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive QR Display & Actions */}
            {atencion.token_conformidad ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800">
                {/* QR Display */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Conformidad" className="w-48 h-48 block" />
                  ) : (
                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                      Generando QR...
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-slate-600 mt-1 font-bold">
                    ESCANEABLE CON CUALQUIER SMARTPHONE
                  </span>
                </div>

                {/* Token Details & Actions */}
                <div className="md:col-span-2 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Estado del Token:</span>
                      {atencion.token_conformidad.consumido ? (
                        <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Consumido & Firmado
                        </span>
                      ) : atencion.token_conformidad.invalidado ? (
                        <span className="text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Token Invalidado
                        </span>
                      ) : (
                        <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Vigente (24h)
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Token Hash Criptográfico:</span>
                        <span className="font-mono text-blue-300 truncate max-w-[200px]" title={atencion.token_conformidad.token_hash}>
                          {atencion.token_conformidad.token_hash.substring(0, 16)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Generado:</span>
                        <span>{new Date(atencion.token_conformidad.fecha_creacion).toLocaleString('es-PE')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Expiración Límite:</span>
                        <span className="text-amber-400">{new Date(atencion.token_conformidad.fecha_expiracion).toLocaleString('es-PE')}</span>
                      </div>
                    </div>

                    {/* Signed conformity details if signed */}
                    {atencion.conformidad && (
                      <div className="bg-emerald-950/60 border border-emerald-700/50 p-3 rounded-xl space-y-1 text-xs text-emerald-100">
                        <div className="font-bold flex items-center gap-1 text-emerald-300">
                          <CheckCircle2 className="w-4 h-4" /> Conformidad Registrada
                        </div>
                        <p>Firmante: <strong>{atencion.conformidad.firmante_nombre}</strong> (Doc: {atencion.conformidad.firmante_documento})</p>
                        <p>Calificación: <span className="text-amber-400 font-bold">{'★'.repeat(atencion.conformidad.calificacion)}</span> ({atencion.conformidad.calificacion}/5)</p>
                        {atencion.conformidad.observaciones && <p className="italic text-[11px] text-emerald-200">"{atencion.conformidad.observaciones}"</p>}
                        {atencion.conformidad.firma_digital_data && (
                          <div className="pt-2">
                            <span className="text-[10px] text-emerald-400 block mb-1">Constancia de Firma:</span>
                            <img src={atencion.conformidad.firma_digital_data} alt="Firma" className="h-12 bg-white/90 rounded-md p-1" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions for QR */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={conformityUrl}
                        className="bg-slate-800 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-700 flex-1 font-mono select-all"
                      />
                      <button
                        id="btn-copy-conformity-link"
                        onClick={handleCopyLink}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copiar enlace"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id="btn-simulate-qr-scan"
                        onClick={() => onOpenPublicConformidad(atencion.token_conformidad!.token_hash)}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Simular Escaneo de QR (Abrir Vista Cliente)
                      </button>

                      <button
                        id="btn-regenerate-token"
                        onClick={handleRegenerarToken}
                        className="p-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Regenerar nuevo token seguro y anular el anterior"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      {!atencion.token_conformidad.invalidado && !atencion.token_conformidad.consumido && (
                        <button
                          id="btn-invalidate-token"
                          onClick={handleInvalidarToken}
                          className="p-2 text-xs font-medium text-rose-300 bg-rose-950/80 hover:bg-rose-900 rounded-lg border border-rose-800 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Invalidar token inmediatamente"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* If Attention not finished yet */
              <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                <QrCode className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">QR de Conformidad no generado</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  El código QR con token criptoseguro se generará automáticamente cuando el personal finalice la atención y guarde el informe técnico final.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Versión de registro: v{atencion.version_registro} • Base de Datos Principal OK
          </span>
          <div className="flex items-center gap-2">
            {isAdmin && !isEditingAdmin && (
              <button
                id="btn-footer-edit"
                onClick={() => setIsEditingAdmin(true)}
                className="px-3 py-2 bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Corregir Atención</span>
              </button>
            )}
            <button
              id="btn-close-modal-footer"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM DELETE MODAL (FOR ADMIN) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-300">
                  ¿Eliminar Atención Permanentemente?
                </h3>
                <p className="text-xs text-slate-300">
                  Está a punto de eliminar la atención <strong className="text-white font-mono">{atencion.codigo_visible}</strong> ({atencion.categoria} - {atencion.solicitante_nombre}).
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-200">
              ⚠️ Esta acción removerá el registro de la base de datos principal y de Google Sheets. La operación quedará registrada en el módulo de auditoría inmutable.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-delete-atencion"
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
