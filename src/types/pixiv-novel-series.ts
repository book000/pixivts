import { BaseSimpleCheck, CheckFunctions } from '../checks'
import { PixivUser } from './pixiv-common'
import { PixivNovelItem, PixivNovelItemCheck } from './pixiv-novel'

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

export class NovelSeriesDetailCheck extends BaseSimpleCheck<NovelSeriesDetail> {
  checks(): CheckFunctions<NovelSeriesDetail> {
    return {
      id: (data) => typeof data.id === 'number',
      title: (data) => typeof data.title === 'string',
      caption: (data) => typeof data.caption === 'string',
      is_original: (data) => typeof data.is_original === 'boolean',
      is_concluded: (data) => typeof data.is_concluded === 'boolean',
      content_count: (data) => typeof data.content_count === 'number',
      total_character_count: (data) =>
        typeof data.total_character_count === 'number',
      user: (data) => typeof data.user === 'object',
      display_text: (data) => typeof data.display_text === 'string',
      novel_ai_type: (data) => typeof data.novel_ai_type === 'number',
      watchlist_added: (data) => typeof data.watchlist_added === 'boolean',
    }
  }
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
   * 次 URL
   */
  next_url: string | null
}

export class PixivNovelSeriesItemCheck extends BaseSimpleCheck<PixivNovelSeriesItem> {
  checks(): CheckFunctions<PixivNovelSeriesItem> {
    return {
      novel_series_detail: (data) =>
        typeof data.novel_series_detail === 'object' &&
        new NovelSeriesDetailCheck().throwIfFailed(data.novel_series_detail),
      novel_series_first_novel: (data) =>
        typeof data.novel_series_first_novel === 'object' &&
        new PixivNovelItemCheck().throwIfFailed(data.novel_series_first_novel),
      novel_series_latest_novel: (data) =>
        typeof data.novel_series_latest_novel === 'object' &&
        new PixivNovelItemCheck().throwIfFailed(data.novel_series_latest_novel),
      novels: (data) =>
        Array.isArray(data.novels) &&
        data.novels.every(
          (novel) =>
            typeof novel === 'object' &&
            new PixivNovelItemCheck().throwIfFailed(novel)
        ),
      next_url: (data) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeof data.next_url === 'string' || data.next_url === null,
    }
  }
}
