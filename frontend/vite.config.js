import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/AERO/', // repo name
  plugins: [react()],
  server: {
    port: 3000
    // ❌ remove proxy in production
  }
})
