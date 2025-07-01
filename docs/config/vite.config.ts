import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({
    jsxImportSource: '@emotion/react',
    babel: {
      plugins: ['@emotion/babel-plugin'],
    },
  })],
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'es2020',
    format: 'esm'
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    host: true,
    strictPort: false
  }
})