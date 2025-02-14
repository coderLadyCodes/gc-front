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
        //rewrite: path => path.replace(/^\/api/, '')  // THIS IS FOR PRODUCTION
          secure: false,  // Add this line FOR LOCAL TESTS ONLY (NOT FOR PRODUCTION)
          rewrite: path => path.replace(/^\/api/, '/api') // Ensure it keeps the "/api" prefix FOR LOCAL TESTS ONLY (NOT FOR PRODUCTION)
      }
    },
    watch: {  // NOT SURE
      usePolling: true
    }
  },
})
