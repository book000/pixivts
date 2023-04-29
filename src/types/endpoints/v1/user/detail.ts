import {
  PixivUserItem,
  PixivUserProfile,
  PixivUserProfilePublicity,
  PixivUserProfileWorkspace,
} from '../../../pixiv-user'

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
