/**
 * Parses the structured novel data embedded in the WebView HTML page
 * (GET /webview/v2/novel).
 */
import { parseError } from './errors'
import { camelizeKeys } from './params'
import { err, ok } from './result'
import type { PixivError } from './errors'
import type { Result } from './result'
import type { WebviewNovel } from './types'

// The page embeds the novel data as a JavaScript object literal assigned to
// a `novel` property, immediately followed by `isOwnWork`. There is no
// surrounding JSON document to parse instead, so pixivpy's approach — a
// regex extracting the object literal — is followed here too. The pattern
// is neither anchored to a unique prefix nor lazy, matching from the first
// `novel:` to the last `isOwnWork` in the page; this is a known limitation
// shared with pixivpy (unverified against a real page containing more than
// one such token), so the shape check below guards against a wrong span
// that still happens to be syntactically valid JSON.
const NOVEL_JSON_PATTERN = /novel:\s*({.+}),\s*isOwnWork/s

/**
 * Verifies that a parsed value has the fields a `WebviewNovel` requires,
 * so a syntactically valid but wrong-span capture (see `NOVEL_JSON_PATTERN`)
 * is rejected instead of silently returned as if it were the requested novel.
 */
function isWebviewNovelShape(value: unknown): value is WebviewNovel {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.userId === 'string' &&
    typeof candidate.text === 'string'
  )
}

/**
 * Extracts and parses the `WebviewNovel` object embedded in a WebView novel
 * HTML page.
 *
 * @param html - Raw HTML body returned by GET /webview/v2/novel
 * @returns `Result<WebviewNovel, PixivError>` — `err` with `type: 'parse_error'`
 *   if the embedded JSON cannot be located, parsed, or does not have the
 *   expected `WebviewNovel` shape
 */
export function parseWebviewNovel(html: string): Result<WebviewNovel, PixivError> {
  const match = NOVEL_JSON_PATTERN.exec(html)
  if (!match) {
    return err(
      parseError('Could not find embedded novel JSON in WebView HTML', html)
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(match[1])
  } catch (error: unknown) {
    return err(
      parseError(
        `Failed to parse embedded novel JSON: ${String(error)}`,
        html,
        error
      )
    )
  }

  const camelized = camelizeKeys(parsed)
  if (!isWebviewNovelShape(camelized)) {
    return err(
      parseError(
        'Embedded novel JSON does not match the expected WebviewNovel shape',
        html
      )
    )
  }
  return ok(camelized)
}
