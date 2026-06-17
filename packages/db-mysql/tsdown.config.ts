import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'node',
  dts: true,
  clean: true,
  // Keep ESM output as index.js and CJS as index.cjs to match package.json exports.
  // tsdown sets fixedExtension: true on the node platform by default, which would
  // emit index.mjs instead of index.js for ESM.
  fixedExtension: false,
  outDir: 'dist',
  // drizzle-orm + mysql2 (deps) and @book000/pixivts (peerDep) are automatically
  // externalised by tsdown; this makes the intent explicit.
  deps: { neverBundle: ['drizzle-orm', 'mysql2', '@book000/pixivts'] },
})
