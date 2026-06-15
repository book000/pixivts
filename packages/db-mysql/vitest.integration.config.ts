import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'db-mysql-integration',
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    // Real MySQL connections take longer than unit tests.
    testTimeout: 60_000,
    hookTimeout: 30_000,
    // Run serially to avoid race conditions on shared MySQL state.
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
})
