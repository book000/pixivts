/**
 * @book000/pixivts-db-mysql — MySQL response recorder for @book000/pixivts
 *
 * @example
 * ```ts
 * import { createResponseRecorder } from '@book000/pixivts-db-mysql'
 * import { PixivClient } from '@book000/pixivts'
 *
 * const { interceptor, close } = await createResponseRecorder({
 *   host: process.env.DB_HOST,
 *   database: 'pixivts',
 *   bootstrap: true,
 * })
 *
 * const client = await PixivClient.of(process.env.PIXIV_REFRESH_TOKEN!, {
 *   onResponse: interceptor,
 * })
 * // ... make API calls, responses are persisted automatically ...
 * await close()
 * ```
 */

// Connection
export { createDatabaseConnection } from './connection'
export type { ConnectionOptions, DatabaseInstance } from './connection'

// Deprecated aliases for the connection API above, kept for backward
// compatibility with the pre-1.x `createDbConnection`/`DbInstance` naming
// (renamed to satisfy the `unicorn/name-replacements` lint rule).
// eslint-disable-next-line @typescript-eslint/no-deprecated -- re-exporting the deprecated binding itself for backward compatibility, not using it
export { createDbConnection } from './connection'
// eslint-disable-next-line @typescript-eslint/no-deprecated -- re-exporting the deprecated alias itself for backward compatibility, not using it
export type { DbInstance } from './connection'

// Schema
export { responsesTable } from './schema'
export type { NewResponse, ResponseRow } from './schema'

// Recorder
export {
  createResponseRecorder,
  createRecorderBundle,
  addResponse,
  getResponses,
  getResponseCount,
  getEndpoints,
} from './recorder'
export type {
  RecorderBundle,
  RecorderOptions,
  ResponseFilter,
  RangeOptions,
  EndpointWithCount,
} from './recorder'

// Migrations
export { bootstrapSchema } from './migrations'
