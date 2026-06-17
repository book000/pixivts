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
  squareMedium: string
  /** Long side ≤ 540 px */
  medium: string
  /** Width ≤ 600 px, height ≤ 1200 px */
  large: string
  /** Original image (present in `metaPages` entries only) */
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
  profileImageUrls: ProfileImageUrls
  /** Whether the authenticated user follows this user. */
  isFollowed?: boolean
  /** Whether this user has blocked access by the authenticated user. */
  isAccessBlockingUser?: boolean
  /** Whether this user accepts illustration commission requests. */
  isAcceptRequest?: boolean
}

/** Tag on a work. */
export interface Tag {
  /** Tag name in Japanese. */
  name: string
  /** Translated tag name, or `null` if no translation is available. */
  translatedName: string | null
  /** Whether the tag was added by the work's uploader. */
  addedByUploadedUser?: boolean
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

/**
 * Original-image URL for a single-page illust.
 *
 * For manga works the API returns `meta_single_page` as an empty object `{}`,
 * so `originalImageUrl` may be absent even when the enclosing object is present.
 */
export interface MetaSinglePage {
  /**
   * Direct URL to the original-resolution image.
   * Absent for manga works where `meta_single_page` is returned as `{}`.
   */
  originalImageUrl?: string
}

/** Per-page image URLs for a multi-page work (manga). */
export interface MetaPages {
  /** Full set of image URLs for this page, including the original. */
  imageUrls: Required<ImageUrls>
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
  imageUrls: ImageUrls
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
  createDate: string
  /** Number of images in a multi-page work (1 for single-page). */
  pageCount: number
  /** Canvas width in pixels. */
  width: number
  /** Canvas height in pixels. */
  height: number
  /** Sanity / sensitivity level assigned by the pixiv content filter. */
  sanityLevel: number
  /** Age restriction: 0 = all-ages, 1 = R-18, 2 = R-18G */
  xRestrict: number
  /** Series this work belongs to, or `null` if not part of a series. */
  series: Series | null
  /**
   * For single-page works: `{ originalImageUrl: string }`.
   * For multi-page works (manga): `{}` (empty object; `originalImageUrl` will be `undefined`).
   */
  metaSinglePage: MetaSinglePage | Record<string, never>
  /** Per-page image URLs for multi-page works (empty array for single-page). */
  metaPages: MetaPages[]
  /** Total number of views. */
  totalView: number
  /** Total number of bookmarks. */
  totalBookmarks: number
  /** Whether the authenticated user has bookmarked this work. */
  isBookmarked: boolean
  /** Whether the work is publicly visible. */
  visible: boolean
  /** Whether the work is muted for the authenticated user. */
  isMuted: boolean
  /** Total number of comments (may be absent on some endpoints). */
  totalComments?: number
  /** AI-generated content flag: 0 = no AI, 1 = partial AI, 2 = fully AI */
  illustAiType: number
  /** Book-style rendering flag (0 = normal, 1 = book). */
  illustBookStyle: number
  /** Controls who can post comments (may be absent). */
  commentAccessControl?: number
  /** Additional access-restriction attributes (may be absent). */
  restrictionAttributes?: string[]
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
  coverImageUrls: { medium: string }
  /** Number of works in the series. */
  seriesWorkCount: number
  /** ISO 8601 date-time string of when the series was created. */
  createDate: string
  /** Canvas width of the cover image in pixels. */
  width: number
  /** Canvas height of the cover image in pixels. */
  height: number
  /** Author of the series. */
  user: PixivUser
  /** Whether the authenticated user has added this series to their watchlist. */
  watchlistAdded: boolean
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
  xRestrict: number
  /** Whether the novel is an original work (not fan fiction). */
  isOriginal: boolean
  /** Cover image URLs. */
  imageUrls: ImageUrls
  /** ISO 8601 date-time string of when the novel was posted. */
  createDate: string
  /** Tags attached to the novel. */
  tags: Tag[]
  /** Number of pages (word-count chunks). */
  pageCount: number
  /** Total character count of the novel body. */
  textLength: number
  /** Author of the novel. */
  user: PixivUser
  /**
   * Series information.
   *
   * `{}` (empty object) if the novel does not belong to a series.
   */
  series: Series | Record<string, never>
  /** Whether the authenticated user has bookmarked this novel. */
  isBookmarked: boolean
  /** Total number of bookmarks. */
  totalBookmarks: number
  /** Total number of views. */
  totalView: number
  /** Whether the novel is publicly visible. */
  visible: boolean
  /** Total number of comments. */
  totalComments: number
  /** Whether the novel is muted for the authenticated user. */
  isMuted: boolean
  /** Whether the novel is restricted to mutual followers (mypixiv). */
  isMypixivOnly: boolean
  /** Whether the novel contains explicit content beyond the `xRestrict` flag. */
  isXRestricted: boolean
  /** AI-generated content flag: 0 = no AI, 1 = partial AI, 2 = fully AI */
  novelAiType: number
  /** Controls who can post comments (may be absent). */
  commentAccessControl?: number
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
  isOriginal: boolean
  /** Whether the series has been marked as concluded by the author. */
  isConcluded: boolean
  /** Number of novels in the series. */
  contentCount: number
  /** Total character count across all novels in the series. */
  totalCharacterCount: number
  /** Author of the series. */
  user: PixivUser
  /** Human-readable series label / tagline. */
  displayText: string
  /** AI-generated content flag: 0 = no AI, 1 = partial AI, 2 = fully AI */
  novelAiType: number
  /** Whether the authenticated user has added this series to their watchlist. */
  watchlistAdded: boolean
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
  birthDay: string
  /** Birth year. */
  birthYear: number
  /** Region / prefecture. */
  region: string
  /** Internal address ID. */
  addressId: number
  /** Two-letter country code (ISO 3166-1 alpha-2). */
  countryCode: string
  /** Occupation / job description. */
  job: string
  /** Internal job category ID. */
  jobId: number
  /** Number of users this user follows. */
  totalFollowUsers: number
  /** Number of mutual-follow (mypixiv) connections. */
  totalMypixivUsers: number
  /** Total number of public illusts. */
  totalIllusts: number
  /** Total number of public manga works. */
  totalManga: number
  /** Total number of public novels. */
  totalNovels: number
  /** Total number of publicly bookmarked illusts. */
  totalIllustBookmarksPublic: number
  /** Total number of illust series. */
  totalIllustSeries: number
  /** Total number of novel series. */
  totalNovelSeries: number
  /** Profile background image URL, or `null` if not set. */
  backgroundImageUrl: string | null
  /** Linked Twitter/X account name (without @). */
  twitterAccount: string
  /** Twitter/X profile URL, or `null` if not set. */
  twitterUrl: string | null
  /** Pawoo profile URL, or `null` if not set. */
  pawooUrl: string | null
  /** Whether the user has a premium (paid) account. */
  isPremium: boolean
  /** Whether the user has set a custom profile image. */
  isUsingCustomProfileImage: boolean
}

/** Visibility settings for a user's profile fields. */
export interface PixivUserProfilePublicity {
  /** Visibility of the gender field. */
  gender: Publicity
  /** Visibility of the region field. */
  region: Publicity
  /** Visibility of the birth-day field. */
  birthDay: Publicity
  /** Visibility of the birth-year field. */
  birthYear: Publicity
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
  workspaceImageUrl: string | null
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
  isMuted: boolean
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
  zipUrls: ZipUrls
  /** Per-frame timing data (in order). */
  frames: Frame[]
}

// ---------------------------------------------------------------------------
// API error body
// ---------------------------------------------------------------------------

/**
 * Camelized shape of the JSON error body returned by the pixiv API.
 *
 * The pixiv wire format uses `snake_case` field names (e.g. `user_message`);
 * `HttpClient` applies `camelizeKeys()` before returning, so all fields here
 * are `lowerCamelCase`.
 */
export interface PixivApiErrorBody {
  /** Error payload returned by the pixiv API (keys camelized). */
  error: {
    /** Localised error message intended for end users. */
    userMessage: string
    /** Internal error message. */
    message: string
    /** Short error reason / code. */
    reason: string
    /** Additional details for the user-facing message (may be absent). */
    userMessageDetails?: Record<string, unknown>
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
  /**
   * Whether AI-generated works are shown in the results.
   *
   * Only present on search responses; absent on related/ranking/recommended endpoints.
   */
  showAi?: boolean
  /** URL to the next page, or `null` when this is the last page. */
  nextUrl: string | null
}

/** Page response for GET /v1/illust/recommended. */
export interface IllustRecommendedPage {
  /** Recommended illusts. */
  illusts: PixivIllustItem[]
  /** Ranking illusts included alongside recommendations. */
  rankingIllusts: PixivIllustItem[]
  /** Whether an ongoing contest exists. */
  contestExists: boolean
  /** Privacy-policy notice (present on the first page). */
  privacyPolicy?: PrivacyPolicy
  /** URL to the next page, or `null` when this is the last page. */
  nextUrl: string | null
}

/** Page response for GET /v1/illust/series. */
export interface IllustSeriesPage {
  /** Metadata for the series. */
  illustSeriesDetail: IllustSeriesDetail
  /** First illust in the series. */
  illustSeriesFirstIllust: PixivIllustItem
  /** Illusts on this page. */
  illusts: PixivIllustItem[]
  /** URL to the next page, or `null` when this is the last page. */
  nextUrl: string | null
}

// Manga endpoint responses

/** Page response for GET /v1/manga/recommended. */
export interface MangaRecommendedPage {
  /** Recommended manga works. */
  illusts: PixivIllustItem[]
  /** Ranking manga works included alongside recommendations. */
  rankingIllusts: PixivIllustItem[]
  /** Privacy-policy notice (present on the first page). */
  privacyPolicy?: PrivacyPolicy
  /** URL to the next page, or `null` when this is the last page. */
  nextUrl: string | null
}

// Ugoira endpoint responses

/** Response shape for GET /v1/ugoira/metadata. */
export interface UgoiraMetadataResponse {
  /** Ugoira metadata (ZIP URLs and per-frame timings). */
  ugoiraMetadata: PixivUgoiraItem
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
  /**
   * Whether AI-generated works are shown in the results.
   *
   * Only present on search responses; absent on related/ranking/recommended endpoints.
   */
  showAi?: boolean
  /** URL to the next page, or `null` when this is the last page. */
  nextUrl: string | null
}

/** Page response for GET /v1/novel/recommended. */
export interface NovelRecommendedPage {
  /** Recommended novels. */
  novels: PixivNovelItem[]
  /** Ranking novels included alongside recommendations. */
  rankingNovels: PixivNovelItem[]
  /** Privacy-policy notice (present on the first page). */
  privacyPolicy?: PrivacyPolicy
  /** URL to the next page, or `null` when this is the last page. */
  nextUrl: string | null
}

/** Page response for GET /v2/novel/series. */
export interface NovelSeriesPage {
  /** Metadata for the series. */
  novelSeriesDetail: NovelSeriesDetail
  /** First novel in the series. */
  novelSeriesFirstNovel: PixivNovelItem
  /** Most recently published novel in the series. */
  novelSeriesLatestNovel: PixivNovelItem
  /** Novels on this page. */
  novels: PixivNovelItem[]
  /** URL to the next page, or `null` when this is the last page. */
  nextUrl: string | null
}

// User endpoint responses

/** Response shape for GET /v1/user/detail. */
export interface UserDetailResponse {
  /** Basic user info with self-introduction. */
  user: PixivUserItem
  /** Detailed profile data. */
  profile: PixivUserProfile
  /** Visibility settings for profile fields. */
  profilePublicity: PixivUserProfilePublicity
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
  nextUrl: string | null
}

/** Page response for GET /v1/user/novels. */
export interface UserNovelsPage {
  /** The user whose novels are listed. */
  user: PixivUser
  /** Novels on this page. */
  novels: PixivNovelItem[]
  /** URL to the next page, or `null` when this is the last page. */
  nextUrl: string | null
}

/** Page response for GET /v1/user/bookmarks/illust. */
export interface UserBookmarksIllustPage {
  /** Bookmarked illusts on this page. */
  illusts: PixivIllustItem[]
  /** URL to the next page, or `null` when this is the last page. */
  nextUrl: string | null
}

/** Page response for GET /v1/user/bookmarks/novel. */
export interface UserBookmarksNovelPage {
  /** Bookmarked novels on this page. */
  novels: PixivNovelItem[]
  /** URL to the next page, or `null` when this is the last page. */
  nextUrl: string | null
}

/** Page response for GET /v1/user/following. */
export interface UserFollowingPage {
  /** User preview items on this page. */
  userPreviews: PixivUserPreviewItem[]
  /** URL to the next page, or `null` when this is the last page. */
  nextUrl: string | null
}
