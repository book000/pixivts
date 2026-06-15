/**
 * Public option types for @book000/pixivts.
 *
 * Each option is exported as both a runtime `const` object (for enum-like
 * access, e.g. `BookmarkRestrict.PUBLIC`) and a TypeScript `type` (so plain
 * string literals such as `'public'` are also accepted).
 *
 * @example
 * ```ts
 * // Enum-like usage
 * await client.illusts.bookmarkAdd({ illustId: 123, restrict: BookmarkRestrict.PUBLIC })
 *
 * // Plain string literal — also valid
 * await client.illusts.bookmarkAdd({ illustId: 123, restrict: 'public' })
 * ```
 */

/**
 * Search match target for illust / novel searches.
 *
 * - `partial_match_for_tags` — tags contain the word (default)
 * - `exact_match_for_tags` — tags exactly equal the word
 * - `title_and_caption` — title or caption contains the word
 * - `keyword` — general keyword search (novel only)
 */
export const SearchTarget = {
  PARTIAL_MATCH_FOR_TAGS: 'partial_match_for_tags',
  EXACT_MATCH_FOR_TAGS: 'exact_match_for_tags',
  TITLE_AND_CAPTION: 'title_and_caption',
  KEYWORD: 'keyword',
} as const
export type SearchTarget = (typeof SearchTarget)[keyof typeof SearchTarget]

/**
 * Sort order for search results.
 *
 * - `date_desc` — newest first (default)
 * - `date_asc` — oldest first
 * - `popular_desc` — most bookmarks first (premium only)
 */
export const SearchSort = {
  DATE_DESC: 'date_desc',
  DATE_ASC: 'date_asc',
  POPULAR_DESC: 'popular_desc',
} as const
export type SearchSort = (typeof SearchSort)[keyof typeof SearchSort]

/**
 * Date range filter for search results.
 *
 * - `within_last_day` — past 24 hours
 * - `within_last_week` — past 7 days
 * - `within_last_month` — past 30 days
 */
export const SearchDuration = {
  WITHIN_LAST_DAY: 'within_last_day',
  WITHIN_LAST_WEEK: 'within_last_week',
  WITHIN_LAST_MONTH: 'within_last_month',
} as const
export type SearchDuration = (typeof SearchDuration)[keyof typeof SearchDuration]

/**
 * Ranking mode for illust rankings.
 *
 * R-18 modes require a premium account with R-18 content enabled.
 */
export const RankingMode = {
  DAY: 'day',
  DAY_MALE: 'day_male',
  DAY_FEMALE: 'day_female',
  WEEK_ORIGINAL: 'week_original',
  WEEK_ROOKIE: 'week_rookie',
  WEEK: 'week',
  MONTH: 'month',
  DAY_AI: 'day_ai',
  DAY_R18: 'day_r18',
  WEEK_R18: 'week_r18',
  DAY_MALE_R18: 'day_male_r18',
  DAY_FEMALE_R18: 'day_female_r18',
  DAY_R18_AI: 'day_r18_ai',
} as const
export type RankingMode = (typeof RankingMode)[keyof typeof RankingMode]

/**
 * Ranking mode for novel rankings.
 *
 * R-18 modes require a premium account with R-18 content enabled.
 */
export const NovelRankingMode = {
  DAY: 'day',
  WEEK: 'week',
  DAY_MALE: 'day_male',
  DAY_FEMALE: 'day_female',
  WEEK_ROOKIE: 'week_rookie',
  DAY_R18: 'day_r18',
  WEEK_R18: 'week_r18',
  DAY_R18_AI: 'day_r18_ai',
} as const
export type NovelRankingMode = (typeof NovelRankingMode)[keyof typeof NovelRankingMode]

/**
 * Visibility restriction for bookmarks.
 *
 * - `public` — publicly visible (default)
 * - `private` — visible only to the owner
 */
export const BookmarkRestrict = {
  PUBLIC: 'public',
  PRIVATE: 'private',
} as const
export type BookmarkRestrict = (typeof BookmarkRestrict)[keyof typeof BookmarkRestrict]

/**
 * Visibility restriction for follows.
 *
 * - `public` — publicly visible (default)
 * - `private` — visible only to the owner
 */
export const FollowRestrict = {
  PUBLIC: 'public',
  PRIVATE: 'private',
} as const
export type FollowRestrict = (typeof FollowRestrict)[keyof typeof FollowRestrict]

/**
 * OS filter used to request works compatible with the given platform.
 *
 * - `for_ios` — iOS-compatible works (default)
 * - `for_android` — Android-compatible works
 */
export const OSFilter = {
  FOR_IOS: 'for_ios',
  FOR_ANDROID: 'for_android',
} as const
export type OSFilter = (typeof OSFilter)[keyof typeof OSFilter]

/**
 * Work type filter for user illust listings.
 *
 * - `illust` — illustrations only
 * - `manga` — manga only
 */
export const UserIllustType = {
  ILLUST: 'illust',
  MANGA: 'manga',
} as const
export type UserIllustType = (typeof UserIllustType)[keyof typeof UserIllustType]
