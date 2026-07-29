import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, ShieldCheck } from 'lucide-react';

interface QRCodeViewerProps {
  value: string;
  size?: number;
  label?: string;
}

export const QRCodeViewer: React.FC<QRCodeViewerProps> = ({ 
  value, 
  size = 220, 
  label = 'Tunjukkan QR Code ini kepada panitia saat pengambilan Race Pack' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      }, (error) => {
        if (error) console.error('Error rendering QR Code:', error);
      });
    }
  }, [value, size]);

  return (
    <div className="flex flex-col items-center p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl max-w-sm mx-auto text-center">
      <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider mb-4">
        <QrCode className="w-4 h-4" />
        <span>Token Verifikasi QR Resmi</span>
      </div>

      <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-200">
        <canvas ref={canvasRef} />
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-full">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Tervalidasi Sistem RacePro</span>
      </div>

      <p className="text-xs text-slate-400 mt-3 leading-relaxed font-medium">
        {label}
      </p>

      <div className="mt-3 text-[10px] font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded border border-slate-800 break-all">
        Token: {value}
      </div>
    </div>
  );
};
