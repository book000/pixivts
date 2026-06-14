# GitHub Copilot Instructions

## Project Overview

- Purpose: pixiv Unofficial API Library for TypeScript
- Main features: provides a TypeScript library using the private API used by the pixiv iOS app
- Target users: TypeScript/Node.js developers who want to use the pixiv API

## Common Rules

- Project language: English is the primary language for all project artifacts (code, comments, commit messages, PR titles/bodies, and documentation). The only exception is direct conversation with Claude Code itself, which follows the user's personal/global instructions.
- PRs and commits follow Conventional Commits (`<description>` written in English).
- Insert a half-width space between Japanese and alphanumeric characters whenever Japanese text is unavoidable.

## Tech Stack

- Language: TypeScript (es2020)
- Package manager: pnpm
- Test framework: Jest
- Lint: ESLint (@book000/eslint-config)
- Format: Prettier
- Documentation generation: TypeDoc
- Main dependencies: axios, mysql2, typeorm

## Coding Conventions

- Formatting: use Prettier
  - No semicolons (`semi: false`)
  - Single quotes (`singleQuote: true`)
  - Tab width 2 (`tabWidth: 2`)
  - Line endings: LF
- Naming conventions:
  - Classes: PascalCase
  - Functions/variables: camelCase
  - Constants: UPPER_SNAKE_CASE
- TypeScript:
  - strict mode enabled
  - Working around issues with `skipLibCheck` is prohibited
  - Functions and interfaces have docstrings (JSDoc) written in English
- Comments: written in English
- Error messages: written in English

## Development Commands

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Clean
pnpm clean

# Compile
pnpm compile

# Run tests
pnpm test

# Lint check
pnpm lint

# Lint fix
pnpm fix

# Prettier check
pnpm lint:prettier

# Prettier fix
pnpm fix:prettier

# ESLint check
pnpm lint:eslint

# ESLint fix
pnpm fix:eslint

# TypeScript type check
pnpm lint:tsc

# Generate documentation
pnpm generate-docs
```

## Testing Policy

- Test framework: Jest
- Test files: `*.test.ts`
- Coverage collection target: `src/**/*.ts` (excluding `src/index.ts`, `src/**/*.test.ts`, and `src/types/**`)
- When adding a new feature, add a corresponding test

## Security / Sensitive Information

- Do not commit API keys or credentials to Git.
- Do not output personal information or credentials to logs.
- Do not use real credentials in test code; use mocks or dummy data.

## Documentation Updates

Update the following documents as needed:

- README.md: when adding features or changing usage
- TypeDoc comments: when changing public APIs
- CHANGELOG (if present): on version bumps

## Repository-Specific Notes

- This project is published as an npm package.
- API documentation is hosted on GitHub Pages.
- TypeDoc documentation generation references the content of the `master` branch.
- The index file is auto-generated using ctix.
- There is a feature using TypeORM to save responses to a MySQL database.
- Renovate is enabled for automatic dependency updates.
