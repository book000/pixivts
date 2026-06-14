import { BaseMultipleCheck, CheckFunctions } from '../../../../../checks'
import {
  BookmarkRestrict,
  BookmarkRestrictCheck,
  OSFilter,
  OSFilterCheck,
} from '../../../../../options'
import { PixivIllustItem, PixivIllustItemCheck } from '../../../../pixiv-illust'

/**
 * Request for GET /v1/user/bookmarks/illust
 */
export interface GetV1UserBookmarksIllustRequest {
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

  /**
   * OS filter
   */
  filter?: OSFilter
}

/**
 * Response for GET /v1/user/bookmarks/illust
 */
export interface GetV1UserBookmarksIllustResponse {
  /**
   * Bookmarked illusts
   */
  illusts: PixivIllustItem[]

  /**
   * Next URL
   */
  next_url: string | null
}

export class GetV1UserBookmarksIllustCheck extends BaseMultipleCheck<
  GetV1UserBookmarksIllustRequest,
  GetV1UserBookmarksIllustResponse
> {
  requestChecks(): CheckFunctions<GetV1UserBookmarksIllustRequest> {
    return {
      user_id: (data) => typeof data.user_id === 'number' && data.user_id > 0,
      restrict: (data) =>
        new BookmarkRestrictCheck().throwIfFailed(data.restrict),
      tag: (data) => data.tag === undefined || typeof data.tag === 'string',
      max_bookmark_id: (data) =>
        data.max_bookmark_id === undefined ||
        typeof data.max_bookmark_id === 'string',
      filter: (data) =>
        data.filter === undefined ||
        new OSFilterCheck().throwIfFailed(data.filter),
    }
  }

  responseChecks(): CheckFunctions<GetV1UserBookmarksIllustResponse> {
    return {
      illusts: (data) =>
        Array.isArray(data.illusts) &&
        data.illusts.length > 0 &&
        data.illusts.every((illust) =>
          new PixivIllustItemCheck().throwIfFailed(illust)
        ),
      next_url: (data) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeof data.next_url === 'string' || data.next_url === null,
    }
  }
}
