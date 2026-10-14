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
  birthDay: z.string(),
  birthYear: z.number(),
  region: z.string(),
  addressId: z.number(),
  countryCode: z.string(),
  job: z.string(),
  jobId: z.number(),
  totalFollowUsers: z.number(),
  totalMypixivUsers: z.number(),
  totalIllusts: z.number(),
  totalManga: z.number(),
  totalNovels: z.number(),
  totalIllustBookmarksPublic: z.number(),
  totalIllustSeries: z.number(),
  totalNovelSeries: z.number(),
  backgroundImageUrl: z.string().nullable(),
  twitterAccount: z.string(),
  twitterUrl: z.string().nullable(),
  pawooUrl: z.string().nullable(),
  isPremium: z.boolean(),
  isUsingCustomProfileImage: z.boolean(),
})

/** Visibility settings for a user's profile fields. */
export const PixivUserProfilePublicitySchema = z.object({
  gender: PublicitySchema,
  region: PublicitySchema,
  birthDay: PublicitySchema,
  birthYear: PublicitySchema,
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
  workspaceImageUrl: z.string().nullable(),
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
  isMuted: z.boolean(),
})

/** Profile badge returned by GET /v2/user/detail. */
export const PixivUserProfileBadgeSchema = z.object({
  type: z.string(),
  url: z.string().nullable(),
})

/** Detailed profile information returned by GET /v2/user/detail. */
export const PixivUserProfileV2Schema = z.object({
  webpage: z.string().nullable(),
  gender: z.number().nullable(),
  birth: z.string().nullable(),
  birthDay: z.string().nullable(),
  birthYear: z.number().nullable(),
  region: z.string().nullable(),
  addressId: z.number().nullable(),
  countryCode: z.string().nullable(),
  job: z.string().nullable(),
  jobId: z.number().nullable(),
  totalFollowUsers: z.number(),
  totalMypixivUsers: z.number(),
  totalIllusts: z.number(),
  totalManga: z.number(),
  totalNovels: z.number(),
  totalIllustSeries: z.number(),
  totalNovelSeries: z.number(),
  backgroundImageUrl: z.string().nullable(),
  twitterAccount: z.string().nullable(),
  twitterUrl: z.string().nullable(),
  isPremium: z.boolean(),
  isUsingCustomProfileImage: z.boolean(),
  badge: PixivUserProfileBadgeSchema.nullable(),
})

/** Visibility settings returned by GET /v2/user/detail. */
export const PixivUserProfilePublicityV2Schema = z.object({
  gender: PublicitySchema.nullable(),
  region: PublicitySchema.nullable(),
  birthDay: PublicitySchema.nullable(),
  birthYear: PublicitySchema.nullable(),
  job: PublicitySchema.nullable(),
})

/** Workspace information returned by GET /v2/user/detail. */
export const PixivUserProfileWorkspaceV2Schema =
  PixivUserProfileWorkspaceSchema.omit({ workspaceImageUrl: true })

/** Response shape for GET /v2/user/detail. */
export const UserDetailV2ResponseSchema = z.object({
  user: PixivUserItemSchema.extend({ isAcceptRequest: z.boolean() }),
  profile: PixivUserProfileV2Schema,
  profilePublicity: PixivUserProfilePublicityV2Schema,
  workspace: PixivUserProfileWorkspaceV2Schema,
  disabledLinks: z.array(z.unknown()),
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
