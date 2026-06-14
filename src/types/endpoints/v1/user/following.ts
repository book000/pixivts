import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { FollowRestrict, FollowRestrictCheck } from '../../../../options'
import {
  PixivUserPreviewItem,
  PixivUserPreviewItemCheck,
} from '../../../pixiv-user'

/**
 * Request for GET /v1/user/following
 */
export interface GetV1UserFollowingRequest {
  /**
   * User ID
   */
  user_id: number

  /**
   * Visibility of the followed users to retrieve
   */
  restrict: FollowRestrict

  /**
   * Offset (for pagination)
   */
  offset?: number
}

/**
 * Response for GET /v1/user/following
 */
export interface GetV1UserFollowingResponse {
  /**
   * List of followed users
   */
  user_previews: PixivUserPreviewItem[]

  /**
   * Next URL
   */
  next_url: string | null
}

export class GetV1UserFollowingCheck extends BaseMultipleCheck<
  GetV1UserFollowingRequest,
  GetV1UserFollowingResponse
> {
  requestChecks(): CheckFunctions<GetV1UserFollowingRequest> {
    return {
      user_id: (data) => typeof data.user_id === 'number' && data.user_id > 0,
      restrict: (data) =>
        new FollowRestrictCheck().throwIfFailed(data.restrict),
      offset: (data) =>
        data.offset === undefined || typeof data.offset === 'number',
    }
  }

  responseChecks(): CheckFunctions<GetV1UserFollowingResponse> {
    return {
      user_previews: (data) =>
        Array.isArray(data.user_previews) &&
        data.user_previews.every((preview) =>
          new PixivUserPreviewItemCheck().throwIfFailed(preview)
        ),
      next_url: (data) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeof data.next_url === 'string' || data.next_url === null,
    }
  }
}
