import { isEmptyObject } from '../utils'
import { BaseSimpleCheck, CheckFunctions } from '../checks'
import {
  ImageUrls,
  Tag,
  PixivUser,
  Series,
  TagCheck,
  PixivUserCheck,
  SeriesCheck,
  ImageUrlsCheck,
} from './pixiv-common'

/**
 * pixiv novel item
 */
export interface PixivNovelItem {
  /**
   * Work ID
   *
   * Note that illusts and novels are numbered separately, so the same ID can appear in both.
   */
  id: number

  /**
   * Work title
   */
  title: string

  /**
   * Caption (description)
   */
  caption: string

  /**
   * Visibility
   *
   * Details unknown. 0 is confirmed to mean public
   */
  restrict: number

  /**
   * Age restriction
   *
   * 0 is all-ages, 1 is R-18, 2 is R-18G
   */
  x_restrict: number

  /**
   * Whether it is an original work
   */
  is_original: boolean

  /**
   * Image URLs for the work
   *
   * For novels, this contains the cover image.
   */
  image_urls: ImageUrls

  /**
   * Posted date and time
   *
   * ISO 8601 format. YYYY-MM-DD'T'HH:mm:ss+09:00
   */
  create_date: string

  /**
   * Work tags
   */
  tags: Tag[]

  /**
   * Number of pages
   */
  page_count: number

  /**
   * Character count
   */
  text_length: number

  /**
   * Information about the work's poster
   */
  user: PixivUser

  /**
   * Series information
   *
   * For novels, this contains an empty object if the work does not belong to a series.
   */
  series: Series | Record<string, never>

  /**
   * Whether it is bookmarked
   */
  is_bookmarked: boolean

  /**
   * Bookmark count
   */
  total_bookmarks: number

  /**
   * View count
   */
  total_view: number

  /**
   * Whether it is visible
   */
  visible: boolean

  /**
   * Comment count
   */
  total_comments: number

  /**
   * Whether this work is muted
   */
  is_muted: boolean

  /**
   * Whether visibility is restricted to "mypixiv" users
   */
  is_mypixiv_only: boolean

  /**
   * Unknown (whether visibility is restricted?)
   *
   * @beta
   */
  is_x_restricted: boolean

  /**
   * AI usage flag
   *
   * 0: Not used
   * 1: Used to a supplementary extent
   * 2: Used
   *
   * As of 2022/11/02, the posting screen does not appear to have a UI to select "used to a supplementary extent",
   * but there are works that actually have 1 set.
   *
   * @see https://www.pixiv.help/hc/ja/articles/11866194231577
   * @see https://github.com/ArkoClub/async-pixiv/blob/fa45c81093a5c6f4eabfcc942915fc479e42174f/src/async_pixiv/model/other.py#L40-L48
   */
  novel_ai_type: number
}

export class PixivNovelItemCheck extends BaseSimpleCheck<PixivNovelItem> {
  checks(): CheckFunctions<PixivNovelItem> {
    return {
      id: (data) => typeof data.id === 'number',
      title: (data) => typeof data.title === 'string',
      caption: (data) => typeof data.caption === 'string',
      restrict: (data) => typeof data.restrict === 'number',
      x_restrict: (data) => typeof data.x_restrict === 'number',
      is_original: (data) => typeof data.is_original === 'boolean',
      image_urls: (data) =>
        typeof data.image_urls === 'object' &&
        new ImageUrlsCheck().throwIfFailed(data.image_urls),
      create_date: (data) => typeof data.create_date === 'string',
      tags: (data) =>
        typeof data.tags === 'object' &&
        Array.isArray(data.tags) &&
        data.tags.every((tag) => new TagCheck().throwIfFailed(tag)),
      page_count: (data) => typeof data.page_count === 'number',
      text_length: (data) => typeof data.text_length === 'number',
      user: (data) =>
        typeof data.user === 'object' &&
        new PixivUserCheck().throwIfFailed(data.user),
      series: (data) =>
        typeof data.series === 'object' &&
        (isEmptyObject(data.series) ||
          new SeriesCheck().throwIfFailed(data.series)),
      is_bookmarked: (data) => typeof data.is_bookmarked === 'boolean',
      total_bookmarks: (data) => typeof data.total_bookmarks === 'number',
      total_view: (data) => typeof data.total_view === 'number',
      visible: (data) => typeof data.visible === 'boolean',
      total_comments: (data) => typeof data.total_comments === 'number',
      is_muted: (data) => typeof data.is_muted === 'boolean',
      is_mypixiv_only: (data) => typeof data.is_mypixiv_only === 'boolean',
      is_x_restricted: (data) => typeof data.is_x_restricted === 'boolean',
      novel_ai_type: (data) => typeof data.novel_ai_type === 'number',
    }
  }
}
