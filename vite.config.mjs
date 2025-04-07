import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

// Get __dirname equivalent in an ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Base public path when served in production
  base: './',

  // Project root directory
  root: './',

  // Directory to serve as plain static assets
  publicDir: 'public',

  // Configure the server
  server: {
    port: 3000,
    open: true,
    hmr: { overlay: true },
    cors: true
  },

  // Build options
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Remove content hashing from asset file names
        assetFileNames: 'assets/[name][extname]'
      },
      onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      }
    },
    minify: 'terser',
    sourcemap: true,
    reportCompressedSize: false
  },

  // Resolve configuration for finding files
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './public/assets'),
      '@js': path.resolve(__dirname, './js'),
      '@css': path.resolve(__dirname, './css')
    }
  },

  // CSS configuration
  css: {
    devSourcemap: true
  },

  // Define global constants
  define: {
    __API_URL__: JSON.stringify(
      process.env.NODE_ENV === 'production'
        ? 'https://pokeapi.co/api/v2'
        : 'https://pokeapi.co/api/v2'
    )
  }
});