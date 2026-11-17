import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { mockApi } from './mock-api.mjs';

/**
 * Vite Configuration.
 *
 * Builds the console into build/admin while development serves root-level page
 * addresses. API calls use the running service or the in-memory mock.
 *
 * @since 0.0.0
 */
export default defineConfig((configurationEnvironment) => ({
  appType: 'spa',
  base: (configurationEnvironment.command === 'serve') ? '/' : '/admin/',
  build: {
    emptyOutDir: true,
    outDir: 'build/admin',
  },
  envDir: false,
  plugins: (configurationEnvironment.mode === 'mock') ? [
    react(),
    mockApi(),
  ] : [react()],
  publicDir: 'src/web/public',
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  server: {
    port: 5174,
    proxy: (configurationEnvironment.mode === 'mock') ? {} : {
      '/api': 'http://127.0.0.1:22603',
    },
  },
}));
