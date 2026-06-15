import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { OSFilter, OSFilterCheck } from '../../../../options'
import { PixivUser, PixivUserCheck } from '../../../pixiv-common'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../pixiv-novel'

/**
 * Request for GET /v1/user/novels
 */
export interface GetV1UserNovelsRequest {
  /**
   * User ID
   */
  user_id: number

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
 * Response for GET /v1/user/novels
 */
export interface GetV1UserNovelsResponse {
  /**
   * User details
   */
  user: PixivUser

  /**
   * List of novels
   */
  novels: PixivNovelItem[]

  /**
   * Next URL
   */
  next_url: string | null
}

export class GetV1UserNovelsCheck extends BaseMultipleCheck<
  GetV1UserNovelsRequest,
  GetV1UserNovelsResponse
> {
  requestChecks(): CheckFunctions<GetV1UserNovelsRequest> {
    return {
      user_id: (data) => typeof data.user_id === 'number' && data.user_id > 0,
      filter: (data) =>
        data.filter === undefined ||
        new OSFilterCheck().throwIfFailed(data.filter),
      offset: (data) =>
        data.offset === undefined || typeof data.offset === 'number',
    }
  }

  responseChecks(): CheckFunctions<GetV1UserNovelsResponse> {
    return {
      user: (data) => new PixivUserCheck().throwIfFailed(data.user),
      novels: (data) =>
        Array.isArray(data.novels) &&
        data.novels.every((novel) =>
          new PixivNovelItemCheck().throwIfFailed(novel)
        ),
      next_url: (data) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeof data.next_url === 'string' || data.next_url === null,
    }
  }
}
