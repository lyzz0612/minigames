import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  define: {
    __PLATFORM__: JSON.stringify('web')
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    target: 'es2019',
    minify: 'esbuild',
    outDir: 'dist/h5',
    sourcemap: false
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }
})
