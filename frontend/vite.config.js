import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import generateSitemap from 'vite-plugin-sitemap'

// All public routes — private routes (/profile, /result, /ats-result, /analyze) are excluded
const publicRoutes = [
  '/',
  '/check-ats-score',
  '/templates',
  '/pricing',
  '/help-center',
  '/Privacy-Policy',
  '/Terms-of-Service',
  '/status',
  '/login',
  '/signup',
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    generateSitemap({
      hostname: 'https://www.resumeaionline.in',
      dynamicRoutes: publicRoutes,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString().split('T')[0],
      // Custom priority per route
      generateRobotsTxt: false, // We manage our own robots.txt
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          gsap: ['gsap'],
          icons: ['lucide-react', 'react-icons']
        }
      }
    }
  }
})