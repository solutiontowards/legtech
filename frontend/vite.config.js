import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // This tells the Vite dev server to correctly handle SPA routing.
  // It ensures that refreshing any page (like /retailer/wallet) works correctly.
  appType: "spa",

  server: {
    // This proxy is a best practice for MERN development. It forwards API
    // requests from your frontend to your backend server, avoiding CORS issues.
    proxy: {
      "/api": {
        target: "http://localhost:4000", // Your backend server address
        changeOrigin: true,
      },
    },
  },
});