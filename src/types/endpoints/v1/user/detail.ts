import {
  PixivUserItem,
  PixivUserItemCheck,
  PixivUserProfile,
  PixivUserProfileCheck,
  PixivUserProfilePublicity,
  PixivUserProfilePublicityCheck,
  PixivUserProfileWorkspace,
  PixivUserProfileWorkspaceCheck,
} from '../../../pixiv-user'
import { OSFilter, OSFilterCheck } from '../../../../options'
import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'

/**
 * Request for GET /v1/user/detail
 */
export interface GetV1UserDetailRequest {
  /**
   * User ID
   */
  user_id: number

  /**
   * OS filter
   *
   * @default 'for_ios'
   */
  filter?: OSFilter
}

/**
 * Response for GET /v1/user/detail
 */
export interface GetV1UserDetailResponse {
  /**
   * User details
   */
  user: PixivUserItem

  /**
   * User profile information
   */
  profile: PixivUserProfile

  /**
   * User public profile information
   */
  profile_publicity: PixivUserProfilePublicity

  /**
   * User workspace information
   */
  workspace: PixivUserProfileWorkspace
}

export class GetV1UserDetailCheck extends BaseMultipleCheck<
  GetV1UserDetailRequest,
  GetV1UserDetailResponse
> {
  requestChecks(): CheckFunctions<GetV1UserDetailRequest> {
    return {
      user_id: (data) => typeof data.user_id === 'number',
      filter: (data) =>
        data.filter === undefined ||
        (typeof data.filter === 'string' &&
          new OSFilterCheck().throwIfFailed(data.filter)),
    }
  }

  responseChecks(): CheckFunctions<GetV1UserDetailResponse> {
    return {
      user: (data) => new PixivUserItemCheck().throwIfFailed(data.user),
      profile: (data) =>
        new PixivUserProfileCheck().throwIfFailed(data.profile),
      profile_publicity: (data) =>
        new PixivUserProfilePublicityCheck().throwIfFailed(
          data.profile_publicity
        ),
      workspace: (data) =>
        new PixivUserProfileWorkspaceCheck().throwIfFailed(data.workspace),
    }
  }
}
