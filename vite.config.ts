import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

/* The API host is fixed rather than read from the environment: this proxy
   exists to mirror what Netlify does in production (see public/_redirects),
   and the two only stay in step if they name the same target. */
const API_TARGET = 'http://46.62.230.64:8081'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    /* Dev talks to /api just like the deployed site does, so the path the
       app requests is exercised locally instead of only in production.
       `/api/events` here becomes `/api/v1/events` on the backend, which is
       the same rewrite the Netlify rule performs. */
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
    },
  },
})
