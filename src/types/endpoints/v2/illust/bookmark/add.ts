import { BookmarkRestrict } from '../../../../../options'

/**
 * Request for POST /v2/illust/bookmark/add
 */
export interface PostV2IllustBookmarkAddRequest {
  /**
   * Illust ID
   */
  illust_id: number

  /**
   * Visibility setting
   *
   * public: Public
   * private: Private
   *
   * @default BookmarkRestrict.Public
   */
  restrict: BookmarkRestrict

  /**
   * Bookmark tags
   */
  tags?: string[]
}

/**
 * Response for POST /v2/illust/bookmark/add
 */
export type PostV2IllustBookmarkAddResponse = Record<string, never>
