import { PixivIllustItem } from '../../pixivIllust'
/**
 * POST /v1/illust/detail のレスポンス
 */
export interface GetIllustDetailApiResponse {
  illust: PixivIllustItem
}
