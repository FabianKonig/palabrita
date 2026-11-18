/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // The user decides when to update (UpdateBanner), no silent reload.
      registerType: "prompt",
      includeAssets: ["icons/logo.svg", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Palabrita",
        short_name: "Palabrita",
        description: "Spanisch-Vokabeln für Mexiko und Guatemala",
        lang: "de",
        display: "standalone",
        start_url: "./",
        scope: "./",
        theme_color: "#0d9488",
        background_color: "#f8fafa",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // App shell and all vocabulary files are available offline.
        globPatterns: ["**/*.{js,css,html,svg,png,json,webmanifest}"],
        // No runtime caching: requests to de/es.wiktionary.org are neither
        // intercepted nor cached.
      },
    }),
  ],
  base: "./",
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
