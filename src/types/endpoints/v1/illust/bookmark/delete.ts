/**
 * Request for POST /v1/illust/bookmark/delete
 */
export interface PostV1IllustBookmarkDeleteRequest {
  /**
   * Illust ID
   */
  illust_id: string
}

/**
 * Response for POST /v1/illust/bookmark/delete
 */
export type PostV1IllustBookmarkDeleteResponse = Record<string, never>
