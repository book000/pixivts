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
    // Override the project-based TypeScript parser configuration from
    // @book000/eslint-config with projectService, which auto-discovers
    // the nearest tsconfig.json for each file in the monorepo.
    // This removes the requirement for a single root tsconfig.json that
    // lists every source file.
    // Note: project must be explicitly set to undefined here; if both
    // project and projectService are set, @typescript-eslint throws a
    // fatal parsing error.
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parserOptions: {
        // projectService: true uses TypeScript's language service to
        // auto-discover the nearest tsconfig.json for each file in the
        // monorepo, replacing the single-root-tsconfig requirement from
        // @book000/eslint-config's parserOptions.project: ["tsconfig.json"].
        // project: false explicitly cancels the earlier "project" setting so
        // the two options do not conflict (ts-eslint throws if both are set).
        // Files not covered by any tsconfig (tests, vitest configs, etc.) fall
        // back to a default project and are parsed without type-aware rules.
        project: false,
        projectService: {
          // allowDefaultProject lets files outside any tsconfig.json (tests,
          // vitest configs, build configs, etc.) be parsed with a minimal
          // default TypeScript project instead of causing a fatal parse error.
          // Type-aware lint rules are disabled for these files; syntax rules
          // still apply. Source files under src/ are covered by each package's
          // tsconfig.json and receive full type-aware linting.
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
          // Raised from the default of 8 to cover all test and config files.
          // This is intentionally verbose to remain visible as a maintenance cost.
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 30,
        },
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    // Forbid .js extensions on relative imports.
    // moduleResolution: bundler in tsconfig.base.json resolves extensionless
    // imports at compile time; tsup and vitest both handle them at runtime.
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
