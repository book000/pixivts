import {
  PixivUserItem,
  PixivUserProfile,
  PixivUserProfilePublicity,
  PixivUserProfileWorkspace,
} from '../../pixivUser'

/**
 * GET /v1/user/detail のレスポンス
 */
export interface GetUserDetailApiResponse {
  user: PixivUserItem
  profile: PixivUserProfile
  profile_publicity: PixivUserProfilePublicity
  workspace: PixivUserProfileWorkspace
}
