import React from 'react';
import { Table, Download, RefreshCw, FileSpreadsheet, CheckCircle2, ShieldCheck } from 'lucide-react';
import { GoogleSheetsRow } from '../types';

interface GoogleSheetsPreviewProps {
  data: GoogleSheetsRow[];
  onRefresh: () => void;
  isOnline: boolean;
}

export const GoogleSheetsPreview: React.FC<GoogleSheetsPreviewProps> = ({
  data,
  onRefresh,
  isOnline,
}) => {
  const exportToCSV = () => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sincronizacion_Atenciones_GoogleSheets_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="sheets-preview-panel" className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-emerald-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-700/80 rounded-xl">
            <FileSpreadsheet className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold">Hoja de Sincronización Consolidada (Google Sheets API v4)</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOnline ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                {isOnline ? '🟢 Sincronizador Activo' : '🔴 Servicio Desconectado'}
              </span>
            </div>
            <p className="text-xs text-emerald-200/80">
              Destino exclusivo de análisis y consolidación • Control de Idempotencia por <code className="font-mono bg-emerald-800 px-1 py-0.5 rounded">ID_ATENCION</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-sheets"
            onClick={onRefresh}
            className="p-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Refrescar vista de hoja"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-export-csv"
            onClick={exportToCSV}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar CSV
          </button>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10 text-[11px]">
            <tr>
              <th className="p-3 border-r border-slate-200">#</th>
              <th className="p-3 border-r border-slate-200">ID_ATENCION</th>
              <th className="p-3 border-r border-slate-200">FECHA_SOLICITUD</th>
              <th className="p-3 border-r border-slate-200">SOLICITANTE</th>
              <th className="p-3 border-r border-slate-200">ÁREA</th>
              <th className="p-3 border-r border-slate-200">TÉCNICO</th>
              <th className="p-3 border-r border-slate-200">CATEGORÍA</th>
              <th className="p-3 border-r border-slate-200">ESTADO</th>
              <th className="p-3 border-r border-slate-200">PRIORIDAD</th>
              <th className="p-3 border-r border-slate-200">CONFORMIDAD</th>
              <th className="p-3 border-r border-slate-200">CALIFICACIÓN</th>
              <th className="p-3 border-r border-slate-200">FIRMANTE</th>
              <th className="p-3">ÚLTIMA_ACTUALIZACIÓN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800 font-normal">
            {data.length === 0 ? (
              <tr>
                <td colSpan={13} className="p-8 text-center text-slate-400">
                  No hay filas sincronizadas en Google Sheets.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.ID_ATENCION} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="p-3 border-r border-slate-200 text-slate-400 font-mono text-center">{idx + 1}</td>
                  <td className="p-3 border-r border-slate-200 font-mono font-bold text-blue-700 whitespace-nowrap">
                    {row.ID_ATENCION}
                  </td>
                  <td className="p-3 border-r border-slate-200 whitespace-nowrap text-slate-600">{row.FECHA_SOLICITUD}</td>
                  <td className="p-3 border-r border-slate-200 font-medium text-slate-900 whitespace-nowrap">{row.SOLICITANTE}</td>
                  <td className="p-3 border-r border-slate-200 text-slate-600 whitespace-nowrap">{row.AREA}</td>
                  <td className="p-3 border-r border-slate-200 text-slate-700 whitespace-nowrap">{row.TECNICO}</td>
                  <td className="p-3 border-r border-slate-200 text-slate-600 whitespace-nowrap">{row.CATEGORIA}</td>
                  <td className="p-3 border-r border-slate-200 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                      {row.ESTADO}
                    </span>
                  </td>
                  <td className="p-3 border-r border-slate-200 font-semibold whitespace-nowrap">{row.PRIORIDAD}</td>
                  <td className="p-3 border-r border-slate-200 whitespace-nowrap">
                    <span className={row.CONFORMIDAD.includes('FIRMADA') ? 'text-emerald-700 font-bold' : 'text-amber-700 font-medium'}>
                      {row.CONFORMIDAD}
                    </span>
                  </td>
                  <td className="p-3 border-r border-slate-200 font-bold text-center text-amber-600">{row.CALIFICACION}</td>
                  <td className="p-3 border-r border-slate-200 text-slate-700 whitespace-nowrap">{row.FIRMANTE}</td>
                  <td className="p-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">{row.ULTIMA_ACTUALIZACION}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Actualización por Upsert atómico: No se generan filas duplicadas ante reintentos de red.
        </span>
        <span className="font-mono font-medium">Total de registros: {data.length} filas</span>
      </div>
    </div>
  );
};
