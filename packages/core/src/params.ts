/**
 * Parameter building utilities.
 *
 * Provides camelCase → snake_case conversion and a URLSearchParams builder
 * that replicates the behaviour of the `qs` library used in the legacy code
 * (without the `qs` runtime dependency).
 */

/**
 * Converts a camelCase string to snake_case.
 *
 * @example
 * camelToSnake('illustId')  // 'illust_id'
 * camelToSnake('searchAiType') // 'search_ai_type'
 *
 * @param key - camelCase string
 * @returns snake_case string
 */
export function camelToSnake(key: string): string {
  return key.replaceAll(/([A-Z])/g, (m) => `_${m.toLowerCase()}`)
}

/**
 * Converts all keys of a plain object from camelCase to snake_case, shallow.
 *
 * Values are preserved as-is; nested objects are NOT recursed into.
 *
 * @param obj - Object with camelCase keys
 * @returns New object with snake_case keys
 */
export function toSnakeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    out[camelToSnake(key)] = obj[key]
  }
  return out
}

type ParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[]
  | number[]

/**
 * Serialises a record of query parameters into a `URLSearchParams` instance.
 *
 * Rules:
 * - `null` / `undefined` values are skipped.
 * - Arrays are appended with a `[]` suffix: `foo[]=1&foo[]=2` (Rails/pixiv convention).
 * - Booleans are serialised as `'true'` / `'false'`.
 * - Numbers are serialised via `.toString()`.
 *
 * @param params - Key/value pairs to serialise
 * @returns Populated `URLSearchParams`
 */
export function buildSearchParams(
  params: Record<string, ParamValue>
): URLSearchParams {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue
    if (Array.isArray(value)) {
      // The pixiv API (Rails backend) expects bracket-suffixed keys for arrays:
      // e.g. seed_illust_ids[]=1&seed_illust_ids[]=2, not seed_illust_ids=1&seed_illust_ids=2
      for (const item of value) usp.append(`${key}[]`, String(item))
    } else {
      usp.set(key, String(value))
    }
  }
  return usp
}

/**
 * Merges camelCase→snake_case conversion with URLSearchParams building.
 *
 * Convenience wrapper used by resource methods.
 *
 * @param params - camelCase record
 * @returns Populated `URLSearchParams` with snake_case keys
 */
export function buildParams(
  params: Record<string, ParamValue>
): URLSearchParams {
  return buildSearchParams(toSnakeKeys(params) as Record<string, ParamValue>)
}

// ---------------------------------------------------------------------------
// parseNextUrl
// ---------------------------------------------------------------------------

/**
 * Typed cursor parameters extracted from a pixiv `next_url`.
 *
 * Different endpoints use different cursor fields; only the fields present
 * in the URL will be defined.
 *
 * | Field | Endpoint(s) |
 * |---|---|
 * | `maxBookmarkId` | `GET /v1/user/bookmarks/illust` |
 * | `maxBookmarkIdForRecommend` | `GET /v1/illust/recommended`, `GET /v1/novel/recommended` |
 * | `minBookmarkIdForRecentIllust` | `GET /v1/illust/recommended` |
 * | `offset` | search, ranking, recommended, user lists, … |
 * | `lastOrder` | `GET /v2/novel/series` |
 */
export interface ParsedNextUrl {
  /** Cursor for `GET /v1/user/bookmarks/illust`. */
  maxBookmarkId?: number
  /** Cursor for `GET /v1/illust/recommended` and `GET /v1/novel/recommended`. */
  maxBookmarkIdForRecommend?: number
  /** Secondary cursor for `GET /v1/illust/recommended`. */
  minBookmarkIdForRecentIllust?: number
  /** Zero-based offset for general list endpoints. */
  offset?: number
  /** Cursor for `GET /v2/novel/series`. */
  lastOrder?: number
}

/**
 * Parses a pixiv `next_url` into a typed cursor object.
 *
 * Pass the `next_url` field from any paginated response to extract the
 * cursor parameters needed to resume pagination from a saved position.
 *
 * @example
 * ```ts
 * const page = await client.users.bookmarks.illusts({ userId: client.userId })
 * if (page.isOk && page.value.next_url) {
 *   const cursor = parseNextUrl(page.value.next_url)
 *   // Resume later:
 *   const next = await client.users.bookmarks.illusts({
 *     userId: client.userId,
 *     maxBookmarkId: cursor.maxBookmarkId,
 *   })
 * }
 * ```
 *
 * @param url - The `next_url` string returned by a pixiv list endpoint
 * @returns Typed cursor parameters; fields absent in the URL are `undefined`
 */
export function parseNextUrl(url: string): ParsedNextUrl {
  const usp = new URL(url).searchParams
  const result: ParsedNextUrl = {}

  const toNum = (key: string): number | undefined => {
    const v = usp.get(key)
    return v === null ? undefined : Number(v)
  }

  const maxBookmarkId = toNum('max_bookmark_id')
  if (maxBookmarkId !== undefined) result.maxBookmarkId = maxBookmarkId

  const maxBookmarkIdForRecommend = toNum('max_bookmark_id_for_recommend')
  if (maxBookmarkIdForRecommend !== undefined)
    result.maxBookmarkIdForRecommend = maxBookmarkIdForRecommend

  const minBookmarkIdForRecentIllust = toNum('min_bookmark_id_for_recent_illust')
  if (minBookmarkIdForRecentIllust !== undefined)
    result.minBookmarkIdForRecentIllust = minBookmarkIdForRecentIllust

  const offset = toNum('offset')
  if (offset !== undefined) result.offset = offset

  const lastOrder = toNum('last_order')
  if (lastOrder !== undefined) result.lastOrder = lastOrder

  return result
}
