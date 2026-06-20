import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "apple-touch-icon-180x180.png",
      ],
      manifest: {
        name: "SnugWeek",
        short_name: "SnugWeek",
        description:
          "Затишний тижневик-щоденник: тижневий розворот, трекери настрою, сітка звичок.",
        lang: "uk",
        display: "standalone",
        start_url: "/",
        scope: "/",
        background_color: "#faf6ef",
        theme_color: "#faf6ef",
        orientation: "portrait-primary",
        categories: ["productivity", "lifestyle"],
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Додати справу",
            short_name: "Справа",
            description: "Швидко додати справу на сьогодні",
            url: "/?action=add",
            icons: [
              { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            ],
          },
          {
            name: "Сьогодні",
            short_name: "Сьогодні",
            description: "Відкрити поточний тиждень",
            url: "/?action=today",
            icons: [
              { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
            ],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,ico,webmanifest}"],
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith(".woff2"),
            handler: "CacheFirst",
            options: {
              cacheName: "snugweek-fonts",
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "firebase", test: /node_modules[\\/]@?firebase[\\/]/ },
          ],
        },
      },
    },
  },
});
