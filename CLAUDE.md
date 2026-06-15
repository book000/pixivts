# Claude Code Working Guidelines

## Purpose

This document defines the policies and rules for Claude Code (an AI coding assistant) when working on the pixivts project.

## Decision Recording Rules

Decisions must always be recorded in a reviewable form:

1. Summary of the decision
2. Alternatives considered
3. Alternatives not adopted and the reasons why
4. Assumptions, premises, and uncertainties
5. Whether the decision can be reviewed by another agent

Assumptions, premises, and uncertainties must be stated explicitly. Assumptions must never be treated as facts.

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

## Important Rules

- Project language: English is the primary language for all project artifacts (code, comments, commit messages, PR titles/bodies, and documentation). The only exception is direct conversation with Claude Code itself, which follows the user's personal/global instructions.
- Code comments: English
- Error messages: English
- Insert a half-width space between Japanese and alphanumeric characters (applies only where Japanese text is unavoidable, e.g. quoting real-world Japanese data)

## Environment Rules

- Commit messages: follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  - `<type>(<scope>): <description>` format
  - `<description>` is written in English
- Branch naming: follow [Conventional Branch](https://conventional-branch.github.io)
  - `<type>/<description>` format
  - Use the short form of `<type>` (feat, fix)
- When researching a GitHub repository, clone it into a temporary directory and search there
- Do not add commits or updates to existing Renovate-created pull requests

## Code Change Rules

- Insert a half-width space between Japanese and alphanumeric characters whenever Japanese text is unavoidable
- Never enable `skipLibCheck` in a TypeScript project to work around type errors
- Add and update docstrings (JSDoc) for functions and interfaces, written in English

## Consultation Rules

Claude Code can consult other agent-based AI development assistant tools such as Codex CLI and Gemini CLI. Use them according to the following:

- Codex CLI (ask-codex): an AI development assistant agent specialized in source code review and implementation strategy
  - Source code review of implementation code
  - Local technical decisions such as function design and module-internal implementation strategy
  - Decisions with broader impact, such as architecture, inter-module contracts, performance, and security
  - Verifying implementation correctness, detecting mechanical mistakes, and checking consistency with existing code
- Gemini CLI (ask-gemini): an AI research agent specialized in investigating external service specifications and the latest information
  - Decisions about external dependencies that require up-to-date information, such as SaaS specifications, language/runtime version differences, and pricing/limits/quotas
  - Verifying primary external sources, researching the latest specifications, and validating external assumptions

If another agent raises a point or objection, Claude Code must always do one of the following. Silently ignoring or rejecting it without comment is prohibited:

- Accept the feedback and revise the decision
- Reject the feedback and clearly state the reason

The following must always be done:

- Do not blindly accept another agent's suggestion; understand its rationale and reasoning
- If your own analysis differs from another agent's opinion, compare both viewpoints
- Make the final decision yourself, after comprehensively evaluating both viewpoints

## Development Commands

```bash
# Install dependencies
pnpm install

# Build (runs clean, ctix, compile, generate-docs in order)
pnpm build

# Clean
pnpm clean

# Compile
pnpm compile

# Auto-generate the index file with ctix
pnpm ctix

# Generate documentation with TypeDoc
pnpm generate-docs

# Run tests (with coverage)
pnpm test

# Lint check (runs prettier, eslint, tsc in order)
pnpm lint

# Lint fix (runs prettier, eslint, ctix in order)
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
```

## Architecture and Key Files

### Architecture Summary

- `src/pixiv.ts`: Defines the main `Pixiv` class. Provides API request methods
- `src/types/`: Type definitions for API responses
  - `pixiv-*.ts`: Common type definitions (illusts, novels, users, etc.)
  - `endpoints/`: Request/response type definitions per endpoint
- `src/saving-responses/`: Functionality for saving responses to the database
- `src/options.ts`: Option definitions for the `Pixiv` class
- `src/utils.ts`: Utility functions
- `src/checks.ts`: Check functions
- `src/index.ts`: Export file (auto-generated by ctix)

### Key Directories

- `src/`: Source code
- `src/types/`: Type definitions
- `src/types/endpoints/`: Type definitions per endpoint
- `src/saving-responses/`: Response-saving functionality
- `dist/`: Build output
- `docs/`: TypeDoc-generated documentation

## Implementation Patterns

### Recommended Patterns

- API request methods return an axios `AxiosResponse`
- Type definitions map snake_case to camelCase via snake-camel-types
- Response types are placed under `src/types/endpoints/`
- Tests are written in `*.test.ts` files
- Public APIs have JSDoc comments written in English

### Discouraged Patterns

- Enabling `skipLibCheck` to work around type errors
- Writing error messages in Japanese
- Using semicolons (Prettier is configured with `semi: false`)

## Testing

### Testing Policy

- Test framework: Jest
- Coverage collection: `src/**/*.ts` (excluding `src/index.ts`, `src/**/*.test.ts`, and `src/types/**`)
- Snapshot tests: placed under `src/__snapshots__/`

### Additional Testing Requirements

- When adding a new API method, add a corresponding test
- Include tests for edge cases and exception handling

## Documentation Update Rules

### Targets

- README.md: when adding features or changing usage
- TypeDoc comments (JSDoc): when changing public APIs
- src/index.ts: auto-generated by ctix, no manual edits needed

### Timing

- When adding/changing an API method: update the corresponding JSDoc comments
- When adding a feature: update the Features section of README.md
- When adding/changing type definitions: add/update the corresponding JSDoc comments

## Work Checklist

### Before New Work

1. Thoroughly explore and understand the project
2. Verify the working branch is appropriate — not a branch with a closed PR
3. Verify it is a new branch based on the latest remote branch
4. Verify that closed/unnecessary branches have been deleted
5. Install dependencies with `pnpm install`

### Before Commit/Push

1. Commit message follows Conventional Commits (`<description>` in English)
2. No sensitive information in the commit
3. `pnpm lint` runs without errors
4. `pnpm test` passes all tests
5. Verify the change works as expected

### Before Creating a PR

1. The user has requested that a PR be created
2. No sensitive information in the commit
3. No risk of conflicts

### After Creating a PR

1. Confirm no conflicts have occurred
2. Update the PR body to reflect only the current state of the branch, **in English** (overrides the global default of Japanese), without including the update history of this PR
3. Wait for GitHub Actions CI with `gh pr checks <PR ID> --watch` and confirm it does not fail
4. If the `request-review-copilot` command (a helper command available in this repository/development environment for requesting GitHub Copilot reviews) exists, use it to request a review from GitHub Copilot
5. Respond to GitHub Copilot review comments posted within 10 minutes. After addressing them, reply to each review comment
6. Run the Claude Code command `/code-review:code-review` to perform a code review. Address all findings with a score of 50 or higher

## Repository-Specific Notes

- This project is published as the npm package `@book000/pixivts`
- API documentation is hosted on GitHub Pages (https://book000.github.io/pixivts/)
- TypeDoc documentation generation references the content of the `master` branch (`--gitRevision master`)
- `src/index.ts` is auto-generated using ctix. Do not edit it manually
- There is a feature using TypeORM to save responses to a MySQL database (`src/saving-responses/`)
- Renovate is enabled for automatic dependency updates
- The package manager is pnpm 10.28.1
- The Node.js version is managed via the `.node-version` file
