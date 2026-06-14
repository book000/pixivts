/**
 * Request for POST /v1/user/follow/delete
 */
export interface PostV1UserFollowDeleteRequest {
  /**
   * User ID
   */
  user_id: number
}

/**
 * Response for POST /v1/user/follow/delete
 */
export type PostV1UserFollowDeleteResponse = Record<string, never>
