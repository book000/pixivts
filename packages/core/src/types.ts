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
  /** Medium-size profile image URL. */
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
  /** Display name shown on the user's profile. */
  name: string
  /** Login account name (distinct from the display `name`). */
  account: string
  /** Set of profile image URLs at different sizes. */
  profile_image_urls: ProfileImageUrls
  /** Whether the authenticated user follows this user. */
  is_followed?: boolean
  /** Whether this user has blocked access by the authenticated user. */
  is_access_blocking_user?: boolean
  /** Whether this user accepts illustration commission requests. */
  is_accept_request?: boolean
}

/** Tag on a work. */
export interface Tag {
  /** Tag name in Japanese. */
  name: string
  /** Translated tag name, or `null` if no translation is available. */
  translated_name: string | null
  /** Whether the tag was added by the work's uploader. */
  added_by_uploaded_user?: boolean
}

/** Series information embedded in a work item. */
export interface Series {
  /** Series ID. */
  id: number
  /** Series title. */
  title: string
}

/** Privacy-policy blurb returned by recommended endpoints. */
export interface PrivacyPolicy {
  /** Policy version string. */
  version?: string
  /** Human-readable policy notice. */
  message?: string
  /** URL to the full privacy-policy page. */
  url?: string
}

// ---------------------------------------------------------------------------
// Illust
// ---------------------------------------------------------------------------

/** Original-image URL for a single-page illust. */
export interface MetaSinglePage {
  /** Direct URL to the original-resolution image. */
  original_image_url: string
}

/** Per-page image URLs for a multi-page work (manga). */
export interface MetaPages {
  /** Full set of image URLs for this page, including the original. */
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
  /** Title of the work. */
  title: string
  /** Work category: illustration, manga, or animated illustration. */
  type: 'illust' | 'manga' | 'ugoira'
  /** Thumbnail image URLs at various sizes. */
  image_urls: ImageUrls
  /** Work caption / description (may contain HTML). */
  caption: string
  /** Content restriction level (0 = public, 1 = mypixiv-only, 2 = private). */
  restrict: number
  /** Author of the work. */
  user: PixivUser
  /** Tags attached to the work. */
  tags: Tag[]
  /** Creation tools listed by the author (e.g. "Photoshop"). */
  tools: string[]
  /** ISO 8601 date-time string of when the work was posted. */
  create_date: string
  /** Number of images in a multi-page work (1 for single-page). */
  page_count: number
  /** Canvas width in pixels. */
  width: number
  /** Canvas height in pixels. */
  height: number
  /** Sanity / sensitivity level assigned by the pixiv content filter. */
  sanity_level: number
  /** Age restriction: 0 = all-ages, 1 = R-18, 2 = R-18G */
  x_restrict: number
  /** Series this work belongs to, or `null` if not part of a series. */
  series: Series | null
  /**
   * For single-page works: `{ original_image_url: string }`.
   * For multi-page works: `{}` (empty object).
   */
  meta_single_page: MetaSinglePage | Record<string, never>
  /** Per-page image URLs for multi-page works (empty array for single-page). */
  meta_pages: MetaPages[]
  /** Total number of views. */
  total_view: number
  /** Total number of bookmarks. */
  total_bookmarks: number
  /** Whether the authenticated user has bookmarked this work. */
  is_bookmarked: boolean
  /** Whether the work is publicly visible. */
  visible: boolean
  /** Whether the work is muted for the authenticated user. */
  is_muted: boolean
  /** Total number of comments (may be absent on some endpoints). */
  total_comments?: number
  /** AI-generated content flag: 0 = no AI, 1 = partial AI, 2 = fully AI */
  illust_ai_type: number
  /** Book-style rendering flag (0 = normal, 1 = book). */
  illust_book_style: number
  /** Controls who can post comments (may be absent). */
  comment_access_control?: number
  /** Additional access-restriction attributes (may be absent). */
  restriction_attributes?: string[]
}

