import { BaseMultipleCheck, CheckFunctions } from '../../../../../checks'
import {
  BookmarkRestrict,
  BookmarkRestrictCheck,
  Filter,
  FilterCheck,
} from '../../../../../options'
import { PixivIllustItem, PixivIllustItemCheck } from '../../../../pixiv-illust'

/**
 * GET /v1/user/bookmarks/illust のリクエスト
 */
export interface GetV1UserBookmarksIllustRequest {
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
  max_bookmark_id?: number

  /**
   * OSフィルタ
   */
  filter?: Filter
}

/**
 * GET /v1/user/bookmarks/illust のレスポンス
 */
export interface GetV1UserBookmarksIllustResponse {
  /**
   * ブックマークしたイラスト群
   */
  illusts: PixivIllustItem[]

  /**
   * 次 URL
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
        new FilterCheck().throwIfFailed(data.filter),
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
        typeof data.next_url === 'string' || data.next_url === null,
    }
  }
}
