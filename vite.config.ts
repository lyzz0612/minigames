import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@components': resolve(__dirname, 'src/components'),
      '@systems': resolve(__dirname, 'src/systems'),
      '@scenes': resolve(__dirname, 'src/scenes'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
})
