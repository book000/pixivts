import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../pixiv-novel'

/**
 * GET /v2/novel/detail のリクエスト
 */
export interface GetV2NovelDetailRequest {
  /**
   * 小説ID
   */
  novel_id: number
}

/**
 * GET /v2/novel/detail のレスポンス
 */
export interface GetV2NovelDetailResponse {
  /**
   * 小説の詳細情報
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
