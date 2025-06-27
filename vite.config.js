// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // dev 명령어는 개발환경, build 명령어는 프로덕션으로 간주
  const isProduction = command === 'build'

  // 🐛 디버깅용 출력
  console.log('🔧 Vite Config Debug:')
  console.log('  - command:', command)
  console.log('  - mode:', mode)
  console.log('  - isProduction:', isProduction)
  console.log('  - base will be:', isProduction ? '/' : '/lsh')
  console.log('---')
  
  return {
    base: isProduction ? '/' : '/lsh',
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
  }
 })