import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// Local dev at / ; production GitHub Pages at /journey/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : '/journey/',
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  build: {
    outDir: path.resolve(rootDir, '../journey'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1400,
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: false,
  },
}))
