import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  // VITE_BASE_PATH is set by the GitHub Actions workflow to /<repo-name>/
  // Falls back to '/' for local dev
  base: process.env.VITE_BASE_PATH ?? '/',
})
