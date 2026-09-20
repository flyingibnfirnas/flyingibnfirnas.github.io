import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// Builds to ../journey so GitHub Pages serves the experience at /journey/
export default defineConfig({
  plugins: [react()],
  base: '/journey/',
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
    port: 5173,
    open: false,
  },
})
