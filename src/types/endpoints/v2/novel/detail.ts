import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../pixiv-novel'

/**
 * Request for GET /v2/novel/detail
 */
export interface GetV2NovelDetailRequest {
  /**
   * Novel ID
   */
  novel_id: number
}

/**
 * Response for GET /v2/novel/detail
 */
export interface GetV2NovelDetailResponse {
  /**
   * Novel details
   */
  novel: PixivNovelItem
}

export class GetV2NovelDetailCheck extends BaseMultipleCheck<
  GetV2NovelDetailRequest,
  GetV2NovelDetailResponse
> {
  requestChecks(): CheckFunctions<GetV2NovelDetailRequest> {
    return {
      novel_id: (data) =>
        typeof data.novel_id === 'number' && data.novel_id > 0,
    }
  }

  responseChecks(): CheckFunctions<GetV2NovelDetailResponse> {
    return {
      novel: (data) =>
        typeof data.novel === 'object' &&
        new PixivNovelItemCheck().throwIfFailed(data.novel),
    }
  }
}
