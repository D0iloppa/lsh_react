// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/lsh_staff/',
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@contexts' : '/src/contexts',
      '@pages': '/src/pages',
      '@hooks': '/src/hooks',
      '@layout': '/src/layout',
      '@utils': '/src/utils',
      '@assets': '/src/assets'
    }
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['lsh.host', 'localhost'],
    watch: {
      usePolling: true,
      interval: 100
    }
  }
})