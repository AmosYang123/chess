import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: true,
      mangle: true
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true
  },
  preview: {
    port: 4173
  }
})
