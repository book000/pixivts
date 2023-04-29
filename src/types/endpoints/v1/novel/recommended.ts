import { PixivNovelItem } from '../../../pixiv-novel'

// @ts-ignore because tsdoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Pixiv from '../../../../pixiv'

/**
 * GET /v1/novel/recommended のレスポンス
 */
export interface GetV1RecommendedNovelResponse {
  /**
   * おすすめの小説群
   */
  novels: PixivNovelItem[]

  /**
   * 不明
   *
   * @beta
   */
  ranking_novels: unknown[]

  /**
   * 不明
   *
   * @beta
   */
  privacy_policy: unknown

  /**
   * 次回のリクエストに使用する URL。
   *
   * @see {Pixiv.parseQueryString}
   */
  next_url: string
}
