import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'core',
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/types.ts'],
    },
  },
})
