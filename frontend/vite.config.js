import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This ensures that for any route not found, index.html is served.
    historyApiFallback: true,
  },
})