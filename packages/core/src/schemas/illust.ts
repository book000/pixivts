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
} from './common.js'

/** Single-page illust detail (original_image_url). */
export const MetaSinglePageSchema = z.object({
  original_image_url: z.string(),
})

/** Multi-page illust detail (image_urls for each page). */
export const MetaPagesSchema = z.object({
  image_urls: ImageUrlsSchema.extend({
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
  image_urls: ImageUrlsSchema,
  caption: z.string(),
  restrict: z.number(),
  user: PixivUserSchema,
  tags: z.array(TagSchema),
  tools: z.array(z.string()),
  /** ISO 8601 date-time string */
  create_date: z.string(),
  page_count: z.number(),
  width: z.number(),
  height: z.number(),
  sanity_level: z.number(),
  /** 0 = all-ages, 1 = R-18, 2 = R-18G */
  x_restrict: z.number(),
  series: SeriesSchema.nullable(),
  /**
   * For single-page works this is `{ original_image_url: string }`.
   * For multi-page works this is an empty object `{}`.
   */
  meta_single_page: z.union([MetaSinglePageSchema, z.record(z.never())]),
  meta_pages: z.array(MetaPagesSchema),
  total_view: z.number(),
  total_bookmarks: z.number(),
  is_bookmarked: z.boolean(),
  visible: z.boolean(),
  is_muted: z.boolean(),
  total_comments: z.number().optional(),
  /** 0 = no AI, 1 = partial AI, 2 = fully AI */
  illust_ai_type: z.number(),
  illust_book_style: z.number(),
  comment_access_control: z.number().optional(),
  restriction_attributes: z.array(z.string()).optional(),
})

/** Illust series metadata returned by GET /v1/illust/series. */
export const IllustSeriesDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  caption: z.string(),
  cover_image_urls: z.object({ medium: z.string() }),
  series_work_count: z.number(),
  create_date: z.string(),
  width: z.number(),
  height: z.number(),
  user: PixivUserSchema,
  watchlist_added: z.boolean(),
})

export type PixivIllustItem = z.infer<typeof PixivIllustItemSchema>
export type MetaSinglePage = z.infer<typeof MetaSinglePageSchema>
export type MetaPages = z.infer<typeof MetaPagesSchema>
export type IllustSeriesDetail = z.infer<typeof IllustSeriesDetailSchema>
