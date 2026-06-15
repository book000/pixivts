import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  treeshake: true,
  outDir: 'dist',
  external: ['drizzle-orm', 'mysql2', '@book000/pixivts'],
})
