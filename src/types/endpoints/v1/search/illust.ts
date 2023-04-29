import { PixivIllustItem } from '../../../pixiv-illust'

// @ts-ignore because tsdoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Pixiv from '../../../../pixiv'

/**
 * GET /v1/search/illust のレスポンス
 */
export interface GetV1SearchIllustResponse {
  /**
   * 検索結果のイラスト群
   */
  illusts: PixivIllustItem[]

  /**
   * 次回のリクエストに使用する URL。
   *
   * @see {Pixiv.parseQueryString}
   */
  next_url: string

  /**
   * 不明
   *
   * @beta
   */
  search_span_limit: number
}
