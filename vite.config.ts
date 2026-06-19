/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['node_modules/**', 'dist/**', '.worktrees/**'],
  },
} as UserConfig & {
  test: {
    environment: string;
    setupFiles: string;
    css: boolean;
    exclude: string[];
  };
});
