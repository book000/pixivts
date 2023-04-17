import {
  PixivUserItem,
  PixivUserProfile,
  PixivUserProfilePublicity,
  PixivUserProfileWorkspace,
} from '../../pixiv-user'

/**
 * GET /v1/user/detail のレスポンス
 */
export interface GetUserDetailApiResponse {
  user: PixivUserItem
  profile: PixivUserProfile
  profile_publicity: PixivUserProfilePublicity
  workspace: PixivUserProfileWorkspace
}
