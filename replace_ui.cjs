const fs = require('fs');
const path = 'c:/Users/Hii Masteg/Downloads/guwigo-events/src/pages/ParticipantDashboardPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1
content = content.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">',
  '<div className="glass-card p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">\n        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 dark:bg-amber-500/10 rounded-full blur-3xl -z-10 animate-pulse-soft" />'
);

// 2
content = content.replace(
  '<div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">\n            <User className="w-7 h-7 text-slate-400 dark:text-slate-500" />\n          </div>',
  '<div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-amber-500 text-white shadow-lg flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-800">\n            <User className="w-8 h-8" />\n          </div>'
);

// 3
content = content.replace(
  'className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-semibold text-sm transition-colors shadow-sm"',
  'className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-slate-900/20"'
);

// 4
content = content.replace(
  'className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm border border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-50 shadow-sm"',
  'className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-sm"'
);

// 5
content = content.replace(
  `{/* Registrations Switcher (Pills layout) */}
      {registrations.length > 1 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pilih Pendaftaran:</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {registrations.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  if (r.id !== selectedReg?.id) loadRegistrationDetails(r);
                }}
                className={\`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border \${
                  selectedReg?.id === r.id 
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                }\`}
              >
                {r.registrationNumber}
              </button>
            ))}
          </div>
        </div>
      )}`,
  `{/* Registrations Switcher (Segmented Control) */}
      {registrations.length > 1 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pilih Pendaftaran:</h3>
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto custom-scrollbar">
            {registrations.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  if (r.id !== selectedReg?.id) loadRegistrationDetails(r);
                }}
                className={\`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 \${
                  selectedReg?.id === r.id 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-100' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 scale-95 hover:scale-100'
                }\`}
              >
                {r.registrationNumber}
              </button>
            ))}
          </div>
        </div>
      )}`
);

// 6
content = content.replace(
  '<div className="p-12 sm:p-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">',
  '<div className="p-12 sm:p-20 text-center glass-card">'
);

// 7
content = content.replace(
  '<button onClick={() => navigate(\'/events\')} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold rounded-lg shadow-sm transition-colors">',
  '<button onClick={() => navigate(\'/events\')} className="px-8 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95">'
);

// 8
content = content.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">',
  '<div className="glass-card p-6">'
);

// 9
content = content.replace(
  '<p className="text-lg font-mono font-bold text-slate-900 dark:text-white">{participant?.bibNumber || \'-\'}</p>',
  '<p className="text-2xl font-display tracking-widest text-red-600 dark:text-amber-500">{participant?.bibNumber || \'-\'}</p>'
);

// 10
content = content.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">',
  '<div className="glass-card p-4 flex items-center gap-4 group hover:border-red-200 dark:hover:border-amber-500/30 transition-colors">'
);

// 11
content = content.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full flex flex-col items-center justify-center text-center">',
  '<div className="glass-card p-6 h-full flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-red-200 dark:hover:border-amber-500/30">\n                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 dark:bg-amber-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />'
);

// 12
content = content.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">',
  '<div className="glass-card overflow-hidden">'
);

// 13
content = content.replace(
  'className="w-full sm:w-auto px-8 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"',
  'className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-500/20"'
);

// 14
content = content.replace(
  'className="w-full py-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"',
  'className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"'
);

// 15
content = content.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sm:p-8">',
  '<div className="glass-card p-6 sm:p-8">'
);

// 16
content = content.replace(
  'className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold shadow-sm transition-colors"',
  'className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg"'
);

// 17
content = content.replace(
  '<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 text-center">',
  '<div className="glass-card p-8 text-center relative overflow-hidden">\n                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10 animate-pulse-soft" />'
);

// 18
content = content.replace(
  '<p className="text-xl font-mono font-bold text-slate-900 dark:text-white">{result.gunTime}</p>',
  '<p className="text-3xl font-display tracking-widest text-slate-900 dark:text-white">{result.gunTime}</p>'
);

// 19
content = content.replace(
  '<p className="text-xl font-mono font-bold text-red-600 dark:text-red-400">{result.chipTime}</p>',
  '<p className="text-3xl font-display tracking-widest text-red-600 dark:text-amber-500">{result.chipTime}</p>'
);

// 20
content = content.replace(
  'className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold shadow-sm transition-colors mt-4"',
  'className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-r dark:from-amber-400 dark:to-amber-500 text-white dark:text-slate-900 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg mt-4"'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Done replacement in ParticipantDashboardPage.tsx');
