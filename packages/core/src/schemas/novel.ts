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
  xRestrict: z.number(),
  isOriginal: z.boolean(),
  /** Cover image URLs */
  imageUrls: ImageUrlsSchema,
  /** ISO 8601 date-time string */
  createDate: z.string(),
  tags: z.array(TagSchema),
  pageCount: z.number(),
  textLength: z.number(),
  user: PixivUserSchema,
  /**
   * Series information.
   *
   * Contains `{}` (empty object) if the novel does not belong to a series.
   */
  series: z.union([SeriesSchema, z.record(z.string(), z.never())]),
  isBookmarked: z.boolean(),
  totalBookmarks: z.number(),
  totalView: z.number(),
  visible: z.boolean(),
  totalComments: z.number(),
  isMuted: z.boolean(),
  isMypixivOnly: z.boolean(),
  isXRestricted: z.boolean(),
  /** 0 = no AI, 1 = partial AI, 2 = fully AI */
  novelAiType: z.number(),
  commentAccessControl: z.number().optional(),
})

/** Novel series details returned by GET /v2/novel/series. */
export const NovelSeriesDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  caption: z.string(),
  isOriginal: z.boolean(),
  isConcluded: z.boolean(),
  contentCount: z.number(),
  totalCharacterCount: z.number(),
  user: PixivUserSchema,
  displayText: z.string(),
  /** 0 = no AI, 1 = partial AI, 2 = fully AI */
  novelAiType: z.number(),
  watchlistAdded: z.boolean(),
})

export type PixivNovelItem = z.infer<typeof PixivNovelItemSchema>
export type NovelSeriesDetail = z.infer<typeof NovelSeriesDetailSchema>
