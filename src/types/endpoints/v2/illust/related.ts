import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'

/**
 * GET /v2/illust/related のリクエスト
 */
export interface GetV2IllustRelatedRequest {
  /**
   * イラストID
   */
  illust_id: number

  /**
   * イラストID シード配列 (?)
   */
  seed_illust_ids?: number[]

  /**
   * 閲覧済みイラストID
   */
  viewed?: number[]

  /**
   * オフセット
   */
  offset?: number
}

/**
 * GET /v1/illust/related のレスポンス
 */
export interface GetV2IllustRelatedResponse {
  /**
   * イラストの詳細情報
   */
  illusts: PixivIllustItem[]

  /**
   * 次のURL
   */
  next_url: string
}

export class GetV2IllustRelatedCheck extends BaseMultipleCheck<
  GetV2IllustRelatedRequest,
  GetV2IllustRelatedResponse
> {
  requestChecks(): CheckFunctions<GetV2IllustRelatedRequest> {
    return {
      illust_id: (data) => typeof data.illust_id === 'number',
      seed_illust_ids: (data) =>
        data.seed_illust_ids === undefined ||
        (Array.isArray(data.seed_illust_ids) &&
          data.seed_illust_ids.every((id) => typeof id === 'number')),
      viewed: (data) =>
        data.viewed === undefined ||
        (Array.isArray(data.viewed) &&
          data.viewed.every((id) => typeof id === 'number')),
    }
  }

  responseChecks(): CheckFunctions<GetV2IllustRelatedResponse> {
    return {
      illust: (data) =>
        Array.isArray(data.illusts) &&
        data.illusts.every((illust) =>
          new PixivIllustItemCheck().throwIfFailed(illust)
        ),
      next_url: (data) =>
        typeof data.next_url === 'string' || data.next_url === null,
    }
  }
}
