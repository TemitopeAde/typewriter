import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Renders the app's real panel and widget with only the Wix host modules stubbed.
const mock = (name: string) => fileURLToPath(new URL(`./mocks/${name}.ts`, import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  resolve: {
    alias: {
      '@wix/editor': mock('editor'),
      '@wix/essentials': mock('essentials'),
      '@wix/site-window': mock('site-window'),
    },
  },
  server: { port: 5199, strictPort: true, fs: { allow: ['../..'] } },
});
