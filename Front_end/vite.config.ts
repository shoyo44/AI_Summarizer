import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/pdfjs-dist/, /node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('pdfjs-dist')) return 'pdfjs';
            if (id.includes('html2pdf')) return 'html2pdf';
            if (id.includes('mammoth')) return 'mammoth';
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            return 'vendor';
          }
        }
      },
    },
  },
  worker: {
    format: 'es',
  },
})
