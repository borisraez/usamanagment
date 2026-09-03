import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Plus, 
  Trash2, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Check,
  Hospital
} from 'lucide-react';
import { SystemUser } from '../types';
import { storageService, INITIAL_AREAS } from '../services/storageService';

interface AreasManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SystemUser;
  onAreasChange: () => void;
}

export const AreasManagerModal: React.FC<AreasManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAreasChange,
}) => {
  const [areasList, setAreasList] = useState<string[]>(() => storageService.getAreas());
  const [newAreaName, setNewAreaName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const refreshList = () => {
    const fresh = storageService.getAreas();
    setAreasList(fresh);
    onAreasChange();
  };

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const trimmed = newAreaName.trim();
    if (!trimmed) {
      setNotification({ type: 'error', message: 'Ingrese un nombre válido para el área.' });
      return;
    }

    try {
      storageService.addArea(trimmed, currentUser);
      setNewAreaName('');
      refreshList();
      setNotification({ type: 'success', message: `Área "${trimmed}" agregada exitosamente.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al agregar el área.';
      setNotification({ type: 'error', message: msg });
    }
  };

  const handleDeleteArea = (area: string) => {
    try {
      storageService.deleteArea(area, currentUser);
      setAreaToDelete(null);
      refreshList();
      setNotification({ type: 'success', message: `Área "${area}" eliminada del catálogo.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el área.';
      setNotification({ type: 'error', message: msg });
    }
  };

  const handleResetDefaults = () => {
    if (confirm('¿Restablecer el catálogo con las 19 áreas hospitalarias predeterminadas?')) {
      storageService.resetAreas(currentUser);
      refreshList();
      setNotification({ type: 'success', message: 'Se restablecieron las áreas predeterminadas con éxito.' });
    }
  };

  const filteredAreas = areasList.filter(a => 
    a.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        id="modal-areas-manager"
        className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-emerald-500/30 text-white"
      >
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-950/50">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Gestión de Áreas Hospitalarias</h2>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  {areasList.length} ÁREAS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Administración de servicios, pabellones y departamentos para registro de atenciones
              </p>
            </div>
          </div>

          <button
            id="btn-close-areas-manager"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {notification && (
          <div className={`p-3 text-xs flex items-center justify-between gap-2 border-b ${
            notification.type === 'success' 
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' 
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action Controls: Add Area & Search */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-3">
          {/* Form to Add Area */}
          <form onSubmit={handleAddArea} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="input-new-area-name"
                type="text"
                value={newAreaName}
                onChange={e => setNewAreaName(e.target.value)}
                placeholder="Nombre de nueva área (Ej. Farmacia Central, Sala de Partos)..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <button
              id="btn-add-area-submit"
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-md shadow-emerald-950 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Área</span>
            </button>
          </form>

          {/* Search Filter and Reset Default Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="input-search-areas"
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Filtrar áreas por nombre..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              id="btn-reset-default-areas"
              type="button"
              onClick={handleResetDefaults}
              className="text-[11px] font-semibold text-slate-400 hover:text-emerald-300 flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-850 px-2.5 py-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer shrink-0"
              title="Restablecer a las 19 áreas originales"
            >
              <RotateCcw className="w-3 h-3 text-emerald-400" />
              <span>Restablecer Predeterminadas ({INITIAL_AREAS.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Areas List */}
        <div className="overflow-y-auto p-4 sm:p-5 flex-1">
          {filteredAreas.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Hospital className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-400">No se encontraron áreas</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {searchTerm ? `Sin resultados para "${searchTerm}"` : 'Agregue una nueva área usando el formulario superior.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredAreas.map((areaItem, index) => {
                const isConfirmingDelete = areaToDelete === areaItem;

                return (
                  <div
                    key={areaItem}
                    id={`area-item-${index}`}
                    className="p-3 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-2 group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate" title={areaItem}>
                        {areaItem}
                      </span>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1 animate-in fade-in duration-150">
                          <button
                            id={`btn-confirm-delete-area-${index}`}
                            type="button"
                            onClick={() => handleDeleteArea(areaItem)}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Eliminar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAreaToDelete(null)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-delete-area-${index}`}
                          type="button"
                          onClick={() => setAreaToDelete(areaItem)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                          title={`Eliminar área "${areaItem}"`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Total en catálogo: <strong className="text-emerald-400">{areasList.length}</strong> áreas activas</span>
          <button
            id="btn-close-areas-footer"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
