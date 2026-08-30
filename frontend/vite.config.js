import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import generateSitemap from 'vite-plugin-sitemap'

// All public routes — private routes (/profile, /result, /ats-result, /admin) are excluded
const publicRoutes = [
  '/',
  '/check-ats-score',
  '/templates',
  '/analyze',
  '/pricing',
  '/about',
  '/recruitment',
  '/help-center',
  '/status',
  '/privacy-policy',
  '/terms-of-service',
]

// https://vite.dev/config/
export default defineConfig({
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
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
  esbuild: {
    drop: ['console', 'debugger'],
  },
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
