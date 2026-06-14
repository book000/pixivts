import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'

/**
 * Request for GET /v1/illust/detail
 */
export interface GetV1IllustDetailRequest {
  /**
   * Illust ID
   */
  illust_id: number
}

/**
 * Response for GET /v1/illust/detail
 */
export interface GetV1IllustDetailResponse {
  /**
   * Illust details
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
