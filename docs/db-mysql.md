# MySQL Response Recorder

`@book000/pixivts-db-mysql` is an optional add-on package that persists every successful (2xx) pixiv API response to a MySQL database via [Drizzle ORM](https://orm.drizzle.team/). Error responses, network failures and image downloads (`client.images.fetch`) are not recorded.

## Installation

```shell
npm install @book000/pixivts-db-mysql
```

The integration tests run against the MySQL service image configured in `.github/workflows/nodejs-ci.yml`. Other MySQL-compatible servers are untested.

## Quick Start

```typescript
import { PixivClient } from '@book000/pixivts'
import { createResponseRecorder } from '@book000/pixivts-db-mysql'

const { interceptor, close } = await createResponseRecorder({
  host: 'localhost',
  user: 'pixiv',
  password: 'secret',
  database: 'pixivts',
  bootstrap: true, // run CREATE TABLE IF NOT EXISTS on first run
})

const client = await PixivClient.of(process.env.PIXIV_REFRESH_TOKEN!, {
  onResponse: interceptor,
})

// Every successful API call is now persisted automatically
const result = await client.illusts.detail({ illustId: 12345 })
// ...

await close()
```

## Connection Options

Options can be passed explicitly or set via environment variables.

| Option | Env variable | Default | Description |
|---|---|---|---|
| `host` | `RESPONSE_DB_HOSTNAME` | `localhost` | Database hostname |
| `port` | `RESPONSE_DB_PORT` | `3306` | Database port |
| `user` | `RESPONSE_DB_USERNAME` | — | Database username |
| `password` | `RESPONSE_DB_PASSWORD` | — | Database password |
| `database` | `RESPONSE_DB_DATABASE` | — | Database name |
| `bootstrap` | — | `false` | Run `CREATE TABLE IF NOT EXISTS` on startup |

Environment variable example:

```shell
RESPONSE_DB_HOSTNAME=db.example.com
RESPONSE_DB_USERNAME=pixiv
RESPONSE_DB_PASSWORD=secret
RESPONSE_DB_DATABASE=pixivts
```

```typescript
// All connection options are read from env vars automatically
const { interceptor, close } = await createResponseRecorder({ bootstrap: true })
```

## Schema

Responses are stored in a single `responses` table.

| Column | Type | Description |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Primary key |
| `method` | VARCHAR(10) | HTTP method (`GET` / `POST`) |
| `endpoint` | VARCHAR(255) | API path (e.g. `/v1/illust/detail`) |
| `url` | TEXT | Full request URL |
| `url_hash` | VARCHAR(255) | SHA-256 of the URL (used for deduplication) |
| `request_headers` | LONGTEXT | Serialised request headers (JSON) |
| `request_body` | LONGTEXT | Request body (POST only) |
| `response_type` | VARCHAR(10) | `JSON` or `TEXT` |
| `status_code` | INT | HTTP status code |
| `response_headers` | LONGTEXT | Serialised response headers (JSON) |
| `response_body` | LONGTEXT | Raw response body |
| `created_at` | DATETIME(3) | Timestamp |

A unique composite index on `(method, endpoint, status_code, url_hash)` keeps one row per combination: if a later response to the same request URL has the same method, endpoint and status code, it is silently ignored (`ON DUPLICATE KEY UPDATE id = id`) and the first recorded response is kept. The `created_at` column is written through a connection pool configured with the fixed time zone `+09:00`.

### Credential redaction

The `Authorization` header value is stored as `[REDACTED]` in `request_headers`, so the access token is never written to the database.

Rows recorded by earlier versions may still contain `Authorization: Bearer <token>`. The library never modifies existing rows; scrub them deliberately with the statement below (requires MySQL 5.7+ or MariaDB 10.2.3+ for the JSON functions):

```sql
UPDATE responses
SET request_headers = JSON_SET(request_headers, '$.Authorization', '[REDACTED]')
WHERE id > 0
  AND CASE
    WHEN JSON_VALID(request_headers)
      THEN JSON_CONTAINS_PATH(request_headers, 'one', '$.Authorization')
    ELSE 0
  END;
```

The `id > 0` condition is a key condition that keeps the statement valid when `sql_safe_updates` is enabled. The `CASE` expression guarantees that `JSON_CONTAINS_PATH` is evaluated only for valid JSON.

Notes:

- `JSON_SET` re-serializes the document, so key spacing and order in scrubbed rows may change. The `Authorization` value is the only semantic change.
- The statement rewrites every matching row. On large tables, run it during a maintenance window or in `id` ranges.
- Rows whose `request_headers` is not valid JSON are skipped. After the scrub, verify that nothing is left; the expected result is `0`:

  ```sql
  SELECT COUNT(*) FROM responses WHERE request_headers LIKE '%Bearer %';
  ```

- Database backups and exports taken before the scrub still contain the tokens. Purge them or treat them as secrets, and revoke the tokens if those copies may have been exposed.

## Query Helpers

The package exports several helpers for reading recorded data.

### `getResponses`

Returns response rows from the last 90 days, newest first.

```typescript
import { getResponses } from '@book000/pixivts-db-mysql'

const rows = await getResponses(db, { endpoint: '/v1/illust/detail' }, { page: 1, limit: 50 })
```

Filters:

| Field | Type | Description |
|---|---|---|
| `method` | `string` | HTTP method |
| `endpoint` | `string` | API endpoint path |
| `statusCode` | `number` | HTTP status code |

Pagination:

| Field | Default | Description |
|---|---|---|
| `page` | `1` | 1-based page number |
| `limit` | `100` | Items per page |

### `getResponseCount`

Returns the count of matching rows from the last 90 days.

```typescript
import { getResponseCount } from '@book000/pixivts-db-mysql'

const total = await getResponseCount(db, { statusCode: 200 })
```

### `getEndpoints`

Returns all unique `(method, endpoint, statusCode)` combinations seen in the last 90 days, sorted by count descending.

```typescript
import { getEndpoints } from '@book000/pixivts-db-mysql'

const endpoints = await getEndpoints(db)
// [{ method: 'GET', endpoint: '/v1/illust/detail', statusCode: 200, count: 42 }, ...]
```

## Custom Queries

The `db` field in the bundle is a typed Drizzle ORM instance. Use it for any query not covered by the helpers.

```typescript
import { responsesTable } from '@book000/pixivts-db-mysql'
import { eq } from 'drizzle-orm'

const { interceptor, db, close } = await createResponseRecorder({ bootstrap: true })
const client = await PixivClient.of(token, { onResponse: interceptor })

// Custom query: fetch all 429 responses
const rateLimited = await db
  .select()
  .from(responsesTable)
  .where(eq(responsesTable.statusCode, 429))

await close()
```
