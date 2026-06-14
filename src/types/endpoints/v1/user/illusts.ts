import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { OSFilter, OSFilterCheck } from '../../../../options'
import { PixivUser, PixivUserCheck } from '../../../pixiv-common'
import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'

/**
 * Content type filter for user illusts
 */
export type UserIllustType = 'illust' | 'manga'

const USER_ILLUST_TYPES = new Set<UserIllustType>(['illust', 'manga'])

/**
 * Request for GET /v1/user/illusts
 */
export interface GetV1UserIllustsRequest {
  /**
   * User ID
   */
  user_id: number

  /**
   * Content type filter
   */
  type?: UserIllustType

  /**
   * OS filter
   */
  filter?: OSFilter

  /**
   * Offset (for pagination)
   */
  offset?: number
}

/**
 * Response for GET /v1/user/illusts
 */
export interface GetV1UserIllustsResponse {
  /**
   * User details
   */
  user: PixivUser

  /**
   * List of illusts or manga
   */
  illusts: PixivIllustItem[]

  /**
   * Next URL
   */
  next_url: string | null
}

export class GetV1UserIllustsCheck extends BaseMultipleCheck<
  GetV1UserIllustsRequest,
  GetV1UserIllustsResponse
> {
  requestChecks(): CheckFunctions<GetV1UserIllustsRequest> {
    return {
      user_id: (data) => typeof data.user_id === 'number' && data.user_id > 0,
      type: (data) =>
        data.type === undefined || USER_ILLUST_TYPES.has(data.type),
      filter: (data) =>
        data.filter === undefined ||
        new OSFilterCheck().throwIfFailed(data.filter),
      offset: (data) =>
        data.offset === undefined || typeof data.offset === 'number',
    }
  }

  responseChecks(): CheckFunctions<GetV1UserIllustsResponse> {
    return {
      user: (data) => new PixivUserCheck().throwIfFailed(data.user),
      illusts: (data) =>
        Array.isArray(data.illusts) &&
        data.illusts.every((illust) =>
          new PixivIllustItemCheck().throwIfFailed(illust)
        ),
      next_url: (data) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeof data.next_url === 'string' || data.next_url === null,
    }
  }
}
