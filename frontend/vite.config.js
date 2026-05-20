import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import generateSitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    generateSitemap({
      hostname: 'https://www.resumeaionline.in'
    })
  ],
})