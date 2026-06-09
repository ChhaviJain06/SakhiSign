import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API calls to the Node backend in dev so the frontend can use
    // same-origin "/api" without CORS hassles.
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
