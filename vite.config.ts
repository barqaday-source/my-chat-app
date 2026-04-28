import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // ✅ هذا السطر يضمن أن المتصفح يجد ملفات الواجهة في أي بيئة
  base: '/', 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // التأكد من أن المجلد الناتج هو dist كما هو محدد في firebase.json
    outDir: 'dist',
  }
});

