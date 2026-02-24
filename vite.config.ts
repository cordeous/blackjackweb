import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Forward /health, /agents, /run to the local FastAPI server
      '/health': 'http://localhost:8000',
      '/agents': 'http://localhost:8000',
      '/run':    'http://localhost:8000',
    },
  },
})
