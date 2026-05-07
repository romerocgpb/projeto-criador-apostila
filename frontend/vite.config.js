import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Quando o Front pedir '/api/usuarios'...
      '/api': {
        target: 'http://localhost:8585', // ...manda para o Back-end na porta 3000
        changeOrigin: true,
        secure: false,
      }
    }
  }
})