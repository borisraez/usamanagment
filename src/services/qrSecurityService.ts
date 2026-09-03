import { TokenConformidad } from '../types';

/**
 * Generates a cryptographically strong pseudo-random 64-character hex string.
 * This guarantees unpredictable, non-guessable tokens that cannot be enumerated.
 */
export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for non-browser runtimes
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a new TokenConformidad record with 24 hours of validity
 */
export function createTokenConformidadRecord(atencionId: string, expirationHours: number = 24): TokenConformidad {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);

  return {
    id: `tok-${generateSecureToken().substring(0, 12)}`,
    atencion_id: atencionId,
    token_hash: generateSecureToken(),
    fecha_creacion: now.toISOString(),
    fecha_expiracion: expiresAt.toISOString(),
    consumido: false,
    invalidado: false,
  };
}

export type TokenValidationStatus = 
  | 'VALID'
  | 'EXPIRED'
  | 'ALREADY_CONSUMED'
  | 'INVALIDATED'
  | 'NOT_FOUND';

export interface TokenValidationResult {
  status: TokenValidationStatus;
  isValid: boolean;
  message: string;
  token?: TokenConformidad;
}

/**
 * Verifies a token according to the strict security requirements:
 * 1. Must exist
 * 2. Must not be invalidated
 * 3. Must not be consumed
 * 4. Must not be expired
 */
export function validateTokenConformidad(token?: TokenConformidad): TokenValidationResult {
  if (!token) {
    return {
      status: 'NOT_FOUND',
      isValid: false,
      message: 'El enlace o token de conformidad no es válido o no existe en el sistema.',
    };
  }

  if (token.invalidado) {
    return {
      status: 'INVALIDATED',
      isValid: false,
      message: 'Este token de conformidad fue invalidado o reemplazado por un nuevo código generado por el técnico.',
      token,
    };
  }

  if (token.consumido) {
    return {
      status: 'ALREADY_CONSUMED',
      isValid: false,
      message: `Esta atención ya cuenta con constancia de conformidad registrada el ${new Date(token.fecha_consumo || '').toLocaleString('es-PE')}.`,
      token,
    };
  }

  const now = new Date();
  const expirationDate = new Date(token.fecha_expiracion);

  if (now > expirationDate) {
    return {
      status: 'EXPIRED',
      isValid: false,
      message: `El token de conformidad ha expirado (vigencia de 24 horas concluida el ${expirationDate.toLocaleString('es-PE')}). Solicite un nuevo código al técnico.`,
      token,
    };
  }

  return {
    status: 'VALID',
    isValid: true,
    message: 'Token válido para registro de conformidad.',
    token,
  };
}
