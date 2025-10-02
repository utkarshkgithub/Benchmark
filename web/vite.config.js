import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['styled-jsx/babel'],
      },
    }),
  ],
  server: {
    historyApiFallback: true, // 👈 this makes dev server handle SPA routing
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Redux related
          redux: ['@reduxjs/toolkit', 'react-redux'],
          // UI libraries
          ui: ['framer-motion', 'react-icons', 'lucide-react'],
          // Form and validation
          forms: ['react-hook-form', 'react-otp-input'],
          // PDF and document libraries
          pdf: ['jspdf', 'jspdf-autotable', 'xlsx'],
          // QR and image processing
          qr: ['qrcode.react', 'react-zoom-pan-pinch'],
          // Utility libraries
          utils: ['axios', 'clsx', 'tailwind-merge', 'react-hot-toast']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb to reduce warnings
    // Security: Minify for production
    minify: true
  }
})
