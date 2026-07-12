import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Pointing local dev server proxies to AWS server
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    cors: true,
    proxy: {
      "/api": {
        target: "http://13.127.231.53.nip.io",
        changeOrigin: true,
        secure: false
      },
      "/socket.io": {
        target: "http://13.127.231.53.nip.io",
        changeOrigin: true,
        ws: true,
        secure: false
      },
      "/list-files": {
        target: "http://13.127.231.53.nip.io",
        changeOrigin: true,
        secure: false
      },
      "/read-files": {
        target: "http://13.127.231.53.nip.io",
        changeOrigin: true,
        secure: false
      },
      "/update-files": {
        target: "http://13.127.231.53.nip.io",
        changeOrigin: true,
        secure: false
      },
      "/create-file": {
        target: "http://13.127.231.53.nip.io",
        changeOrigin: true,
        secure: false
      }
    }
  }
})