/** Illust series metadata returned by GET /v1/illust/series. */
export interface IllustSeriesDetail {
  /** Series ID. */
  id: number
  /** Series title. */
  title: string
  /** Series description / caption. */
  caption: string
  /** Cover image URLs. */
  cover_image_urls: { medium: string }
  /** Number of works in the series. */
  series_work_count: number
  /** ISO 8601 date-time string of when the series was created. */
  create_date: string
  /** Canvas width of the cover image in pixels. */
  width: number
  /** Canvas height of the cover image in pixels. */
  height: number
  /** Author of the series. */
  user: PixivUser
  /** Whether the authenticated user has added this series to their watchlist. */
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
  /**
   * Work ID.
   *
   * Novels and illusts are numbered in separate sequences — the same ID
   * can appear in both.
   */
  id: number
  /** Title of the novel. */
  title: string
  /** Synopsis / caption (may contain HTML). */
  caption: string
  /** Content restriction level (0 = public, 1 = mypixiv-only, 2 = private). */
  restrict: number
  /** Age restriction: 0 = all-ages, 1 = R-18, 2 = R-18G */
  x_restrict: number
  /** Whether the novel is an original work (not fan fiction). */
  is_original: boolean
  /** Cover image URLs. */
  image_urls: ImageUrls
  /** ISO 8601 date-time string of when the novel was posted. */
  create_date: string
  /** Tags attached to the novel. */
  tags: Tag[]
  /** Number of pages (word-count chunks). */
  page_count: number
  /** Total character count of the novel body. */
  text_length: number
  /** Author of the novel. */
  user: PixivUser
  /**
   * Series information.
   *
   * `{}` (empty object) if the novel does not belong to a series.
   */
  series: Series | Record<string, never>
  /** Whether the authenticated user has bookmarked this novel. */
  is_bookmarked: boolean
  /** Total number of bookmarks. */
  total_bookmarks: number
  /** Total number of views. */
  total_view: number
  /** Whether the novel is publicly visible. */
  visible: boolean
  /** Total number of comments. */
  total_comments: number
  /** Whether the novel is muted for the authenticated user. */
  is_muted: boolean
  /** Whether the novel is restricted to mutual followers (mypixiv). */
  is_mypixiv_only: boolean
  /** Whether the novel contains explicit content beyond the `x_restrict` flag. */
  is_x_restricted: boolean
  /** AI-generated content flag: 0 = no AI, 1 = partial AI, 2 = fully AI */
  novel_ai_type: number
  /** Controls who can post comments (may be absent). */
  comment_access_control?: number
}

/** Novel series details returned by GET /v2/novel/series. */
export interface NovelSeriesDetail {
  /** Series ID. */
  id: number
  /** Series title. */
  title: string
  /** Series description / caption. */
  caption: string
  /** Whether every novel in the series is original (not fan fiction). */
  is_original: boolean
  /** Whether the series has been marked as concluded by the author. */
  is_concluded: boolean
  /** Number of novels in the series. */
  content_count: number
  /** Total character count across all novels in the series. */
  total_character_count: number
  /** Author of the series. */
  user: PixivUser
  /** Human-readable series label / tagline. */
  display_text: string
  /** AI-generated content flag: 0 = no AI, 1 = partial AI, 2 = fully AI */
  novel_ai_type: number
  /** Whether the authenticated user has added this series to their watchlist. */
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
  /** Personal website URL, or `null` if not set. */
  webpage: string | null
  /** Disclosed gender. */
  gender: 'male' | 'female' | 'unknown'
  /** Birth date string (YYYY-MM-DD format, may be partial). */
  birth: string
  /** Birth day portion (MM-DD format). */
  birth_day: string
  /** Birth year. */
  birth_year: number
  /** Region / prefecture. */
  region: string
  /** Internal address ID. */
  address_id: number
  /** Two-letter country code (ISO 3166-1 alpha-2). */
  country_code: string
  /** Occupation / job description. */
  job: string
  /** Internal job category ID. */
  job_id: number
  /** Number of users this user follows. */
  total_follow_users: number
  /** Number of mutual-follow (mypixiv) connections. */
  total_mypixiv_users: number
  /** Total number of public illusts. */
  total_illusts: number
  /** Total number of public manga works. */
  total_manga: number
  /** Total number of public novels. */
  total_novels: number
  /** Total number of publicly bookmarked illusts. */
  total_illust_bookmarks_public: number
  /** Total number of illust series. */
  total_illust_series: number
  /** Total number of novel series. */
  total_novel_series: number
  /** Profile background image URL, or `null` if not set. */
  background_image_url: string | null
  /** Linked Twitter/X account name (without @). */
  twitter_account: string
  /** Twitter/X profile URL, or `null` if not set. */
  twitter_url: string | null
  /** Pawoo profile URL, or `null` if not set. */
  pawoo_url: string | null
  /** Whether the user has a premium (paid) account. */
  is_premium: boolean
  /** Whether the user has set a custom profile image. */
  is_using_custom_profile_image: boolean
}

