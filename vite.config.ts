import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'client',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://192.168.9.104:8085',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://192.168.9.104:8085',
        ws: true
      }
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})