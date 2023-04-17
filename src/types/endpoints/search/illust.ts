import { PixivIllustItem } from '../../pixiv-illust'

/**
 * GET /v1/search/illust のレスポンス
 */
export interface SearchIllustApiResponse {
  illusts: PixivIllustItem[]
  next_url: string
  search_span_limit: number
}
