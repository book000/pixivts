# Gemini CLI Working Guidelines

## Purpose

This document defines the context and working policy for Gemini CLI (a command-line AI agent tool provided by Google; see https://ai.google.dev/gemini-api/docs/developer-tools) when working on the pixivts project.

## Output Style

- Language: English
- Tone: concise and technical
- Format: Markdown

## Common Rules

- Conduct conversations in English
- PRs and commits follow Conventional Commits (`<description>` written in English)
- Insert a half-width space between Japanese and alphanumeric characters whenever Japanese text is unavoidable

## Project Overview

- Purpose: pixiv Unofficial API Library for TypeScript
- Main features:
  - Wraps the private API used by the pixiv iOS app in TypeScript
  - Search and retrieval of illusts, manga, and novels
  - Retrieval of user information
  - Adding and removing bookmarks
  - Retrieval of ranking information
  - Retrieval of ugoira (animated illust) metadata
  - Saving responses to a MySQL database

## Coding Conventions

- Formatting: Prettier
  - No semicolons (`semi: false`)
  - Single quotes (`singleQuote: true`)
  - Tab width 2 (`tabWidth: 2`)
  - Line endings: LF
- Naming conventions:
  - Classes: PascalCase
  - Functions/variables: camelCase
  - Constants: UPPER_SNAKE_CASE
- Comments: written in English
- Error messages: written in English
- TypeScript:
  - strict mode enabled
  - Working around issues with `skipLibCheck` is prohibited
  - Functions and interfaces have docstrings (JSDoc) written in English

## Development Commands

```bash
# Install dependencies
pnpm install

# Build
pnpm build

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

# Clean
pnpm clean
```

## Notes

- Do not commit API keys or credentials to Git
- Do not output personal information or credentials to logs
- Prefer existing coding rules and patterns
- Do not add commits or updates to existing Renovate-created pull requests

## Repository-Specific Notes

- This project is published as the npm package `@book000/pixivts`
- API documentation is hosted on GitHub Pages (https://book000.github.io/pixivts/)
- `src/index.ts` is auto-generated using ctix. Do not edit it manually
- There is a feature using TypeORM to save responses to a MySQL database
- The package manager is pnpm 10.28.1
- The test framework is Jest
- Renovate is enabled for automatic dependency updates
