import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { mockApi } from './mock-api.mjs';

/**
 * Vite Configuration.
 *
 * Builds the console into build/admin, served at /admin. Development proxies API calls
 * to the running service or answers them from the mock API. The service's .env files
 * aren't loaded, so their NODE_ENV can't turn a build into a development build.
 *
 * @since 0.0.0
 */
export default defineConfig(({ mode }) => ({
  base: '/admin/',
  build: {
    emptyOutDir: true,
    outDir: 'build/admin',
  },
  envDir: false,
  plugins: (mode === 'mock') ? [
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
    proxy: (mode === 'mock') ? {} : {
      '/api': 'http://127.0.0.1:22603',
    },
  },
}));
