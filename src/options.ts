import { GetV1IllustDetailRequest } from './types/endpoints/v1/illust/detail'
import { SnakeToCamel } from 'snake-camel-types'
import { GetV1IllustRecommendedRequest } from './types/endpoints/v1/illust/recommended'
import { GetV1SearchIllustRequest } from './types/endpoints/v1/search/illust'
import { PostV2IllustBookmarkAddRequest } from './types/endpoints/v2/illust/bookmark/add'
import { GetV1IllustSeriesRequest } from './types/endpoints/v1/illust/series'
import { GetV2NovelDetailRequest } from './types/endpoints/v2/novel/detail'
import { GetV1NovelTextRequest } from './types/endpoints/v1/novel/text'
import { GetV1NovelRecommendedRequest } from './types/endpoints/v1/novel/recommended'
import { GetV1SearchNovelRequest } from './types/endpoints/v1/search/novel'
import { GetV2NovelSeriesRequest } from './types/endpoints/v2/novel/series'
import { GetV1UserDetailRequest } from './types/endpoints/v1/user/detail'
import { GetV1MangaRecommendedRequest } from './types/endpoints/v1/manga/recommended'
import { BaseSimpleCheck, CheckFunctions } from './checks'
import { PostV1IllustBookmarkDeleteRequest } from './types/endpoints/v1/illust/bookmark/delete'
import { PostV2NovelBookmarkAddRequest } from './types/endpoints/v2/novel/bookmark/add'
import { PostV1NovelBookmarkDeleteRequest } from './types/endpoints/v1/novel/bookmark/delete'

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
        typeof data === 'string' &&
        [
          SearchTarget.PARTIAL_MATCH_FOR_TAGS,
          SearchTarget.EXACT_MATCH_FOR_TAGS,
          SearchTarget.TITLE_AND_CAPTION,
          SearchTarget.KEYWORD,
        ].includes(data),
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
        typeof data === 'string' &&
        [
          SearchSort.DATE_DESC,
          SearchSort.DATE_ASC,
          SearchSort.POPULAR_DESC,
        ].includes(data),
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
        [
          SearchIllustDuration.WITHIN_LAST_DAY,
          SearchIllustDuration.WITHIN_LAST_WEEK,
          SearchIllustDuration.WITHIN_LAST_MONTH,
        ].includes(data),
    }
  }
}

/**
 * OSフィルタ
 */
export enum Filter {
  /** iOS */
  FOR_IOS = 'for_ios',
  /** Android */
  FOR_ANDROID = 'for_android',
}

export class FilterCheck extends BaseSimpleCheck<Filter> {
  checks(): CheckFunctions<Filter> {
    return {
      main: (data) =>
        typeof data === 'string' &&
        [Filter.FOR_IOS, Filter.FOR_ANDROID].includes(data),
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

export class BookmarkRestrictCheck extends BaseSimpleCheck<BookmarkRestrict> {
  checks(): CheckFunctions<BookmarkRestrict> {
    return {
      main: (data) =>
        typeof data === 'string' &&
        [BookmarkRestrict.PUBLIC, BookmarkRestrict.PRIVATE].includes(data),
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
 * イラスト詳細取得オプション
 */
export type IllustDetailOptions = SnakeToCamel<GetV1IllustDetailRequest>

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
 * 小説詳細取得オプション
 */
export type NovelDetailOptions = SnakeToCamel<GetV2NovelDetailRequest>

/**
 * 小説本文取得オプション
 */
export type NovelTextOptions = SnakeToCamel<GetV1NovelTextRequest>

/**
 * 小説検索オプション
 */
export type SearchNovelOptions = SomeRequired<
  SnakeToCamel<GetV1SearchNovelRequest>,
  'word'
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
 * ユーザー詳細取得オプション
 */
export type UserDetailOptions = SnakeToCamel<GetV1UserDetailRequest>
