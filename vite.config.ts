import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import packageJson from './package.json'

export default defineConfig({
  define: { __ATLAS_VERSION__: JSON.stringify(packageJson.version) },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon-64.png',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-512.png',
        'icon-maskable-512.png',
        'icon-dark-192.png',
        'icon-dark-512.png',
        'icon-dark-maskable-512.png',
        'apple-touch-icon-dark.png',
        'favicon-dark-64.png',
        'manifest-light.webmanifest',
        'manifest-dark.webmanifest',
        'fonts/AradVF.woff2',
      ],
      manifest: false,
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
})
