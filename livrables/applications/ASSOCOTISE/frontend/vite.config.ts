import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Application installable et utilisable sur une connexion instable : la coquille de
    // l'application est servie depuis le cache, les données restant gérées par la
    // persistance hors-ligne de Firestore (voir lib/firebase.ts).
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icone-192.png', 'icone-512.png'],
      manifest: {
        name: 'AssoCotise',
        short_name: 'AssoCotise',
        description: 'Gestion financière associative : membres, cotisations et dépenses.',
        lang: 'fr',
        theme_color: '#4338ca',
        background_color: '#4338ca',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Rien n'est mis en cache côté requêtes Firebase : le SDK gère lui-même son cache
        // local et sa file d'attente d'écritures hors-ligne.
        runtimeCaching: [],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 3010,
  },
})
