
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false, // For development, can be true in production with HTTPS backend
      },
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true,
        secure: false, // For development
      },
      // Proxy for uploaded content if backend serves it
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
