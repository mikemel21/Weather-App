import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', //'Weather-App',
  plugins: [vue()],
  server: {
    hmr: {
      overlay: false
    }
  }
})
