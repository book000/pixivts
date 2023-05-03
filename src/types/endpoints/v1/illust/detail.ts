import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'

/**
 * GET /v1/illust/detail のリクエスト
 */
export interface GetV1IllustDetailRequest {
  /**
   * イラストID
   */
  illust_id: number
}

/**
 * GET /v1/illust/detail のレスポンス
 */
export interface GetV1IllustDetailResponse {
  /**
   * イラストの詳細情報
   */
  illust: PixivIllustItem
}

export class GetV1IllustDetailCheck extends BaseMultipleCheck<
  GetV1IllustDetailRequest,
  GetV1IllustDetailResponse
> {
  requestChecks(): CheckFunctions<GetV1IllustDetailRequest> {
    return {
      illust_id: (data) => typeof data.illust_id === 'number',
    }
  }

  responseChecks(): CheckFunctions<GetV1IllustDetailResponse> {
    return {
      illust: (data) =>
        typeof data.illust === 'object' &&
        new PixivIllustItemCheck().throwIfFailed(data.illust),
    }
  }
}
