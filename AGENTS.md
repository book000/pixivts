# AI Agent Working Guidelines

## Purpose

This document defines the common baseline policy for AI agents working on the pixivts project.

## Basic Policy

- Project language: English is the primary language for all project artifacts (code, comments, commit messages, PR titles/bodies, and documentation). The only exception is direct conversation with Claude Code itself, which follows the user's personal/global instructions.
- Code comments: English
- Error messages: English
- Insert a half-width space between Japanese and alphanumeric characters whenever Japanese text is unavoidable
- Commit messages: follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  - `<type>(<scope>): <description>` format
  - `<description>` is written in English
  - Example: `feat: add illust search feature`

## Decision Recording Rules

When making a technical decision, record the following:

1. Summary of the decision
2. Alternatives considered
3. The chosen alternative and the reason for choosing it
4. Alternatives not adopted and the reasons why
5. Explicit statement of assumptions, premises, and uncertainties

Do not treat assumptions as facts; always state premises and uncertainties explicitly.

## Development Workflow (Overview)

1. Understand the project
   - Read README.md
   - Check package.json
   - Review the main source code
2. Install dependencies
   - Run `pnpm install`
3. Implement changes
   - Conform to TypeScript strict mode
   - Add JSDoc comments (in English) to functions and interfaces
   - Working around issues with `skipLibCheck` is prohibited
4. Run tests and lint/format
   - Check with `pnpm lint`
   - Run tests with `pnpm test`
   - Auto-fix with `pnpm fix`

## Security / Sensitive Information

- Do not commit API keys or credentials to Git
- Do not output personal information or credentials to logs
- Do not use real credentials in test code; use mocks or dummy data

## Repository-Specific Notes

- This project is a pixiv Unofficial API Library for TypeScript
- Published as the npm package `@book000/pixivts`
- Package manager: pnpm 10.28.1
- Test framework: Jest
- Lint: ESLint (@book000/eslint-config)
- Format: Prettier (semi: false, singleQuote: true)
- Documentation: auto-generated with TypeDoc and hosted on GitHub Pages
- `src/index.ts` is auto-generated using ctix (manual edits prohibited)
- Renovate is enabled for automatic dependency updates
