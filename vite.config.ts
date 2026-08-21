
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  base: './', // Corrige problemas de carregamento em subdiretórios/previews
  build: {
    outDir: 'dist',
    sourcemap: false, // Desativa sourcemaps em produção para segurança
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Hash garante cache-busting sem precisar do Date.now()
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
        }
      }
    }
  },
  // Polyfill simples para evitar que bibliotecas que usam process.env quebrem
  define: {
    'process.env': {},
    '__APP_VERSION__': JSON.stringify(pkg.version),
  }
});
