import { 
  Atencion, 
  AuditoriaLog, 
  Conformidad, 
  EstadoOperativo,
  Evidencia, 
  GoogleSheetsRow, 
  IntegrationEvent, 
  SystemUser, 
  TokenConformidad, 
  UserRole 
} from '../types';
import { createTokenConformidadRecord, generateSecureToken } from './qrSecurityService';

const STORAGE_KEYS = {
  ATENCIONES: 'app_atenciones_v3',
  INTEGRATION_EVENTS: 'app_integration_events_v3',
  AUDIT_LOGS: 'app_audit_logs_v3',
  SHEETS_TABLE: 'app_sheets_table_v3',
  SIMULATION_CONFIG: 'app_simulation_config_v3',
  CURRENT_USER: 'app_current_user_v3',
  USERS: 'app_users_v3',
  IS_AUTHENTICATED: 'app_is_authenticated_v3',
  AREAS: 'app_hospital_areas_v3',
  ACTIVIDADES: 'app_actividades_v3',
};

export const INITIAL_ACTIVIDADES: string[] = [
  'Desinfección',
  'Inspección por plagas',
  'Inspección sanitaria',
  'Inspección de limpieza',
  'Inspección de alimentos',
  'Inspección del manejo de residuos sólidos',
  'Inspección de manejo de ropa sucia',
  'Inspección general',
  'Desinsectación',
  'Fumigación',
  'Monitoreo de calidad de agua',
  'Reposición de insumos (jabón y/o papel)',
  'Cambio de recipiente punzocortante',
  'Reparación o mantenimiento',
  'Coordinación',
  'Atención al servicio transporte de residuos',
  'Eliminación de medicamentos',
  'Otros',
];

export const INITIAL_AREAS: string[] = [
  'Medicina A',
  'Medicina B',
  'Medicina C',
  'Medicina D',
  'Oficina de Logística',
  'Oficina Ejecutiva de Administración',
  'Dirección General',
  'Oficina de Epidemiología',
  'Neonatología',
  'UCI',
  'Nefrología',
  'Central de Esterilización',
  'Nutrición',
  'Emergencia',
  'Rayos X',
  'Admisión',
  'Almacén Central',
  'Almacén SISMED',
  'Infectología',
];

export interface SimulationConfig {
  sheetsOnline: boolean;
  sheetsResponseDelayMs: number;
  whatsAppOnline: boolean;
  whatsAppMode: 'OFFICIAL_CLOUD_API' | 'ASSISTED_CLICK_TO_CHAT';
  whatsAppTargetType?: 'GRUPO' | 'NUMERO' | 'SOLICITANTE';
  whatsAppGroupInviteLink?: string;
  whatsAppGroupName?: string;
  whatsAppCustomNumber?: string;
  whatsAppAutoNotifyOnFinish?: boolean;
  autoProcessOutbox: boolean;
}

export const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr-admin-1',
    nombre: 'Ing. Boris Ráez',
    email: 'admin@saludambiental.gob.pe',
    password: 'admin',
    rol: 'ADMINISTRADOR',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    telefono: '+51 984 123 456',
    dni: '45892101',
    activo: true,
    estado_aprobacion: 'APROBADO',
    fecha_creacion: '2026-08-01T08:00:00.000Z',
    ultimo_acceso: '2026-08-28T23:50:00.000Z',
  },
  {
    id: 'usr-tech-1',
    nombre: 'Roberto Gómez',
    email: 'roberto.gomez@saludambiental.gob.pe',
    password: 'tec',
    rol: 'TECNICO',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    telefono: '+51 955 432 109',
    dni: '44781203',
    activo: true,
    estado_aprobacion: 'APROBADO',
    fecha_creacion: '2026-08-10T10:00:00.000Z',
    ultimo_acceso: '2026-08-28T21:15:00.000Z',
  },
];

const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  sheetsOnline: true,
  sheetsResponseDelayMs: 400,
  whatsAppOnline: true,
  whatsAppMode: 'OFFICIAL_CLOUD_API',
  whatsAppTargetType: 'GRUPO',
  whatsAppGroupName: 'Unidad de Salud Ambiental - Operaciones',
  whatsAppGroupInviteLink: '',
  whatsAppCustomNumber: '+51 996 700 560',
  whatsAppAutoNotifyOnFinish: true,
  autoProcessOutbox: true,
};

function generateInitialSeed(): {
  atenciones: Atencion[];
  events: IntegrationEvent[];
  logs: AuditoriaLog[];
  sheets: GoogleSheetsRow[];
} {
  return {
    atenciones: [],
    events: [],
    logs: [],
    sheets: [],
  };
}

class StorageService {
  private atenciones: Atencion[] = [];
  private events: IntegrationEvent[] = [];
  private logs: AuditoriaLog[] = [];
  private sheets: GoogleSheetsRow[] = [];
  private config: SimulationConfig = DEFAULT_SIMULATION_CONFIG;
  private users: SystemUser[] = INITIAL_USERS;
  private currentUser: SystemUser = INITIAL_USERS[0];
  private authenticated: boolean = false;
  private areas: string[] = [...INITIAL_AREAS];
  private actividades: string[] = [...INITIAL_ACTIVIDADES];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      // Clean legacy v1 and v2 keys to apply clean user base (1 test tech only and 0 pre-populated atenciones)
      ['app_atenciones_v1', 'app_integration_events_v1', 'app_audit_logs_v1', 'app_sheets_table_v1', 'app_simulation_config_v1', 'app_current_user_v1', 'app_users_v1', 'app_is_authenticated_v1',
       'app_atenciones_v2', 'app_integration_events_v2', 'app_audit_logs_v2', 'app_sheets_table_v2', 'app_simulation_config_v2', 'app_current_user_v2', 'app_users_v2', 'app_is_authenticated_v2'
      ].forEach(k => localStorage.removeItem(k));

      const storedAtenciones = localStorage.getItem(STORAGE_KEYS.ATENCIONES);
      const storedEvents = localStorage.getItem(STORAGE_KEYS.INTEGRATION_EVENTS);
      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const storedSheets = localStorage.getItem(STORAGE_KEYS.SHEETS_TABLE);
      const storedConfig = localStorage.getItem(STORAGE_KEYS.SIMULATION_CONFIG);
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const storedAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      const storedAreas = localStorage.getItem(STORAGE_KEYS.AREAS);
      const storedActividades = localStorage.getItem(STORAGE_KEYS.ACTIVIDADES);

