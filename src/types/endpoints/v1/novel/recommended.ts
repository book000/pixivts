import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PrivacyPolicy, PrivacyPolicyCheck } from '../../../pixiv-common'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../pixiv-novel'

/**
 * Request for GET /v1/novel/recommended
 */
export interface GetV1NovelRecommendedRequest {
  /**
   * Whether to include ranking novels (?)
   *
   * @default true
   * @beta
   */
  include_ranking_novels: boolean

  /**
   * IDs of novels already recommended. Comma-separated (?)
   *
   * @default undefined
   * @beta
   */
  already_recommended?: string

  /**
   * Maximum bookmark ID for recommended illusts (?)
   *
   * @default undefined
   * @beta
   */
  max_bookmark_id_for_recommend?: number

  /**
   * Offset
   *
   * @default undefined
   */
  offset?: number

  /**
   * Whether to include the privacy policy (?)
   *
   * @default true
   * @beta
   */
  include_privacy_policy: boolean
}

/**
 * Response for GET /v1/novel/recommended
 */
export interface GetV1NovelRecommendedResponse {
  /**
   * Recommended novels
   */
  novels: PixivNovelItem[]

  /**
   * Ranking novels?
   *
   * @beta
   */
  ranking_novels: PixivNovelItem[]

  /**
   * Privacy policy
   */
  privacy_policy?: PrivacyPolicy

  /**
   * URL to use for the next request.
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
