import { BaseSimpleCheck, CheckFunctions } from '../checks'
import { PixivUser, PixivUserCheck } from './pixiv-common'

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

export class IllustSeriesDetailCheck extends BaseSimpleCheck<IllustSeriesDetail> {
  checks(): CheckFunctions<IllustSeriesDetail> {
    return {
      id: (data) => typeof data.id === 'number' && data.id > 0,
      title: (data) => typeof data.title === 'string' && data.title.length > 0,
      caption: (data) => typeof data.caption === 'string',
      cover_image_urls: (data) =>
        typeof data.cover_image_urls === 'object' &&
        typeof data.cover_image_urls.medium === 'string' &&
        data.cover_image_urls.medium.length > 0,
      series_work_count: (data) =>
        typeof data.series_work_count === 'number' &&
        data.series_work_count > 0,
      create_date: (data) => typeof data.create_date === 'string',
      width: (data) => typeof data.width === 'number' && data.width > 0,
      height: (data) => typeof data.height === 'number' && data.height > 0,
      user: (data) => new PixivUserCheck().throwIfFailed(data.user),
      watchlist_added: (data) => typeof data.watchlist_added === 'boolean',
    }
  }
}
