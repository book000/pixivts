/**
 * Public types for @book000/pixivts.
 *
 * These are explicitly-written TypeScript interfaces — NOT derived via
 * `z.infer<>` at this level — to guarantee that the built `.d.ts` files
 * contain no zod references.  The corresponding zod schemas in `src/schemas/`
 * exist solely for internal use (tests, safeParse fixture validation).
 *
 * Correctness is verified by `expectTypeOf` checks in `tests/types.test.ts`.
 */

// ---------------------------------------------------------------------------
// Common
// ---------------------------------------------------------------------------

/**
 * Image URLs for a work (thumbnail variants).
 *
 * Accessing these URLs requires setting an appropriate `Referer` header.
 */
export interface ImageUrls {
  /** 360×360 thumbnail */
  square_medium: string
  /** Long side ≤ 540 px */
  medium: string
  /** Width ≤ 600 px, height ≤ 1200 px */
  large: string
  /** Original image (present in `meta_pages` entries only) */
  original?: string
}

/** Profile image URLs for a user. */
export interface ProfileImageUrls {
  medium: string
}

/**
 * Minimal user info embedded in works, search results, and preview lists.
 *
 * Full profile data is returned by GET /v1/user/detail.
 */
export interface PixivUser {
  /**
   * Internal numeric user ID.
   *
   * NOTE: certain API endpoints return this as a string.  The core library
   * normalises it to `number` before returning it to callers.
   */
  id: number
  name: string
  account: string
  profile_image_urls: ProfileImageUrls
  is_followed?: boolean
  is_access_blocking_user?: boolean
  is_accept_request?: boolean
}

/** Tag on a work. */
export interface Tag {
  name: string
  translated_name: string | null
  added_by_uploaded_user?: boolean
}

/** Series information embedded in a work item. */
export interface Series {
  id: number
  title: string
}

/** Privacy-policy blurb returned by recommended endpoints. */
export interface PrivacyPolicy {
  version?: string
  message?: string
  url?: string
}

// ---------------------------------------------------------------------------
// Illust
// ---------------------------------------------------------------------------

/** Original-image URL for a single-page illust. */
export interface MetaSinglePage {
  original_image_url: string
}

/** Per-page image URLs for a multi-page work (manga). */
export interface MetaPages {
  image_urls: Required<ImageUrls>
}

/**
 * A pixiv illust or manga work item as returned by the API.
 *
 * Returned by GET /v1/illust/detail, GET /v1/search/illust,
 * GET /v1/illust/ranking, GET /v1/illust/recommended, etc.
 */
export interface PixivIllustItem {
  /**
   * Work ID.
   *
   * Illusts and novels are numbered in separate sequences — the same ID
   * can appear in both.
   */
  id: number
  title: string
  /** "illust" | "manga" | "ugoira" */
  type: 'illust' | 'manga' | 'ugoira'
  image_urls: ImageUrls
  caption: string
  restrict: number
  user: PixivUser
  tags: Tag[]
  tools: string[]
  /** ISO 8601 date-time string */
  create_date: string
  page_count: number
  width: number
  height: number
  sanity_level: number
  /** 0 = all-ages, 1 = R-18, 2 = R-18G */
  x_restrict: number
  series: Series | null
  /**
   * For single-page works: `{ original_image_url: string }`.
   * For multi-page works: `{}` (empty object).
   */
  meta_single_page: MetaSinglePage | Record<string, never>
  meta_pages: MetaPages[]
  total_view: number
  total_bookmarks: number
  is_bookmarked: boolean
  visible: boolean
  is_muted: boolean
  total_comments?: number
  /** 0 = no AI, 1 = partial AI, 2 = fully AI */
  illust_ai_type: number
  illust_book_style: number
  comment_access_control?: number
  restriction_attributes?: string[]
}

/** Illust series metadata returned by GET /v1/illust/series. */
export interface IllustSeriesDetail {
  id: number
  title: string
  caption: string
  cover_image_urls: { medium: string }
  series_work_count: number
  create_date: string
  width: number
  height: number
  user: PixivUser
  watchlist_added: boolean
}

