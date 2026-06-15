import nodePath from 'node:path'
import { fileURLToPath } from 'node:url'
import eslintConfig from '@book000/eslint-config'

const __dirname = nodePath.dirname(fileURLToPath(import.meta.url))

export default [
  ...eslintConfig,
  {
    ignores: ['**/dist/**', '**/coverage/**', 'docs/**'],
  },
  {
    // Use projectService to auto-discover each package's tsconfig.json.
    // project: false cancels @book000/eslint-config's project setting so the
    // two options don't conflict. Files outside any tsconfig fall back to the
    // default project (no type-aware rules, syntax rules still apply).
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parserOptions: {
        project: false,
        projectService: {
          // Files outside src/ (tests, configs) are not included in any
          // package tsconfig, so they need the default project fallback.
          allowDefaultProject: [
            // core tests
            'packages/core/tests/auth.test.ts',
            'packages/core/tests/client.test.ts',
            'packages/core/tests/http.test.ts',
            'packages/core/tests/paginated.test.ts',
            'packages/core/tests/params.test.ts',
            'packages/core/tests/result.test.ts',
            'packages/core/tests/setup.ts',
            'packages/core/tests/e2e/pixiv.e2e.test.ts',
            'packages/core/tests/msw/handlers.ts',
            // core config
            'packages/core/tsup.config.ts',
            'packages/core/vitest.config.ts',
            'packages/core/vitest.e2e.config.ts',
            // db-mysql tests
            'packages/db-mysql/tests/recorder.test.ts',
            'packages/db-mysql/tests/integration/recorder.integration.test.ts',
            // db-mysql config
            'packages/db-mysql/drizzle.config.ts',
            'packages/db-mysql/tsup.config.ts',
            'packages/db-mysql/vitest.config.ts',
            'packages/db-mysql/vitest.integration.config.ts',
            // root
            '*.mjs',
            '*.ts',
          ],
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 30,
        },
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    // Forbid .js extensions on relative imports (moduleResolution: bundler).
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: String.raw`^\.{1,2}/.*\.js$`,
              message:
                'Use extensionless relative imports (moduleResolution: bundler handles resolution).',
            },
          ],
        },
      ],
    },
  },
]
