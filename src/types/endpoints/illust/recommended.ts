import { PixivIllustItem } from '../../pixiv-illust'

// @ts-ignore because tsdoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Pixiv from '../../../pixiv'

/**
 * GET /v1/illust/recommended のレスポンス
 */
export interface GetV1RecommendedIllustResponse {
  /**
   * おすすめのイラスト群
   */
  illusts: PixivIllustItem[]

  /**
   * 不明
   *
   * @beta
   */
  ranking_illusts: unknown[]

  /**
   * 不明
   *
   * @beta
   */
  contest_exists: boolean

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
