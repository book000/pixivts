import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'db-mysql',
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
    },
  },
})
