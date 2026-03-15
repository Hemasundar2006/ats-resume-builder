import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
<<<<<<< HEAD
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@react-pdf/renderer')) {
            return 'vendor-pdf';
          }
          if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('axios')) {
            return 'vendor-ui';
          }
        }
      }
    }
=======
>>>>>>> parent of b0dc85a (feat: establish initial ATS resume builder application structure with landing page, template gallery, and builder components.)
  }
})
