import { BaseSimpleCheck, CheckFunctions } from '../checks'
import { PixivUser, PixivUserCheck } from './pixiv-common'

/**
 * pixiv illust series details
 */
export interface IllustSeriesDetail {
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
   * Cover image URLs
   */
  cover_image_urls: {
    /**
     * Medium-sized cover image URL
     */
    medium: string
  }

  /**
   * Number of works in the series
   */
  series_work_count: number

  /**
   * Series creation date and time
   */
  create_date: string

  /**
   * Width of the series cover image
   */
  width: number

  /**
   * Height of the series cover image
   */
  height: number

  /**
   * Series creator information
   */
  user: PixivUser

  /**
   * Whether it has been added to the watchlist
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
