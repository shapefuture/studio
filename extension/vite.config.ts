
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist'), // Output to extension/dist
    emptyOutDir: true, // Clean the output directory before building
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup_src/popup.html'), // Changed from index.html to popup.html
        content_script: resolve(__dirname, 'src/content_scripts/content_script.tsx'),
        service_worker: resolve(__dirname, 'src/service_worker/service_worker.ts'), // Enabled service worker bundling
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content_script') {
            return 'content_scripts/[name].js';
          }
          if (chunkInfo.name === 'service_worker') {
            return 'service_worker/[name].js';
          }
          // For popup related JS, output to popup_src/assets
          if (chunkInfo.name === 'popup') { // Or whatever Vite names the entry chunk for popup.html
            return 'popup_src/assets/[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js'; // Default for other chunks if any
        },
        chunkFileNames: 'popup_src/assets/[name]-[hash].js', // Chunks related to popup
        assetFileNames: (assetInfo) => {
          // CSS for popup goes into popup_src/assets
          if (assetInfo.name?.endsWith('.css') && assetInfo.source?.includes('#root')) { // Heuristic for popup CSS
            return 'popup_src/assets/[name]-[hash].[ext]';
          }
          // Other assets (images, fonts loaded by JS/CSS)
          return 'assets/[name]-[hash].[ext]';
        }
      },
    },
    // sourcemap: 'inline', // Enable inline source maps for easier debugging in extensions
  },
  // Ensure env variables are accessible if needed (e.g. for Cloudflare worker URL)
  // define: {
  //   'process.env.CLOUDFLARE_WORKER_URL': JSON.stringify(process.env.CLOUDFLARE_WORKER_URL)
  // }
});
