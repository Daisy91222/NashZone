import {defineConfig} from 'vite';

export default defineConfig({
  root: 'app',
  base: './',
  build: {outDir: '../dist', emptyOutDir: true},
  server: {host: '127.0.0.1', port: 4317},
  preview: {host: '127.0.0.1', port: 4318},
});
