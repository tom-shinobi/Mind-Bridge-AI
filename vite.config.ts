import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    host: true,
    allowedHosts: true
  },
  preview: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    allowedHosts: true
  }
})

