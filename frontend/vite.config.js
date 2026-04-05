import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Cesium plugin removed — replaced with lightweight Three.js 3D city
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
