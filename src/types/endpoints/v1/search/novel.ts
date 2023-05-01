import { Filter, SearchSort, SearchTarget } from '../../../../options'
import { PixivNovelItem } from '../../../pixiv-novel'

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
  filter?: Filter

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
