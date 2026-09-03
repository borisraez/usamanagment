import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Clock, User, FileText, ChevronRight } from 'lucide-react';
import { AuditoriaLog } from '../types';

interface AuditoriaViewProps {
  logs: AuditoriaLog[];
}

export const AuditoriaView: React.FC<AuditoriaViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntidad, setSelectedEntidad] = useState<string>('TODAS');
  const [selectedLog, setSelectedLog] = useState<AuditoriaLog | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchSearch = 
      log.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEntidad = selectedEntidad === 'TODAS' || log.entidad === selectedEntidad;
    return matchSearch && matchEntidad;
  });

  const getEntidadBadge = (entidad: string) => {
    switch (entidad) {
      case 'ATENCION': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFORMIDAD': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'TOKEN_CONFORMIDAD': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EVIDENCIA': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Registro Inmutable de Auditoría & Trazabilidad</h3>
            <p className="text-xs text-slate-500">
              Historial de cada mutación de estado operativo, emisión de tokens y firmas de conformidad
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
          Total Eventos: {logs.length}
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="input-search-audit"
            type="text"
            placeholder="Buscar por usuario, acción o descripción..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          id="select-filter-audit-entidad"
          value={selectedEntidad}
          onChange={e => setSelectedEntidad(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="TODAS">Todas las Entidades</option>
          <option value="ATENCION">Atenciones</option>
          <option value="CONFORMIDAD">Conformidad QR</option>
          <option value="TOKEN_CONFORMIDAD">Tokens Criptográficos</option>
          <option value="EVIDENCIA">Evidencias Fotográficas</option>
        </select>
      </div>

      {/* Mobile Logs Cards (< md) */}
      <div className="md:hidden space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white p-8 text-center text-slate-400 rounded-2xl border border-slate-200 text-xs">
            No se encontraron registros de auditoría.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={`mobile-audit-${log.id}`}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getEntidadBadge(log.entidad)}`}>
                  {log.entidad}
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {new Date(log.timestamp).toLocaleString('es-PE')}
                </span>
              </div>

              <div>
                <p className="font-mono font-bold text-slate-900 text-xs">{log.accion}</p>
                <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{log.descripcion}</p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <User className="w-3 h-3 text-slate-400" />
                  <span className="font-medium truncate max-w-[130px]">{log.usuario_nombre}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 font-semibold">
                    {log.usuario_rol}
                  </span>
                </div>

                {(log.datos_anteriores || log.datos_nuevos) && (
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="text-blue-600 hover:text-blue-800 text-xs font-bold underline shrink-0 cursor-pointer"
                  >
                    Ver Diff
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Logs Table (>= md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Fecha & Hora</th>
                <th className="p-3">Entidad</th>
                <th className="p-3">Acción Registrada</th>
                <th className="p-3">Usuario Responsable</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Descripción de la Operación</th>
                <th className="p-3 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No se encontraron registros de auditoría.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('es-PE')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getEntidadBadge(log.entidad)}`}>
                        {log.entidad}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800 text-[11px]">
                      {log.accion}
                    </td>
                    <td className="p-3 font-medium text-slate-900 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      {log.usuario_nombre}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-sm text-[10px] font-semibold">
                        {log.usuario_rol}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-600 max-w-md">
                      {log.descripcion}
                    </td>
                    <td className="p-3 text-right">
                      {(log.datos_anteriores || log.datos_nuevos) && (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-600 hover:text-blue-800 text-[11px] font-bold underline cursor-pointer"
                        >
                          Ver Diff
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Diff Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-5 space-y-4 border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Snapshot de Auditoría</h4>
                <p className="text-xs text-slate-500">{selectedLog.accion} • {new Date(selectedLog.timestamp).toLocaleString('es-PE')}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedLog.datos_anteriores && (
                <div>
                  <span className="font-bold text-slate-600 block mb-1">Estado / Datos Anteriores:</span>
                  <pre className="bg-rose-50 text-rose-800 p-3 rounded-xl text-[11px] font-mono border border-rose-200 overflow-x-auto">
                    {JSON.stringify(selectedLog.datos_anteriores, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.datos_nuevos && (
                <div>
                  <span className="font-bold text-slate-600 block mb-1">Estado / Datos Nuevos:</span>
                  <pre className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-[11px] font-mono border border-emerald-200 overflow-x-auto">
                    {JSON.stringify(selectedLog.datos_nuevos, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
