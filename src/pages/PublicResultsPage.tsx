import React, { useEffect, useState } from 'react';
import { getPublicRaceResults } from '../services/resultService';
import { getPublicEvents } from '../services/eventService';
import { RaceResult, EventItem } from '../types';
import { Trophy, Search, Medal, Award, Clock, ArrowUpDown } from 'lucide-react';

export const PublicResultsPage: React.FC = () => {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const evs = await getPublicEvents();
      setEvents(evs);
      if (evs.length > 0) {
        setSelectedEventId(evs[0].id);
        const res = await getPublicRaceResults(evs[0].id);
        setResults(res);
      } else {
        const res = await getPublicRaceResults();
        setResults(res);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleEventChange = async (eId: string) => {
    setSelectedEventId(eId);
    setLoading(true);
    const res = await getPublicRaceResults(eId || undefined);
    setResults(res);
    setLoading(false);
  };

  const filteredResults = results.filter(r => 
    r.participantName.toLowerCase().includes(search.toLowerCase()) || 
    r.bibNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen  text-slate-900 dark:text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Trophy className="w-4 h-4" />
            <span>Papan Klasemen Finisher</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Hasil Lomba Resmi</h1>
          <p className="text-slate-500 dark:text-slate-500 dark:text-slate-400 text-xs mt-1">Cari waktu tempuh, peringkat kategori, dan status finisher peserta.</p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-500 dark:text-slate-400 uppercase shrink-0">Pilih Event:</label>
            <select
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className=" border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 w-full md:w-72"
            >
              <option value="">Semua Event</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 dark:text-slate-500 dark:text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama peserta atau nomor BIB..."
              className="w-full  border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Results Table */}
        {loading ? (
          <div className="bg-white dark:bg-blue-950 rounded-2xl h-64 border border-slate-200 dark:border-slate-800 animate-pulse" />
        ) : filteredResults.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-blue-950/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Belum Ada Hasil Resmi</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400 mt-1">Hasil lomba belum dipublikasikan oleh komite penilai untuk filter ini.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-blue-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className=" border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Rank Kategori</th>
                    <th className="p-4">BIB</th>
                    <th className="p-4">Nama Peserta</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">Chip Time</th>
                    <th className="p-4">Gun Time</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredResults.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-100 dark:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-black text-yellow-400">
                        {r.categoryRank <= 3 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-300 font-black">
                            <Medal className="w-3.5 h-3.5" /> #{r.categoryRank}
                          </span>
                        ) : (
                          `#${r.categoryRank}`
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{r.bibNumber}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{r.participantName}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-500 dark:text-slate-400">{r.gender === 'MALE' ? 'Pria' : 'Wanita'}</td>
                      <td className="p-4 font-mono text-emerald-400 font-bold">{r.chipTime || '-'}</td>
                      <td className="p-4 font-mono text-slate-600 dark:text-slate-600 dark:text-slate-300">{r.gunTime || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                          r.status === 'FINISH' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-red-950 text-red-400'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
