import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API requests to the Go backend running on :8080.
    // This avoids CORS in development and mirrors a production reverse-proxy setup.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
