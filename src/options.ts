import { GetV1IllustDetailRequest } from './types/endpoints/v1/illust/detail'
import { SnakeToCamel } from 'snake-camel-types'
import {
  GetV1IllustRecommendedNologinRequest,
  GetV1IllustRecommendedRequest,
} from './types/endpoints/v1/illust/recommended'
import { GetV1SearchIllustRequest } from './types/endpoints/v1/search/illust'
import { PostV2IllustBookmarkAddRequest } from './types/endpoints/v2/illust/bookmark/add'
import { GetV1IllustSeriesRequest } from './types/endpoints/v1/illust/series'
import { GetV2NovelDetailRequest } from './types/endpoints/v2/novel/detail'
import { GetV1NovelRecommendedRequest } from './types/endpoints/v1/novel/recommended'
import { GetV1SearchNovelRequest } from './types/endpoints/v1/search/novel'
import { GetV2NovelSeriesRequest } from './types/endpoints/v2/novel/series'
import { GetV1UserDetailRequest } from './types/endpoints/v1/user/detail'
import { GetV1MangaRecommendedRequest } from './types/endpoints/v1/manga/recommended'
import { BaseSimpleCheck, CheckFunctions } from './checks'
import { PostV1IllustBookmarkDeleteRequest } from './types/endpoints/v1/illust/bookmark/delete'
import { PostV2NovelBookmarkAddRequest } from './types/endpoints/v2/novel/bookmark/add'
import { PostV1NovelBookmarkDeleteRequest } from './types/endpoints/v1/novel/bookmark/delete'
import { GetV1UserBookmarksIllustRequest } from './types/endpoints/v1/user/bookmarks/illust'
import { GetV1UserBookmarksNovelRequest } from './types/endpoints/v1/user/bookmarks/novel'
import { GetV1IllustUgoiraMetadataRequest } from './types/endpoints/v1/illust/ugoira/metadata'
import { GetV2IllustRelatedRequest } from './types/endpoints/v2/illust/related'
import { GetV1NovelRelatedRequest } from './types/endpoints/v1/novel/related'
import { GetV1IllustRankingRequest } from './types/endpoints/v1/illust/ranking'
import { GetV1NovelRankingRequest } from './types/endpoints/v1/novel/ranking'
import { GetWebViewV2NovelRequest } from './types/endpoints/webview/v2/novel'
import { GetV1UserFollowingRequest } from './types/endpoints/v1/user/following'
import { PostV1UserFollowAddRequest } from './types/endpoints/v1/user/follow/add'
import { PostV1UserFollowDeleteRequest } from './types/endpoints/v1/user/follow/delete'

/**
 * Search target
 */
export enum SearchTarget {
  /** Partial match for tags */
  PARTIAL_MATCH_FOR_TAGS = 'partial_match_for_tags',
  /** Exact match for tags */
  EXACT_MATCH_FOR_TAGS = 'exact_match_for_tags',
  /** Title or caption (referred to as "text" in the app) */
  TITLE_AND_CAPTION = 'title_and_caption',
  /** Keyword */
  KEYWORD = 'keyword',
}

export class SearchTargetCheck extends BaseSimpleCheck<SearchTarget> {
  checks(): CheckFunctions<SearchTarget> {
    return {
      main: (data) =>
        typeof data === 'string' && Object.values(SearchTarget).includes(data),
    }
  }
}

/**
 * Sort order
 */
export enum SearchSort {
  /** Newest first */
  DATE_DESC = 'date_desc',
  /** Oldest first */
  DATE_ASC = 'date_asc',
  /** Most popular first */
  POPULAR_DESC = 'popular_desc',
}

export class SearchSortCheck extends BaseSimpleCheck<SearchSort> {
  checks(): CheckFunctions<SearchSort> {
    return {
      main: (data) =>
        typeof data === 'string' && Object.values(SearchSort).includes(data),
    }
  }
}

/**
 * Target period
 */
export enum SearchIllustDuration {
  /** Within the last day */
  WITHIN_LAST_DAY = 'within_last_day',
  /** Within the last week */
  WITHIN_LAST_WEEK = 'within_last_week',
  /** Within the last month */
  WITHIN_LAST_MONTH = 'within_last_month',
}

export class SearchIllustDurationCheck extends BaseSimpleCheck<SearchIllustDuration> {
  checks(): CheckFunctions<SearchIllustDuration> {
    return {
      main: (data) =>
        typeof data === 'string' &&
        Object.values(SearchIllustDuration).includes(data),
    }
  }
}

/**
 * OS filter
 */
