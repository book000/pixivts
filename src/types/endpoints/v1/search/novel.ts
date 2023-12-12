import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import {
  OSFilter,
  OSFilterCheck,
  SearchSort,
  SearchSortCheck,
  SearchTarget,
  SearchTargetCheck,
} from '../../../../options'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../pixiv-novel'

/**
 * GET /v1/search/novel のリクエスト
 */
export interface GetV1SearchNovelRequest {
  /**
   * 検索ワード
   */
  word: string

  /**
   * 検索対象
   *
   * @default 'partial_match_for_tags'
   */
  search_target: SearchTarget

  /**
   * ソート順
   *
   * @default 'date_desc'
   */
  sort: SearchSort

  /**
   * 開始日時
   *
   * @default undefined
   */
  start_date?: string

  /**
   * 終了日時
   *
   * @default undefined
   */
  end_date?: string

  /**
   * OSフィルタ
   *
   * @default 'for_ios'
   */
  filter?: OSFilter

  /**
   * オフセット
   *
   * @default undefined
   */
  offset?: number

  /**
   * プレーンキーワード検索結果をマージするか (?)
   *
   * @default true
   * @beta
   */
  merge_plain_keyword_results: boolean

  /**
   * 翻訳タグ検索結果を含むか
   *
   * @default true
   * @beta
   */
  include_translated_tag_results: boolean
}

/**
 * GET /v1/search/novel のレスポンス
 */
export interface GetV1SearchNovelResponse {
  /**
   * 検索結果の小説群
   */
  novels: PixivNovelItem[]

  /**
   * 次回のリクエストに使用する URL。
   *
   * @see {Pixiv.parseQueryString}
   */
  next_url: string | null

  /**
   * 不明
   *
   * 「31536000」固定？1年間？
   *
   * @beta
   */
  search_span_limit: number
}

export class GetV1SearchNovelCheck extends BaseMultipleCheck<
  GetV1SearchNovelRequest,
  GetV1SearchNovelResponse
> {
  requestChecks(): CheckFunctions<GetV1SearchNovelRequest> {
    return {
      word: (data) => typeof data.word === 'string' && data.word.length > 0,
      search_target: (data) =>
        new SearchTargetCheck().throwIfFailed(data.search_target),
      sort: (data) => new SearchSortCheck().throwIfFailed(data.sort),
      start_date: (data) =>
        data.start_date === undefined ||
        (typeof data.start_date === 'string' && data.start_date.length > 0),
      end_date: (data) =>
        data.end_date === undefined ||
        (typeof data.end_date === 'string' && data.end_date.length > 0),
      filter: (data) =>
        data.filter === undefined ||
        new OSFilterCheck().throwIfFailed(data.filter),
      offset: (data) =>
        data.offset === undefined || typeof data.offset === 'number',
      merge_plain_keyword_results: (data) =>
        typeof data.merge_plain_keyword_results === 'boolean',
      include_translated_tag_results: (data) =>
        typeof data.include_translated_tag_results === 'boolean',
    }
  }

  responseChecks(): CheckFunctions<GetV1SearchNovelResponse> {
    return {
      novels: (data) =>
        Array.isArray(data.novels) &&
        data.novels.every((novel) =>
          new PixivNovelItemCheck().throwIfFailed(novel)
        ),
      next_url: (data) =>
        data.next_url === null ||
        (typeof data.next_url === 'string' && data.next_url.length > 0),
      search_span_limit: (data) => typeof data.search_span_limit === 'number',
    }
  }
}
