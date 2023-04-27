import { PixivIllustItem } from '../../pixiv-illust'
/**
 * GET /v1/illust/detail のレスポンス
 */
export interface GetV1IllustDetailResponse {
  illust: PixivIllustItem
}
