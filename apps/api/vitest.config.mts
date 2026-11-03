import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';

/**
 * Vitest Configuration.
 *
 * Discovers source-level and workspace-level unit tests.
 * Keeps application checks isolated from neighboring monorepo workspaces.
 *
 * @since 0.0.0
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: [
      'src/**/*.test.ts',
      'tests/**/*-test.js',
      'tests/**/*.test.ts',
    ],
    passWithNoTests: true,
  },
});
