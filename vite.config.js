import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { normalizeApiBaseUrl } from './src/config/apiUrl.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  normalizeApiBaseUrl(env.VITE_API_BASE_URL)

  return {
    plugins: [react()],
  }
})
