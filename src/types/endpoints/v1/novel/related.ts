import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import {
  PixivNovelItem,
  PixivNovelItemCheck,
} from '../../../../types/pixiv-novel'

/**
 * GET /v1/novel/related のリクエスト
 */
export interface GetV1NovelRelatedRequest {
  /**
   * 小説ID
   */
  novel_id: number

  /**
   * イラストID シード配列 (?)
   */
  seed_novel_ids?: number[]

  /**
   * 閲覧済みイラストID
   */
  viewed?: number[]
}

/**
 * GET /v1/novel/related のレスポンス
 */
export interface GetV1NovelRelatedResponse {
  /**
   * 小説の詳細情報
   */
  novels: PixivNovelItem[]

  /**
   * 次のURL
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
        typeof data.next_url === 'string' || data.next_url === null,
    }
  }
}
