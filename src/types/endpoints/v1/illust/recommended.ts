import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'
import {
  IllustContentType,
  IllustContentTypeCheck,
  OSFilter,
  OSFilterCheck,
} from '../../../../options'
import { PrivacyPolicy, PrivacyPolicyCheck } from '../../../pixiv-common'

import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'

/**
 * Request for GET /v1/illust/recommended
 */
export interface GetV1IllustRecommendedRequest {
  /**
   * Content type to recommend
   *
   * @default 'illust'
   */
  content_type?: IllustContentType

  /**
   * Whether to include ranking label (?)
   *
   * @default true
   * @beta
   */
  include_ranking_label?: boolean

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
   * Minimum bookmark ID for recent illusts (?)
   *
   * @default undefined
   * @beta
   */
  min_bookmark_id_for_recent_illust?: number

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

  /**
   * Viewed illust IDs to exclude from recommendations
   *
   * @default undefined
   */
  viewed?: number[]
}

/**
 * Response for GET /v1/illust/recommended
 */
export interface GetV1IllustRecommendedResponse {
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
   * Whether a contest exists?
   *
   * @beta
   */
  contest_exists: boolean

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

export class GetV1IllustRecommendedCheck extends BaseMultipleCheck<
  GetV1IllustRecommendedRequest,
  GetV1IllustRecommendedResponse
> {
  requestChecks(): CheckFunctions<GetV1IllustRecommendedRequest> {
    return {
      content_type: (data) =>
        data.content_type === undefined ||
        new IllustContentTypeCheck().throwIfFailed(data.content_type),
      include_ranking_label: (data) =>
        data.include_ranking_label === undefined ||
        typeof data.include_ranking_label === 'boolean',
      filter: (data) => new OSFilterCheck().throwIfFailed(data.filter),
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
      viewed: (data) =>
        data.viewed === undefined ||
        (Array.isArray(data.viewed) &&
          data.viewed.every((id) => typeof id === 'number')),
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
