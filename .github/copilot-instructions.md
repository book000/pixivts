# Copilot review instructions

Follow `AGENTS.md` at the repository root for the full conventions, commands and structure. This file is the review checklist.

## Language

- Write review comments in English.
- Flag code comments, JSDoc, docs, commit messages and PR titles or bodies that are not in English. Quotations, identifiers, generated files and real-world test data are exempt.

## Checklist

- Request methods return `ResultAsync<T, PixivError>` (the in-repo `src/result.ts`, not `neverthrow`) and do not throw. Paginated endpoints return `PaginatedResultAsync`.
- Caller-facing values are camelCase; request parameters go through `buildParams()`. Do not "fix" the db-mysql `response_body` column to camelCase.
- `packages/core/src/index.ts` is hand-maintained. Flag public exports that are added or removed without updating it.
- No zod schema or `z.infer<>` type may be exported from the barrel.
- Public functions and interfaces have accurate JSDoc, and docs (`README.md`, `packages/*/README.md`, `docs/`) match the code.
- New API methods and `params.ts` utilities have unit tests (Vitest, MSW v2, snake_case wire bodies).
- No `skipLibCheck`, no committed secrets or tokens, no real credentials in tests.
- Commit messages and PR titles follow Conventional Commits.

## Do not flag

- Missing semicolons and single quotes (Prettier config).
- The neverthrow-style no-throw pattern and `PaginatedResultAsync` extending `ResultAsync`.
