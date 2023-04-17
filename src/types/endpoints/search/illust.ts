import { PixivIllustItem } from '../../pixivIllust'

/**
 * GET /v1/search/illust のレスポンス
 */
export interface SearchIllustApiResponse {
  illusts: PixivIllustItem[]
  next_url: string
  search_span_limit: number
}
