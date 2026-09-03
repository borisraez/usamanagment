export type Prioridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export type EstadoOperativo = 
  | 'REGISTRADA'
  | 'ASIGNADA'
  | 'EN_PROCESO'
  | 'CERRADA_PENDIENTE_CONFORMIDAD'
  | 'CONFORME_FINALIZADA'
  | 'CERRADA_CON_OBSERVACION';

export const ACTIVIDADES_SALUD_AMBIENTAL = [
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
] as const;

export type CategoriaAtencion = 
  | typeof ACTIVIDADES_SALUD_AMBIENTAL[number]
  | string;

export interface Evidencia {
  id: string;
  atencion_id: string;
  tipo: 'FOTO_INICIAL' | 'FOTO_FINAL' | 'REPORTE_TECNICO' | 'DIAGNOSTICO';
  titulo: string;
  url_preview: string;
  descripcion: string;
  timestamp: string;
  archivo_nombre?: string;
}

export interface TokenConformidad {
  id: string;
  atencion_id: string;
  token_hash: string; // 64-char cryptographic random string
  fecha_creacion: string;
  fecha_expiracion: string;
  consumido: boolean;
  invalidado: boolean;
  fecha_consumo?: string;
  ip_consumo?: string;
}

export interface Conformidad {
  id: string;
  atencion_id: string;
  token_id: string;
  firmante_nombre: string;
  firmante_documento: string; // DNI / Cédula
  firmante_cargo?: string;
  calificacion: number; // 1 to 5 stars
  observaciones: string;
  firma_digital_data: string; // Base64 canvas data
  timestamp_registro: string;
}

export interface Atencion {
  id: string;
  codigo_visible: string; // e.g., AT-2026-00245
  solicitante_nombre: string;
  solicitante_contacto: string; // Email / Teléfono
  solicitante_area: string;
  solicitante_ubicacion: string;
  tipo_origen?: 'SOLICITUD' | 'RECORRIDO_OPERATIVO';
  hora_inicio?: string; // e.g. "08:30" (en recorrido operativo)
  hora_termino?: string; // e.g. "10:15" (en recorrido operativo)
  categoria: CategoriaAtencion;
  descripcion: string;
  prioridad: Prioridad;
  estado_operativo: EstadoOperativo;
  tecnico_id?: string;
  tecnico_nombre?: string;
  fecha_solicitud: string;
  fecha_inicio?: string;
  fecha_cierre?: string;
  notas_tecnicas?: string;
  evidencias: Evidencia[];
  token_conformidad?: TokenConformidad;
  conformidad?: Conformidad;
  version_registro: number;
}

export type TipoServicioIntegracion = 'GOOGLE_SHEETS' | 'WHATSAPP_NOTIFICATION';
export type EntidadTipoIntegracion = 'ATENCION' | 'CONFORMIDAD';
export type EstadoEventoIntegracion = 'PENDIENTE' | 'PROCESANDO' | 'EXITOSO' | 'ERROR' | 'REINTENTO_PENDIENTE' | 'FALLO_DEFINITIVO';

export interface IntegrationEvent {
  id: string;
  tipo_servicio: TipoServicioIntegracion;
  entidad_tipo: EntidadTipoIntegracion;
  entidad_id: string;
  entidad_codigo: string;
  id_idempotencia: string; // unique hash: tipo + entidad_id + version
  estado: EstadoEventoIntegracion;
  intentos: number;
  max_intentos: number;
  payload: Record<string, unknown>;
  ultimo_error?: string;
  fecha_creacion: string;
  fecha_ultimo_intento?: string;
  fecha_proximo_reintento?: string;
  fecha_exito?: string;
}

export interface AuditoriaLog {
  id: string;
  entidad: string;
  entidad_id: string;
  accion: string;
  descripcion: string;
  usuario_id: string;
  usuario_nombre: string;
  usuario_rol: string;
  datos_anteriores?: Record<string, unknown>;
  datos_nuevos?: Record<string, unknown>;
  timestamp: string;
}

export type UserRole = 'ADMINISTRADOR' | 'TECNICO' | 'COORDINADOR' | 'CLIENTE';

export type EstadoAprobacionUsuario = 'APROBADO' | 'PENDIENTE' | 'RECHAZADO';

export interface SystemUser {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  avatar: string;
  password?: string;
  telefono?: string;
  dni?: string;
  especialidad?: string;
  activo?: boolean;
  estado_aprobacion?: EstadoAprobacionUsuario;
  fecha_creacion?: string;
  fecha_solicitud_registro?: string;
  fecha_aprobacion?: string;
  aprobado_por?: string;
  ultimo_acceso?: string;
}

export interface GoogleSheetsRow {
  ID_ATENCION: string;
  FECHA_SOLICITUD: string;
  SOLICITANTE: string;
  AREA: string;
  TECNICO: string;
  CATEGORIA: string;
  ESTADO: string;
  PRIORIDAD: string;
  FECHA_INICIO: string;
  FECHA_CIERRE: string;
  CONFORMIDAD: string;
  CALIFICACION: string;
  FIRMANTE: string;
  ULTIMA_ACTUALIZACION: string;
}
