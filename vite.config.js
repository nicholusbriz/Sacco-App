import { defineConfig } from 'vite';

export default defineConfig({
  // Development server configuration
  server: {
    port: 3000,
    open: true
  },

  // Build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  },

  // Root directory (where your index.html is)
  root: 'src/public',

  // Base path for deployment
  base: '/',

  // Resolve configuration
  resolve: {
    alias: {
      '@': '/src',
      '@js': '/src/js',
      '@css': '/src/css',
      '@public': '/src/public'
    }
  }
});
