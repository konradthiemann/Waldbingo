/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'

// Waldbingo PWA – Vite-Konfiguration.
// Wichtig (Offline-Modell "online erstellen, offline spielen"):
//  - App-Shell wird precached (CacheFirst über Workbox precache).
//  - Externe APIs: NetworkFirst mit kurzem Timeout + Cache-Fallback.
//  - OpenStreetMap-Kacheln werden BEWUSST NICHT gecacht (Nutzungsrichtlinie);
//    es gibt daher keine runtimeCaching-Regel für tile.openstreetmap.org.
export default defineConfig({
  base: './',
  // Dev: /api an den lokalen Einladungs-Server (npm run server) weiterreichen.
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8787', changeOrigin: true },
    },
  },
  plugins: [
    react(),
    // HTTPS im Dev/Preview-Server (selbst-signiert) – nötig, damit Geolocation
    // am Handy über die Netzwerk-URL funktioniert (iOS verlangt Secure Context).
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Waldbingo',
        short_name: 'Waldbingo',
        description:
          'Dynamisches Wald-Bingo für Familien – passt sich an Ort, Jahreszeit und Wetter an. Offline-fähig.',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#eaf1e8',
        theme_color: '#1f5b38',
        lang: 'de',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.endsWith('open-meteo.com'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 6 },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'nominatim.openstreetmap.org',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nominatim',
              networkTimeoutSeconds: 6,
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === 'api.inaturalist.org',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'inaturalist-api',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.hostname.endsWith('wikipedia.org') ||
              url.hostname.endsWith('wikimedia.org') ||
              url.hostname.endsWith('wikidata.org') ||
              url.hostname === 'api.phylopic.org',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'wiki-phylopic',
              networkTimeoutSeconds: 8,
              expiration: { maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Artenfotos/-Illustrationen: lange cachen (werden zusätzlich als
            // Blob in IndexedDB gespeichert; dies ist nur der HTTP-Cache).
            urlPattern: ({ url }) =>
              url.hostname.endsWith('inaturalist.org') ||
              url.hostname.includes('inaturalist-open-data') ||
              url.hostname.endsWith('phylopic.org'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'arten-medien',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
