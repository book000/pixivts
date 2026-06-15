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
 * - Arrays are appended as repeated params: `foo=1&foo=2`.
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
      for (const item of value) usp.append(key, String(item))
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
