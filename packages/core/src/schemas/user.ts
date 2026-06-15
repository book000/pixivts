/**
 * Zod schemas for pixiv user-related types.
 *
 * Internal — not exported from the package barrel.
 */

import { z } from 'zod'
import { PixivUserSchema } from './common'
import { PixivIllustItemSchema } from './illust'
import { PixivNovelItemSchema } from './novel'

/**
 * User item — minimal user info plus self-introduction comment.
 *
 * Returned embedded in the GET /v1/user/detail response.
 */
export const PixivUserItemSchema = PixivUserSchema.extend({
  /** Self-introduction text (line endings are \r\n) */
  comment: z.string(),
})

/** Values for publicly-visible profile fields. */
const PublicitySchema = z.enum(['public', 'private', 'mypixiv'])

/** Detailed profile information for a user. */
export const PixivUserProfileSchema = z.object({
  webpage: z.string().nullable(),
  gender: z.enum(['male', 'female', 'unknown']),
  birth: z.string(),
  birth_day: z.string(),
  birth_year: z.number(),
  region: z.string(),
  address_id: z.number(),
  country_code: z.string(),
  job: z.string(),
  job_id: z.number(),
  total_follow_users: z.number(),
  total_mypixiv_users: z.number(),
  total_illusts: z.number(),
  total_manga: z.number(),
  total_novels: z.number(),
  total_illust_bookmarks_public: z.number(),
  total_illust_series: z.number(),
  total_novel_series: z.number(),
  background_image_url: z.string().nullable(),
  twitter_account: z.string(),
  twitter_url: z.string().nullable(),
  pawoo_url: z.string().nullable(),
  is_premium: z.boolean(),
  is_using_custom_profile_image: z.boolean(),
})

/** Visibility settings for a user's profile fields. */
export const PixivUserProfilePublicitySchema = z.object({
  gender: PublicitySchema,
  region: PublicitySchema,
  birth_day: PublicitySchema,
  birth_year: PublicitySchema,
  job: PublicitySchema,
  pawoo: z.boolean(),
})

/** Workspace / desk setup information from a user's profile. */
export const PixivUserProfileWorkspaceSchema = z.object({
  pc: z.string(),
  monitor: z.string(),
  tool: z.string(),
  scanner: z.string(),
  tablet: z.string(),
  mouse: z.string(),
  printer: z.string(),
  desktop: z.string(),
  music: z.string(),
  desk: z.string(),
  chair: z.string(),
  comment: z.string(),
  workspace_image_url: z.string().nullable(),
})

/**
 * Preview item for a user in following/follower lists.
 *
 * Contains a few sample illusts and novels from the user.
 */
export const PixivUserPreviewItemSchema = z.object({
  user: PixivUserSchema,
  illusts: z.array(PixivIllustItemSchema),
  novels: z.array(PixivNovelItemSchema),
  is_muted: z.boolean(),
})

export type PixivUserItem = z.infer<typeof PixivUserItemSchema>
export type PixivUserProfile = z.infer<typeof PixivUserProfileSchema>
export type PixivUserProfilePublicity = z.infer<
  typeof PixivUserProfilePublicitySchema
>
export type PixivUserProfileWorkspace = z.infer<
  typeof PixivUserProfileWorkspaceSchema
>
export type PixivUserPreviewItem = z.infer<typeof PixivUserPreviewItemSchema>
