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
          // Files outside src/ (tests, configs) are not in any package tsconfig,
          // so they fall back to the default project. Glob patterns (via minimatch)
          // are supported — no need to list each file individually.
          allowDefaultProject: [
            'packages/*/tests/*.ts',
            'packages/*/tests/*/*.ts',
            'packages/*/*.config.ts',
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
