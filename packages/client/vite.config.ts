import { defineConfig } from 'vite'
import { test } from 'vitest'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // or 'node' if you don't need DOM
  },
})