import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PrivacyPolicy, PrivacyPolicyCheck } from '../../../pixiv-common'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../pixiv-novel'

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
  privacy_policy?: PrivacyPolicy

  /**
   * 次回のリクエストに使用する URL。
   *
   * @see {Pixiv.parseQueryString}
   */
  next_url: string
}

export class GetV1NovelRecommendedCheck extends BaseMultipleCheck<
  GetV1NovelRecommendedRequest,
  GetV1NovelRecommendedResponse
> {
  requestChecks(): CheckFunctions<GetV1NovelRecommendedRequest> {
    return {
      include_ranking_novels: (data) =>
        typeof data.include_ranking_novels === 'boolean',
      already_recommended: (data) =>
        data.already_recommended === undefined ||
        typeof data.already_recommended === 'string',
      max_bookmark_id_for_recommend: (data) =>
        data.max_bookmark_id_for_recommend === undefined ||
        typeof data.max_bookmark_id_for_recommend === 'number',
      offset: (data) =>
        data.offset === undefined || typeof data.offset === 'number',
      include_privacy_policy: (data) =>
        typeof data.include_privacy_policy === 'boolean',
    }
  }

  responseChecks(): CheckFunctions<GetV1NovelRecommendedResponse> {
    return {
      novels: (data) =>
        Array.isArray(data.novels) &&
        data.novels.every((novel) =>
          new PixivNovelItemCheck().throwIfFailed(novel)
        ),
      ranking_novels: (data) =>
        Array.isArray(data.ranking_novels) &&
        data.ranking_novels.every((novel) =>
          new PixivNovelItemCheck().throwIfFailed(novel)
        ),
      privacy_policy: (data) =>
        data.privacy_policy === undefined ||
        new PrivacyPolicyCheck().throwIfFailed(data.privacy_policy),
      next_url: (data) => typeof data.next_url === 'string',
    }
  }
}
