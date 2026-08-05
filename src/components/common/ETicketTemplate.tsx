import React, { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Participant, EventItem, EventCategory } from '../../types';
import { QrCode, ShieldCheck, MapPin, Calendar, Clock, Shirt } from 'lucide-react';

interface ETicketTemplateProps {
  participant: Participant;
  event: EventItem;
  category: EventCategory | null;
}

export const ETicketTemplate: React.FC<ETicketTemplateProps> = ({ participant, event, category }) => {
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling({
        width: 180,
        height: 180,
        data: participant.qrToken,
        dotsOptions: {
          color: "#DC2626", // red-600
          type: "rounded"
        },
        backgroundOptions: {
          color: "transparent",
        },
        cornersSquareOptions: {
          color: "#eab308", // yellow-500
          type: "extra-rounded"
        },
        cornersDotOptions: {
          color: "#DC2626", // red-600
          type: "dot"
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10
        }
      });
    } else {
      qrCodeRef.current.update({ data: participant.qrToken });
    }
  }, [participant.qrToken]);

  useEffect(() => {
    if (qrContainerRef.current && qrCodeRef.current) {
      qrContainerRef.current.innerHTML = '';
      qrCodeRef.current.append(qrContainerRef.current);
    }
  }, [participant.qrToken]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="w-[400px] bg-white rounded-3xl overflow-hidden shadow-2xl relative font-sans text-slate-900 border border-slate-200" id="eticket-content">
      {/* Top Banner */}
      <div className="h-32 bg-gradient-to-r from-red-600 to-red-800 relative">
        {event.banner && (
          <img 
            src={event.banner} 
            alt="Event Banner" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
            crossOrigin="anonymous"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-red-200 text-[10px] font-black tracking-[0.2em] uppercase mb-1 drop-shadow-md">OFFICIAL E-TICKET</span>
          <h1 className="text-white text-xl font-black uppercase tracking-tight drop-shadow-lg leading-tight line-clamp-2">{event.name}</h1>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="p-6 bg-white relative">
        {/* Cutout circles for ticket effect */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-slate-100 rounded-full border-r border-b border-slate-200" />
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-slate-100 rounded-full border-l border-b border-slate-200" />
        
        {/* Participant Name & BIB */}
        <div className="text-center mb-6">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">NAMA PESERTA</p>
          <h2 className="text-2xl font-black text-slate-900 uppercase leading-none">{participant.fullName}</h2>
          
          <div className="mt-4 inline-block bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl px-8 py-3 shadow-lg shadow-yellow-500/20 border-2 border-yellow-300">
            <p className="text-[10px] text-yellow-900 font-bold uppercase tracking-widest mb-0.5">NOMOR BIB</p>
            <p className="text-4xl font-black text-yellow-900 font-mono tracking-tighter">{participant.bibNumber || 'TBA'}</p>
          </div>
        </div>

        <hr className="border-dashed border-slate-300 my-4" />

        {/* Event Details Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-bold text-[10px] uppercase">Kategori</span>
            </div>
            <p className="font-bold text-slate-900">{category?.name || 'UMUM'}</p>
          </div>
          
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Shirt className="w-3.5 h-3.5" />
              <span className="font-bold text-[10px] uppercase">Ukuran Jersey</span>
            </div>
            <p className="font-bold text-slate-900">{participant.jerseySize}</p>
          </div>

          <div className="col-span-2">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-bold text-[10px] uppercase">Tanggal Pelaksanaan</span>
            </div>
            <p className="font-bold text-slate-900">{formatDate(event.startDate)}</p>
          </div>
          
          <div className="col-span-2">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-bold text-[10px] uppercase">Lokasi</span>
            </div>
            <p className="font-bold text-slate-900 leading-tight">{event.location}</p>
          </div>
        </div>

        <hr className="border-dashed border-slate-300 my-5" />

        {/* QR Code Section */}
        <div className="flex flex-col items-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 text-center">Tunjukkan QR untuk Race Pack</p>
          
          <div className="p-3 bg-white rounded-2xl border border-slate-200 relative inline-block shadow-sm">
            <div className="relative inline-block flex justify-center items-center">
              <div ref={qrContainerRef} className="block" />
              
              {/* Logo Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="rounded-full bg-gradient-to-br from-red-500 to-yellow-400 shadow-lg flex items-center justify-center border-[3px] border-white w-10 h-10">
                  <span className="text-white font-black leading-none text-lg">G</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>TERVALIDASI SISTEM RACEPRO</span>
          </div>
        </div>
      </div>

      {/* Footer Pattern */}
      <div className="h-4 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 w-full" />
    </div>
  );
};
