import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    fs: {
      // Exclude api/ directory from being served/scanned
      deny: ['**/api/**'],
    },
  },
})
