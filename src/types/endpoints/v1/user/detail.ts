import {
  PixivUserItem,
  PixivUserProfile,
  PixivUserProfilePublicity,
  PixivUserProfileWorkspace,
} from '../../../pixiv-user'
import { Filter } from '../../../../options'

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
