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
  size = 240, 
  label = 'Tunjukkan QR Code ini kepada panitia saat pengambilan Race Pack' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#f97316',
          light: '#0f172a',
        },
      }, (error) => {
        if (error) console.error('Error rendering QR Code:', error);
      });
    }
  }, [value, size]);

  const logoSize = Math.max(size * 0.2, 36);

  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl shadow-black/40 max-w-sm mx-auto text-center">
      
      {/* Header */}
      <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-yellow-500/20 border border-blue-500/20 flex items-center justify-center">
          <QrCode className="w-3.5 h-3.5" />
        </div>
        <span>Token Verifikasi QR RacePro</span>
      </div>

      {/* QR Code Canvas with Logo Overlay */}
      <div className="p-4 bg-white dark:bg-blue-950 rounded-2xl border border-slate-300 dark:border-slate-800 relative inline-block shadow-inner">
        <div className="relative inline-block">
          <canvas ref={canvasRef} className="block" />
          
          {/* RacePro Logo Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="rounded-full bg-gradient-to-br from-blue-500 to-yellow-400 shadow-lg shadow-blue-500/30 flex items-center justify-center border-2 border-white/20"
              style={{ width: logoSize, height: logoSize }}
            >
              <span 
                className="text-white font-black leading-none"
                style={{ fontSize: logoSize * 0.45 }}
              >
                G
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Badge */}
      <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Tervalidasi Sistem RacePro</span>
      </div>

      {/* Label */}
      <p className="text-xs text-slate-500 mt-3 leading-relaxed font-medium px-2">
        {label}
      </p>

      {/* Token Display */}
      <div className="mt-3 text-[10px] font-mono text-slate-500 bg-slate-50 dark:bg-blue-950/80 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-800 break-all max-w-full">
        <span className="text-slate-600">Token: </span>
        <span className="text-slate-600 dark:text-slate-500 dark:text-slate-400">{value}</span>
      </div>
    </div>
  );
};
