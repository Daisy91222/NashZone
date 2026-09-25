import {defineConfig} from 'vite';
import {resolve} from 'node:path';

export default defineConfig({
  root: 'app',
  base: './',
  build: {outDir: '../dist', emptyOutDir: true, rolldownOptions: {input: {demo: resolve('app/index.html'), workspace: resolve('app/workspace/index.html')}}},
  server: {host: '127.0.0.1', port: 4317},
  preview: {host: '127.0.0.1', port: 4318},
});
