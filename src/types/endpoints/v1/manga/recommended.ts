import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'
import { OSFilter, OSFilterCheck } from '../../../../options'
import { PrivacyPolicy, PrivacyPolicyCheck } from '../../../pixiv-common'

// @ts-expect-error because tsdoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Pixiv from '../../../pixiv'
import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'

/**
 * Request for GET /v1/manga/recommended
 */
export interface GetV1MangaRecommendedRequest {
  /**
   * OS filter
   *
   * @default 'for_ios'
   */
  filter: OSFilter

  /**
   * Whether to include ranking illusts (?)
   *
   * @default true
   * @beta
   */
  include_ranking_illusts: boolean

  /**
   * Maximum bookmark ID (?)
   *
   * @default undefined
   * @beta
   */
  max_bookmark_id?: number

  /**
   * Offset
   *
   * @default undefined
   */
  offset?: string

  /**
   * Whether to include the privacy policy (?)
   *
   * @default true
   * @beta
   */
  include_privacy_policy: boolean

  /**
   * Viewed illust IDs
   */
  // TODO: Not supported because it's cumbersome
  // viewed?: Record<string, string>
}

/**
 * Response for GET /v1/manga/recommended
 */
export interface GetV1MangaRecommendedResponse {
  /**
   * Recommended illusts
   */
  illusts: PixivIllustItem[]

  /**
   * Ranking illusts?
   *
   * @beta
   */
  ranking_illusts: PixivIllustItem[]

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
