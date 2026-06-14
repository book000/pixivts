import { BaseMultipleCheck, CheckFunctions } from '../../../../../checks'
import { BookmarkRestrict, BookmarkRestrictCheck } from '../../../../../options'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../../pixiv-novel'

/**
 * Request for GET /v1/user/bookmarks/novel
 */
export interface GetV1UserBookmarksNovelRequest {
  /**
   * User ID
   */
  user_id: number

  /**
   * Bookmark visibility
   */
  restrict: BookmarkRestrict

  /**
   * Bookmark tag
   */
  tag?: string

  /**
   * Maximum bookmark ID (pagination?)
   *
   * @beta
   */
  max_bookmark_id?: number
}

/**
 * Response for GET /v1/user/bookmarks/novel
 */
export interface GetV1UserBookmarksNovelResponse {
  /**
   * Bookmarked novels
   */
  novels: PixivNovelItem[]

  /**
   * Next URL
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
