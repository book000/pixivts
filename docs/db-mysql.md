# MySQL Response Recorder

`@book000/pixivts-db-mysql` is an optional add-on package that persists every pixiv API response to a MySQL database via [Drizzle ORM](https://orm.drizzle.team/).

## Installation

```shell
npm install @book000/pixivts-db-mysql
```

Requires MySQL 5.7+ or MariaDB 10.3+.

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

// Every API call is now persisted automatically
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

A unique composite index on `(method, endpoint, status_code, url_hash)` ensures each unique request/response is stored only once.

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