export enum OSFilter {
  /** iOS */
  FOR_IOS = 'for_ios',
  /** Android */
  FOR_ANDROID = 'for_android',
}

/**
 * Check for OS filter
 */
export class OSFilterCheck extends BaseSimpleCheck<OSFilter> {
  checks(): CheckFunctions<OSFilter> {
    return {
      main: (data) =>
        typeof data === 'string' && Object.values(OSFilter).includes(data),
    }
  }
}

/**
 * Bookmark visibility
 */
export enum BookmarkRestrict {
  /** Public */
  PUBLIC = 'public',
  /** Private */
  PRIVATE = 'private',
}

/**
 * Check for bookmark visibility
 */
export class BookmarkRestrictCheck extends BaseSimpleCheck<BookmarkRestrict> {
  checks(): CheckFunctions<BookmarkRestrict> {
    return {
      main: (data) =>
        typeof data === 'string' &&
        Object.values(BookmarkRestrict).includes(data),
    }
  }
}

/**
 * Follow visibility
 */
export enum FollowRestrict {
  /** Public */
  PUBLIC = 'public',
  /** Private */
  PRIVATE = 'private',
}

/**
 * Check for follow visibility
 */
export class FollowRestrictCheck extends BaseSimpleCheck<FollowRestrict> {
  checks(): CheckFunctions<FollowRestrict> {
    return {
      main: (data) =>
        typeof data === 'string' &&
        Object.values(FollowRestrict).includes(data),
    }
  }
}

/**
 * AI content filter for search
 */
export enum SearchAiType {
  /** Filter out AI-generated works */
  FILTER_AI = 0,
  /** Show AI-generated works */
  SHOW_AI = 1,
}

/**
 * Check for AI content filter type
 */
export class SearchAiTypeCheck extends BaseSimpleCheck<SearchAiType> {
  checks(): CheckFunctions<SearchAiType> {
    return {
      main: (data) =>
        typeof data === 'number' &&
        Object.values(SearchAiType)
          .filter((v): v is SearchAiType => typeof v === 'number')
          .includes(data),
    }
  }
}

/**
 * Content type for illust recommendations
 */
export enum IllustContentType {
  /** Illustration */
  ILLUST = 'illust',
  /** Manga */
  MANGA = 'manga',
}

/**
 * Check for illust content type
 */
export class IllustContentTypeCheck extends BaseSimpleCheck<IllustContentType> {
  checks(): CheckFunctions<IllustContentType> {
    return {
      main: (data) =>
        typeof data === 'string' &&
        Object.values(IllustContentType).includes(data),
    }
  }
}

/**
 * Ranking type
 */
export enum RankingMode {
  /** Daily */
  DAY = 'day',
  /** For men */
  DAY_MALE = 'day_male',
  /** For women */
  DAY_FEMALE = 'day_female',
  /** Original */
  WEEK_ORIGINAL = 'week_original',
  /** Rookie */
  WEEK_ROOKIE = 'week_rookie',
  /** Weekly */
  WEEK = 'week',
  /** Monthly */
  MONTH = 'month',
  /** AI-generated */
  DAY_AI = 'day_ai',
  /** R-18 daily */
  DAY_R18 = 'day_r18',
  /** R-18 weekly */
  WEEK_R18 = 'week_r18',
  /** R-18 for men */
  DAY_MALE_R18 = 'day_male_r18',
  /** R-18 for women */
  DAY_FEMALE_R18 = 'day_female_r18',
  /** R-18 AI-generated */
  DAY_R18_AI = 'day_r18_ai',
}

/**
 * Check for ranking type
 */
export class RankingModeCheck extends BaseSimpleCheck<RankingMode> {
  checks(): CheckFunctions<RankingMode> {
    return {
      main: (data) =>
        typeof data === 'string' && Object.values(RankingMode).includes(data),
    }
  }
}

/**
 * Makes some properties of an object required while making the rest optional
 *
 * @see https://mongolyy.hatenablog.com/entry/2022/03/10/001139
 * @see https://qiita.com/yuu_1st/items/71c4fc9cc95a72fa4df9
 */
export type SomeRequired<T, K extends keyof T> = Partial<Omit<T, K>> &
  Required<Pick<T, K>>

/**
 * Overwrites specific properties of an object
 *
 * @see https://qiita.com/ibaragi/items/2a6412aeaca5703694b1
 */
export type Overwrite<T, U extends { [Key in keyof T]?: unknown }> = Omit<
  T,
  keyof U
> &
  U

/**
 * Illust search options
 */
export type SearchIllustOptions = SomeRequired<
  SnakeToCamel<GetV1SearchIllustRequest>,
  'word'
>

/**
 * Options for getting illust ranking
 */
