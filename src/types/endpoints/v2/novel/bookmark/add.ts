/**
 * POST /v2/novel/bookmark/add のリクエスト
 */
export interface PostV2NovelBookmarkAddRequest {
  /**
   * 小説ID
   */
  novel_id: string

  /**
   * 公開設定
   *
   * public: 公開
   * private: 非公開
   *
   * @default BookmarkRestrict.Public
   */
  restrict: string

  // tags: string[]; があるかもしれない。要確認
}

/**
 * POST /v2/novel/bookmark/add のレスポンス
 */
export type PostV2NovelBookmarkAddResponse = Record<string, never>
