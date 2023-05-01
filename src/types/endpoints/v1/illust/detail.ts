import { PixivIllustItem } from '../../../pixiv-illust'

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
