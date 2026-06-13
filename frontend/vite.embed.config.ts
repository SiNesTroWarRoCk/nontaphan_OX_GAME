import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-embed',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/embedded/ox-widget.tsx',
      name: 'OxGameWidget',
      formats: ['iife'],
      fileName: () => 'ox-game.js',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'ox-game.[ext]',
      },
    },
  },
});
