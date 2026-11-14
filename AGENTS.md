# AGENTS.md

Guidance for AI coding agents and contributors. `CLAUDE.md` imports this file, and `.github/copilot-instructions.md` adds the review checklist.

## Language

- All deliverables are written in **English**: commit messages, PR/Issue titles and bodies, review comments, code comments and JSDoc, and documentation (`README.md`, `docs/`, `AGENTS.md`, etc.). CI enforces this for PRs (`.github/workflows/check-pr-language.yml` fails a PR whose title or body is mostly Japanese).
- Exceptions (keep as is): quotations, technical identifiers, generated files, external source text, and real-world data used as test input (for example Japanese search words in the E2E tests).
- Runtime messages (logs, errors) are English.
- Insert a half-width space between Japanese and alphanumeric characters where Japanese text is unavoidable.
- Do not rewrite Git history to change the language of past commits.

## Overview

`pixivts` is an unofficial TypeScript client for the pixiv iOS app API, published to npm from a pnpm monorepo:

| Package | Directory | Role |
|---|---|---|
| `@book000/pixivts` | `packages/core/` | API client. No runtime dependencies; uses native `fetch`. ESM + CJS output. |
| `@book000/pixivts-db-mysql` | `packages/db-mysql/` | Optional recorder that stores successful API responses in MySQL via Drizzle ORM. |

User-facing documentation lives in `README.md`, `packages/*/README.md` and `docs/*.md`. TypeDoc builds the API reference from the JSDoc, `README.md` and `docs/*.md`.

## Commands

```bash
pnpm install                                    # install dependencies
pnpm build                                      # build all packages (tsdown)
pnpm lint                                       # build core, tsc for every package, then ESLint
pnpm fix                                        # ESLint --fix
pnpm format:check                               # Prettier check (ts, mjs)
pnpm test                                       # Vitest unit tests for all packages (MSW mocks, no network)
pnpm --filter @book000/pixivts build:dts-guard  # fail if dist .d.ts files reference zod
pnpm --filter @book000/pixivts generate-docs    # TypeDoc output to docs-out/
pnpm --filter @book000/pixivts test:e2e         # E2E against the real pixiv API
pnpm --filter @book000/pixivts-db-mysql test:integration  # needs a MySQL server
```

- Node.js is pinned in `.node-version` and pnpm in the root `package.json` (`packageManager`).
- E2E tests read `PIXIV_REFRESH_TOKEN` from `.env` or the environment and skip themselves when it is absent. CI runs them on pushes and schedules, not on PRs.
- The integration tests read the `RESPONSE_DB_*` variables (see `docs/db-mysql.md`). CI provides a MySQL service for them.
- CI (`.github/workflows/nodejs-ci.yml`) runs build, lint, format check, unit tests, integration tests, E2E (non-PR), the zod guard and ESM/CJS smoke tests.

## Structure

### `packages/core/src/`

- `client.ts`: `PixivClient` (entry point; create it with `PixivClient.of(refreshToken, options?)`).
- `http.ts`: `HttpClient` over `fetch` with 429 retry (`Retry-After`), one refresh-and-retry on 401, key camelization, and the response interceptor hook.
- `auth.ts`: `AuthManager` (OAuth refresh-token exchange and the `x-client-hash` header; pure-TS MD5 so it runs on edge runtimes).
- `result.ts`: in-repo `Result` / `ResultAsync` with neverthrow-style ergonomics. The `neverthrow` package is not a dependency.
- `paginated.ts`: `PaginatedResultAsync` (awaiting it yields the first page; `.pages()` / `.items()` follow `nextUrl`).
- `params.ts`: `buildParams` (camelCase to snake_case query/body, arrays as `key[]`), `camelizeKeys`, `parseNextUrl`.
- `errors.ts`: the `PixivError` union and its factories, `PixivFetchError` (thrown by the generators), `PixivAuthError` (thrown by token refresh).
- `interceptor.ts`: `ResponseInterceptor` / `ResponseRecord`, the seam used by the db-mysql package.
- `options.ts`: const objects for option values (`BookmarkRestrict`, `RankingMode`, ...). They are values only, not types.
- `types.ts`: hand-written public response interfaces (camelCase). `schemas/` holds zod schemas used only by tests and is never exported.
- `webview-novel.ts`: extracts the novel JSON embedded in the `/webview/v2/novel` HTML page.
- `resources/`: one class per namespace (`illusts`, `novels`, `users` with `users.bookmarks`, `manga`, `ugoira`, `spotlight`, `images`).
- `index.ts`: the public barrel, maintained by hand.

### `packages/db-mysql/src/`

`recorder.ts` (`createResponseRecorder`, query helpers), `schema.ts` (Drizzle `responses` table), `connection.ts` (pool factory), `migrations.ts` (`bootstrapSchema`, `CREATE TABLE IF NOT EXISTS`).

### Other

- `scripts/check-dts-no-zod.mjs` is the zod guard. `scripts/check-pr-language.mjs` backs the PR language check. `scripts/update-snapshot.sh` runs the tests with `-u`.
- Releases use semantic-release (`.releaserc.json`). PRs target `develop`; `develop` is merged into `master` by the generated release PR (`enforce-pr-flow.yml` rejects any other PR into `master`). `docs`, `chore`, `test` and similar types also trigger a patch release, so choose the commit type deliberately.

## Conventions

- Request methods return `ResultAsync<T, PixivError>` and do not throw. List endpoints return `PaginatedResultAsync`. The documented exceptions are `PixivClient.of` (`PixivAuthError`), the `PixivClient.userId` getter, and the `.pages()` / `.items()` generators (`PixivFetchError`).
- Callers see lowerCamelCase keys. `HttpClient` camelizes every JSON response, and `buildParams` converts request parameters to snake_case. The db-mysql recorder stores the raw snake_case body, which is intentional.
- Public types are hand-written interfaces in `types.ts`. Never export a zod schema or a `z.infer<>` type from `index.ts`; the zod guard enforces this.
- When you add or remove a public export, update `index.ts`. When you change a public method, update its JSDoc and the affected docs (`README.md`, `packages/core/README.md` method table, `docs/*.md`).
- Prettier: no semicolons, single quotes, 2 spaces, LF. ESLint comes from `@book000/eslint-config` (see `eslint.config.mjs`). Never enable `skipLibCheck`.
- Public functions and interfaces need JSDoc. Comments explain intent and constraints, not what the code already says.
- Tests use Vitest and MSW v2 (`packages/core/tests/msw/`). MSW bodies use the raw snake_case wire format and assertions use camelCase. Add a unit test for every new API method and every new `params.ts` utility.
- Never commit secrets or refresh tokens, and never put real credentials in tests. Do not log credential values.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/); branches follow [Conventional Branch](https://conventional-branch.github.io) short form (`feat/...`, `fix/...`). Do not commit to Renovate PRs.
