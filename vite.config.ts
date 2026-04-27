import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // هذا السطر هو السحر الذي يحول @ إلى مسار مجلد src
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

