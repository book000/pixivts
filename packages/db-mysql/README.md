# @book000/pixivts-db-mysql

MySQL response recorder for [`@book000/pixivts`](https://www.npmjs.com/package/@book000/pixivts).

Persists every pixiv API response to a MySQL database using [Drizzle ORM](https://orm.drizzle.team/).

## Installation

```shell
npm install @book000/pixivts-db-mysql
# or
pnpm add @book000/pixivts-db-mysql
# or
yarn add @book000/pixivts-db-mysql
```

**Peer dependency**: `@book000/pixivts`

## Usage

```typescript
import { PixivClient } from '@book000/pixivts'
import { createResponseRecorder } from '@book000/pixivts-db-mysql'

// Create the recorder (connects to MySQL and optionally bootstraps the schema)
const { interceptor, db, close } = await createResponseRecorder({
  host: 'localhost',
  port: 3306,
  user: 'pixiv',
  password: 'secret',
  database: 'pixivts',
  bootstrap: true, // run CREATE TABLE IF NOT EXISTS on first use
})

// Pass the interceptor to PixivClient
const client = await PixivClient.of(process.env.PIXIV_REFRESH_TOKEN!, {
  onResponse: interceptor,
})

// Every API call is now recorded to MySQL automatically
const result = await client.illusts.detail({ illustId: 12345 })

// Close the pool when done
await close()
```

### Connection Options

Connection options can be passed explicitly or fall back to environment variables:

| Option | Env var | Default |
|---|---|---|
| `host` | `RESPONSE_DB_HOSTNAME` | `localhost` |
| `port` | `RESPONSE_DB_PORT` | `3306` |
| `user` | `RESPONSE_DB_USERNAME` | — |
| `password` | `RESPONSE_DB_PASSWORD` | — |
| `database` | `RESPONSE_DB_DATABASE` | — |
| `bootstrap` | — | `false` |

### Query Helpers

```typescript
import {
  createResponseRecorder,
  getResponses,
  getResponseCount,
  getEndpoints,
} from '@book000/pixivts-db-mysql'

const { db, close } = await createResponseRecorder({ bootstrap: true })

// Get responses with pagination (last 90 days)
const rows = await getResponses(db, { endpoint: '/v1/illust/detail' }, { page: 1, limit: 50 })

// Count matching records
const count = await getResponseCount(db, { statusCode: 200 })

// List all unique endpoints with counts
const endpoints = await getEndpoints(db)
// [{ method: 'GET', endpoint: '/v1/illust/detail', statusCode: 200, count: 142 }, ...]

await close()
```

### Schema

The `responses` table stores one row per API call:

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | `INT AUTO_INCREMENT` | NO | Primary key |
| `method` | `VARCHAR(10)` | NO | HTTP method |
| `endpoint` | `VARCHAR(255)` | NO | API path |
| `url` | `TEXT` | YES | Full request URL |
| `url_hash` | `VARCHAR(255)` | NO | SHA-256 hex of URL (for deduplication) |
| `request_headers` | `LONGTEXT` | YES | Serialised request headers (JSON) |
| `request_body` | `LONGTEXT` | YES | Request body (null for GET) |
| `response_type` | `VARCHAR(10)` | NO | Response content type (`"JSON"` or `"TEXT"`) |
| `status_code` | `INT` | NO | HTTP status code |
| `response_headers` | `LONGTEXT` | YES | Serialised response headers (JSON) |
| `response_body` | `LONGTEXT` | NO | Raw response body |
| `created_at` | `DATETIME(3)` | NO | Timestamp (millisecond precision) |

Duplicate rows (same method + endpoint + statusCode + createdAt + urlHash) are silently ignored via `ON DUPLICATE KEY UPDATE`.

## Database Migration

To generate a Drizzle migration file, run from the `packages/db-mysql` directory:

```shell
pnpm drizzle-kit generate
```

Alternatively, set `bootstrap: true` in `createResponseRecorder()` to run `CREATE TABLE IF NOT EXISTS` automatically.

## License

This project is licensed under the [MIT License](../../LICENSE)
