import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/AERO/',   // 👈 IMPORTANT: your repo name exactly
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:3200',
        changeOrigin: true
      }
    }
  }
})
