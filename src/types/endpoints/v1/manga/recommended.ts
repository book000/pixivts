import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'
import { OSFilter, OSFilterCheck } from '../../../../options'
import { PrivacyPolicy, PrivacyPolicyCheck } from '../../../pixiv-common'

// @ts-ignore because tsdoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Pixiv from '../../../pixiv'
import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'

/**
 * GET /v1/manga/recommended のリクエスト
 */
export interface GetV1MangaRecommendedRequest {
  /**
   * OSフィルタ
   *
   * @default 'for_ios'
   */
  filter: OSFilter

  /**
   * ランキングイラストを含めるか (?)
   *
   * @default true
   * @beta
   */
  include_ranking_illusts: boolean

  /**
   * 最大ブックマークID (?)
   *
   * @default undefined
   * @beta
   */
  max_bookmark_id?: number

  /**
   * オフセット
   *
   * @default undefined
   */
  offset?: string

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
 * GET /v1/manga/recommended のレスポンス
 */
export interface GetV1MangaRecommendedResponse {
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

export class GetV1MangaRecommendedCheck extends BaseMultipleCheck<
  GetV1MangaRecommendedRequest,
  GetV1MangaRecommendedResponse
> {
  requestChecks(): CheckFunctions<GetV1MangaRecommendedRequest> {
    return {
      filter: (data) =>
        typeof data.filter === 'string' &&
        new OSFilterCheck().throwIfFailed(data.filter),
      include_ranking_illusts: (data) =>
        typeof data.include_ranking_illusts === 'boolean',
      max_bookmark_id: (data) =>
        data.max_bookmark_id === undefined ||
        typeof data.max_bookmark_id === 'number',
      offset: (data) =>
        data.offset === undefined || typeof data.offset === 'string',
      include_privacy_policy: (data) =>
        typeof data.include_privacy_policy === 'boolean',
    }
  }

  responseChecks(): CheckFunctions<GetV1MangaRecommendedResponse> {
    return {
      illusts: (data) =>
        Array.isArray(data.illusts) &&
        data.illusts.every((illust) =>
          new PixivIllustItemCheck().throwIfFailed(illust)
        ),
      ranking_illusts: (data) =>
        Array.isArray(data.ranking_illusts) &&
        data.ranking_illusts.every((illust) =>
          new PixivIllustItemCheck().throwIfFailed(illust)
        ),
      privacy_policy: (data) =>
        data.privacy_policy === undefined ||
        new PrivacyPolicyCheck().throwIfFailed(data.privacy_policy),
      next_url: (data) => typeof data.next_url === 'string',
    }
  }
}
