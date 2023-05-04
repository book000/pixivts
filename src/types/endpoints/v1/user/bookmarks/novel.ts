import { BaseMultipleCheck, CheckFunctions } from '../../../../../checks'
import { BookmarkRestrict, BookmarkRestrictCheck } from '../../../../../options'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../../pixiv-novel'

/**
 * GET /v1/user/bookmarks/novel のリクエスト
 */
export interface GetV1UserBookmarksNovelRequest {
  /**
   * ユーザーID
   */
  user_id: number

  /**
   * ブックマーク公開範囲
   */
  restrict: BookmarkRestrict

  /**
   * ブックマークタグ
   */
  tag?: string

  /**
   * ブックマークIDの最大値（ページネーション？）
   *
   * @beta
   */
  max_bookmark_id?: string
}

/**
 * GET /v1/user/bookmarks/novel のレスポンス
 */
export interface GetV1UserBookmarksNovelResponse {
  /**
   * ブックマークした小説群
   */
  novels: PixivNovelItem[]

  /**
   * 次 URL
   */
  next_url: string | null
}

export class GetV1UserBookmarksNovelCheck extends BaseMultipleCheck<
  GetV1UserBookmarksNovelRequest,
  GetV1UserBookmarksNovelResponse
> {
  requestChecks(): CheckFunctions<GetV1UserBookmarksNovelRequest> {
    return {
      user_id: (data) => typeof data.user_id === 'number' && data.user_id > 0,
      restrict: (data) =>
        typeof data.restrict === 'string' &&
        new BookmarkRestrictCheck().throwIfFailed(data.restrict),
      tag: (data) => data.tag === undefined || typeof data.tag === 'string',
      max_bookmark_id: (data) =>
        data.max_bookmark_id === undefined ||
        typeof data.max_bookmark_id === 'string',
    }
  }

  responseChecks(): CheckFunctions<GetV1UserBookmarksNovelResponse> {
    return {
      novels: (data) =>
        Array.isArray(data.novels) &&
        data.novels.length > 0 &&
        data.novels.every((novel) =>
          new PixivNovelItemCheck().throwIfFailed(novel)
        ),
      next_url: (data) =>
        data.next_url === null || typeof data.next_url === 'string',
    }
  }
}
