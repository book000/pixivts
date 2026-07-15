/**
 * Zod schemas for pixiv illust-related types.
 *
 * Internal — not exported from the package barrel.
 */

import { z } from 'zod'
import {
  ImageUrlsSchema,
  PixivUserSchema,
  SeriesSchema,
  TagSchema,
} from './common'

/** Single-page illust detail (originalImageUrl). */
export const MetaSinglePageSchema = z.object({
  originalImageUrl: z.string().optional(),
})

/** Multi-page illust detail (imageUrls for each page). */
export const MetaPagesSchema = z.object({
  imageUrls: ImageUrlsSchema.extend({
    original: z.string(),
  }),
})

/** A pixiv illust or manga work item as returned by the API. */
export const PixivIllustItemSchema = z.object({
  /**
   * Work ID.
   *
   * Illusts and novels are numbered in separate sequences — the same ID
   * can appear in both.
   */
  id: z.number(),
  title: z.string(),
  /** "illust" | "manga" | "ugoira" */
  type: z.enum(['illust', 'manga', 'ugoira']),
  imageUrls: ImageUrlsSchema,
  caption: z.string(),
  restrict: z.number(),
  user: PixivUserSchema,
  tags: z.array(TagSchema),
  tools: z.array(z.string()),
  /** ISO 8601 date-time string */
  createDate: z.string(),
  pageCount: z.number(),
  width: z.number(),
  height: z.number(),
  sanityLevel: z.number(),
  /** 0 = all-ages, 1 = R-18, 2 = R-18G */
  xRestrict: z.number(),
  series: SeriesSchema.nullable(),
  /**
   * For single-page works this is `{ originalImageUrl: string }`.
   * For multi-page works this is an empty object `{}`.
   */
  metaSinglePage: z.union([
    MetaSinglePageSchema,
    z.record(z.string(), z.never()),
  ]),
  metaPages: z.array(MetaPagesSchema),
  totalView: z.number(),
  totalBookmarks: z.number(),
  isBookmarked: z.boolean(),
  visible: z.boolean(),
  isMuted: z.boolean(),
  totalComments: z.number().optional(),
  /** 0 = no AI, 1 = partial AI, 2 = fully AI */
  illustAiType: z.number(),
  illustBookStyle: z.number(),
  commentAccessControl: z.number().optional(),
  restrictionAttributes: z.array(z.string()).optional(),
})

/** Illust series metadata returned by GET /v1/illust/series. */
export const IllustSeriesDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  caption: z.string(),
  coverImageUrls: z.object({ medium: z.string() }),
  seriesWorkCount: z.number(),
  createDate: z.string(),
  width: z.number(),
  height: z.number(),
  user: PixivUserSchema,
  watchlistAdded: z.boolean(),
})

/** A single comment on an illust. */
export const IllustCommentSchema: z.ZodType<{
  id: number
  comment: string
  date: string
  user: z.infer<typeof PixivUserSchema>
  hasReplies?: boolean
  parentComment?: Record<string, never> | z.infer<typeof IllustCommentSchema>
}> = z.lazy(() =>
  z.object({
    id: z.number(),
    comment: z.string(),
    date: z.string(),
    user: PixivUserSchema,
    hasReplies: z.boolean().optional(),
    parentComment: z
      .union([z.record(z.string(), z.never()), IllustCommentSchema])
      .optional(),
  })
)

/** Tag entry within a bookmark detail. */
export const BookmarkDetailTagSchema = z.object({
  name: z.string(),
  isRegistered: z.boolean(),
})

/** Bookmark metadata for a single illust. */
export const BookmarkDetailSchema = z.object({
  isBookmarked: z.boolean(),
  tags: z.array(BookmarkDetailTagSchema),
  restrict: z.enum(['public', 'private', '']),
})

export type PixivIllustItem = z.infer<typeof PixivIllustItemSchema>
export type MetaSinglePage = z.infer<typeof MetaSinglePageSchema>
export type MetaPages = z.infer<typeof MetaPagesSchema>
export type IllustSeriesDetail = z.infer<typeof IllustSeriesDetailSchema>
export type IllustComment = z.infer<typeof IllustCommentSchema>
export type BookmarkDetailTag = z.infer<typeof BookmarkDetailTagSchema>
export type BookmarkDetail = z.infer<typeof BookmarkDetailSchema>
