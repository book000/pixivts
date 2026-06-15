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
  - Saving responses to a MySQL database (optional, via `@book000/pixivts-db-mysql`)

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
# Install dependencies (workspace root)
pnpm install

# Build all packages
pnpm build                            # = pnpm -r build

# Build only the core package
pnpm --filter @book000/pixivts build  # runs tsup

# Verify .d.ts files contain no zod references (tree-shake guard)
pnpm --filter @book000/pixivts build:dts-guard

# Clean build artifacts
pnpm clean                            # = pnpm -r clean

# Generate TypeDoc documentation (core package)
pnpm --filter @book000/pixivts generate-docs

# Run all tests (workspace root — runs vitest across all packages)
pnpm test

# TypeScript type check (core package — also run implicitly by root lint)
pnpm --filter @book000/pixivts lint   # = tsc -p tsconfig.test.json

# Lint everything (build core, then tsc all packages, then ESLint)
pnpm lint

# ESLint fix
pnpm fix

# Run E2E tests (requires a real PIXIV_REFRESH_TOKEN env var)
pnpm --filter @book000/pixivts test:e2e
```

## Architecture and Key Files

### Repository Layout

This is a **pnpm monorepo** with two published packages:

| Package | Directory | npm name |
|---|---|---|
| Core API library | `packages/core/` | `@book000/pixivts` |
| MySQL recorder (optional) | `packages/db-mysql/` | `@book000/pixivts-db-mysql` |

### Core Package (`packages/core/`)

- **`src/client.ts`**: Main `PixivClient` class — entry point for consumers
- **`src/http.ts`**: `HttpClient` — native `fetch` wrapper with 429-retry, 401-refresh, and response interceptor hook
- **`src/auth.ts`**: `AuthManager` — OAuth 2.0 token refresh and `x-client-hash` header generation (pure-TS MD5)
- **`src/paginated.ts`**: `PaginatedResultAsync` — extends `ResultAsync` with `.pages()` / `.items()` async generators
- **`src/params.ts`**: Parameter utilities — `camelToSnake` / `snakeToCamel`, `camelizeKeys` (deep), `buildParams`, `parseNextUrl`
- **`src/types.ts`**: Hand-written TypeScript interfaces for all public API response types (camelCase)
- **`src/schemas/`**: Zod schemas mirroring `types.ts` — internal only, not exported from the barrel
- **`src/options.ts`**: Const enums for API option values (`OSFilter`, `BookmarkRestrict`, etc.)
- **`src/resources/`**: Per-namespace resource classes (`IllustResource`, `NovelResource`, `UserResource`, `MangaResource`, `UgoiraResource`, `ImageResource`)
- **`src/result.ts`**: Re-exports from `neverthrow` (`ok`, `err`, `ResultAsync`)
- **`src/errors.ts`**: Typed `PixivError` union and factory functions
- **`src/interceptor.ts`**: `ResponseInterceptor` type definition (DB seam)
- **`src/index.ts`**: Package barrel — hand-maintained (not auto-generated)

### DB-MySQL Package (`packages/db-mysql/`)

- **`src/recorder.ts`**: `createResponseRecorder` — saves raw API responses to MySQL via Drizzle ORM
- **`src/schema.ts`**: Drizzle table schema (`responsesTable`)
- **`src/connection.ts`**: MySQL pool factory
- **`src/migrations.ts`**: Bootstrap DDL runner

### Key Toolchain Facts

| Tool | Role | Notes |
|---|---|---|
| `pnpm` v11.6.0 | Package manager | Workspace monorepo |
| `tsup` | Build (core) | Outputs ESM + CJS + `.d.ts` |
| `vitest` | Test runner | Replaces Jest; MSW v2 for HTTP mocking |
| `typedoc` | API docs generator | `--gitRevision master` |
| `tsc` | Type checking | No `skipLibCheck` |
| `eslint` (flat config) | Linting | `eslint.config.mjs` at root |
| `prettier` | Formatting | `semi: false`, single quotes |
| `drizzle-orm` | DB ORM (db-mysql) | MySQL2 adapter |
| `neverthrow` | Result type | `ok`/`err`/`ResultAsync` |

## Response Design

All values returned to callers are in **lowerCamelCase**. The library communicates with the pixiv API in snake_case internally. The conversion is applied at the HTTP layer (`http.ts`) via `camelizeKeys()` (a deep recursive transformer in `params.ts`).

| Layer | Key format |
|---|---|
| pixiv wire / OAuth | `snake_case` |
| `http.ts` after `JSON.parse` | `camelCase` (via `camelizeKeys`) |
| Public types in `types.ts` | `camelCase` |
| DB recorder (`responseBody` column) | `snake_case` (raw text, for archival fidelity) |

## Implementation Patterns

### Recommended Patterns

- API request methods return `ResultAsync<T, PixivError>` (from neverthrow) — no throws
- Paginated endpoints return `PaginatedResultAsync<TPage, TItem>` with `.pages()` / `.items()` generators
- Type definitions are hand-written interfaces in `types.ts` (not derived from Zod)
- Zod schemas in `src/schemas/` exist for internal fixture validation only — they are not exported
- Public APIs have JSDoc comments written in English
- Request parameters are in camelCase; `buildParams()` converts them to snake_case before sending

### Discouraged Patterns

- Enabling `skipLibCheck` to work around type errors
- Writing error messages in Japanese
- Using semicolons (Prettier is configured with `semi: false`)
- Exporting Zod schemas or `z.infer<>` types from the public barrel (breaks tree-shaking of Zod)
- Manually editing `src/index.ts` after breaking changes — keep the barrel up to date

## Testing

### Testing Policy

- Test framework: **vitest** (not Jest)
- HTTP mocking: **MSW v2** (`packages/core/tests/msw/handlers.ts`)
- MSW response bodies use **snake_case** (raw wire format) so the camelizer in `http.ts` is exercised end-to-end
- Assertions on `result.value.*` use **camelCase** (post-camelizer values)
- Coverage collected for `packages/core/src/**/*.ts` and `packages/db-mysql/src/**/*.ts`
- E2E tests in `packages/core/tests/e2e/` require a real `PIXIV_REFRESH_TOKEN` environment variable

### Additional Testing Requirements

- When adding a new API method, add a corresponding unit test
- Include tests for edge cases and exception handling
- When adding a new utility function (`params.ts`), add unit tests in `params.test.ts`

## Documentation Update Rules

### Targets

- `README.md`: when adding features or changing usage
- TypeDoc comments (JSDoc): when changing public APIs
- `docs/*.md`: when adding/changing pagination, migration, or options behaviour
- `src/index.ts`: keep the barrel current after public API changes

### Timing

- When adding/changing an API method: update the corresponding JSDoc comments
- When adding a feature: update the relevant section of `README.md`
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
2. Update the PR body to reflect only the current state of the branch, **in English**, without including the update history of this PR
3. Wait for GitHub Actions CI with `gh pr checks <PR ID> --watch` and confirm it does not fail
4. If the `request-review-copilot` command (a helper command available in this repository/development environment for requesting GitHub Copilot reviews) exists, use it to request a review from GitHub Copilot
5. Respond to GitHub Copilot review comments posted within 10 minutes. After addressing them, reply to each review comment
6. Run the Claude Code command `/code-review:code-review` to perform a code review. Address all findings with a score of 50 or higher

## Repository-Specific Notes

- This project is published as the npm package `@book000/pixivts` (core) and `@book000/pixivts-db-mysql` (optional MySQL recorder)
- API documentation is hosted on GitHub Pages (https://book000.github.io/pixivts/)
- TypeDoc documentation generation references the content of the `master` branch (`--gitRevision master`)
- `src/index.ts` is the hand-maintained package barrel — update it when adding or removing public exports
- The db-mysql package saves raw snake_case response bodies to MySQL for archival fidelity; the camelizer only runs on values returned to callers
- Renovate is enabled for automatic dependency updates
- The package manager is pnpm v11.6.0
- The Node.js version is managed via the `.node-version` file
