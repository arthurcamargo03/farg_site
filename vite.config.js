import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: false,
  server: {
    port: 8000,
    open: true,
    host: true,
  },
  build: {
    target: 'es2019',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        sites: resolve(__dirname, 'sites.html'),
      },
    },
  },
  optimizeDeps: {
    include: ['gsap', 'gsap/ScrollTrigger', 'lenis', 'split-type', 'ogl', '@barba/core'],
  },
});
