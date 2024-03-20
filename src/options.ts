import { GetV1IllustDetailRequest } from './types/endpoints/v1/illust/detail'
import { SnakeToCamel } from 'snake-camel-types'
import { GetV1IllustRecommendedRequest } from './types/endpoints/v1/illust/recommended'
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

/**
 * 検索対象
 */
export enum SearchTarget {
  /** タグの部分一致 */
  PARTIAL_MATCH_FOR_TAGS = 'partial_match_for_tags',
  /** タグの完全一致 */
  EXACT_MATCH_FOR_TAGS = 'exact_match_for_tags',
  /** タイトル、またはキャプション（アプリ内では本文） */
  TITLE_AND_CAPTION = 'title_and_caption',
  /** キーワード */
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
 * ソート
 */
export enum SearchSort {
  /** 新しい順 */
  DATE_DESC = 'date_desc',
  /** 古い順 */
  DATE_ASC = 'date_asc',
  /** 人気順 */
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
 * 対象期間
 */
export enum SearchIllustDuration {
  /** 1日以内 */
  WITHIN_LAST_DAY = 'within_last_day',
  /** 1週間以内 */
  WITHIN_LAST_WEEK = 'within_last_week',
  /** 1ヶ月以内 */
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
 * OSフィルタ
 */
export enum OSFilter {
  /** iOS */
  FOR_IOS = 'for_ios',
  /** Android */
  FOR_ANDROID = 'for_android',
}

/**
 * OSフィルタのチェック
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
 * ブックマーク公開範囲
 */
export enum BookmarkRestrict {
  /** 公開 */
  PUBLIC = 'public',
  /** 非公開 */
  PRIVATE = 'private',
}

/**
 * ブックマーク公開範囲のチェック
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
 * ランキングの種類
 */
export enum RankingMode {
  /** デイリー */
  DAY = 'day',
  /** 男性向け */
  DAY_MALE = 'day_male',
  /** 女性向け */
  DAY_FEMALE = 'day_female',
  /** オリジナル */
  WEEK_ORIGINAL = 'week_original',
  /** ルーキー */
  WEEK_ROOKIE = 'week_rookie',
  /** ウィークリー */
  WEEK = 'week',
  /** マンスリー */
  MONTH = 'month',
  /** AI生成 */
  DAY_AI = 'day_ai',
  /** R18デイリー */
  DAY_R18 = 'day_r18',
  /** R18ウィークリー */
  WEEK_R18 = 'week_r18',
  /** R18男性向け */
  DAY_MALE_R18 = 'day_male_r18',
  /** R18女性向け */
  DAY_FEMALE_R18 = 'day_female_r18',
  /** R-18 AI生成 */
  DAY_R18_AI = 'day_r18_ai',
}

/**
 * ランキングの種類のチェック
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
 * オブジェクトの一部を必須にし、それ以外はオプショナルにする
 *
 * @see https://mongolyy.hatenablog.com/entry/2022/03/10/001139
 * @see https://qiita.com/yuu_1st/items/71c4fc9cc95a72fa4df9
 */
type SomeRequired<T, K extends keyof T> = Partial<Omit<T, K>> &
  Required<Pick<T, K>>

/**
 * オブジェクトの特定プロパティを上書きする
 *
 * @see https://qiita.com/ibaragi/items/2a6412aeaca5703694b1
 */
type Overwrite<T, U extends { [Key in keyof T]?: unknown }> = Omit<T, keyof U> &
  U

/**
 * イラスト検索オプション
 */
export type SearchIllustOptions = SomeRequired<
  SnakeToCamel<GetV1SearchIllustRequest>,
  'word'
>

/**
 * イラストランキング取得オプション
 */
export type IllustRankingOptions = SnakeToCamel<
  Partial<GetV1IllustRankingRequest>
>

/**
 * イラスト詳細取得オプション
 */
export type IllustDetailOptions = SnakeToCamel<GetV1IllustDetailRequest>

/**
 * イラストの関連イラスト取得オプション
 */
export type IllustRelatedOptions = SnakeToCamel<GetV2IllustRelatedRequest>

/**
 * おすすめイラスト取得オプション
 */
export type RecommendedIllustOptions = SnakeToCamel<
  Partial<GetV1IllustRecommendedRequest>
>

/**
 * イラストシリーズ取得オプション
 */
export type IllustSeriesOptions = SomeRequired<
  SnakeToCamel<GetV1IllustSeriesRequest>,
  'illustSeriesId'
>

/**
 * イラストブックマーク追加オプション
 */
export type IllustBookmarkAddOptions = SomeRequired<
  SnakeToCamel<PostV2IllustBookmarkAddRequest>,
  'illustId'
>

/**
 * イラストブックマーク削除オプション
 */
export type IllustBookmarkDeleteOptions =
  SnakeToCamel<PostV1IllustBookmarkDeleteRequest>

/**
 * おすすめマンガ取得オプション
 */
export type MangaRecommendedOptions = SnakeToCamel<
  Partial<GetV1MangaRecommendedRequest>
>

/**
 * うごイラ詳細取得オプション
 */
export type UgoiraDetailOptions = SnakeToCamel<GetV1IllustUgoiraMetadataRequest>

/**
 * 小説詳細取得オプション
 */
export type NovelDetailOptions = SnakeToCamel<GetV2NovelDetailRequest>

/**
 * 小説本文取得オプション
 */
export type NovelTextOptions = SnakeToCamel<GetWebViewV2NovelRequest>

/**
 * 小説の関連小説取得オプション
 */
export type NovelRelatedOptions = SnakeToCamel<GetV1NovelRelatedRequest>

/**
 * 小説検索オプション
 */
export type SearchNovelOptions = SomeRequired<
  SnakeToCamel<GetV1SearchNovelRequest>,
  'word'
>

/**
 * 小説ランキング取得オプション
 */
export type NovelRankingOptions = SnakeToCamel<
  Partial<GetV1NovelRankingRequest>
>

/**
 * おすすめ小説取得オプション
 */
export type RecommendedNovelOptions = Overwrite<
  SnakeToCamel<Partial<GetV1NovelRecommendedRequest>>,
  {
    /**
     * すでにおすすめした小説ID群 (?)
     *
     * @default undefined
     * @beta
     */
    alreadyRecommended?: number[]
  }
>

/**
 * 小説シリーズ詳細取得オプション
 */
export type NovelSeriesOptions = SomeRequired<
  SnakeToCamel<GetV2NovelSeriesRequest>,
  'seriesId'
>

/**
 * 小説ブックマーク追加オプション
 */
export type NovelBookmarkAddOptions = SomeRequired<
  SnakeToCamel<PostV2NovelBookmarkAddRequest>,
  'novelId'
>

/**
 * 小説ブックマーク削除オプション
 */
export type NovelBookmarkDeleteOptions =
  SnakeToCamel<PostV1NovelBookmarkDeleteRequest>

/**
 * ユーザ詳細取得オプション
 */
export type UserDetailOptions = SnakeToCamel<GetV1UserDetailRequest>

/**
 * ユーザイラストブックマーク取得オプション
 */
export type UserBookmarksIllustOptions = SomeRequired<
  SnakeToCamel<GetV1UserBookmarksIllustRequest>,
  'userId'
>

/**
 * ユーザ小説ブックマーク取得オプション
 */
export type UserBookmarksNovelOptions = SomeRequired<
  SnakeToCamel<GetV1UserBookmarksNovelRequest>,
  'userId'
>
