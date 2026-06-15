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
 *     "user_message": "The artwork has been deleted or the artwork ID does not exist.",
 *     "message": "",
 *     "reason": "",
 *     "user_message_details": {}
 *   }
 * }
 * ```
 */
export const PixivApiErrorBodySchema = z.object({
  error: z.object({
    user_message: z.string(),
    message: z.string(),
    reason: z.string(),
    user_message_details: z.record(z.unknown()).optional(),
  }),
})

export type PixivApiErrorBody = z.infer<typeof PixivApiErrorBodySchema>
