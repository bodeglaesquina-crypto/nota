import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// PWA: la app se instala en el móvil ("Añadir a pantalla de inicio") y abre sin conexión.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Pendientes del negocio",
        short_name: "Pendientes",
        description: "Tareas compartidas entre socios",
        theme_color: "#0F766E",
        background_color: "#F3F5F7",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      }
    })
  ]
});
