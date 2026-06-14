/**
 * Request for POST /v2/novel/bookmark/add
 */
export interface PostV2NovelBookmarkAddRequest {
  /**
   * Novel ID
   */
  novel_id: string

  /**
   * Visibility setting
   *
   * public: Public
   * private: Private
   *
   * @default BookmarkRestrict.Public
   */
  restrict: string

  /**
   * Bookmark tags
   */
  tags?: string[]
}

/**
 * Response for POST /v2/novel/bookmark/add
 */
export type PostV2NovelBookmarkAddResponse = Record<string, never>
