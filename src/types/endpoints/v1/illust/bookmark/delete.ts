/**
 * POST /v1/illust/bookmark/delete のリクエスト
 */
export interface PostV1IllustBookmarkDeleteRequest {
  /**
   * イラストID
   */
  illust_id: string
}

/**
 * POST /v1/illust/bookmark/delete のレスポンス
 */
export type PostV1IllustBookmarkDeleteResponse = Record<string, never>