/** Visibility settings for a user's profile fields. */
export interface PixivUserProfilePublicity {
  /** Visibility of the gender field. */
  gender: Publicity
  /** Visibility of the region field. */
  region: Publicity
  /** Visibility of the birth-day field. */
  birth_day: Publicity
  /** Visibility of the birth-year field. */
  birth_year: Publicity
  /** Visibility of the job field. */
  job: Publicity
  /** Whether the Pawoo account link is visible. */
  pawoo: boolean
}

/** Workspace / desk setup information from a user's profile. */
export interface PixivUserProfileWorkspace {
  /** PC / computer specs. */
  pc: string
  /** Monitor model. */
  monitor: string
  /** Drawing software / tool. */
  tool: string
  /** Scanner model. */
  scanner: string
  /** Tablet model. */
  tablet: string
  /** Mouse model. */
  mouse: string
  /** Printer model. */
  printer: string
  /** Desktop wallpaper or environment description. */
  desktop: string
  /** Music / background audio description. */
  music: string
  /** Desk description. */
  desk: string
  /** Chair description. */
  chair: string
  /** Free-text comment about the workspace. */
  comment: string
  /** Workspace image URL, or `null` if not set. */
  workspace_image_url: string | null
}

/**
 * Preview item for a user in the GET /v1/user/following response.
 *
 * Contains a few sample illusts and novels from that user.
 */
export interface PixivUserPreviewItem {
  /** The user being previewed. */
  user: PixivUser
  /** A small sample of the user's recent illusts. */
  illusts: PixivIllustItem[]
  /** A small sample of the user's recent novels. */
  novels: PixivNovelItem[]
  /** Whether this user is muted by the authenticated user. */
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
  /** Archive URLs for the frame ZIP. */
  zip_urls: ZipUrls
  /** Per-frame timing data (in order). */
  frames: Frame[]
}

// ---------------------------------------------------------------------------
// API error body
// ---------------------------------------------------------------------------

/**
 * Shape of the JSON body returned by the pixiv API on error.
 */