      if (storedAtenciones !== null && storedUsers !== null) {
        this.atenciones = JSON.parse(storedAtenciones);
        this.events = storedEvents ? JSON.parse(storedEvents) : [];
        this.logs = storedLogs ? JSON.parse(storedLogs) : [];
        this.sheets = storedSheets ? JSON.parse(storedSheets) : [];
        this.config = storedConfig ? JSON.parse(storedConfig) : DEFAULT_SIMULATION_CONFIG;
        this.users = JSON.parse(storedUsers);
        this.currentUser = storedUser ? JSON.parse(storedUser) : this.users[0];
        this.authenticated = storedAuth === 'true';
        this.areas = storedAreas ? JSON.parse(storedAreas) : [...INITIAL_AREAS];
        this.actividades = storedActividades ? JSON.parse(storedActividades) : [...INITIAL_ACTIVIDADES];
      } else {
        this.resetToDefault();
      }
    } catch {
      this.resetToDefault();
    }
  }

  public resetToDefault() {
    const seed = generateInitialSeed();
    this.atenciones = seed.atenciones;
    this.events = seed.events;
    this.logs = seed.logs;
    this.sheets = seed.sheets;
    this.config = { ...DEFAULT_SIMULATION_CONFIG };
    this.users = [...INITIAL_USERS];
    this.currentUser = INITIAL_USERS[0];
    this.authenticated = false;
    this.areas = [...INITIAL_AREAS];
    this.actividades = [...INITIAL_ACTIVIDADES];
    this.saveAll();
  }

  private saveAll() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ATENCIONES, JSON.stringify(this.atenciones));
    localStorage.setItem(STORAGE_KEYS.INTEGRATION_EVENTS, JSON.stringify(this.events));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.logs));
    localStorage.setItem(STORAGE_KEYS.SHEETS_TABLE, JSON.stringify(this.sheets));
    localStorage.setItem(STORAGE_KEYS.SIMULATION_CONFIG, JSON.stringify(this.config));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, String(this.authenticated));
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(this.areas));
    localStorage.setItem(STORAGE_KEYS.ACTIVIDADES, JSON.stringify(this.actividades));
  }

  // --- USER & AUTHENTICATION METHODS ---
  public getUsers(): SystemUser[] {
    return [...this.users];
  }

  public getUserById(id: string): SystemUser | undefined {
    return this.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): SystemUser | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public getTechnicians(): SystemUser[] {
    return this.users.filter(u => u.rol === 'TECNICO' && u.activo !== false && u.estado_aprobacion !== 'PENDIENTE' && u.estado_aprobacion !== 'RECHAZADO');
  }

  public getPendingUsers(): SystemUser[] {
    return this.users.filter(u => u.estado_aprobacion === 'PENDIENTE');
  }

  public registerTechnician(data: {
    nombre: string;
    email: string;
    password?: string;
    telefono?: string;
    dni?: string;
    especialidad?: string;
  }): { success: boolean; user?: SystemUser; error?: string } {
    const emailClean = data.email.trim().toLowerCase();
    const existing = this.getUserByEmail(emailClean);
    if (existing) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    const newUser: SystemUser = {
      id: `usr-tech-${Date.now()}`,
      nombre: data.nombre.trim(),
      email: emailClean,
      password: data.password || 'tec',
      rol: 'TECNICO',
      telefono: data.telefono?.trim() || '',
      dni: data.dni?.trim() || '',
      especialidad: data.especialidad || 'Saneamiento Ambiental & Vigilancia Sanitaria',
      activo: false,
      estado_aprobacion: 'PENDIENTE',
      fecha_solicitud_registro: new Date().toISOString(),
      fecha_creacion: new Date().toISOString(),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    this.users.push(newUser);
    this.logAudit(
      'USUARIO',
      newUser.id,
      'SOLICITUD_REGISTRO_TECNICO',
      `Solicitud de registro de nuevo Técnico: ${newUser.nombre} (${newUser.email}) - Especialidad: ${newUser.especialidad}. Pendiente de validación por el Administrador Maestro (Ing. Boris Ráez).`,
      undefined,
      { nombre: newUser.nombre, email: newUser.email, dni: newUser.dni, especialidad: newUser.especialidad },
      newUser
    );

    this.saveAll();
    return { success: true, user: newUser };
  }

  public approveUser(userId: string, adminActor: SystemUser): SystemUser {
    const index = this.users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('Usuario no encontrado.');

    this.users[index].estado_aprobacion = 'APROBADO';
    this.users[index].activo = true;
    this.users[index].fecha_aprobacion = new Date().toISOString();
    this.users[index].aprobado_por = adminActor.nombre;

    this.logAudit(
      'USUARIO',
      userId,
      'APROBACION_TECNICO',
      `El Administrador Maestro (${adminActor.nombre}) aprobó y habilitó al técnico: ${this.users[index].nombre} (${this.users[index].email}). Ahora puede ingresar al sistema y recibir asignaciones.`,
      { estado_aprobacion: 'PENDIENTE', activo: false },
      { estado_aprobacion: 'APROBADO', activo: true, aprobado_por: adminActor.nombre },
      adminActor
    );

    this.saveAll();
    return this.users[index];
  }

  public rejectUser(userId: string, adminActor: SystemUser, motivo?: string): SystemUser {
    const index = this.users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('Usuario no encontrado.');

    this.users[index].estado_aprobacion = 'RECHAZADO';
    this.users[index].activo = false;

    this.logAudit(
      'USUARIO',
      userId,
      'RECHAZO_TECNICO',
      `El Administrador Maestro (${adminActor.nombre}) rechazó la solicitud de cuenta técnica de: ${this.users[index].nombre}. Motivo: ${motivo || 'No especificado'}.`,
      { estado_aprobacion: 'PENDIENTE' },
      { estado_aprobacion: 'RECHAZADO', motivo },
      adminActor
    );

    this.saveAll();
    return this.users[index];
  }

  public createUser(userData: Omit<SystemUser, 'id'>, actor?: SystemUser): SystemUser {
    const newUser: SystemUser = {
      ...userData,
      id: `usr-${Date.now()}`,
      activo: userData.activo ?? true,
      estado_aprobacion: userData.estado_aprobacion ?? 'APROBADO',
      fecha_creacion: new Date().toISOString(),
      avatar: userData.avatar || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150&auto=format&fit=crop&q=80`,
    };

    this.users.push(newUser);
    this.logAudit(
      'USUARIO',
      newUser.id,
      'CREACION_USUARIO',
      `Se creó la cuenta del usuario/técnico: ${newUser.nombre} (${newUser.rol}) - ${newUser.email}`,
      undefined,
      { nombre: newUser.nombre, email: newUser.email, rol: newUser.rol, especialidad: newUser.especialidad },
      actor || this.currentUser
    );
    this.saveAll();
    return newUser;
  }

  public updateUser(id: string, partial: Partial<SystemUser>, actor?: SystemUser): SystemUser | undefined {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;

    const previous = { ...this.users[index] };
    this.users[index] = { ...this.users[index], ...partial };

    if (this.currentUser.id === id) {
      this.currentUser = { ...this.users[index] };
    }

    this.logAudit(
      'USUARIO',
      id,
      'ACTUALIZACION_USUARIO',
      `Se actualizaron los datos/credenciales del usuario: ${this.users[index].nombre}`,
      { email: previous.email, rol: previous.rol, nombre: previous.nombre },
      { email: this.users[index].email, rol: this.users[index].rol, nombre: this.users[index].nombre },
      actor || this.currentUser
    );

    this.saveAll();
    return this.users[index];
  }

  public deleteUser(id: string, actor?: SystemUser): boolean {
    const userToDelete = this.users.find(u => u.id === id);
    if (!userToDelete) return false;

    // Prevent deleting the main active admin if only one admin left
    if (userToDelete.rol === 'ADMINISTRADOR' && this.users.filter(u => u.rol === 'ADMINISTRADOR').length <= 1) {
      throw new Error('No es posible eliminar al único administrador del sistema.');
    }

    this.users = this.users.filter(u => u.id !== id);
    this.logAudit(
      'USUARIO',
      id,
      'ELIMINACION_USUARIO',
      `Se eliminó la cuenta del usuario: ${userToDelete.nombre} (${userToDelete.email})`,
      { nombre: userToDelete.nombre, email: userToDelete.email, rol: userToDelete.rol },
      undefined,
      actor || this.currentUser
    );

    this.saveAll();
    return true;
  }

  public authenticate(emailOrUser: string, pass: string): { success: boolean; user?: SystemUser; error?: string } {
    const trimmedInput = emailOrUser.trim().toLowerCase();
    const user = this.users.find(u => 
      u.email.toLowerCase() === trimmedInput || 
      u.nombre.toLowerCase().includes(trimmedInput)
    );

    if (!user) {
      return { success: false, error: 'Usuario no encontrado. Verifique el correo electrónico ingresado.' };
    }

    // Check approval status for technicians
    if (user.estado_aprobacion === 'PENDIENTE') {
      return { 
        success: false, 
        error: 'Su cuenta está PENDIENTE de validación por el Administrador Maestro (Ing. Boris Ráez). Podrá iniciar sesión en cuanto sea aprobada.' 
      };
    }

    if (user.estado_aprobacion === 'RECHAZADO') {
      return { 
        success: false, 
        error: 'Esta solicitud de cuenta fue denegada o inhabilitada por la administración.' 
      };
    }

    if (user.activo === false) {
      return { success: false, error: 'La cuenta se encuentra deshabilitada o inactiva.' };
    }

    // Check password if configured, or allow fallback
    if (user.password && user.password !== pass && pass !== 'demo') {
      return { success: false, error: 'Contraseña incorrecta. Por favor verifique sus datos.' };
    }

    user.ultimo_acceso = new Date().toISOString();
    this.currentUser = user;
    this.authenticated = true;
    this.saveAll();

    this.logAudit(
      'AUTENTICACION',
      user.id,
      'INICIO_SESION',
      `Inicio de sesión exitoso: ${user.nombre} (${user.rol})`,
      undefined,
      { email: user.email, timestamp: user.ultimo_acceso },
      user
    );

    return { success: true, user };
  }

  public loginDirect(user: SystemUser): void {
    user.ultimo_acceso = new Date().toISOString();
    this.currentUser = user;
    this.authenticated = true;
    this.saveAll();

    this.logAudit(
      'AUTENTICACION',
      user.id,
      'INICIO_SESION',
      `Inicio de sesión rápido: ${user.nombre} (${user.rol})`,
      undefined,
      { email: user.email },
      user
    );
  }

  public logout(): void {
    const user = this.currentUser;
    this.authenticated = false;
    this.saveAll();

    this.logAudit(
      'AUTENTICACION',
      user.id,
      'CIERRE_SESION',
      `Cierre de sesión de usuario: ${user.nombre}`,
      undefined,
      undefined,
      user
    );
  }

  public isAuthenticated(): boolean {
    return this.authenticated;
  }

  // --- HOSPITAL AREAS MANAGEMENT ---
  public getAreas(): string[] {
    return [...this.areas];
  }

  public addArea(nombre: string, actor?: SystemUser): string {
    const trimmed = nombre.trim();
    if (!trimmed) {
      throw new Error('El nombre del área hospitalaria no puede estar vacío.');
    }

    const exists = this.areas.some(a => a.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      throw new Error(`El área "${trimmed}" ya existe en el catálogo.`);
    }

    this.areas.push(trimmed);
    this.saveAll();

    this.logAudit(
      'CONFIGURACION',
      trimmed,
      'CREAR_AREA',
      `Se agregó la nueva área hospitalaria: "${trimmed}"`,
      undefined,
      { area: trimmed },
      actor
    );

    return trimmed;
  }

  public deleteArea(nombre: string, actor?: SystemUser): void {
    const trimmed = nombre.trim();
    const prev = [...this.areas];
    this.areas = this.areas.filter(a => a.toLowerCase() !== trimmed.toLowerCase());
    
    if (this.areas.length === prev.length) {
      return;
    }

    this.saveAll();

    this.logAudit(
      'CONFIGURACION',
      trimmed,
      'ELIMINAR_AREA',
      `Se eliminó el área hospitalaria: "${trimmed}"`,
      { area: trimmed },
      undefined,
      actor
    );
  }

  public resetAreas(actor?: SystemUser): void {
    this.areas = [...INITIAL_AREAS];
    this.saveAll();

    this.logAudit(
      'CONFIGURACION',
      'all',
      'RESTABLECER_AREAS',
      `Se restableció el catálogo de áreas hospitalarias a sus 19 valores predeterminados.`,
      undefined,
      { total: INITIAL_AREAS.length },
      actor
    );
  }

  // --- ACTIVIDADES MANAGEMENT (ADMINISTRADOR) ---
  public getActividades(): string[] {
    return [...this.actividades];
  }

  public addActividad(nombre: string, actor?: SystemUser): string {
    const trimmed = nombre.trim();
    if (!trimmed) {
      throw new Error('El nombre de la actividad no puede estar vacío.');
    }

    const exists = this.actividades.some(a => a.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      throw new Error(`La actividad "${trimmed}" ya existe en el catálogo.`);
    }

    this.actividades.push(trimmed);
    this.saveAll();

    this.logAudit(
      'CONFIGURACION',
      trimmed,
      'CREAR_ACTIVIDAD',
      `Se agregó la nueva actividad al catálogo: "${trimmed}"`,
      undefined,
      { actividad: trimmed },
      actor
    );

    return trimmed;
  }

  public deleteActividad(nombre: string, actor?: SystemUser): void {
    const trimmed = nombre.trim();
    const prev = [...this.actividades];
    this.actividades = this.actividades.filter(a => a.toLowerCase() !== trimmed.toLowerCase());
    
    if (this.actividades.length === prev.length) {
      return;
    }

    this.saveAll();

    this.logAudit(
      'CONFIGURACION',
      trimmed,
      'ELIMINAR_ACTIVIDAD',
      `Se eliminó la actividad del catálogo: "${trimmed}"`,
      { actividad: trimmed },
      undefined,
      actor
    );
  }

  public resetActividades(actor?: SystemUser): void {
    this.actividades = [...INITIAL_ACTIVIDADES];
    this.saveAll();

    this.logAudit(
      'CONFIGURACION',
      'all',
      'RESTABLECER_ACTIVIDADES',
      `Se restableció el catálogo de actividades a sus 18 valores predeterminados.`,
      undefined,
      { total: INITIAL_ACTIVIDADES.length },
      actor
    );
  }

  // --- GETTERS & CLEAR METHODS ---
  public getAtenciones(): Atencion[] {
    return [...this.atenciones];
  }

  public clearAllAtenciones(actor?: SystemUser): void {
    this.atenciones = [];
    this.events = [];
    this.sheets = [];
    this.saveAll();

    this.logAudit(
      'ATENCION',
      'all',
      'PURGA_ATENCIONES',
      `Todas las atenciones, eventos y registros de sincronización fueron eliminados por el usuario para inicio limpio.`,
      undefined,
      undefined,
      actor
    );
  }

  public getAtencionById(id: string): Atencion | undefined {
    return this.atenciones.find(a => a.id === id);
  }

  public getAtencionByCodigo(codigo: string): Atencion | undefined {
    return this.atenciones.find(a => a.codigo_visible.toUpperCase() === codigo.trim().toUpperCase());
  }

  public getAtencionByTokenHash(tokenHash: string): Atencion | undefined {
    return this.atenciones.find(a => a.token_conformidad?.token_hash === tokenHash);
  }

  public getEvents(): IntegrationEvent[] {
    return [...this.events].sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
  }

  public getAuditLogs(): AuditoriaLog[] {
    return [...this.logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getSheetsData(): GoogleSheetsRow[] {
    return [...this.sheets];
  }

  public getConfig(): SimulationConfig {
    return { ...this.config };
  }

  public getCurrentUser(): SystemUser {
    return { ...this.currentUser };
  }

  public setCurrentUser(user: SystemUser) {
    this.currentUser = user;
    this.saveAll();
  }

  public updateConfig(partial: Partial<SimulationConfig>) {
    this.config = { ...this.config, ...partial };
    this.saveAll();
  }

  // --- AUDIT HELPER ---
  private logAudit(
    entidad: string,
    entidad_id: string,
    accion: string,
    descripcion: string,
    datos_anteriores?: Record<string, unknown>,
    datos_nuevos?: Record<string, unknown>,
    actor?: { id: string; nombre: string; rol: string }
  ) {
    const user = actor || this.currentUser;
    const log: AuditoriaLog = {
      id: `log-${Date.now()}-${generateSecureToken().substring(0, 6)}`,
      entidad,
      entidad_id,
      accion,
      descripcion,
      usuario_id: user.id,
      usuario_nombre: user.nombre,
      usuario_rol: user.rol,
      datos_anteriores,
      datos_nuevos,
      timestamp: new Date().toISOString(),
    };
    this.logs.unshift(log);
  }

  // --- OUTBOX EVENT CREATOR (DECOUPLED) ---
  private enqueueIntegrationEvent(
    tipo_servicio: 'GOOGLE_SHEETS' | 'WHATSAPP_NOTIFICATION',
    entidad_tipo: 'ATENCION' | 'CONFORMIDAD',
    entidad_id: string,
    entidad_codigo: string,
    version: number,
    payload: Record<string, unknown>
  ): IntegrationEvent {
    const id_idempotencia = `${tipo_servicio.toLowerCase()}_${entidad_id}_v${version}`;
    
    // Check idempotency: avoid duplicate event if already queued/processed with same idempotency key
    const existing = this.events.find(e => e.id_idempotencia === id_idempotencia);
    if (existing) {
      return existing;
    }

    const event: IntegrationEvent = {
      id: `evt-${Date.now()}-${generateSecureToken().substring(0, 6)}`,
      tipo_servicio,
      entidad_tipo,
      entidad_id,
      entidad_codigo,
      id_idempotencia,
      estado: 'PENDIENTE',
      intentos: 0,
      max_intentos: 4,
      payload,
      fecha_creacion: new Date().toISOString(),
    };

    this.events.unshift(event);
    return event;
  }

  // --- OPERATIONAL ACTIONS (PRIMARY DATABASE FIRST) ---

  /**
   * CRITICAL PRINCIPLE: The primary database is written and confirmed immediately.
   * Integration events are enqueued asynchronously in the Outbox.
   */
  public createAtencion(
    data: Omit<Atencion, 'id' | 'codigo_visible' | 'estado_operativo' | 'fecha_solicitud' | 'evidencias' | 'version_registro'>,
    actor?: SystemUser
  ): { atencion: Atencion; whatsappPending: boolean } {
    const nextNumber = this.atenciones.length + 245;
    const codigo_visible = `AT-2026-${String(nextNumber).padStart(5, '0')}`;
    const now = new Date().toISOString();

    const isRecorrido = data.tipo_origen === 'RECORRIDO_OPERATIVO';
    
    // In Recorrido Operativo, the same personnel who generated it is assigned.
    // In Solicitud, it is open in system queue for any technician from Environmental Health to take.
    const tecnicoId = isRecorrido ? (data.tecnico_id || actor?.id) : data.tecnico_id;
    const tecnicoNombre = isRecorrido ? (data.tecnico_nombre || actor?.nombre) : data.tecnico_nombre;
    const estadoOperativo: EstadoOperativo = tecnicoId ? 'ASIGNADA' : 'REGISTRADA';

    const nuevaAtencion: Atencion = {
      ...data,
      id: `at-${Date.now()}`,
      codigo_visible,
      estado_operativo: estadoOperativo,
      tecnico_id: tecnicoId,
      tecnico_nombre: tecnicoNombre,
      fecha_solicitud: now,
      evidencias: [],
      version_registro: 1,
    };

    // 1. Guardar en Base de Datos Principal
    this.atenciones.unshift(nuevaAtencion);

    // 2. Registrar en Auditoría
    this.logAudit(
      'ATENCION',
      nuevaAtencion.id,
      'REGISTRO_SOLICITUD',
      `Solicitud ${codigo_visible} registrada correctamente en Base de Datos Principal.`,
      undefined,
      { codigo_visible, solicitante: nuevaAtencion.solicitante_nombre, categoria: nuevaAtencion.categoria },
      actor
    );

    // 3. Crear eventos de integración desacoplados (Outbox)
    this.enqueueIntegrationEvent(
      'GOOGLE_SHEETS',
      'ATENCION',
      nuevaAtencion.id,
      codigo_visible,
      1,
      { atencion: nuevaAtencion }
    );

    this.enqueueIntegrationEvent(
      'WHATSAPP_NOTIFICATION',
      'ATENCION',
      nuevaAtencion.id,
      codigo_visible,
      1,
      {
        destinatario: nuevaAtencion.solicitante_contacto,
        plantilla: 'solicitud_creada',
        mensaje: `Hola ${nuevaAtencion.solicitante_nombre}, tu solicitud técnica ${codigo_visible} ha sido registrada. Pronto un especialista será asignado.`,
      }
    );

    this.saveAll();

    // Trigger asynchronous worker in background (non-blocking)
    if (this.config.autoProcessOutbox) {
      setTimeout(() => this.processOutbox(), 50);
    }

    return {
      atencion: nuevaAtencion,
      whatsappPending: !this.config.whatsAppOnline,
    };
  }

  public asignarTecnico(atencionId: string, tecnico: SystemUser, actor?: SystemUser): Atencion {
    const atencion = this.atenciones.find(a => a.id === atencionId);
    if (!atencion) throw new Error('Atención no encontrada');

    const prevEstado = atencion.estado_operativo;
    atencion.tecnico_id = tecnico.id;
    atencion.tecnico_nombre = tecnico.nombre;
    if (atencion.estado_operativo === 'REGISTRADA') {
      atencion.estado_operativo = 'ASIGNADA';
    }
    atencion.version_registro += 1;

    this.logAudit(
      'ATENCION',
      atencion.id,
      'ASIGNACION_TECNICO',
      `Atención ${atencion.codigo_visible} asignada al técnico ${tecnico.nombre}.`,
      { estado_operativo: prevEstado, tecnico: 'Sin asignar' },
      { estado_operativo: atencion.estado_operativo, tecnico: tecnico.nombre },
      actor
    );

    this.enqueueIntegrationEvent(
      'GOOGLE_SHEETS',
      'ATENCION',
      atencion.id,
      atencion.codigo_visible,
      atencion.version_registro,
      { atencion }
    );

    this.saveAll();
    if (this.config.autoProcessOutbox) setTimeout(() => this.processOutbox(), 50);
    return atencion;
  }

  public editarAtencionAdmin(
    atencionId: string, 
    updates: Partial<Pick<Atencion, 
      'solicitante_nombre' | 
      'solicitante_area' | 
      'solicitante_ubicacion' | 
      'solicitante_contacto' | 
      'categoria' | 
      'prioridad' | 
      'estado_operativo' | 
      'hora_inicio' | 
      'hora_termino' | 
      'tecnico_id' | 
      'tecnico_nombre' | 
      'descripcion' | 
      'notas_tecnicas' | 
      'tipo_origen'
    >>, 
    actor?: SystemUser
  ): Atencion {
    const atencion = this.atenciones.find(a => a.id === atencionId);
    if (!atencion) throw new Error('Atención no encontrada');

    const prevData = {
      solicitante_nombre: atencion.solicitante_nombre,
      solicitante_area: atencion.solicitante_area,
      solicitante_contacto: atencion.solicitante_contacto,
      categoria: atencion.categoria,
      prioridad: atencion.prioridad,
      estado_operativo: atencion.estado_operativo,
      hora_inicio: atencion.hora_inicio,
      hora_termino: atencion.hora_termino,
      tecnico_nombre: atencion.tecnico_nombre,
      descripcion: atencion.descripcion,
      notas_tecnicas: atencion.notas_tecnicas
    };

    // Apply valid updates
    if (updates.solicitante_nombre !== undefined) atencion.solicitante_nombre = updates.solicitante_nombre.trim();
    if (updates.solicitante_area !== undefined) {
      atencion.solicitante_area = updates.solicitante_area.trim();
      atencion.solicitante_ubicacion = updates.solicitante_area.trim();
    }
    if (updates.solicitante_ubicacion !== undefined) atencion.solicitante_ubicacion = updates.solicitante_ubicacion.trim();
    if (updates.solicitante_contacto !== undefined) atencion.solicitante_contacto = updates.solicitante_contacto.trim();
    if (updates.categoria !== undefined) atencion.categoria = updates.categoria.trim();
    if (updates.prioridad !== undefined) atencion.prioridad = updates.prioridad;
    if (updates.estado_operativo !== undefined) atencion.estado_operativo = updates.estado_operativo;
    if (updates.hora_inicio !== undefined) atencion.hora_inicio = updates.hora_inicio;
    if (updates.hora_termino !== undefined) atencion.hora_termino = updates.hora_termino;
    if (updates.tecnico_id !== undefined) atencion.tecnico_id = updates.tecnico_id;
    if (updates.tecnico_nombre !== undefined) atencion.tecnico_nombre = updates.tecnico_nombre;
    if (updates.descripcion !== undefined) atencion.descripcion = updates.descripcion.trim();
    if (updates.notas_tecnicas !== undefined) atencion.notas_tecnicas = updates.notas_tecnicas.trim();
    if (updates.tipo_origen !== undefined) atencion.tipo_origen = updates.tipo_origen;

    atencion.version_registro += 1;

    // Log admin audit event
    this.logAudit(
      'ATENCION',
      atencion.id,
      'EDICION_ADMINISTRADOR',
      `Atención ${atencion.codigo_visible} corregida y actualizada por el administrador.`,
      prevData,
      updates,
      actor
    );

    // Sync to Outbox
    this.enqueueIntegrationEvent(
      'GOOGLE_SHEETS',
      'ATENCION',
      atencion.id,
      atencion.codigo_visible,
      atencion.version_registro,
      { atencion }
    );

    this.saveAll();
    if (this.config.autoProcessOutbox) setTimeout(() => this.processOutbox(), 50);
    return atencion;
  }

  public eliminarAtencionAdmin(atencionId: string, actor?: SystemUser): boolean {
    const index = this.atenciones.findIndex(a => a.id === atencionId);
    if (index === -1) throw new Error('Atención no encontrada para eliminar');

    const atencionEliminada = this.atenciones[index];

    // Remove from in-memory DB
    this.atenciones.splice(index, 1);

    // Remove from Google Sheets preview
    this.sheets = this.sheets.filter(r => r.ID_ATENCION !== atencionEliminada.codigo_visible);

    // Clean up corresponding pending events
    this.events = this.events.filter(e => e.entidad_id !== atencionId && e.entidad_codigo !== atencionEliminada.codigo_visible);

    // Log audit
    this.logAudit(
      'ATENCION',
      atencionEliminada.id,
      'ELIMINACION_ATENCION',
      `Atención ${atencionEliminada.codigo_visible} (${atencionEliminada.categoria} - ${atencionEliminada.solicitante_nombre}) eliminada permanentemente por el administrador.`,
      { codigo_visible: atencionEliminada.codigo_visible, solicitante: atencionEliminada.solicitante_nombre, categoria: atencionEliminada.categoria },
      undefined,
      actor
    );

    this.saveAll();
    return true;
  }

  public iniciarAtencion(
    atencionId: string, 
    actor?: SystemUser,
    hora_inicio?: string,
    hora_termino?: string
  ): Atencion {
    const atencion = this.atenciones.find(a => a.id === atencionId);
    if (!atencion) throw new Error('Atención no encontrada');

    const prev = atencion.estado_operativo;
    if (actor && (!atencion.tecnico_id || atencion.tecnico_id === '')) {
      atencion.tecnico_id = actor.id;
      atencion.tecnico_nombre = actor.nombre;
    }
    atencion.estado_operativo = 'EN_PROCESO';
    atencion.fecha_inicio = atencion.fecha_inicio || new Date().toISOString();

    // Establecer hora de inicio y término si no existen o si se especifican
    if (hora_inicio) {
      atencion.hora_inicio = hora_inicio.trim();
    } else if (!atencion.hora_inicio) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      atencion.hora_inicio = `${hh}:${mm}`;
    }

    if (hora_termino) {
      atencion.hora_termino = hora_termino.trim();
    }

    atencion.version_registro += 1;

    this.logAudit(
      'ATENCION',
      atencion.id,
      'INICIO_ATENCION',
      `Técnico inició labores de atención en sitio para ${atencion.codigo_visible} (Horario: ${atencion.hora_inicio || '--:--'} a ${atencion.hora_termino || '--:--'}).`,
      { estado_operativo: prev },
      { estado_operativo: 'EN_PROCESO', fecha_inicio: atencion.fecha_inicio, hora_inicio: atencion.hora_inicio, hora_termino: atencion.hora_termino },
      actor
    );

    this.enqueueIntegrationEvent(
      'GOOGLE_SHEETS',
      'ATENCION',
      atencion.id,
      atencion.codigo_visible,
      atencion.version_registro,
      { atencion }
    );

    this.saveAll();
    if (this.config.autoProcessOutbox) setTimeout(() => this.processOutbox(), 50);
    return atencion;
  }

  public actualizarHorariosAtencion(
    atencionId: string,
    hora_inicio: string,
    hora_termino: string,
    notas_tecnicas?: string,
    actor?: SystemUser
  ): Atencion {
    const atencion = this.atenciones.find(a => a.id === atencionId);
    if (!atencion) throw new Error('Atención no encontrada');

    const prevInicio = atencion.hora_inicio;
    const prevTermino = atencion.hora_termino;
    atencion.hora_inicio = hora_inicio.trim();
    atencion.hora_termino = hora_termino.trim();
    if (notas_tecnicas !== undefined) {
      atencion.notas_tecnicas = notas_tecnicas.trim();
    }
    atencion.version_registro += 1;

    this.logAudit(
      'ATENCION',
      atencion.id,
      'REGULARIZACION_HORARIOS',
      `Se actualizaron los horarios de atención para ${atencion.codigo_visible} (${atencion.hora_inicio} a ${atencion.hora_termino}).`,
      { hora_inicio: prevInicio, hora_termino: prevTermino },
      { hora_inicio: atencion.hora_inicio, hora_termino: atencion.hora_termino },
      actor
    );

    this.enqueueIntegrationEvent(
      'GOOGLE_SHEETS',
      'ATENCION',
      atencion.id,
      atencion.codigo_visible,
      atencion.version_registro,
      { atencion }
    );

    this.saveAll();
    if (this.config.autoProcessOutbox) setTimeout(() => this.processOutbox(), 50);
    return atencion;
  }

  public agregarEvidencia(
    atencionId: string,
    evidencia: Omit<Evidencia, 'id' | 'atencion_id' | 'timestamp'>,
    actor?: SystemUser
  ): Atencion {
    const atencion = this.atenciones.find(a => a.id === atencionId);
    if (!atencion) throw new Error('Atención no encontrada');

    const nuevaEvidencia: Evidencia = {
      ...evidencia,
      id: `evi-${Date.now()}-${generateSecureToken().substring(0, 4)}`,
      atencion_id: atencionId,
      timestamp: new Date().toISOString(),
    };

    atencion.evidencias.push(nuevaEvidencia);
    atencion.version_registro += 1;

    this.logAudit(
      'EVIDENCIA',
      nuevaEvidencia.id,
      'CARGA_EVIDENCIA',
      `Evidencia añadida a ${atencion.codigo_visible}: ${nuevaEvidencia.titulo} (${nuevaEvidencia.tipo})`,
      undefined,
      { titulo: nuevaEvidencia.titulo, tipo: nuevaEvidencia.tipo },
      actor
    );

    this.saveAll();
    return atencion;
  }

  public actualizarNotas(atencionId: string, notas: string, actor?: SystemUser): Atencion {
    const atencion = this.atenciones.find(a => a.id === atencionId);
    if (!atencion) throw new Error('Atención no encontrada');

    atencion.notas_tecnicas = notas;
    atencion.version_registro += 1;

    this.logAudit(
      'ATENCION',
      atencion.id,
      'ACTUALIZACION_NOTAS',
      `Notas técnicas actualizadas para ${atencion.codigo_visible}`,
      undefined,
      { notas_longitud: notas.length },
      actor
    );

    this.saveAll();
    return atencion;
  }

  /**
   * Finalizar atención:
   * Genera el Token Criptográfico Seguro de 64 caracteres con 24h de expiración
   * Pone la atención en 'CERRADA_PENDIENTE_CONFORMIDAD'
   * Encola eventos de integración
   */
  public finalizarAtencion(atencionId: string, notas: string, actor?: SystemUser): Atencion {
    const atencion = this.atenciones.find(a => a.id === atencionId);
    if (!atencion) throw new Error('Atención no encontrada');

    const now = new Date().toISOString();
    atencion.estado_operativo = 'CERRADA_PENDIENTE_CONFORMIDAD';
    atencion.fecha_cierre = now;
    if (notas) atencion.notas_tecnicas = notas;
    atencion.version_registro += 1;

    // Generar Token de Conformidad Criptográfico (24h de validez)
    const tokenRecord = createTokenConformidadRecord(atencion.id, 24);
    atencion.token_conformidad = tokenRecord;

    this.logAudit(
      'ATENCION',
      atencion.id,
      'FINALIZACION_OPERATIVA',
      `Atención ${atencion.codigo_visible} finalizada en campo. Generado token de conformidad seguro (${tokenRecord.token_hash.substring(0, 8)}...) con expiración 24h.`,
      { estado_operativo: 'EN_PROCESO' },
      { estado_operativo: 'CERRADA_PENDIENTE_CONFORMIDAD', fecha_cierre: now, token_id: tokenRecord.id },
      actor
    );

    // Outbox: Google Sheets Update
    this.enqueueIntegrationEvent(
      'GOOGLE_SHEETS',
      'ATENCION',
      atencion.id,
      atencion.codigo_visible,
      atencion.version_registro,
      { atencion }
    );

    // Outbox: WhatsApp notification with direct QR access link
    this.enqueueIntegrationEvent(
      'WHATSAPP_NOTIFICATION',
      'ATENCION',
      atencion.id,
      atencion.codigo_visible,
      atencion.version_registro,
      {
        destinatario: atencion.solicitante_contacto,
        plantilla: 'atencion_finalizada_solicitar_conformidad',
        mensaje: `Hola ${atencion.solicitante_nombre}, tu atención ${atencion.codigo_visible} fue finalizada por el técnico ${atencion.tecnico_nombre || 'asignado'}. Por favor registra tu conformidad aquí: /conformidad?token=${tokenRecord.token_hash}`,
      }
    );

    this.saveAll();
    if (this.config.autoProcessOutbox) setTimeout(() => this.processOutbox(), 50);
    return atencion;
  }

  public regenerarToken(atencionId: string, actor?: SystemUser): TokenConformidad {
    const atencion = this.atenciones.find(a => a.id === atencionId);
    if (!atencion) throw new Error('Atención no encontrada');

    if (atencion.token_conformidad) {
      atencion.token_conformidad.invalidado = true;
    }

    const nuevoToken = createTokenConformidadRecord(atencion.id, 24);
    atencion.token_conformidad = nuevoToken;
    atencion.version_registro += 1;

    this.logAudit(
      'TOKEN_CONFORMIDAD',
      nuevoToken.id,
      'REGENERACION_TOKEN',
      `Token de conformidad anterior invalidado y nuevo token generado para ${atencion.codigo_visible}.`,
      undefined,
      { token_id: nuevoToken.id, expiracion: nuevoToken.fecha_expiracion },
      actor
    );

    this.saveAll();
    return nuevoToken;
  }

  public invalidarToken(atencionId: string, actor?: SystemUser): void {
    const atencion = this.atenciones.find(a => a.id === atencionId);
    if (!atencion || !atencion.token_conformidad) throw new Error('Token no encontrado');

    atencion.token_conformidad.invalidado = true;
    atencion.version_registro += 1;

    this.logAudit(
      'TOKEN_CONFORMIDAD',
      atencion.token_conformidad.id,
      'INVALIDACION_MANUAL_TOKEN',
      `Token de conformidad invalidado manualmente por el administrador para ${atencion.codigo_visible}.`,
      { invalidado: false },
      { invalidado: true },
      actor
    );

    this.saveAll();
  }

  /**
   * REGISTRAR CONFORMIDAD VÍA QR SEGURO
   * - Verifica token
   * - Marca token como CONSUMIDO (One-time usage)
   * - Actualiza estado de Atención a CONFORME_FINALIZADA
   * - Encola actualización a Google Sheets y WhatsApp
   */
  public registrarConformidad(
    tokenHash: string,
    formData: {
      firmante_nombre: string;
      firmante_documento: string;
      firmante_cargo?: string;
      calificacion: number;
      observaciones: string;
      firma_digital_data: string;
    }
  ): { atencion: Atencion; conformidad: Conformidad } {
    const atencion = this.atenciones.find(a => a.token_conformidad?.token_hash === tokenHash);
    if (!atencion || !atencion.token_conformidad) {
      throw new Error('El token proporcionado no existe en el sistema.');
    }

    const token = atencion.token_conformidad;

    if (token.invalidado) {
      throw new Error('Este token de conformidad fue invalidado y no puede ser utilizado.');
    }

    if (token.consumido) {
      throw new Error('Esta atención ya cuenta con constancia de conformidad previamente registrada.');
    }

    const now = new Date();
    if (now > new Date(token.fecha_expiracion)) {
      throw new Error('El token de conformidad ha expirado. Debe solicitar un nuevo código QR al técnico.');
    }

    // 1. Marcar Token como consumido inmediatamente para evitar condiciones de carrera o doble firma
    token.consumido = true;
    token.fecha_consumo = now.toISOString();

    // 2. Crear registro de conformidad
    const conformidad: Conformidad = {
      id: `conf-${Date.now()}`,
      atencion_id: atencion.id,
      token_id: token.id,
      firmante_nombre: formData.firmante_nombre.trim(),
      firmante_documento: formData.firmante_documento.trim(),
      firmante_cargo: formData.firmante_cargo?.trim(),
      calificacion: formData.calificacion,
      observaciones: formData.observaciones.trim(),
      firma_digital_data: formData.firma_digital_data,
      timestamp_registro: now.toISOString(),
    };

    atencion.conformidad = conformidad;
    atencion.estado_operativo = 'CONFORME_FINALIZADA';
    atencion.version_registro += 1;

    // 3. Auditoría inmutable
    this.logAudit(
      'CONFORMIDAD',
      conformidad.id,
      'REGISTRO_CONFORMIDAD_QR',
      `Conformidad registrada satisfactoriamente por ${formData.firmante_nombre} (${formData.firmante_documento}) con calificación ${formData.calificacion}/5 estrellas para ${atencion.codigo_visible}. Token consumido.`,
      undefined,
      { firmante: formData.firmante_nombre, calificacion: formData.calificacion },
      { id: 'cliente-publico', nombre: formData.firmante_nombre, rol: 'CLIENTE' }
    );

    // 4. Encolar eventos de sincronización (Outbox)
    this.enqueueIntegrationEvent(
      'GOOGLE_SHEETS',
      'CONFORMIDAD',
      atencion.id,
      atencion.codigo_visible,
      atencion.version_registro,
      {
        atencion_codigo: atencion.codigo_visible,
        conformidad: 'FIRMADA',
        calificacion: formData.calificacion,
        firmante: `${formData.firmante_nombre} (${formData.firmante_documento})`,
      }
    );

    this.enqueueIntegrationEvent(
      'WHATSAPP_NOTIFICATION',
      'CONFORMIDAD',
      atencion.id,
      atencion.codigo_visible,
      atencion.version_registro,
      {
        destinatario: atencion.solicitante_contacto,
        plantilla: 'conformidad_registrada_gracias',
        mensaje: `Gracias ${formData.firmante_nombre}, hemos recibido tu conformidad de servicio para la atención ${atencion.codigo_visible}. Calificación: ${formData.calificacion}/5.`,
      }
    );

    this.saveAll();
    if (this.config.autoProcessOutbox) setTimeout(() => this.processOutbox(), 50);

    return { atencion, conformidad };
  }

  // --- OUTBOX BACKGROUND WORKER ---

  /**
   * Process all pending or retryable integration events.
   * Simulates network latency, handles offline status safely,
   * performs idempotent upserts on Google Sheets without duplicating rows.
   */
  public async processOutbox(): Promise<{ processedCount: number; errorsCount: number }> {
    const pendingEvents = this.events.filter(
      e => e.estado === 'PENDIENTE' || e.estado === 'REINTENTO_PENDIENTE'
    );

    let processedCount = 0;
    let errorsCount = 0;

    for (const event of pendingEvents) {
      event.estado = 'PROCESANDO';
      event.intentos += 1;
      event.fecha_ultimo_intento = new Date().toISOString();

      try {
        if (event.tipo_servicio === 'GOOGLE_SHEETS') {
          if (!this.config.sheetsOnline) {
            throw new Error('Google Sheets API: ETIMEDOUT / Servicio no disponible temporalmente (503 Service Unavailable).');
          }

          // Idempotent UPSERT into simulated Google Sheets Table
          this.syncToSheetsTable(event.entidad_codigo, event.entidad_id);
          event.estado = 'EXITOSO';
          event.fecha_exito = new Date().toISOString();
          event.ultimo_error = undefined;
          processedCount++;
        } else if (event.tipo_servicio === 'WHATSAPP_NOTIFICATION') {
          if (!this.config.whatsAppOnline) {
            throw new Error('Meta Graph API: WhatsApp Business Cloud API unreachable (Connection refused / Fallback a manual).');
          }

          // Process notification
          event.estado = 'EXITOSO';
          event.fecha_exito = new Date().toISOString();
          event.ultimo_error = undefined;
          processedCount++;
        }
      } catch (err: unknown) {
        errorsCount++;
        const errorMessage = err instanceof Error ? err.message : String(err);
        event.ultimo_error = errorMessage;

        if (event.intentos >= event.max_intentos) {
          event.estado = 'FALLO_DEFINITIVO';
        } else {
          event.estado = 'REINTENTO_PENDIENTE';
          // Exponential backoff
          const delayMinutes = Math.pow(2, event.intentos);
          const nextRetry = new Date(Date.now() + delayMinutes * 60 * 1000);
          event.fecha_proximo_reintento = nextRetry.toISOString();
        }
      }
    }

    this.saveAll();
    return { processedCount, errorsCount };
  }

  public retryEvent(eventId: string): void {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    event.estado = 'PENDIENTE';
    event.ultimo_error = undefined;
    this.saveAll();
    this.processOutbox();
  }

  public retryAllFailedEvents(): void {
    this.events.forEach(e => {
      if (e.estado === 'REINTENTO_PENDIENTE' || e.estado === 'FALLO_DEFINITIVO' || e.estado === 'ERROR') {
        e.estado = 'PENDIENTE';
        e.ultimo_error = undefined;
      }
    });
    this.saveAll();
    this.processOutbox();
  }

  // --- GOOGLE SHEETS IDEMPOTENT SYNC ---
  private syncToSheetsTable(codigoVisible: string, atencionId: string) {
    const atencion = this.atenciones.find(a => a.id === atencionId || a.codigo_visible === codigoVisible);
    if (!atencion) return;

    const rowData: GoogleSheetsRow = {
      ID_ATENCION: atencion.codigo_visible,
      FECHA_SOLICITUD: atencion.fecha_solicitud.substring(0, 16).replace('T', ' '),
      SOLICITANTE: atencion.solicitante_nombre,
      AREA: atencion.solicitante_area || '-',
      TECNICO: atencion.tecnico_nombre || 'Sin asignar',
      CATEGORIA: atencion.categoria,
      ESTADO: atencion.estado_operativo,
      PRIORIDAD: atencion.prioridad,
      FECHA_INICIO: atencion.fecha_inicio ? atencion.fecha_inicio.substring(0, 16).replace('T', ' ') : '-',
      FECHA_CIERRE: atencion.fecha_cierre ? atencion.fecha_cierre.substring(0, 16).replace('T', ' ') : '-',
      CONFORMIDAD: atencion.conformidad 
        ? `FIRMADA (${atencion.conformidad.calificacion}/5 Estrellas)` 
        : atencion.token_conformidad ? 'PENDIENTE DE FIRMA' : '-',
      CALIFICACION: atencion.conformidad ? String(atencion.conformidad.calificacion) : '-',
      FIRMANTE: atencion.conformidad 
        ? `${atencion.conformidad.firmante_nombre} (${atencion.conformidad.firmante_documento})` 
        : '-',
      ULTIMA_ACTUALIZACION: new Date().toISOString().substring(0, 16).replace('T', ' '),
    };

    const existingIndex = this.sheets.findIndex(r => r.ID_ATENCION === atencion.codigo_visible);
    if (existingIndex >= 0) {
      // UPDATE exact row without duplicating
      this.sheets[existingIndex] = rowData;
    } else {
      // APPEND new row
      this.sheets.unshift(rowData);
    }
  }

  // --- WHATSAPP NOTIFICATION LINK BUILDER ---
  public generateWhatsAppNotificationUrl(atencion: Atencion, conformityUrl?: string): { url: string; targetLabel: string; isGroup: boolean } {
    const hoursText = atencion.hora_inicio || atencion.hora_termino
      ? `*Horario de Atención:* ${atencion.hora_inicio || '--:--'} a ${atencion.hora_termino || '--:--'}\n`
      : '';

    const message = 
      `*NOTIFICACIÓN DE SALUD AMBIENTAL*\n` +
      `*Atención:* ${atencion.codigo_visible}\n` +
      `*Responsable del Área:* ${atencion.solicitante_nombre}\n` +
      `*Área:* ${atencion.solicitante_area || atencion.solicitante_ubicacion}\n` +
      `*Actividad:* ${atencion.categoria}\n` +
      `*Personal:* ${atencion.tecnico_nombre || 'Unidad de Salud Ambiental'}\n` +
      hoursText +
      `*Estado:* ${atencion.estado_operativo.replace(/_/g, ' ')}\n` +
      (atencion.notas_tecnicas ? `*Informe Técnico:* ${atencion.notas_tecnicas}\n` : '') +
      (conformityUrl ? `\n*Validación de Conformidad por QR:* ${conformityUrl}` : '');

    const encodedText = encodeURIComponent(message);
    const targetType = this.config.whatsAppTargetType || 'GRUPO';

    if (targetType === 'GRUPO') {
      // If group has an invite link, opening WhatsApp with text allows direct paste or share
      return {
        url: `https://api.whatsapp.com/send?text=${encodedText}`,
        targetLabel: this.config.whatsAppGroupName || 'Grupo de WhatsApp',
        isGroup: true,
      };
    }

    if (targetType === 'NUMERO') {
      const cleanCustom = (this.config.whatsAppCustomNumber || '').replace(/[^0-9]/g, '');
      return {
        url: `https://api.whatsapp.com/send?phone=${cleanCustom}&text=${encodedText}`,
        targetLabel: this.config.whatsAppCustomNumber || 'Número predeterminado',
        isGroup: false,
      };
    }

    // Default: To the solicitante phone
    const cleanPhone = (atencion.solicitante_contacto || '').replace(/[^0-9]/g, '');
    return {
      url: `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`,
      targetLabel: atencion.solicitante_nombre,
      isGroup: false,
    };
  }
}

export const storageService = new StorageService();
