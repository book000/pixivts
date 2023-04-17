import { PixivIllustItem } from '../../pixiv-illust'
/**
 * POST /v1/illust/detail のレスポンス
 */
export interface GetIllustDetailApiResponse {
  illust: PixivIllustItem
}
