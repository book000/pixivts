/**
 * Zod schema for pixiv API error response body.
 *
 * Internal — not exported from the package barrel.
 */

import { z } from 'zod'

/**
 * Shape of the JSON body returned by the pixiv API on error.
 *
 * Example:
 * ```json
 * {
 *   "error": {
 *     "userMessage": "The artwork has been deleted or the artwork ID does not exist.",
 *     "message": "",
 *     "reason": "",
 *     "userMessageDetails": {}
 *   }
 * }
 * ```
 */
export const PixivApiErrorBodySchema = z.object({
  error: z.object({
    userMessage: z.string(),
    message: z.string(),
    reason: z.string(),
    userMessageDetails: z.record(z.unknown()).optional(),
  }),
})

export type PixivApiErrorBody = z.infer<typeof PixivApiErrorBodySchema>
