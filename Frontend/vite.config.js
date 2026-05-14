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
        // CHUNK SPLITTING STRATEGY — iOS Optimized but React-Safe
        //
        // ⚠️ CRITICAL: React and React-dependent libraries CANNOT be split into
        // separate chunks from each other. When loaded in parallel, 'vendor' chunk
        // may execute before 'vendor-react' initializes → `React.forwardRef` = undefined crash.
        //
        // SAFE to split: Libraries with NO React dependency (Firebase SDK, GSAP).
        // UNSAFE to split: React, Framer Motion, Socket.io (all use React internals).
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;

          // Firebase — large, fully self-contained, no React dependency in core SDK
          if (id.includes('firebase') || id.includes('@firebase')) {
            return 'vendor-firebase';
          }

          // GSAP — animation library, fully self-contained, no React dependency
          if (id.includes('gsap')) {
            return 'vendor-gsap';
          }

          // Everything else (React, ReactDOM, React-Router, Framer Motion,
          // Socket.io, Leaflet, etc.) stays in ONE vendor chunk to ensure
          // React is available when any library calls React.forwardRef / React.createElement
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