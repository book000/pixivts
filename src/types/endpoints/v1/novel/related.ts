import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import {
  PixivNovelItem,
  PixivNovelItemCheck,
} from '../../../../types/pixiv-novel'

/**
 * Request for GET /v1/novel/related
 */
export interface GetV1NovelRelatedRequest {
  /**
   * Novel ID
   */
  novel_id: number

  /**
   * Array of seed novel IDs (?)
   */
  seed_novel_ids?: number[]

  /**
   * Viewed novel IDs
   */
  viewed?: number[]
}

/**
 * Response for GET /v1/novel/related
 */
export interface GetV1NovelRelatedResponse {
  /**
   * Novel details
   */
  novels: PixivNovelItem[]

  /**
   * Next URL
   */
  next_url: string
}

export class GetV1NovelRelatedCheck extends BaseMultipleCheck<
  GetV1NovelRelatedRequest,
  GetV1NovelRelatedResponse
> {
  requestChecks(): CheckFunctions<GetV1NovelRelatedRequest> {
    return {
      novel_id: (data) =>
        typeof data.novel_id === 'number' && data.novel_id > 0,
    }
  }

  responseChecks(): CheckFunctions<GetV1NovelRelatedResponse> {
    return {
      novels: (data) =>
        Array.isArray(data.novels) &&
        data.novels.every(
          (novel) =>
            typeof novel === 'object' &&
            new PixivNovelItemCheck().throwIfFailed(novel)
        ),
      next_url: (data) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeof data.next_url === 'string' || data.next_url === null,
    }
  }
}
