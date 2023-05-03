import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'
import { Filter, FilterCheck } from '../../../../options'
import { PrivacyPolicy, PrivacyPolicyCheck } from '../../../pixiv-common'

// @ts-ignore because tsdoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Pixiv from '../../../pixiv'
import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'

/**
 * GET /v1/illust/recommended のリクエスト
 */
export interface GetV1IllustRecommendedRequest {
  /**
   * OSフィルタ
   *
   * @default 'for_ios'
   */
  filter: Filter

  /**
   * ランキングイラストを含めるか (?)
   *
   * @default true
   * @beta
   */
  include_ranking_illusts: boolean

  /**
   * 最近のイラストの最小ブックマークID (?)
   *
   * @default undefined
   * @beta
   */
  min_bookmark_id_for_recent_illust?: number

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

  /**
   * 閲覧済みのイラストID
   */
  // 面倒なので対応しない
  // viewed?: Record<string, string>
}

/**
 * GET /v1/illust/recommended のレスポンス
 */
export interface GetV1IllustRecommendedResponse {
  /**
   * おすすめのイラスト群
   */
  illusts: PixivIllustItem[]

  /**
   * ランキングのイラスト群？
   *
   * @beta
   */
  ranking_illusts: PixivIllustItem[]

  /**
   * コンテストが存在するか？
   *
   * @beta
   */
  contest_exists: boolean

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

export class GetV1IllustRecommendedCheck extends BaseMultipleCheck<
  GetV1IllustRecommendedRequest,
  GetV1IllustRecommendedResponse
> {
  requestChecks(): CheckFunctions<GetV1IllustRecommendedRequest> {
    return {
      filter: (data) => new FilterCheck().throwIfFailed(data.filter),
      include_ranking_illusts: (data) =>
        typeof data.include_ranking_illusts === 'boolean',
      min_bookmark_id_for_recent_illust: (data) =>
        data.min_bookmark_id_for_recent_illust === undefined ||
        typeof data.min_bookmark_id_for_recent_illust === 'number',
      max_bookmark_id_for_recommend: (data) =>
        data.max_bookmark_id_for_recommend === undefined ||
        typeof data.max_bookmark_id_for_recommend === 'number',
      offset: (data) =>
        data.offset === undefined || typeof data.offset === 'number',
      include_privacy_policy: (data) =>
        typeof data.include_privacy_policy === 'boolean',
    }
  }

  responseChecks(): CheckFunctions<GetV1IllustRecommendedResponse> {
    return {
      illusts: (data) =>
        Array.isArray(data.illusts) &&
        data.illusts.length > 0 &&
        data.illusts.every((illust) =>
          new PixivIllustItemCheck().throwIfFailed(illust)
        ),
      ranking_illusts: (data) =>
        Array.isArray(data.ranking_illusts) &&
        data.ranking_illusts.length > 0 &&
        data.ranking_illusts.every((illust) =>
          new PixivIllustItemCheck().throwIfFailed(illust)
        ),
      contest_exists: (data) => typeof data.contest_exists === 'boolean',
      privacy_policy: (data) =>
        data.privacy_policy === undefined ||
        new PrivacyPolicyCheck().throwIfFailed(data.privacy_policy),
      next_url: (data) => typeof data.next_url === 'string',
    }
  }
}
