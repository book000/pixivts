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
import { Filter, FilterCheck } from '../../../../options'
import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'

/**
 * GET /v1/user/detail のリクエスト
 */
export interface GetV1UserDetailRequest {
  /**
   * ユーザーID
   */
  user_id: number

  /**
   * OSフィルタ
   *
   * @default 'for_ios'
   */
  filter?: Filter
}

/**
 * GET /v1/user/detail のレスポンス
 */
export interface GetV1UserDetailResponse {
  /**
   * ユーザーの詳細情報
   */
  user: PixivUserItem

  /**
   * ユーザーのプロフィール情報
   */
  profile: PixivUserProfile

  /**
   * ユーザーの公開プロフィール情報
   */
  profile_publicity: PixivUserProfilePublicity

  /**
   * ユーザーの作業環境情報
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
          new FilterCheck().throwIfFailed(data.filter)),
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
