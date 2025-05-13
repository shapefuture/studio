
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { crx } from '@crxjs/vite-plugin'
// import manifest from './public/manifest.json' assert { type: 'json' } // For CRX v3

// For a simpler setup without CRX plugin, we'll manually define entry points
// and ensure manifest.json is handled if not using crx plugin.

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // If using crx plugin for manifest v3:
    // crx({ manifest }), 
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        // For manifest v3, service worker and content scripts are often bundled by the extension tooling (like CRX)
        // or need to be specified if building manually.
        // If not using a dedicated extension plugin like crx, you might need to ensure these are treated as entry points.
        // For simplicity with Vite for a basic extension structure, Vite usually focuses on the popup/options page.
        // Service workers and content scripts might need separate bundling steps or configurations
        // if they have complex imports or need specific output formats not typical of web apps.

        // Let's assume for now that `src/service_worker.ts` and `src/content_scripts/content_script.ts`
        // are simple enough or will be handled by an extension packaging step.
        // If using a plugin like `@crxjs/vite-plugin`, it handles these entries based on manifest.json.
        // Manual configuration:
         service_worker: resolve(__dirname, 'src/service_worker.ts'),
         content_script: resolve(__dirname, 'src/content_scripts/content_script.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service_worker' || chunkInfo.name === 'content_script') {
            return `src/[name].js`; // Place them in src/ to match manifest path
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      }
    },
    // Set to false to prevent minification if debugging, true for production
    minify: false, 
  },
  // Server configuration for development (not directly used by extension popup when loaded in browser)
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000
    }
  }
})
