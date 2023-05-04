/**
 * POST /v1/novel/bookmark/delete のリクエスト
 */
export interface PostV1NovelBookmarkDeleteRequest {
  /**
   * 小説ID
   */
  novel_id: string
}

/**
 * POST /v1/novel/bookmark/delete のレスポンス
 */
export type PostV1NovelBookmarkDeleteResponse = Record<string, never>