export type IllustRankingOptions = SnakeToCamel<
  Partial<GetV1IllustRankingRequest>
>

/**
 * Options for getting illust details
 */
export type IllustDetailOptions = SnakeToCamel<GetV1IllustDetailRequest>

/**
 * Options for getting related illusts
 */
export type IllustRelatedOptions = SnakeToCamel<GetV2IllustRelatedRequest>

/**
 * Options for getting recommended illusts
 */
export type RecommendedIllustOptions = SnakeToCamel<
  Partial<GetV1IllustRecommendedRequest>
>

/**
 * Options for getting recommended illusts without authentication
 */
export type RecommendedIllustNologinOptions = Overwrite<
  SnakeToCamel<Partial<GetV1IllustRecommendedNologinRequest>>,
  {
    /**
     * IDs of bookmarked illusts to base recommendations on (unauthenticated only)
     *
     * @default undefined
     */
    bookmarkIllustIds?: number[]
  }
>

/**
 * Options for getting illust series
 */
export type IllustSeriesOptions = SomeRequired<
  SnakeToCamel<GetV1IllustSeriesRequest>,
  'illustSeriesId'
>

/**
 * Options for adding an illust bookmark
 */
export type IllustBookmarkAddOptions = SomeRequired<
  SnakeToCamel<PostV2IllustBookmarkAddRequest>,
  'illustId'
>

/**
 * Options for removing an illust bookmark
 */
export type IllustBookmarkDeleteOptions =
  SnakeToCamel<PostV1IllustBookmarkDeleteRequest>

/**
 * Options for getting recommended manga
 */
export type MangaRecommendedOptions = SnakeToCamel<
  Partial<GetV1MangaRecommendedRequest>
>

/**
 * Options for getting ugoira details
 */
export type UgoiraDetailOptions = SnakeToCamel<GetV1IllustUgoiraMetadataRequest>

/**
 * Options for getting novel details
 */
export type NovelDetailOptions = SnakeToCamel<GetV2NovelDetailRequest>

/**
 * Options for getting novel text
 */
export type NovelTextOptions = SnakeToCamel<GetWebViewV2NovelRequest>

/**
 * Options for getting related novels
 */
export type NovelRelatedOptions = SnakeToCamel<GetV1NovelRelatedRequest>

/**
 * Novel search options
 */
export type SearchNovelOptions = SomeRequired<
  SnakeToCamel<GetV1SearchNovelRequest>,
  'word'
>

/**
 * Options for getting novel ranking
 */
export type NovelRankingOptions = SnakeToCamel<
  Partial<GetV1NovelRankingRequest>
>

/**
 * Options for getting recommended novels
 */
export type RecommendedNovelOptions = Overwrite<
  SnakeToCamel<Partial<GetV1NovelRecommendedRequest>>,
  {
    /**
     * IDs of novels already recommended (?)
     *
     * @default undefined
     * @beta
     */
    alreadyRecommended?: number[]
  }
>

/**
 * Options for getting novel series details
 */
export type NovelSeriesOptions = SomeRequired<
  SnakeToCamel<GetV2NovelSeriesRequest>,
  'seriesId'
>

/**
 * Options for adding a novel bookmark
 */
export type NovelBookmarkAddOptions = SomeRequired<
  SnakeToCamel<PostV2NovelBookmarkAddRequest>,
  'novelId'
>

/**
 * Options for removing a novel bookmark
 */
export type NovelBookmarkDeleteOptions =
  SnakeToCamel<PostV1NovelBookmarkDeleteRequest>

/**
 * Options for getting user details
 */
export type UserDetailOptions = SnakeToCamel<GetV1UserDetailRequest>

/**
 * Options for getting a user's illust bookmarks
 */
export type UserBookmarksIllustOptions = SomeRequired<
  SnakeToCamel<GetV1UserBookmarksIllustRequest>,
  'userId'
>

/**
 * Options for getting a user's novel bookmarks
 */
export type UserBookmarksNovelOptions = SomeRequired<
  SnakeToCamel<GetV1UserBookmarksNovelRequest>,
  'userId'
>

/**
 * Options for getting the list of users a user is following
 */
export type UserFollowingOptions = SomeRequired<
  SnakeToCamel<GetV1UserFollowingRequest>,
  'userId'
>

/**
 * Options for following a user
 */
export type UserFollowAddOptions = SomeRequired<
  SnakeToCamel<PostV1UserFollowAddRequest>,
  'userId'
>

/**
 * Options for unfollowing a user
 */
export type UserFollowDeleteOptions =
  SnakeToCamel<PostV1UserFollowDeleteRequest>
