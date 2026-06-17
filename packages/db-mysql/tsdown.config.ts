import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'node',
  dts: true,
  clean: true,
  // node platform defaults fixedExtension: true, which would emit index.mjs.
  // Set false to preserve index.js as expected by package.json exports.
  fixedExtension: false,
  outDir: 'dist',
  // drizzle-orm + mysql2 (deps) and @book000/pixivts (peerDep) are auto-externalised
  // by tsdown; listed explicitly to make the intent clear.
  deps: { neverBundle: ['drizzle-orm', 'mysql2', '@book000/pixivts'] },
})
