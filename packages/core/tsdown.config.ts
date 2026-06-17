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
  // zod is a devDependency used only in src/schemas/ and is not re-exported
  // from the public barrel; Rolldown tree-shakes it out. scripts/check-dts-no-zod.mjs
  // verifies that no zod reference leaks into the dist .d.ts files.
})
