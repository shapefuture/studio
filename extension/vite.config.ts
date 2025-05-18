
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
        popup: resolve(__dirname, 'src/popup_src/index.html'),
        // If content_script.tsx needs to be bundled by Vite (e.g., if it uses React heavily and JSX)
        content_script: resolve(__dirname, 'src/content_scripts/content_script.tsx'),
        // service_worker.ts will likely be compiled separately using tsc or esbuild
        // as Vite is primarily for front-end SPA/MPA bundling.
        // However, we can try to bundle it if it doesn't have Node.js specific dependencies
        // or if we configure Vite correctly for library mode output for it.
        // For simplicity, for now, we assume service_worker.ts is handled by a separate build step (e.g. tsc)
        // and manifest.json points to its compiled JS output.
        // If we want Vite to bundle service_worker.ts:
        // service_worker: resolve(__dirname, 'src/service_worker/service_worker.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content_script') {
            return 'content_scripts/[name].js';
          }
          if (chunkInfo.name === 'service_worker') {
            return 'service_worker/[name].js';
          }
          return 'popup_src/assets/[name]-[hash].js';
        },
        chunkFileNames: 'popup_src/assets/[name]-[hash].js',
        assetFileNames: 'popup_src/assets/[name]-[hash].[ext]',
      },
    },
    // sourcemap: 'inline', // Enable inline source maps for easier debugging in extensions
  },
  // Ensure env variables are accessible if needed (e.g. for Cloudflare worker URL)
  // define: {
  //   'process.env.CLOUDFLARE_WORKER_URL': JSON.stringify(process.env.CLOUDFLARE_WORKER_URL)
  // }
});
