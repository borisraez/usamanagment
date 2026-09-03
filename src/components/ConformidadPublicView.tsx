import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Star, 
  User, 
  FileText, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Wrench,
  Download,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Atencion } from '../types';
import { storageService } from '../services/storageService';
import { validateTokenConformidad, TokenValidationResult } from '../services/qrSecurityService';
import { SignatureCanvas } from './SignatureCanvas';

interface ConformidadPublicViewProps {
  tokenHash: string;
  onBackToApp?: () => void;
  onConformidadRegistered?: () => void;
}

export const ConformidadPublicView: React.FC<ConformidadPublicViewProps> = ({
  tokenHash,
  onBackToApp,
  onConformidadRegistered,
}) => {
  const [atencion, setAtencion] = useState<Atencion | undefined>(undefined);
  const [validation, setValidation] = useState<TokenValidationResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [cargo, setCargo] = useState('');
  const [calificacion, setCalificacion] = useState<number>(5);
  const [observaciones, setObservaciones] = useState('');
  const [firmaData, setFirmaData] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [tokenHash]);

  const loadData = () => {
    setLoading(true);
    const item = storageService.getAtencionByTokenHash(tokenHash);
    setAtencion(item);

    if (item && item.token_conformidad) {
      const val = validateTokenConformidad(item.token_conformidad);
      setValidation(val);
      if (item.solicitante_nombre && !nombre) {
        setNombre(item.solicitante_nombre);
      }
    } else {
      setValidation({
        status: 'NOT_FOUND',
        isValid: false,
        message: 'No se encontró ninguna atención asociada a este enlace o el código es inválido.',
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!nombre.trim()) {
      setErrorMessage('Por favor ingrese el nombre del firmante.');
      return;
    }
    if (!documento.trim()) {
      setErrorMessage('Por favor ingrese su número de documento de identidad (DNI/Cédula).');
      return;
    }
    if (!firmaData) {
      setErrorMessage('Por favor dibuje su firma digital para validar la conformidad.');
      return;
    }

    try {
      setSubmitting(true);
      storageService.registrarConformidad(tokenHash, {
        firmante_nombre: nombre,
        firmante_documento: documento,
        firmante_cargo: cargo,
        calificacion,
        observaciones,
        firma_digital_data: firmaData,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSubmittedSuccess(true);
      loadData();
      if (onConformidadRegistered) onConformidadRegistered();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar conformidad.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Validando token criptográfico seguro...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="conformidad-public-screen" className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-8 px-3 sm:px-6 flex flex-col items-center justify-start">
      {/* Top Header Bar */}
      <div className="max-w-xl w-full flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight">Salud Ambiental • Validación de Conformidad</h1>
            <p className="text-[10px] sm:text-xs text-slate-400">Verificación criptográfica y firma digital en campo</p>
          </div>
        </div>

        {onBackToApp && (
          <button
            id="btn-back-to-console"
            onClick={onBackToApp}
            className="text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver</span>
          </button>
        )}
      </div>

      <div className="max-w-xl w-full bg-slate-900 text-slate-100 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
        {/* Token Validation Banner if Invalid or Consumed */}
        {!validation?.isValid && (
          <div className="p-6 sm:p-8 text-center space-y-5">
            {validation?.status === 'ALREADY_CONSUMED' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Conformidad Previamente Registrada</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
                    {validation.message}
                  </p>
                </div>

                {atencion?.conformidad && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="font-semibold text-slate-400">Atención:</span>
                      <span className="font-mono font-bold text-emerald-400">{atencion.codigo_visible}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="font-semibold text-slate-400">Firmante:</span>
                      <span>{atencion.conformidad.firmante_nombre} (Doc: {atencion.conformidad.firmante_documento})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="font-semibold text-slate-400">Calificación:</span>
                      <span className="text-amber-400 font-bold">{'★'.repeat(atencion.conformidad.calificacion)} ({atencion.conformidad.calificacion}/5)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-400">Fecha de Sello:</span>
                      <span>{new Date(atencion.conformidad.timestamp_registro).toLocaleString('es-PE')}</span>
                    </div>

                    {atencion.conformidad.firma_digital_data && (
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <span className="font-semibold text-slate-400 block mb-1">Firma Digital Registrada:</span>
                        <img 
                          src={atencion.conformidad.firma_digital_data} 
                          alt="Firma registrada" 
                          className="h-16 max-w-full bg-white rounded-lg p-1 object-contain mx-auto"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-[11px] text-slate-500">
                    Por motivos de seguridad e inmutabilidad sanitaria, este enlace no permite modificaciones adicionales.
                  </p>
                </div>
              </div>
            )}

            {validation?.status === 'EXPIRED' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/40">
                  <Clock className="w-10 h-10" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Enlace Expirado (24 Horas)</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {validation.message}
                </p>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 text-left">
                  <strong>Recomendación:</strong> Solicite al técnico especialista {atencion?.tecnico_nombre || 'a cargo'} que genere un nuevo código QR actualizado desde su consola.
                </div>
              </div>
            )}

            {validation?.status === 'INVALIDATED' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/40">
                  <XCircle className="w-10 h-10" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Token Invalidado</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {validation.message}
                </p>
              </div>
            )}

            {validation?.status === 'NOT_FOUND' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/40">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Token No Válido</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {validation.message}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Valid Form for Signing */}
        {validation?.isValid && atencion && (
          <div>
            {/* Header with ticket summary */}
            <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-5 sm:p-6 border-b border-emerald-900/50">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-black/40 border border-emerald-500/40 rounded-md text-xs font-mono font-bold text-emerald-300 tracking-wider">
                  {atencion.codigo_visible}
                </span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3" /> Token Criptoseguro Activo
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold mt-3 leading-snug text-white">{atencion.descripcion}</h2>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">Especialista: <strong className="text-white">{atencion.tecnico_nombre || 'Técnico'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">{atencion.solicitante_area || atencion.solicitante_ubicacion}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fecha: {new Date(atencion.fecha_solicitud).toLocaleDateString('es-PE')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {atencion.tipo_origen === 'RECORRIDO_OPERATIVO' && (atencion.hora_inicio || atencion.hora_termino) ? (
                    <span>Horario: {atencion.hora_inicio || '--:--'} - {atencion.hora_termino || '--:--'}</span>
                  ) : (
                    <span>Cierre: {atencion.fecha_cierre ? new Date(atencion.fecha_cierre).toLocaleTimeString('es-PE') : '-'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Technical Work Done Summary */}
            {atencion.notas_tecnicas && (
              <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-emerald-400 block mb-1">Informe de Trabajos Sanitarios Ejecutados:</span>
                <p className="leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-200">{atencion.notas_tecnicas}</p>
              </div>
            )}

            {/* Evidence previews */}
            {atencion.evidencias.length > 0 && (
              <div className="p-4 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-2">Evidencias Adjuntas por el Técnico ({atencion.evidencias.length}):</span>
                <div className="grid grid-cols-2 gap-2">
                  {atencion.evidencias.map(evi => (
                    <div key={evi.id} className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={evi.url_preview} alt={evi.titulo} className="w-full h-24 object-cover" />
                      <div className="p-1.5 bg-slate-900 text-[11px] font-medium text-slate-300 truncate">
                        {evi.titulo}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  Datos de la Persona que Recibe el Servicio
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      id="input-firmante-nombre"
                      type="text"
                      required
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      placeholder="Ej. Dra. Elena Ramos"
                      className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Documento Identidad (DNI/Cédula) *
                    </label>
                    <input
                      id="input-firmante-documento"
                      type="text"
                      required
                      value={documento}
                      onChange={e => setDocumento(e.target.value)}
                      placeholder="Ej. 45892147"
                      className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cargo o Relación con el Área
                  </label>
                  <input
                    id="input-firmante-cargo"
                    type="text"
                    value={cargo}
                    onChange={e => setCargo(e.target.value)}
                    placeholder="Ej. Jefa de Epidemiología / Coordinador Sanitario"
                    className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Star Rating */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-white">
                  Calificación del Servicio Brindado:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      id={`btn-star-${star}`}
                      onClick={() => setCalificacion(star)}
                      className={`p-1.5 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                        calificacion >= star ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-2">
                    {calificacion === 5 ? 'Excelente (5/5)' : `${calificacion} de 5 estrellas`}
                  </span>
                </div>
              </div>

              {/* Observations */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Observaciones adicionales (Opcional)
                </label>
                <textarea
                  id="input-firmante-observaciones"
                  rows={2}
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  placeholder="Comentarios sobre la atención, puntualidad o recomendaciones..."
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Digital Signature Canvas */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-white">
                  Firma Digital del Solicitante / Receptor *
                </label>
                <p className="text-[11px] text-slate-400">
                  Dibuje su firma con el dedo o puntero en el siguiente recuadro:
                </p>
                <SignatureCanvas
                  onSave={(data) => setFirmaData(data)}
                  onClear={() => setFirmaData('')}
                />
              </div>

              {/* Submit button */}
              <div className="pt-3">
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Al enviar, el token quedará consumido de inmediato. El registro se sincronizará de forma desacoplada.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-500 mt-6 max-w-sm">
        Salud Ambiental • Protocolo Criptográfico de Conformidad y Trazabilidad V1
      </div>
    </div>
  );
};
