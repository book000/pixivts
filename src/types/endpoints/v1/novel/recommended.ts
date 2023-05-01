import { PrivacyPolicy } from 'src/types/pixiv-common'
import { PixivNovelItem } from 'src/types/pixiv-novel'

/**
 * GET /v1/novel/recommended のリクエスト
 */
export interface GetV1NovelRecommendedRequest {
  /**
   * ランキング小説を含めるか (?)
   *
   * @default true
   * @beta
   */
  include_ranking_novels: boolean

  /**
   * すでにおすすめした小説ID群。カンマ区切り (?)
   *
   * @default undefined
   * @beta
   */
  already_recommended?: string

  /**
   * おすすめイラストの最大ブックマークID (?)
   *
   * @default undefined
   * @beta
   */
  max_bookmark_id_for_recommend?: number

  /**
   * オフセット
   *
   * @default undefined
   */
  offset?: number

  /**
   * プライバシーポリシーを含めるか (?)
   *
   * @default true
   * @beta
   */
  include_privacy_policy: boolean
}

/**
 * GET /v1/novel/recommended のレスポンス
 */
export interface GetV1NovelRecommendedResponse {
  /**
   * おすすめの小説群
   */
  novels: PixivNovelItem[]

  /**
   * ランキングの小説群？
   *
   * @beta
   */
  ranking_novels: PixivNovelItem[]

  /**
   * プライバシーポリシー
   */
  privacy_policy?: PrivacyPolicy[]

  /**
   * 次回のリクエストに使用する URL。
   *
   * @see {Pixiv.parseQueryString}
   */
  next_url: string
}
