import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    proxy: {
      '/api': mode === 'development'
        ? 'http://localhost:5000'
        : 'https://staurants-server.onrender.com'
    }
  }
}))
