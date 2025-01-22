import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(
    {include: '**/*.jsx',})
  ],
  server: {
    port: 5173,
    open: true, 
    cors: true, 
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    },
    watch: {  // NOT SURE
      usePolling: true
    }
  },
})
