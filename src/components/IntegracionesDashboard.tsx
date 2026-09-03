import React, { useState } from 'react';
import { 
  Activity, 
  RefreshCw, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Radio, 
  Sliders, 
  FileSpreadsheet, 
  MessageSquare, 
  ShieldCheck, 
  ExternalLink,
  Zap,
  Info,
  Users,
  Settings,
  Link,
  Phone,
  HelpCircle
} from 'lucide-react';
import { GoogleSheetsRow, IntegrationEvent } from '../types';
import { SimulationConfig, storageService } from '../services/storageService';
import { GoogleSheetsPreview } from './GoogleSheetsPreview';
import { WhatsAppConfigModal } from './WhatsAppConfigModal';

interface IntegracionesDashboardProps {
  events: IntegrationEvent[];
  sheetsData: GoogleSheetsRow[];
  config: SimulationConfig;
  onRefresh: () => void;
}

export const IntegracionesDashboard: React.FC<IntegracionesDashboardProps> = ({
  events,
  sheetsData,
  config,
  onRefresh,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<IntegrationEvent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWhatsAppConfigModal, setShowWhatsAppConfigModal] = useState(false);

  const sheetsEvents = events.filter(e => e.tipo_servicio === 'GOOGLE_SHEETS');
  const waEvents = events.filter(e => e.tipo_servicio === 'WHATSAPP_NOTIFICATION');

  const pendingCount = events.filter(e => e.estado === 'PENDIENTE' || e.estado === 'REINTENTO_PENDIENTE').length;
  const errorCount = events.filter(e => e.estado === 'FALLO_DEFINITIVO' || e.estado === 'ERROR').length;
  const successCount = events.filter(e => e.estado === 'EXITOSO').length;

  const handleToggleSheets = () => {
    storageService.updateConfig({ sheetsOnline: !config.sheetsOnline });
    onRefresh();
  };

  const handleToggleWhatsApp = () => {
    storageService.updateConfig({ whatsAppOnline: !config.whatsAppOnline });
    onRefresh();
  };

  const handleProcessOutbox = async () => {
    setIsProcessing(true);
    await storageService.processOutbox();
    setIsProcessing(false);
    onRefresh();
  };

  const handleRetrySingle = (id: string) => {
    storageService.retryEvent(id);
    onRefresh();
  };

  const handleRetryAll = () => {
    storageService.retryAllFailedEvents();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Health Overview & Simulation Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Sheets Health Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Servicio Google Sheets</h3>
                <p className="text-xs text-slate-500">Destino de sincronización y análisis consolidado</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                config.sheetsOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                <Radio className={`w-3 h-3 ${config.sheetsOnline ? 'animate-pulse text-emerald-600' : 'text-rose-600'}`} />
                {config.sheetsOnline ? '🟢 Conectado' : '🔴 Desconectado'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 block">Filas en Hoja</span>
              <span className="font-bold text-slate-900 text-sm">{sheetsData.length}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Sincronizados</span>
              <span className="font-bold text-emerald-600 text-sm">
                {sheetsEvents.filter(e => e.estado === 'EXITOSO').length}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">En Cola / Error</span>
              <span className="font-bold text-amber-600 text-sm">
                {sheetsEvents.filter(e => e.estado !== 'EXITOSO').length}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-500">Simulador de Caída de Red:</span>
            <button
              id="btn-toggle-sheets-status"
              onClick={handleToggleSheets}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs border transition-colors ${
                config.sheetsOnline
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {config.sheetsOnline ? 'Simular Caída de Sheets' : 'Restaurar Conexión Sheets'}
            </button>
          </div>
        </div>

        {/* WhatsApp Service Health Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Servicio WhatsApp Notificaciones</h3>
                <p className="text-xs text-slate-500">Meta Cloud API Oficial + Click-to-Chat Fallback</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                config.whatsAppOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                <Radio className={`w-3 h-3 ${config.whatsAppOnline ? 'animate-pulse text-emerald-600' : 'text-rose-600'}`} />
                {config.whatsAppOnline ? '🟢 Operativo' : '🔴 No Disponible'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 block">Total Mensajes</span>
              <span className="font-bold text-slate-900 text-sm">{waEvents.length}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Despachados</span>
              <span className="font-bold text-emerald-600 text-sm">
                {waEvents.filter(e => e.estado === 'EXITOSO').length}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Pendientes</span>
              <span className="font-bold text-amber-600 text-sm">
                {waEvents.filter(e => e.estado !== 'EXITOSO').length}
              </span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Destino Actual de Reportes:</span>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsAppConfigModal(true)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-emerald-300 shadow-2xs hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                Configurar Grupo / Destino
              </button>
            </div>
            
            <div className="text-[11px] text-emerald-800 flex items-center gap-2">
              <span className="font-semibold">
                {config.whatsAppTargetType === 'GRUPO' ? '👥 Grupo de WhatsApp:' : config.whatsAppTargetType === 'NUMERO' ? '📞 Teléfono Central:' : '👤 Solicitante:'}
              </span>
              <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-900 font-bold">
                {config.whatsAppTargetType === 'GRUPO' 
                  ? (config.whatsAppGroupName || 'Unidad de Salud Ambiental - Operaciones')
                  : config.whatsAppTargetType === 'NUMERO'
                  ? (config.whatsAppCustomNumber || '+51 996 700 560')
                  : 'Contacto registrado en ficha'}
              </span>
            </div>

            {config.whatsAppGroupInviteLink && config.whatsAppTargetType === 'GRUPO' && (
              <div className="text-[10px] text-emerald-700 flex items-center gap-1 truncate">
                <Link className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">Enlace vinculado: {config.whatsAppGroupInviteLink}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-500">Simulador de Servicio WhatsApp:</span>
            <button
              id="btn-toggle-whatsapp-status"
              onClick={handleToggleWhatsApp}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs border transition-colors ${
                config.whatsAppOnline
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {config.whatsAppOnline ? 'Simular Caída de WhatsApp' : 'Restaurar WhatsApp'}
            </button>
          </div>
        </div>
      </div>

      {/* Outbox Events Table (Capa de Integración Desacoplada) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Cola de Eventos de Integración (Transactional Outbox)</h3>
              <p className="text-xs text-slate-400">
                Garantía de ejecución desacoplada • Reintentos con Backoff Exponencial • Idempotencia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-retry-all-events"
              onClick={handleRetryAll}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reintentar Fallidos
            </button>
            <button
              id="btn-process-outbox-now"
              onClick={handleProcessOutbox}
              disabled={isProcessing}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {isProcessing ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              Procesar Cola
            </button>
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">ID Evento</th>
                <th className="p-3">Servicio</th>
                <th className="p-3">Atención / Código</th>
                <th className="p-3">Idempotencia Key</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Intentos</th>
                <th className="p-3">Detalle / Error</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No hay eventos encolados en el Outbox.
                  </td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-500">{event.id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        event.tipo_servicio === 'GOOGLE_SHEETS' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {event.tipo_servicio}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-700">{event.entidad_codigo}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{event.id_idempotencia}</td>
                    <td className="p-3">
                      {event.estado === 'EXITOSO' && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Exitoso
                        </span>
                      )}
                      {event.estado === 'PENDIENTE' && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                      {event.estado === 'REINTENTO_PENDIENTE' && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit">
                          <RotateCcw className="w-3 h-3" /> Reintentando
                        </span>
                      )}
                      {event.estado === 'FALLO_DEFINITIVO' && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" /> Fallo Definitivo
                        </span>
                      )}
                      {event.estado === 'PROCESANDO' && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Procesando
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-center">
                      <span className={event.intentos > 1 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                        {event.intentos}/{event.max_intentos}
                      </span>
                    </td>
                    <td className="p-3 text-[11px]">
                      {event.ultimo_error ? (
                        <span className="text-rose-600 font-medium line-clamp-1" title={event.ultimo_error}>
                          ⚠️ {event.ultimo_error}
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          {event.fecha_exito ? `Completado ${new Date(event.fecha_exito).toLocaleTimeString('es-PE')}` : 'Sin errores'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`btn-inspect-event-${event.id}`}
                          onClick={() => setSelectedEvent(event)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold transition-colors"
                        >
                          Payload
                        </button>
                        {event.estado !== 'EXITOSO' && (
                          <button
                            id={`btn-retry-event-${event.id}`}
                            onClick={() => handleRetrySingle(event.id)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-[11px] font-bold transition-colors"
                          >
                            Reintentar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Google Sheets Preview Mirror */}
      <GoogleSheetsPreview 
        data={sheetsData} 
        onRefresh={onRefresh} 
        isOnline={config.sheetsOnline} 
      />

      {/* Payload Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5 space-y-4 border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-sm font-bold">Detalle del Evento de Integración</h4>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
            </div>

            <div className="text-xs space-y-2">
              <p><strong>ID:</strong> {selectedEvent.id}</p>
              <p><strong>Idempotencia Key:</strong> <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{selectedEvent.id_idempotencia}</code></p>
              <p><strong>Creado:</strong> {new Date(selectedEvent.fecha_creacion).toLocaleString('es-PE')}</p>
              <div>
                <span className="font-bold block mb-1">Payload JSON:</span>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Configuration Modal */}
      <WhatsAppConfigModal
        isOpen={showWhatsAppConfigModal}
        onClose={() => setShowWhatsAppConfigModal(false)}
        config={config}
        onConfigUpdated={() => {
          onRefresh();
        }}
      />
    </div>
  );
};
