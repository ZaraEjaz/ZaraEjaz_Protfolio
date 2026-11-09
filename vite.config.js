import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // three.js + R3F in one named, lazily loaded chunk
        manualChunks: (id) => (/node_modules\/(three|@react-three|three-stdlib|troika)/.test(id) ? 'three' : undefined),
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
