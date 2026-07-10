# GitHub Copilot Code Review Instructions

Guidance for reviewing pull requests in this repository. This is a pixiv Unofficial API Library for TypeScript, published as a pnpm monorepo (`@book000/pixivts` core + optional `@book000/pixivts-db-mysql` recorder).

## Enforced conventions (flag violations)

- Prettier: no semicolons (`semi: false`), single quotes, 2-space indentation, LF line endings. Flag added semicolons and double quotes.
- ESLint flat config (`eslint.config.mjs`) via `@book000/eslint-config`. Type checking is `tsc` with strict mode.
- Comments, JSDoc, and error messages must be in English.
- Public functions and interfaces must have English JSDoc comments.
- Commit messages / PR titles follow Conventional Commits with an English `<description>`.
- Insert a half-width space between Japanese and alphanumeric characters where Japanese text is unavoidable.

## Review focus points

- API request methods must return `ResultAsync<T, PixivError>` (from the in-repo `src/result.ts`, a zero-dependency neverthrow-style module — not the external `neverthrow` package) — flag `throw` in request paths. Paginated endpoints return `PaginatedResultAsync`.
- Public types in `src/types.ts` are hand-written camelCase interfaces. The library talks to pixiv in snake_case and converts at the HTTP layer (`camelizeKeys` in `src/params.ts`). Confirm caller-facing values are camelCase and wire params are converted via `buildParams()`.
- `src/index.ts` is the hand-maintained barrel (not auto-generated). Flag added/removed public exports that are not reflected there.
- Zod schemas in `src/schemas/` are internal only. Flag any `z.infer<>` type or schema exported from the public barrel — it breaks Zod tree-shaking.
- Never enable `skipLibCheck` to work around type errors.
- The db-mysql package (Drizzle ORM + mysql2) stores raw snake_case response bodies for archival fidelity — do not "fix" that column to camelCase.

## Testing expectations

- Test framework is **vitest** (not Jest); HTTP mocking uses **MSW v2**.
- MSW response bodies are snake_case (raw wire format); assertions on `result.value.*` use camelCase.
- New API methods and new `params.ts` utilities require corresponding unit tests, including edge cases and error handling.
- E2E tests (`packages/core/tests/e2e/`) require a real `PIXIV_REFRESH_TOKEN` env var.

## Security (flag on sight)

- No API keys, refresh tokens, or credentials committed to Git or written to logs.
- No real credentials in test code — use MSW mocks or dummy data.

## Known non-issues (do not flag)

- Absent semicolons and single quotes are intentional (Prettier config).
- `PaginatedResultAsync` extending `ResultAsync` and the neverthrow-style no-throw pattern (implemented in-repo in `src/result.ts`, no external dependency) are deliberate design choices.
