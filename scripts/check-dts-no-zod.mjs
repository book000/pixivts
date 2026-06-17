#!/usr/bin/env node
/**
 * CI guard: verifies that the built .d.ts files do not contain any reference to zod.
 *
 * zod is intentionally a devDependency of @book000/pixivts. Public types are
 * generated via z.infer<> and should be structurally inlined by rolldown-plugin-dts
 * (used by tsdown). If zod leaks into the output .d.ts files, downstream consumers
 * would need to install zod just to use our types.
 *
 * This script fails the build if any of the following patterns appear in dist/*.d.ts:
 *   - import("zod")
 *   - from "zod"
 *   - from 'zod'
 *   - require("zod")
 *   - require('zod')
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import nodePath from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const CORE_DIST = nodePath.join(__dirname, '..', 'packages', 'core', 'dist')

/**
 * Recursively collects .d.ts files from a directory.
 *
 * @param {string} directory - Directory to search
 * @returns {string[]} Absolute paths to .d.ts files
 */
function collectDts(directory) {
  /** @type {string[]} */
  const results = []
  for (const entry of readdirSync(directory)) {
    const full = nodePath.join(directory, entry)
    if (statSync(full).isDirectory()) {
      results.push(...collectDts(full))
    } else if (entry.endsWith('.d.ts') || entry.endsWith('.d.cts')) {
      results.push(full)
    }
  }
  return results
}

const ZOD_PATTERNS = [
  /from\s+['"]zod['"]/,
  /import\(['"]zod['"]\)/,
  /require\(['"]zod['"]\)/,
]

let hadError = false

for (const file of collectDts(CORE_DIST)) {
  const content = readFileSync(file, 'utf8')
  for (const pattern of ZOD_PATTERNS) {
    if (pattern.test(content)) {
      console.error(
        `ERROR: zod reference found in ${nodePath.relative(process.cwd(), file)}`
      )
      console.error(`  Pattern: ${pattern}`)
      hadError = true
    }
  }
}

if (hadError) {
  console.error(
    '\nzod leaked into the distributed .d.ts files. ' +
      'Ensure all public types are exported as type-only re-exports of z.infer<> results ' +
      'so that rolldown-plugin-dts can inline them structurally.'
  )
  process.exit(1)
}

console.log('dts:guard passed — no zod references in dist/*.d.ts')
