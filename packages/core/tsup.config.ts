import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  treeshake: true,
  outDir: 'dist',
  // zod is a devDependency used only for schema definitions in src/schemas/.
  // It is never imported in a value position from the public barrel (src/index.ts),
  // so esbuild tree-shakes it out of the JS bundle automatically.
  // The dts:guard script (scripts/check-dts-no-zod.mjs) verifies this at CI time.
  external: [],
})
