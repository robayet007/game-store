import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // ✅ build সেকশনে chunkSizeWarningLimit যোগ করুন
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000, // এই লাইনটি যোগ করুন
  },
  // ✅ SPA fallback জন্য
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})