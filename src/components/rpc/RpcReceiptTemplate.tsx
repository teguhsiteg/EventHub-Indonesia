import React from 'react';
import { Participant } from '../../types';

interface RpcReceiptTemplateProps {
  participant: Participant;
  eventName: string;
  categoryName: string;
  adminName: string;
}

export const RpcReceiptTemplate: React.FC<RpcReceiptTemplateProps> = ({
  participant,
  eventName,
  categoryName,
  adminName
}) => {
  return (
    <div className="w-[80mm] min-h-[100mm] bg-white text-black p-4 font-mono text-sm mx-auto shadow-xl" id="rpc-receipt-template">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-black mb-1">EventHub</h1>
        <p className="text-xs">RACE PACK COLLECTION</p>
        <p className="text-xs font-bold mt-2">{eventName}</p>
        <p className="text-[10px] border-b border-black pb-2 mt-1">TANDA TERIMA RESMI</p>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6 text-xs">
        <div>
          <p className="text-[10px] text-gray-500">Nama Peserta</p>
          <p className="font-bold">{participant.fullName}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500">Kategori</p>
          <p className="font-bold">{categoryName}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500">Ukuran Jersey</p>
          <p className="font-bold">{participant.jerseySize || '-'}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-500">Nomor Dada (BIB)</p>
          <p className="text-2xl font-black mt-1 p-2 border-2 border-black text-center">
            {participant.bibNumber || 'TBA'}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="border-t border-dashed border-black pt-4 text-[10px] space-y-1">
        <div className="flex justify-between">
          <span>Waktu Ambil:</span>
          <span>{new Date(participant.checkInTime || Date.now()).toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between">
          <span>Petugas:</span>
          <span>{adminName}</span>
        </div>
        <div className="flex justify-between">
          <span>ID Ref:</span>
          <span>{participant.id.slice(-6).toUpperCase()}</span>
        </div>
      </div>

      <div className="mt-8 text-center text-[10px]">
        <p>Terima kasih telah berpartisipasi.</p>
        <p>Simpan struk ini sebagai bukti pengambilan.</p>
        <p className="mt-2 font-bold">eventhub.guwigo.com</p>
      </div>
    </div>
  );
};
