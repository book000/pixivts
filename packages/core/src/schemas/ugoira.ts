/**
 * Zod schemas for pixiv ugoira (animated illust) types.
 *
 * Internal — not exported from the package barrel.
 */

import { z } from 'zod'

/** URLs for ugoira frame archives (ZIP files). */
export const ZipUrlsSchema = z.object({
  /**
   * URL for the 600px-long-side ZIP archive.
   *
   * Replacing "600x600" with "1920x1080" in the URL may yield the
   * original-resolution archive (unverified).
   */
  medium: z.string(),
})

/** Timing information for a single ugoira frame. */
export const FrameSchema = z.object({
  /** File name within the ZIP archive */
  file: z.string(),
  /** Display duration in milliseconds */
  delay: z.number(),
})

/** Ugoira metadata as returned by GET /v1/ugoira/metadata. */
export const PixivUgoiraItemSchema = z.object({
  zip_urls: ZipUrlsSchema,
  frames: z.array(FrameSchema),
})

export type ZipUrls = z.infer<typeof ZipUrlsSchema>
export type Frame = z.infer<typeof FrameSchema>
export type PixivUgoiraItem = z.infer<typeof PixivUgoiraItemSchema>
