import { PixivUser } from './pixivCommon'
import { PixivNovelItem } from './pixivNovel'

/**
 * pixiv 小説シリーズ詳細情報
 */
export interface NovelSeriesDetail {
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
   * オリジナル作品かどうか
   */
  is_original: boolean

  /**
   * 完結済みかどうか
   */
  is_concluded: boolean

  /**
   * コンテンツ数
   */
  content_count: number

  /**
   * 累計文字数
   */
  total_character_count: number

  /**
   * ユーザー情報
   */
  user: PixivUser

  /**
   * シリーズ説明文
   */
  display_text: string

  /**
   * AI使用フラグ
   */
  novel_ai_type: number

  /**
   * ウォッチリストに追加済みかどうか
   */
  watchlist_added: boolean
}

/**
 * pixiv 小説シリーズアイテム
 */
export interface PixivNovelSeriesItem {
  /**
   * シリーズ詳細
   */
  novel_series_detail: NovelSeriesDetail

  /**
   * シリーズの1個目の小説データ
   */
  novel_series_first_novel: PixivNovelItem

  /**
   * シリーズの最新の小説データ
   */
  novel_series_latest_novel: PixivNovelItem

  /**
   * シリーズにある小説一覧
   */
  novels: PixivNovelItem[]

  /**
   * 次URL
   */
  next_url: string | null
}
