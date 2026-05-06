import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    // Strip console.log and debugger statements in production to prevent PII leaking
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    sourcemap: mode !== 'production', // Only sourcemaps in dev
    rollupOptions: {
      output: {
        // Code splitting for faster initial load
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          charts: ['recharts'],
          motion: ['motion'],
          ui: ['lucide-react'],
        },
      },
    },
  },
}))

