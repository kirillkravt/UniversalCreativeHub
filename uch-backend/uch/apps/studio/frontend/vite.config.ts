import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Автоматически определяем base в зависимости от режима
const isDevelopment = process.env.NODE_ENV === 'development'
const base = isDevelopment ? '/' : '/static/studio/'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic'
    })
  ],
  base: base,
  root: '.',  // Явно указываем корень проекта
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    cors: true,
    proxy: {
      '/api': 'http://localhost:8000'
    },
    hmr: {
      overlay: false
    }
  },
  build: {
    outDir: '../static/studio',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.tsx')
      },
      output: {
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})
