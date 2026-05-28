import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost",
        changeOrigin: true,
        secure: false
      },
      "/socket.io": {
        target: "http://localhost",
        changeOrigin: true,
        ws: true,
        secure: false
      },
      "/list-files": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false
      },
      "/read-files": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false
      },
      "/update-files": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false
      },
      "/create-file": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false
      }
    }
  }
})
