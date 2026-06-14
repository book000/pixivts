/**
 * Request for POST /v1/novel/bookmark/delete
 */
export interface PostV1NovelBookmarkDeleteRequest {
  /**
   * Novel ID
   */
  novel_id: string
}

/**
 * Response for POST /v1/novel/bookmark/delete
 */
export type PostV1NovelBookmarkDeleteResponse = Record<string, never>
