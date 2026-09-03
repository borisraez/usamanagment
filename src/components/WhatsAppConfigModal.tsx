import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Users, 
  Link, 
  Phone, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink,
  ShieldCheck,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { SimulationConfig, storageService } from '../services/storageService';

interface WhatsAppConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SimulationConfig;
  onConfigUpdated: () => void;
}

export const WhatsAppConfigModal: React.FC<WhatsAppConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
}) => {
  const [targetType, setTargetType] = useState<'GRUPO' | 'NUMERO' | 'SOLICITANTE'>(
    config.whatsAppTargetType || 'GRUPO'
  );
  const [groupInviteLink, setGroupInviteLink] = useState(
    config.whatsAppGroupInviteLink || ''
  );
  const [groupName, setGroupName] = useState(
    config.whatsAppGroupName || 'Unidad de Salud Ambiental - Operaciones'
  );
  const [customNumber, setCustomNumber] = useState(
    config.whatsAppCustomNumber || '+51 996 700 560'
  );
  const [autoNotifyOnFinish, setAutoNotifyOnFinish] = useState(
    config.whatsAppAutoNotifyOnFinish !== false
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showHowToLink, setShowHowToLink] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean group link if provided
    let cleanGroupLink = groupInviteLink.trim();
    if (cleanGroupLink && !cleanGroupLink.startsWith('http://') && !cleanGroupLink.startsWith('https://')) {
      if (cleanGroupLink.startsWith('chat.whatsapp.com/')) {
        cleanGroupLink = `https://${cleanGroupLink}`;
      }
    }

    storageService.updateConfig({
      whatsAppTargetType: targetType,
      whatsAppGroupInviteLink: cleanGroupLink,
      whatsAppGroupName: groupName.trim(),
      whatsAppCustomNumber: customNumber.trim(),
      whatsAppAutoNotifyOnFinish: autoNotifyOnFinish,
    });

    onConfigUpdated();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const sampleMessage = `*NOTIFICACIÓN DE SALUD AMBIENTAL*\n*Atención:* AT-2026-00245\n*Responsable:* Dr. Encinas\n*Área:* Nefrología\n*Actividad:* Desinfección\n*Personal:* Roberto Gómez\n*Horario:* 08:05 a 09:20 (75 min)\n*Estado:* CERRADA PENDIENTE CONFORMIDAD\n\n*Validación de Conformidad por QR:* https://saludambiental.gob.pe/conformidad?token=9f83...`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Configurar Notificaciones de WhatsApp
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  GRUPO / CANAL
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Vincule el Grupo de WhatsApp para el envío automático al finalizar atenciones y generar QR.
              </p>
            </div>
          </div>
          <button
            id="btn-close-whatsapp-config"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 text-xs">
          {savedSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>¡Configuración de WhatsApp guardada exitosamente!</span>
            </div>
          )}

          {/* 1. Destino de Notificación */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-2">
              ¿A dónde deben enviarse las notificaciones del servicio?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setTargetType('GRUPO')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  targetType === 'GRUPO'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Users className={`w-4 h-4 ${targetType === 'GRUPO' ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {targetType === 'GRUPO' && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/40">
                      Recomendado
                    </span>
                  )}
                </div>
                <div className="font-bold text-slate-100">Grupo de WhatsApp</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Notifica a todo el equipo o jefatura</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('NUMERO')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  targetType === 'NUMERO'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Phone className={`w-4 h-4 ${targetType === 'NUMERO' ? 'text-emerald-400' : 'text-slate-400'}`} />
                </div>
                <div className="font-bold text-slate-100">Número Específico</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Envía a un teléfono central predeterminado</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('SOLICITANTE')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  targetType === 'SOLICITANTE'
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Send className={`w-4 h-4 ${targetType === 'SOLICITANTE' ? 'text-emerald-400' : 'text-slate-400'}`} />
                </div>
                <div className="font-bold text-slate-100">Al Solicitante</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Al contacto registrado en cada ficha</div>
              </button>
            </div>
          </div>

          {/* Conditional Input depending on target type */}
          {targetType === 'GRUPO' && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3.5 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre del Grupo de WhatsApp
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ej. Salud Ambiental - Guardia y Operaciones"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Enlace de Invitación del Grupo de WhatsApp (Opcional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHowToLink(!showHowToLink)}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <HelpCircle className="w-3 h-3" />
                    ¿Cómo obtener este enlace?
                  </button>
                </div>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Link className="w-4 h-4" />
                  </div>
                  <input
                    id="input-wa-group-link"
                    type="text"
                    value={groupInviteLink}
                    onChange={(e) => setGroupInviteLink(e.target.value)}
                    placeholder="https://chat.whatsapp.com/AbCdEfGhIjK12345"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {showHowToLink && (
                <div className="p-3 bg-slate-900 border border-emerald-800/40 rounded-xl text-[11px] text-slate-300 space-y-1.5 animate-in fade-in">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Pasos para vincular el grupo:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                    <li>Abre <strong>WhatsApp</strong> en tu teléfono o WhatsApp Web.</li>
                    <li>Ingresa al grupo donde deseas recibir los reportes de atención.</li>
                    <li>Toca el nombre del grupo en la parte superior y selecciona <strong>"Enlace de invitación al grupo"</strong>.</li>
                    <li>Copia el enlace (ej: <code className="text-emerald-300">chat.whatsapp.com/XXXXX</code>) y pégalo aquí.</li>
                  </ol>
                  <p className="text-[10px] text-slate-400 pt-1">
                    Al finalizar la atención, el sistema abrirá WhatsApp con el reporte formateado listo para compartir al grupo con un solo clic.
                  </p>
                </div>
              )}
            </div>
          )}

          {targetType === 'NUMERO' && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 animate-in fade-in">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Número de Teléfono Predeterminado (con código de país)
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="input-wa-custom-phone"
                  type="text"
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value)}
                  placeholder="+51 996 700 560"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                El sistema dirigirá los mensajes de notificación y cierre a este número telefónico.
              </p>
            </div>
          )}

          {/* 2. Automatización al Finalizar y Generar QR */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Automatizar envío al "Finalizar Atención y Generar QR"</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Abre inmediatamente la ventana de WhatsApp con el resumen completo de la labor y el enlace QR de conformidad listo para remitir.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={autoNotifyOnFinish}
                  onChange={(e) => setAutoNotifyOnFinish(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* 3. Vista Previa del Mensaje Automatizado */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Vista Previa del Mensaje Automatizado de Término
            </label>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-300/90 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
              {sampleMessage}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-save-whatsapp-config"
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-950 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Configuración de WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
