/**
 * Public option types for @book000/pixivts.
 *
 * All types are string literal unions — NOT TypeScript enums — so callers
 * do not need to import a runtime value and the values are transparent in
 * serialised output.
 */

/**
 * Search match target for illust / novel searches.
 *
 * - `partial_match_for_tags` — tags contain the word (default)
 * - `exact_match_for_tags` — tags exactly equal the word
 * - `title_and_caption` — title or caption contains the word
 * - `keyword` — general keyword search (novel only)
 */
export type SearchTarget =
  | 'partial_match_for_tags'
  | 'exact_match_for_tags'
  | 'title_and_caption'
  | 'keyword'

/**
 * Sort order for search results.
 *
 * - `date_desc` — newest first (default)
 * - `date_asc` — oldest first
 * - `popular_desc` — most bookmarks first (premium only)
 */
export type SearchSort = 'date_desc' | 'date_asc' | 'popular_desc'

/**
 * Date range filter for search results.
 *
 * - `within_last_day` — past 24 hours
 * - `within_last_week` — past 7 days
 * - `within_last_month` — past 30 days
 */
export type SearchDuration =
  | 'within_last_day'
  | 'within_last_week'
  | 'within_last_month'

/**
 * Ranking mode for illust rankings.
 *
 * R-18 modes require a premium account with R-18 content enabled.
 */
export type RankingMode =
  | 'day'
  | 'day_male'
  | 'day_female'
  | 'week_original'
  | 'week_rookie'
  | 'week'
  | 'month'
  | 'day_ai'
  | 'day_r18'
  | 'week_r18'
  | 'day_male_r18'
  | 'day_female_r18'
  | 'day_r18_ai'

/**
 * Ranking mode for novel rankings.
 *
 * R-18 modes require a premium account with R-18 content enabled.
 */
export type NovelRankingMode =
  | 'day'
  | 'week'
  | 'day_male'
  | 'day_female'
  | 'week_rookie'
  | 'day_r18'
  | 'week_r18'
  | 'day_r18_ai'

/**
 * Visibility restriction for bookmarks.
 *
 * - `public` — publicly visible (default)
 * - `private` — visible only to the owner
 */
export type BookmarkRestrict = 'public' | 'private'

/**
 * Visibility restriction for follows.
 *
 * - `public` — publicly visible (default)
 * - `private` — visible only to the owner
 */
export type FollowRestrict = 'public' | 'private'

/**
 * OS filter used to request works compatible with the given platform.
 *
 * - `for_ios` — iOS-compatible works (default)
 * - `for_android` — Android-compatible works
 */
export type OSFilter = 'for_ios' | 'for_android'

/**
 * Work type filter for user illust listings.
 *
 * - `illust` — illustrations only
 * - `manga` — manga only
 */
export type UserIllustType = 'illust' | 'manga'
