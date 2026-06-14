import { BaseSimpleCheck, CheckFunctions } from '../checks'
import { PixivUser } from './pixiv-common'
import { PixivNovelItem, PixivNovelItemCheck } from './pixiv-novel'

/**
 * pixiv novel series details
 */
export interface NovelSeriesDetail {
  /**
   * Series ID
   */
  id: number

  /**
   * Series title
   */
  title: string

  /**
   * Series description
   */
  caption: string

  /**
   * Whether it is an original work
   */
  is_original: boolean

  /**
   * Whether it has concluded
   */
  is_concluded: boolean

  /**
   * Number of contents
   */
  content_count: number

  /**
   * Total character count
   */
  total_character_count: number

  /**
   * User information
   */
  user: PixivUser

  /**
   * Series display text
   */
  display_text: string

  /**
   * AI usage flag
   */
  novel_ai_type: number

  /**
   * Whether it has been added to the watchlist
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
 * pixiv novel series item
 */
export interface PixivNovelSeriesItem {
  /**
   * Series details
   */
  novel_series_detail: NovelSeriesDetail

  /**
   * First novel data in the series
   */
  novel_series_first_novel: PixivNovelItem

  /**
   * Latest novel data in the series
   */
  novel_series_latest_novel: PixivNovelItem

  /**
   * List of novels in the series
   */
  novels: PixivNovelItem[]

  /**
   * Next URL
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
