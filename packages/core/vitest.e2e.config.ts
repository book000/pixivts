import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'core-e2e',
    globals: true,
    environment: 'node',
    include: ['tests/e2e/**/*.test.ts'],
    // Real network calls take longer than unit tests.
    testTimeout: 120_000,
    hookTimeout: 30_000,
    // Run files one at a time to avoid pixiv API rate limits.
    fileParallelism: false,
  },
})
