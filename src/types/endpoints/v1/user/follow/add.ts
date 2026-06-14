import { FollowRestrict } from '../../../../../options'

/**
 * Request for POST /v1/user/follow/add
 */
export interface PostV1UserFollowAddRequest {
  /**
   * User ID
   */
  user_id: number

  /**
   * Visibility setting
   *
   * public: Public
   * private: Private
   *
   * @default FollowRestrict.PUBLIC
   */
  restrict: FollowRestrict
}

/**
 * Response for POST /v1/user/follow/add
 */
export type PostV1UserFollowAddResponse = Record<string, never>
