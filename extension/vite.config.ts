
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files based on mode (development, production)
  // Vite will automatically load .env, .env.development, .env.production
  // Place VITE_CLOUDFLARE_WORKER_URL in your .env files
  const env = loadEnv(mode, process.cwd(), ''); // Load all env vars, not just VITE_ prefixed

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        // Add aliases from tsconfig.json if not already covered by '@'
        '@core_logic': resolve(__dirname, 'src/core_logic'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@popup_src': resolve(__dirname, 'src/popup_src'),
        '@components': resolve(__dirname, 'src/popup_src/components'),
        '@views': resolve(__dirname, 'src/popup_src/views'),
        '@ui_components': resolve(__dirname, 'src/ui_components'),
        '@content_scripts': resolve(__dirname, 'src/content_scripts'),
        '@service_worker': resolve(__dirname, 'src/service_worker'),
        // Ensure lib alias is present if used by other imports
        '@lib': resolve(__dirname, 'src/lib'),

      },
    },
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'src/popup_src/popup.html'),
          content_script: resolve(__dirname, 'src/content_scripts/content_script.tsx'),
          service_worker: resolve(__dirname, 'src/service_worker/service_worker.ts'),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'content_script') {
              return 'content_scripts/[name].js';
            }
            if (chunkInfo.name === 'service_worker') {
              return 'service_worker/[name].js';
            }
            if (chunkInfo.name === 'popup') {
              return 'popup_src/assets/[name]-[hash].js';
            }
            return 'assets/[name]-[hash].js';
          },
          chunkFileNames: 'popup_src/assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css') && assetInfo.source?.includes('#root')) {
              return 'popup_src/assets/[name]-[hash].[ext]';
            }
             // Handle icons properly if they are in public/icons
            if (assetInfo.name?.startsWith('icons/')) {
              return 'icons/[name].[ext]';
            }
            return 'assets/[name]-[hash].[ext]';
          },
        },
      },
      // sourcemap: mode === 'development' ? 'inline' : false, // Inline sourcemaps for dev, none for prod
    },
    // Define environment variables to be available in the client-side code
    // and replaced in the service worker.
    define: {
      // This makes VITE_CLOUDFLARE_WORKER_URL available as import.meta.env.VITE_CLOUDFLARE_WORKER_URL
      // in your client-side code (popup, content script if processed by Vite)
      // For service worker, Vite's define is more robust than plugins for simple replacement.
      'import.meta.env.VITE_CLOUDFLARE_WORKER_URL': JSON.stringify(env.VITE_CLOUDFLARE_WORKER_URL),
    },
    // If you have a public directory (e.g., extension/public/) for static assets like icons
    // ensure it's configured correctly or assets are handled by the build process.
    // By default, Vite serves from `public` at the project root.
    // For an extension, you might copy these assets manually or configure Vite to do so.
    // If icons are in `extension/public/icons`, Vite should copy `public` to `dist`.
    // `assetFileNames` in `rollupOptions.output` can also manage where these go.
  };
});
