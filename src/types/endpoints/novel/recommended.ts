import { PixivNovelItem } from '../../pixiv-novel'

/**
 * GET /v1/novel/recommended のレスポンス
 */
export interface RecommendedNovelApiResponse {
  novels: PixivNovelItem[]
  ranking_novels: unknown[]
  privacy_policy: unknown
  next_url: string
}
