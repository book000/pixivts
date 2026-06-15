/**
 * Shared zod schemas used across multiple endpoint responses.
 *
 * All schemas are INTERNAL — not exported from the package barrel.
 * Public types are re-exported as `type` aliases in `src/types.ts`.
 */

import { z } from 'zod'

/** Image URLs for a work (thumbnail variants). */
export const ImageUrlsSchema = z.object({
  /** 360×360 thumbnail */
  squareMedium: z.string(),
  /** Long side ≤ 540 px */
  medium: z.string(),
  /** Width ≤ 600 px, height ≤ 1200 px */
  large: z.string(),
  /** Original image (only present in metaPages entries) */
  original: z.string().optional(),
})

/** Profile image URLs for a user. */
export const ProfileImageUrlsSchema = z.object({
  medium: z.string(),
})

/**
 * Minimal user information embedded in works and other responses.
 *
 * Full profile data is returned by GET /v1/user/detail.
 */
export const PixivUserSchema = z.object({
  /**
   * Internal numeric user ID.
   *
   * NOTE: Some API endpoints may return this as a string. The coerce
   * normalises it to a number in those cases (the only permitted
   * runtime-normalisation exception in this codebase).
   */
  id: z.union([z.number(), z.string()]).pipe(z.coerce.number()),
  name: z.string(),
  account: z.string(),
  profileImageUrls: ProfileImageUrlsSchema,
  isFollowed: z.boolean().optional(),
  isAccessBlockingUser: z.boolean().optional(),
  isAcceptRequest: z.boolean().optional(),
})

/** Tag on a work. */
export const TagSchema = z.object({
  name: z.string(),
  translatedName: z.string().nullable(),
  addedByUploadedUser: z.boolean().optional(),
})

/** Series information embedded in a work item. */
export const SeriesSchema = z.object({
  id: z.number(),
  title: z.string(),
})

/** Privacy policy information returned in recommended endpoints. */
export const PrivacyPolicySchema = z.object({
  version: z.string().optional(),
  message: z.string().optional(),
  url: z.string().optional(),
})

// Re-export inferred types for use within the schemas package
export type ImageUrls = z.infer<typeof ImageUrlsSchema>
export type ProfileImageUrls = z.infer<typeof ProfileImageUrlsSchema>
export type PixivUser = z.infer<typeof PixivUserSchema>
export type Tag = z.infer<typeof TagSchema>
export type Series = z.infer<typeof SeriesSchema>
export type PrivacyPolicy = z.infer<typeof PrivacyPolicySchema>
