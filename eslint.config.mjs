import nodePath from 'node:path'
import { fileURLToPath } from 'node:url'
import eslintConfig from '@book000/eslint-config'
import jsdoc from 'eslint-plugin-jsdoc'

const __dirname = nodePath.dirname(fileURLToPath(import.meta.url))

export default [
  ...eslintConfig,
  {
    ignores: ['**/dist/**', '**/coverage/**', 'docs-out/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
    languageOptions: {
      parserOptions: {
        // project: false overrides @book000/eslint-config's project setting.
        project: false,
        projectService: {
          allowDefaultProject: [
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
    // Require JSDoc on every exported interface property signature.
    // This enforces documentation of public API surface (TSDoc style).
    plugins: { jsdoc },
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          contexts: [
            'TSInterfaceDeclaration > TSInterfaceBody > TSPropertySignature',
          ],
          require: {
            FunctionDeclaration: false,
            MethodDefinition: false,
            ClassDeclaration: false,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
          },
          checkConstructors: false,
          checkGetters: false,
          checkSetters: false,
          publicOnly: true,
        },
      ],
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
