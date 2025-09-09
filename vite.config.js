import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.avif'], // fallback
  server: {
    port: 5174,      // frontend en 5174
    strictPort: true,
    host: true
  },
  preview: {
    port: 5174,
    host: true
  }
})
