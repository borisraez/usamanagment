import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, Sparkles } from 'lucide-react';

interface SignatureCanvasProps {
  onSave: (dataUrl: string) => void;
  onClear: () => void;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSave, onClear }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const signatureDataRef = useRef<string>('');

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Save previous drawing if exists
    const previousData = signatureDataRef.current;

    const dpr = window.devicePixelRatio || 2;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = '#0f172a'; // slate-900
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If there was a previous signature, redraw it smoothly
    if (previousData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = previousData;
    }
  };

  useEffect(() => {
    initCanvas();

    const container = containerRef.current;
    if (!container) return;

    let resizeTimer: number;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        initCanvas();
      }, 100);
    });

    observer.observe(container);

    return () => {
      window.clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const dataUrl = canvas.toDataURL('image/png');
      signatureDataRef.current = dataUrl;
      onSave(dataUrl);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    signatureDataRef.current = '';
    onClear();
  };

  const handleSampleSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    handleClear();
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.65);
    ctx.bezierCurveTo(w * 0.25, h * 0.2, w * 0.35, h * 0.8, w * 0.5, h * 0.45);
    ctx.bezierCurveTo(w * 0.6, h * 0.25, w * 0.7, h * 0.6, w * 0.85, h * 0.4);
    ctx.stroke();

    // Loop
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.5, 12, 0, Math.PI * 2);
    ctx.stroke();

    setHasSignature(true);
    const dataUrl = canvas.toDataURL('image/png');
    signatureDataRef.current = dataUrl;
    onSave(dataUrl);
  };

  return (
    <div ref={containerRef} id="signature-canvas-container" className="space-y-2">
      <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden hover:border-slate-400 transition-colors">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-40 touch-none cursor-crosshair block"
        />

        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-sm">
            <span className="font-medium">Dibuje su firma con el dedo o mouse aquí</span>
            <span className="text-xs text-slate-400">Constancia digital vinculada al token</span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          <button
            id="btn-sample-signature"
            type="button"
            onClick={handleSampleSignature}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white/90 backdrop-blur border border-slate-200 rounded-md shadow-xs hover:bg-slate-100 flex items-center gap-1"
            title="Generar firma simulada de prueba"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            Firma Demo
          </button>
          {hasSignature && (
            <button
              id="btn-clear-signature"
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 text-xs font-medium text-rose-600 bg-white/90 backdrop-blur border border-rose-200 rounded-md shadow-xs hover:bg-rose-50 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Check className={`w-3.5 h-3.5 ${hasSignature ? 'text-emerald-600' : 'text-slate-300'}`} />
          {hasSignature ? 'Firma digital capturada con éxito' : 'Firma pendiente'}
        </span>
        <span>Sello criptográfico SHA-256</span>
      </div>
    </div>
  );
};
