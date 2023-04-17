import { PixivNovelItem } from '../../pixivNovel'

/**
 * GET /v1/search/novel のレスポンス
 */
export interface SearchNovelApiResponse {
  novels: PixivNovelItem[]
}
