import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // O editor (CodeMirror) e o SDK do Firebase ficam em chunks carregados sob demanda.
    chunkSizeWarningLimit: 800,
  },
});
