import { PixivUser } from './pixiv-common'

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
