// ============================================================
// GUWIGO INDONESIA — Konfigurasi Vite Build
// ============================================================

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR dinonaktifkan di AI Studio melalui env var DISABLE_HMR.
      // Jangan dimodifikasi — file watching dinonaktifkan untuk mencegah flicker selama agent edit.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Matikan file watching saat DISABLE_HMR = true untuk menghemat CPU selama agent edit.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