// ---------------------------------------------------------------------------
// Novel
// ---------------------------------------------------------------------------

/**
 * A pixiv novel work item as returned by the API.
 *
 * Returned by GET /v2/novel/detail, GET /v1/search/novel, etc.
 */
export interface PixivNovelItem {
  id: number
  title: string
  caption: string
  restrict: number
  /** 0 = all-ages, 1 = R-18, 2 = R-18G */
  x_restrict: number
  is_original: boolean
  /** Cover image URLs */
  image_urls: ImageUrls
  /** ISO 8601 date-time string */
  create_date: string
  tags: Tag[]
  page_count: number
  text_length: number
  user: PixivUser
  /**
   * Series information.
   *
   * `{}` (empty object) if the novel does not belong to a series.
   */
  series: Series | Record<string, never>
  is_bookmarked: boolean
  total_bookmarks: number
  total_view: number
  visible: boolean
  total_comments: number
  is_muted: boolean
  is_mypixiv_only: boolean
  is_x_restricted: boolean
  /** 0 = no AI, 1 = partial AI, 2 = fully AI */
  novel_ai_type: number
  comment_access_control?: number
}

/** Novel series details returned by GET /v2/novel/series. */
export interface NovelSeriesDetail {
  id: number
  title: string
  caption: string
  is_original: boolean
  is_concluded: boolean
  content_count: number
  total_character_count: number
  user: PixivUser
  display_text: string
  /** 0 = no AI, 1 = partial AI, 2 = fully AI */
  novel_ai_type: number
  watchlist_added: boolean
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

/** User item with self-introduction; embedded in GET /v1/user/detail. */
export type PixivUserItem = PixivUser & {
  /** Self-introduction text (line endings are \r\n) */
  comment: string
}

/** Visibility setting for a user profile field. */
export type Publicity = 'public' | 'private' | 'mypixiv'

/** Detailed profile information for a user. */
export interface PixivUserProfile {
  webpage: string | null
  gender: 'male' | 'female' | 'unknown'
  birth: string
  birth_day: string
  birth_year: number
  region: string
  address_id: number
  country_code: string
  job: string
  job_id: number
  total_follow_users: number
  total_mypixiv_users: number
  total_illusts: number
  total_manga: number
  total_novels: number
  total_illust_bookmarks_public: number
  total_illust_series: number
  total_novel_series: number
  background_image_url: string | null
  twitter_account: string
  twitter_url: string | null
  pawoo_url: string | null
  is_premium: boolean
  is_using_custom_profile_image: boolean
}

/** Visibility settings for a user's profile fields. */
export interface PixivUserProfilePublicity {
  gender: Publicity
  region: Publicity
  birth_day: Publicity
  birth_year: Publicity
  job: Publicity
  pawoo: boolean
}

/** Workspace / desk setup information from a user's profile. */
export interface PixivUserProfileWorkspace {
  pc: string
  monitor: string
  tool: string
  scanner: string
  tablet: string
  mouse: string
  printer: string
  desktop: string
  music: string
  desk: string
  chair: string
  comment: string
  workspace_image_url: string | null
}

/**
 * Preview item for a user in the GET /v1/user/following response.
 *
 * Contains a few sample illusts and novels from that user.
 */
export interface PixivUserPreviewItem {
  user: PixivUser
  illusts: PixivIllustItem[]
  novels: PixivNovelItem[]
  is_muted: boolean
}

// ---------------------------------------------------------------------------
// Ugoira
// ---------------------------------------------------------------------------

/** URLs for ugoira frame archives (ZIP files). */
export interface ZipUrls {
  /** URL for the 600 px-long-side archive. */
  medium: string
}

/** Timing info for a single ugoira frame. */
export interface Frame {
  /** File name within the ZIP archive */
  file: string
  /** Display duration in milliseconds */
  delay: number
}

/** Ugoira metadata as returned by GET /v1/ugoira/metadata. */
export interface PixivUgoiraItem {
  zip_urls: ZipUrls
  frames: Frame[]
}

// ---------------------------------------------------------------------------
// API error body
// ---------------------------------------------------------------------------

/**
 * Shape of the JSON body returned by the pixiv API on error.
 */
export interface PixivApiErrorBody {
  error: {
    user_message: string
    message: string
    reason: string
    user_message_details?: Record<string, unknown>
  }
}

// ---------------------------------------------------------------------------
// Response types for API endpoints
// (PagedResponse extends are compatible with PaginatedResultAsync)
// ---------------------------------------------------------------------------

// Illust endpoint responses

/** Response shape for GET /v1/illust/detail. */
export interface IllustDetailResponse {
  illust: PixivIllustItem
}

/** Page response for illust list endpoints (search, related, ranking, etc.). */
export interface IllustListPage {
  illusts: PixivIllustItem[]
  next_url: string | null
}

/** Page response for GET /v1/illust/recommended. */
export interface IllustRecommendedPage {
  illusts: PixivIllustItem[]
  ranking_illusts: PixivIllustItem[]
  contest_exists: boolean
  privacy_policy?: PrivacyPolicy
  next_url: string | null
}

/** Page response for GET /v1/illust/series. */
export interface IllustSeriesPage {
  illust_series_detail: IllustSeriesDetail
  illust_series_first_illust: PixivIllustItem
  illusts: PixivIllustItem[]
  next_url: string | null
}

// Manga endpoint responses

/** Page response for GET /v1/manga/recommended. */
export interface MangaRecommendedPage {
  illusts: PixivIllustItem[]
  ranking_illusts: PixivIllustItem[]
  privacy_policy?: PrivacyPolicy
  next_url: string | null
}

// Ugoira endpoint responses

/** Response shape for GET /v1/ugoira/metadata. */
export interface UgoiraMetadataResponse {
  ugoira_metadata: PixivUgoiraItem
}

// Novel endpoint responses

/** Response shape for GET /v2/novel/detail. */
export interface NovelDetailResponse {
  novel: PixivNovelItem
}

/** Page response for novel list endpoints (search, related, ranking, etc.). */
export interface NovelListPage {
  novels: PixivNovelItem[]
  next_url: string | null
}

/** Page response for GET /v1/novel/recommended. */
export interface NovelRecommendedPage {
  novels: PixivNovelItem[]
  ranking_novels: PixivNovelItem[]
  privacy_policy?: PrivacyPolicy
  next_url: string | null
}

/** Page response for GET /v2/novel/series. */
export interface NovelSeriesPage {
  novel_series_detail: NovelSeriesDetail
  novel_series_first_novel: PixivNovelItem
  novel_series_latest_novel: PixivNovelItem
  novels: PixivNovelItem[]
  next_url: string | null
}

// User endpoint responses

/** Response shape for GET /v1/user/detail. */
export interface UserDetailResponse {
  user: PixivUserItem
  profile: PixivUserProfile
  profile_publicity: PixivUserProfilePublicity
  workspace: PixivUserProfileWorkspace
}

/** Page response for GET /v1/user/illusts. */
export interface UserIllustsPage {
  user: PixivUser
  illusts: PixivIllustItem[]
  next_url: string | null
}

/** Page response for GET /v1/user/novels. */
export interface UserNovelsPage {
  user: PixivUser
  novels: PixivNovelItem[]
  next_url: string | null
}

/** Page response for GET /v1/user/bookmarks/illust. */
export interface UserBookmarksIllustPage {
  illusts: PixivIllustItem[]
  next_url: string | null
}

/** Page response for GET /v1/user/bookmarks/novel. */
export interface UserBookmarksNovelPage {
  novels: PixivNovelItem[]
  next_url: string | null
}

/** Page response for GET /v1/user/following. */
export interface UserFollowingPage {
  user_previews: PixivUserPreviewItem[]
  next_url: string | null
}
