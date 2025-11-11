import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/graphql": {
        target: "https://chatbotfrontend-dhd.pages.dev", // 后端地址
        changeOrigin: true, // 允许跨域
      },
    },
  },
});
