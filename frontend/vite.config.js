import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all /api requests to backend
      "/api": {
        target: "http://localhost:5000", // backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});