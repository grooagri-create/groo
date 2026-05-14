import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    // Ensure only one React instance
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173, // Change port to bypass cache
    strictPort: true,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: http: https: http://localhost:* http://127.0.0.1:* http://localhost:5000 http://127.0.0.1:5000; font-src 'self' data: https:; connect-src 'self' https: ws: wss: http://localhost:* http://127.0.0.1:* http://localhost:5000 http://127.0.0.1:5000; frame-src 'self' https:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self';",
      // Force no caching in development
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    rollupOptions: {
      output: {
        // Split dependencies into separate chunks for faster iOS loading
        // iOS Safari's JavaScriptCore parses JS much slower than Chrome/V8.
        // A single 5-10MB vendor.js causes 5-15s loading screen on iOS.
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;

          // Firebase - large, load separately
          if (id.includes('firebase') || id.includes('@firebase')) {
            return 'vendor-firebase';
          }

          // Framer Motion - heavy animation library
          if (id.includes('framer-motion')) {
            return 'vendor-framer';
          }

          // GSAP - animation library (only used in landing page)
          if (id.includes('gsap')) {
            return 'vendor-gsap';
          }

          // Map libraries
          if (id.includes('leaflet') || id.includes('react-leaflet') || id.includes('mapbox')) {
            return 'vendor-maps';
          }

          // Socket.io client
          if (id.includes('socket.io')) {
            return 'vendor-socket';
          }

          // Core React + Router (smallest, loaded first)
          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('react-router')
          ) {
            return 'vendor-react';
          }

          // Everything else in a general vendor chunk
          return 'vendor';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Adjust limit for split chunks (each chunk should now be smaller)
    chunkSizeWarningLimit: 800,
    sourcemap: false,
    cssCodeSplit: true,
    // es2018 is supported by iOS 13+ (much broader compatibility than es2020)
    // es2020 breaks on iOS 13/14 with certain features
    target: 'es2018',
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: [
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
    ],
  },
})