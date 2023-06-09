import { BookmarkRestrict } from '../../../../../options'

/**
 * POST /v2/illust/bookmark/add のリクエスト
 */
export interface PostV2IllustBookmarkAddRequest {
  /**
   * イラストID
   */
  illust_id: number

  /**
   * 公開設定
   *
   * public: 公開
   * private: 非公開
   *
   * @default BookmarkRestrict.Public
   */
  restrict: BookmarkRestrict

  /**
   * ブックマークタグ群
   */
  tags?: string[]
}

/**
 * POST /v2/illust/bookmark/add のレスポンス
 */
export type PostV2IllustBookmarkAddResponse = Record<string, never>
