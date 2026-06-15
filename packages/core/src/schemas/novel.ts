/**
 * Zod schemas for pixiv novel-related types.
 *
 * Internal — not exported from the package barrel.
 */

import { z } from 'zod'
import { ImageUrlsSchema, PixivUserSchema, SeriesSchema, TagSchema } from './common'

/** A pixiv novel work item as returned by the API. */
export const PixivNovelItemSchema = z.object({
  /**
   * Work ID.
   *
   * Novels and illusts are numbered in separate sequences — the same ID
   * can appear in both.
   */
  id: z.number(),
  title: z.string(),
  caption: z.string(),
  restrict: z.number(),
  /** 0 = all-ages, 1 = R-18, 2 = R-18G */
  x_restrict: z.number(),
  is_original: z.boolean(),
  /** Cover image URLs */
  image_urls: ImageUrlsSchema,
  /** ISO 8601 date-time string */
  create_date: z.string(),
  tags: z.array(TagSchema),
  page_count: z.number(),
  text_length: z.number(),
  user: PixivUserSchema,
  /**
   * Series information.
   *
   * Contains `{}` (empty object) if the novel does not belong to a series.
   */
  series: z.union([SeriesSchema, z.record(z.never())]),
  is_bookmarked: z.boolean(),
  total_bookmarks: z.number(),
  total_view: z.number(),
  visible: z.boolean(),
  total_comments: z.number(),
  is_muted: z.boolean(),
  is_mypixiv_only: z.boolean(),
  is_x_restricted: z.boolean(),
  /** 0 = no AI, 1 = partial AI, 2 = fully AI */
  novel_ai_type: z.number(),
  comment_access_control: z.number().optional(),
})

/** Novel series details returned by GET /v2/novel/series. */
export const NovelSeriesDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  caption: z.string(),
  is_original: z.boolean(),
  is_concluded: z.boolean(),
  content_count: z.number(),
  total_character_count: z.number(),
  user: PixivUserSchema,
  display_text: z.string(),
  /** 0 = no AI, 1 = partial AI, 2 = fully AI */
  novel_ai_type: z.number(),
  watchlist_added: z.boolean(),
})

export type PixivNovelItem = z.infer<typeof PixivNovelItemSchema>
export type NovelSeriesDetail = z.infer<typeof NovelSeriesDetailSchema>
