import { PixivUser } from './pixiv-common'
import { PixivIllustItem } from './pixiv-illust'

/**
 * pixiv イラストシリーズ詳細情報
 */
export interface IllustSeriesDetail {
  /**
   * シリーズ ID
   */
  id: number

  /**
   * シリーズタイトル
   */
  title: string

  /**
   * シリーズの説明文
   */
  caption: string

  /**
   * カバー画像 URL群
   */
  cover_image_urls: {
    /**
     * 中サイズカバー画像 URL
     */
    medium: string
  }

  /**
   * シリーズ作品数
   */
  series_work_count: number

  /**
   * シリーズ作成日時
   */
  create_date: string

  /**
   * シリーズカバー画像の幅
   */
  width: number

  /**
   * シリーズカバー画像の高さ
   */
  height: number

  /**
   * シリーズ作成者情報
   */
  user: PixivUser

  /**
   * ウォッチリストに追加済みかどうか
   */
  watchlist_added: boolean
}

/**
 * pixiv イラストシリーズ詳細情報
 */
export interface PixivIllustSeriesItem {
  /**
   * シリーズ詳細
   */
  illust_series_detail: IllustSeriesDetail

  /**
   * シリーズの最初のイラスト
   */
  illust_series_first_illust: PixivIllustItem

  /**
   * シリーズに含まれているイラスト群
   */
  illusts: PixivIllustItem[]

  /**
   * 次 URL
   */
  next_url: string | null
}
