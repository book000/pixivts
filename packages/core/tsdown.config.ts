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
  // zod is a devDependency used only for schema definitions in src/schemas/.
  // It is never imported in a value position from the public barrel (src/index.ts),
  // so Rolldown tree-shakes it out of the JS bundle automatically.
  // The dts:guard script (scripts/check-dts-no-zod.mjs) verifies this at CI time.
})
