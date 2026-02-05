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
    sourcemap: true
  },
  
  // Public directory configuration
  publicDir: 'src/public',
  
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
