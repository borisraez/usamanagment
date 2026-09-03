import React, { useState, useEffect, useCallback } from 'react';
import { 
  Atencion, 
  AuditoriaLog, 
  GoogleSheetsRow, 
  IntegrationEvent, 
  SystemUser 
} from './types';
import { storageService, SimulationConfig } from './services/storageService';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { AtencionesList } from './components/AtencionesList';
import { AtencionDetailModal } from './components/AtencionDetailModal';
import { NuevaAtencionModal } from './components/NuevaAtencionModal';
import { UsuariosManagerModal } from './components/UsuariosManagerModal';
import { AreasManagerModal } from './components/AreasManagerModal';
import { ActividadesManagerModal } from './components/ActividadesManagerModal';
import { AdminProfileModal } from './components/AdminProfileModal';
import { ConformidadPublicView } from './components/ConformidadPublicView';
import { IntegracionesDashboard } from './components/IntegracionesDashboard';
import { AuditoriaView } from './components/AuditoriaView';
import { ResilienceTestCenter } from './components/ResilienceTestCenter';
import { TecnicoDashboard } from './components/TecnicoDashboard';
import { WhatsAppConfigModal } from './components/WhatsAppConfigModal';
import { CheckCircle2, RotateCcw, Shield, Leaf, Users, KeyRound, Building2, ListChecks } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'ATENCIONES' | 'INTEGRACIONES' | 'AUDITORIA' | 'PRUEBAS'>('ATENCIONES');
  const [publicTokenHash, setPublicTokenHash] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => storageService.isAuthenticated());

  // App Data State
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);
  const [events, setEvents] = useState<IntegrationEvent[]>([]);
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [sheetsData, setSheetsData] = useState<GoogleSheetsRow[]>([]);
  const [config, setConfig] = useState<SimulationConfig>(storageService.getConfig());
  const [currentUser, setCurrentUser] = useState<SystemUser>(storageService.getCurrentUser());

  // Modals
  const [selectedAtencion, setSelectedAtencion] = useState<Atencion | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newModalTipoOrigen, setNewModalTipoOrigen] = useState<'SOLICITUD' | 'RECORRIDO_OPERATIVO'>('SOLICITUD');
  const [showUsuariosModal, setShowUsuariosModal] = useState(false);
  const [showAreasModal, setShowAreasModal] = useState(false);
  const [showActividadesModal, setShowActividadesModal] = useState(false);
  const [showAdminProfileModal, setShowAdminProfileModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load state from service
  const refreshAllData = useCallback(() => {
    setAtenciones(storageService.getAtenciones());
    setEvents(storageService.getEvents());
    setLogs(storageService.getAuditLogs());
    setSheetsData(storageService.getSheetsData());
    setConfig(storageService.getConfig());
    setCurrentUser(storageService.getCurrentUser());
    setIsAuthenticated(storageService.isAuthenticated());

    if (selectedAtencion) {
      const updated = storageService.getAtencionById(selectedAtencion.id);
      if (updated) setSelectedAtencion(updated);
    }
  }, [selectedAtencion]);

  useEffect(() => {
    // Check URL parameters for direct QR token entry (e.g. ?token=9f83a8...)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        setPublicTokenHash(token);
      }
    }
    refreshAllData();
  }, [refreshAllData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUserChange = (user: SystemUser) => {
    storageService.setCurrentUser(user);
    setCurrentUser(user);
    showToast(`Sesión activa: ${user.nombre} (${user.rol})`);
  };

  const handleLoginSuccess = (user: SystemUser) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    refreshAllData();
    showToast(`¡Bienvenido/a al Sistema, ${user.nombre}!`);
  };

  const handleLogout = () => {
    storageService.logout();
    setIsAuthenticated(false);
    showToast('Sesión cerrada correctamente.');
  };

  const handleResetData = () => {
    if (confirm('¿Restablecer el sistema con los datos demo iniciales?')) {
      storageService.resetToDefault();
      refreshAllData();
      showToast('Sistema restablecido a los datos iniciales.');
    }
  };

  // 1. If user is accessing via Public QR token for Conformity Signature
  if (publicTokenHash) {
    return (
      <ConformidadPublicView
        tokenHash={publicTokenHash}
        onBackToApp={() => {
          setPublicTokenHash(null);
          window.history.pushState({}, '', window.location.pathname);
          refreshAllData();
        }}
        onConformidadRegistered={() => {
          refreshAllData();
          showToast('¡Conformidad registrada con éxito en el sistema!');
        }}
      />
    );
  }

  // 2. If user is NOT authenticated, display the Login / Account Creation Interface
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // 3. If authenticated user is a TECNICO, render the Minimalist Dedicated Technician Dashboard
  if (currentUser.rol === 'TECNICO') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-emerald-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <TecnicoDashboard
          atenciones={atenciones}
          currentUser={currentUser}
          onSelectAtencion={(atencion) => setSelectedAtencion(atencion)}
          onOpenNuevaAtencion={(tipo) => {
            setNewModalTipoOrigen(tipo || 'SOLICITUD');
            setShowNewModal(true);
          }}
          onOpenPublicConformidad={(tokenHash) => setPublicTokenHash(tokenHash)}
          onRefreshData={refreshAllData}
          onLogout={handleLogout}
        />

        {/* Attention Detail Modal */}
        {selectedAtencion && (
          <AtencionDetailModal
            atencion={selectedAtencion}
            onClose={() => setSelectedAtencion(null)}
            onUpdate={refreshAllData}
            currentUser={currentUser}
            onOpenPublicConformidad={(tokenHash) => {
              setSelectedAtencion(null);
              setPublicTokenHash(tokenHash);
            }}
          />
        )}

        {/* New Attention Modal */}
        {showNewModal && (
          <NuevaAtencionModal
            onClose={() => setShowNewModal(false)}
            currentUser={currentUser}
            initialTipoOrigen={newModalTipoOrigen}
            onSuccess={(codigo) => {
              setShowNewModal(false);
              refreshAllData();
              showToast(`Atención ${codigo} registrada con éxito.`);
            }}
          />
        )}
      </div>
    );
  }

  // 4. If authenticated user is ADMINISTRATOR, render the complete Management Dashboard
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        config={config}
        onOpenNuevaAtencion={() => setShowNewModal(true)}
        onOpenUsuariosManager={() => setShowUsuariosModal(true)}
        onOpenAreasManager={() => setShowAreasModal(true)}
        onOpenActividadesManager={() => setShowActividadesModal(true)}
        onOpenAdminProfile={() => setShowAdminProfileModal(true)}
        onOpenWhatsAppConfig={() => setShowWhatsAppModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 flex-1">
        {activeTab === 'ATENCIONES' && (
          <AtencionesList
            atenciones={atenciones}
            onSelectAtencion={(atencion) => setSelectedAtencion(atencion)}
            onOpenNuevaAtencion={() => setShowNewModal(true)}
            onOpenPublicConformidad={(tokenHash) => setPublicTokenHash(tokenHash)}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'INTEGRACIONES' && (
          <IntegracionesDashboard
            events={events}
            sheetsData={sheetsData}
            config={config}
            onRefresh={refreshAllData}
          />
        )}

        {activeTab === 'AUDITORIA' && (
          <AuditoriaView logs={logs} />
        )}

        {activeTab === 'PRUEBAS' && (
          <ResilienceTestCenter
            onRefreshAll={refreshAllData}
            currentUser={currentUser}
            onOpenPublicConformidad={(tokenHash) => setPublicTokenHash(tokenHash)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-3 sm:py-4 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">Sistema de Salud Ambiental & Vigilancia Sanitaria</span>
            <span className="hidden sm:inline text-slate-500">• Núcleo Transaccional Desacoplado</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] flex-wrap justify-center">
            <button
              id="btn-footer-open-areas"
              onClick={() => setShowAreasModal(true)}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Áreas ({storageService.getAreas().length})</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              id="btn-footer-open-actividades"
              onClick={() => setShowActividadesModal(true)}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Actividades ({storageService.getActividades().length})</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              id="btn-footer-open-users"
              onClick={() => setShowUsuariosModal(true)}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Técnicos ({storageService.getUsers().filter(u => u.estado_aprobacion === 'APROBADO' || !u.estado_aprobacion).length})</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              id="btn-footer-reset-data"
              onClick={handleResetData}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar Demo</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Attention Detail Modal */}
      {selectedAtencion && (
        <AtencionDetailModal
          atencion={selectedAtencion}
          onClose={() => setSelectedAtencion(null)}
          onUpdate={refreshAllData}
          currentUser={currentUser}
          onOpenPublicConformidad={(tokenHash) => {
            setSelectedAtencion(null);
            setPublicTokenHash(tokenHash);
          }}
        />
      )}

      {/* New Attention Modal */}
      {showNewModal && (
        <NuevaAtencionModal
          onClose={() => setShowNewModal(false)}
          currentUser={currentUser}
          onOpenAreasManager={() => setShowAreasModal(true)}
          onOpenActividadesManager={() => setShowActividadesModal(true)}
          onSuccess={(codigo) => {
            setShowNewModal(false);
            refreshAllData();
            showToast(`Solicitud ${codigo} creada con éxito en la Base de Datos Principal.`);
          }}
        />
      )}

      {/* Users and Technicians Management Modal */}
      {showUsuariosModal && (
        <UsuariosManagerModal
          isOpen={showUsuariosModal}
          onClose={() => setShowUsuariosModal(false)}
          currentUser={currentUser}
          onUsersChange={refreshAllData}
        />
      )}

      {/* Hospital Areas Management Modal (Admin can add/remove areas) */}
      {showAreasModal && (
        <AreasManagerModal
          isOpen={showAreasModal}
          onClose={() => {
            setShowAreasModal(false);
            refreshAllData();
          }}
          currentUser={currentUser}
          onAreasChange={refreshAllData}
        />
      )}

      {/* Actividades Management Modal (Admin can add/remove actividades) */}
      {showActividadesModal && (
        <ActividadesManagerModal
          isOpen={showActividadesModal}
          onClose={() => {
            setShowActividadesModal(false);
            refreshAllData();
          }}
          currentUser={currentUser}
          onActividadesChange={refreshAllData}
        />
      )}

      {/* Master Administrator Profile Setup Modal (Accessible inside Admin session) */}
      {showAdminProfileModal && (
        <AdminProfileModal
          isOpen={showAdminProfileModal}
          onClose={() => setShowAdminProfileModal(false)}
          currentUser={currentUser}
          onUserUpdated={(updated) => {
            setCurrentUser(updated);
            refreshAllData();
            showToast('¡Credenciales de Administrador actualizadas con éxito!');
          }}
        />
      )}

      {/* WhatsApp Configuration Modal */}
      {showWhatsAppModal && (
        <WhatsAppConfigModal
          isOpen={showWhatsAppModal}
          onClose={() => {
            setShowWhatsAppModal(false);
            refreshAllData();
          }}
          config={config}
          onConfigUpdated={() => {
            refreshAllData();
            showToast('¡Configuración de Grupo de WhatsApp actualizada!');
          }}
        />
      )}
    </div>
  );
}
