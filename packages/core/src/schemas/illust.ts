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
  originalImageUrl: z.string(),
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
  metaSinglePage: z.union([MetaSinglePageSchema, z.record(z.never())]),
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

export type PixivIllustItem = z.infer<typeof PixivIllustItemSchema>
export type MetaSinglePage = z.infer<typeof MetaSinglePageSchema>
export type MetaPages = z.infer<typeof MetaPagesSchema>
export type IllustSeriesDetail = z.infer<typeof IllustSeriesDetailSchema>