export interface PixivApiErrorBody {
  /** Error payload returned by the pixiv API. */
  error: {
    /** Localised error message intended for end users. */
    user_message: string
    /** Internal error message. */
    message: string
    /** Short error reason / code. */
    reason: string
    /** Additional details for the user-facing message (may be absent). */
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
  /** The requested illust. */
  illust: PixivIllustItem
}

/** Page response for illust list endpoints (search, related, ranking, etc.). */
export interface IllustListPage {
  /** Illusts on this page. */
  illusts: PixivIllustItem[]
  /** URL to the next page, or `null` when this is the last page. */
  next_url: string | null
}

/** Page response for GET /v1/illust/recommended. */
export interface IllustRecommendedPage {
  /** Recommended illusts. */
  illusts: PixivIllustItem[]
  /** Ranking illusts included alongside recommendations. */
  ranking_illusts: PixivIllustItem[]
  /** Whether an ongoing contest exists. */
  contest_exists: boolean
  /** Privacy-policy notice (present on the first page). */
  privacy_policy?: PrivacyPolicy
  /** URL to the next page, or `null` when this is the last page. */
  next_url: string | null
}

/** Page response for GET /v1/illust/series. */
export interface IllustSeriesPage {
  /** Metadata for the series. */
  illust_series_detail: IllustSeriesDetail
  /** First illust in the series. */
  illust_series_first_illust: PixivIllustItem
  /** Illusts on this page. */
  illusts: PixivIllustItem[]
  /** URL to the next page, or `null` when this is the last page. */
  next_url: string | null
}

// Manga endpoint responses

/** Page response for GET /v1/manga/recommended. */
export interface MangaRecommendedPage {
  /** Recommended manga works. */
  illusts: PixivIllustItem[]
  /** Ranking manga works included alongside recommendations. */
  ranking_illusts: PixivIllustItem[]
  /** Privacy-policy notice (present on the first page). */
  privacy_policy?: PrivacyPolicy
  /** URL to the next page, or `null` when this is the last page. */
  next_url: string | null
}

// Ugoira endpoint responses

/** Response shape for GET /v1/ugoira/metadata. */
export interface UgoiraMetadataResponse {
  /** Ugoira metadata (ZIP URLs and per-frame timings). */
  ugoira_metadata: PixivUgoiraItem
}

// Novel endpoint responses

/** Response shape for GET /v2/novel/detail. */
export interface NovelDetailResponse {
  /** The requested novel. */
  novel: PixivNovelItem
}

/** Page response for novel list endpoints (search, related, ranking, etc.). */
export interface NovelListPage {
  /** Novels on this page. */
  novels: PixivNovelItem[]
  /** URL to the next page, or `null` when this is the last page. */
  next_url: string | null
}

/** Page response for GET /v1/novel/recommended. */
export interface NovelRecommendedPage {
  /** Recommended novels. */
  novels: PixivNovelItem[]
  /** Ranking novels included alongside recommendations. */
  ranking_novels: PixivNovelItem[]
  /** Privacy-policy notice (present on the first page). */
  privacy_policy?: PrivacyPolicy
  /** URL to the next page, or `null` when this is the last page. */
  next_url: string | null
}

/** Page response for GET /v2/novel/series. */
export interface NovelSeriesPage {
  /** Metadata for the series. */
  novel_series_detail: NovelSeriesDetail
  /** First novel in the series. */
  novel_series_first_novel: PixivNovelItem
  /** Most recently published novel in the series. */
  novel_series_latest_novel: PixivNovelItem
  /** Novels on this page. */
  novels: PixivNovelItem[]
  /** URL to the next page, or `null` when this is the last page. */
  next_url: string | null
}

// User endpoint responses

/** Response shape for GET /v1/user/detail. */
export interface UserDetailResponse {
  /** Basic user info with self-introduction. */
  user: PixivUserItem
  /** Detailed profile data. */
  profile: PixivUserProfile
  /** Visibility settings for profile fields. */
  profile_publicity: PixivUserProfilePublicity
  /** Workspace / desk-setup information. */
  workspace: PixivUserProfileWorkspace
}

/** Page response for GET /v1/user/illusts. */
export interface UserIllustsPage {
  /** The user whose illusts are listed. */
  user: PixivUser
  /** Illusts on this page. */
  illusts: PixivIllustItem[]
  /** URL to the next page, or `null` when this is the last page. */
  next_url: string | null
}

/** Page response for GET /v1/user/novels. */
export interface UserNovelsPage {
  /** The user whose novels are listed. */
  user: PixivUser
  /** Novels on this page. */
  novels: PixivNovelItem[]
  /** URL to the next page, or `null` when this is the last page. */
  next_url: string | null
}

/** Page response for GET /v1/user/bookmarks/illust. */
export interface UserBookmarksIllustPage {
  /** Bookmarked illusts on this page. */
  illusts: PixivIllustItem[]
  /** URL to the next page, or `null` when this is the last page. */
  next_url: string | null
}

/** Page response for GET /v1/user/bookmarks/novel. */
export interface UserBookmarksNovelPage {
  /** Bookmarked novels on this page. */
  novels: PixivNovelItem[]
  /** URL to the next page, or `null` when this is the last page. */
  next_url: string | null
}

/** Page response for GET /v1/user/following. */
export interface UserFollowingPage {
  /** User preview items on this page. */
  user_previews: PixivUserPreviewItem[]
  /** URL to the next page, or `null` when this is the last page. */
  next_url: string | null
}
