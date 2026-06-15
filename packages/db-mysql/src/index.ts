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
export { createDbConnection } from './connection.js'
export type { ConnectionOptions, DbInstance } from './connection.js'

// Schema
export { responsesTable } from './schema.js'
export type { NewResponse, ResponseRow } from './schema.js'

// Recorder
export {
  createResponseRecorder,
  createRecorderBundle,
  addResponse,
  getResponses,
  getResponseCount,
  getEndpoints,
} from './recorder.js'
export type {
  RecorderBundle,
  RecorderOptions,
  ResponseFilter,
  RangeOptions,
  EndpointWithCount,
} from './recorder.js'

// Migrations
export { bootstrapSchema } from './migrations.js'
