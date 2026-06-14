import { BaseMultipleCheck, CheckFunctions } from '../../../../../checks'
import { PixivUgoiraItem, PixivUgoiraItemCheck } from '../../../../pixiv-ugoira'

/**
 * Request for GET /v1/illust/ugoira/detail
 */
export interface GetV1IllustUgoiraMetadataRequest {
  /**
   * Illust ID
   */
  illust_id: number
}

/**
 * Response for GET /v1/illust/ugoira/detail
 */
export interface GetV1IllustUgoiraMetadataResponse {
  /**
   * Ugoira details
   */
  ugoira_metadata: PixivUgoiraItem
}

export class GetV1IllustUgoiraMetadataCheck extends BaseMultipleCheck<
  GetV1IllustUgoiraMetadataRequest,
  GetV1IllustUgoiraMetadataResponse
> {
  requestChecks(): CheckFunctions<GetV1IllustUgoiraMetadataRequest> {
    return {
      illust_id: (data) => typeof data.illust_id === 'number',
    }
  }

  responseChecks(): CheckFunctions<GetV1IllustUgoiraMetadataResponse> {
    return {
      ugoira_metadata: (data) =>
        typeof data.ugoira_metadata === 'object' &&
        new PixivUgoiraItemCheck().throwIfFailed(data.ugoira_metadata),
    }
  }
}
