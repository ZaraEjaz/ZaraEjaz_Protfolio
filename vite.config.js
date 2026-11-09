import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // React gets its own chunk; three.js + R3F + their helpers form one lazily loaded chunk.
        // (Without the explicit react group, Rollup folds react-dom into the 3D chunk because R3F shares it,
        // and the whole 3D bundle then has to load before first paint.)
        manualChunks: (id) => {
          // Vite's lazy-import helper must live in an always-loaded chunk, or the entry ends up
          // importing the 3D chunk just to lazy-load anything
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id) || /vite\/preload-helper|commonjsHelpers/.test(id)) return 'react';
          if (/node_modules\/(three|@react-three|three-stdlib|troika|@monogrid|bidi-js|webgl-sdf-generator|react-reconciler|its-fine|suspend-react|zustand|maath|meshline|camera-controls|stats-gl|tunnel-rat|detect-gpu|hls\.js|@use-gesture)/.test(id))
            return 'three';
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 1100, // the 3D chunk (~1 MB raw, ~300 kB gzip) is lazy-loaded; the initial JS is ~120 kB gzip
  },
})
