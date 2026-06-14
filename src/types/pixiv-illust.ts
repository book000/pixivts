import { isEmptyObject } from '../utils'
import { BaseSimpleCheck, CheckFunctions } from '../checks'
import {
  ImageUrls,
  PixivUser,
  Tag,
  Series,
  ImageUrlsCheck,
  PixivUserCheck,
  TagCheck,
} from './pixiv-common'

/** Single-illust details */
export interface MetaSinglePage {
  /**
   * Original image URL
   *
   * Not present for manga (multi-page) works, since {@link PixivIllustItem.meta_single_page}
   * is an empty object for those works.
   */
  original_image_url?: string
}

/** Multi-illust details */
export interface MetaPages {
  /** Image URLs */
  image_urls: Required<ImageUrls>
}

/**
 * pixiv illust item
 */
export interface PixivIllustItem {
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
   * Work type
   *
   * illust: Illust
   * manga: Manga
   * ugoira: Ugoira
   */
  type: 'illust' | 'manga' | 'ugoira'

  /**
   * Image URLs for the work
   *
   * For illusts and manga, this contains the first image.
   * The second and subsequent images are contained in {@link meta_pages}.
   */
  image_urls: ImageUrls

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
   * Information about the work's poster
   */
  user: PixivUser

  /**
   * Work tags
   */
  tags: Tag[]

  /**
   * Tools used
   *
   * Such as SAI, CLIP STUDIO PAINT, etc. The poster can register up to 3, selected from a list.
   */
  tools: string[]

  /**
   * Posted date and time
   *
   * ISO 8601 format. YYYY-MM-DD'T'HH:mm:ss+09:00
   */
  create_date: string

  /**
   * Number of pages
   */
  page_count: number

  /** Image width */
  width: number

  /** Image height */
  height: number

  /**
   * Sanity level? (Content rating setting?)
   *
   * Details unknown. Can be 2, 4, or 6. 2 is all-ages, 6 is R-18?
   *
   * @beta
   */
  sanity_level: number

  /**
   * Age restriction
   *
   * 0 is all-ages, 1 is R-18, 2 is R-18G
   */
  x_restrict: number

  /**
   * Series information
   *
   * For illusts and manga, this is null if the work does not belong to a series.
   */
  series: Series | null

  /**
   * Single-illust details
   *
   * Used only for single-page works. For multi-page works, use {@link meta_pages}.
   * For multi-page works, this property contains an empty object.
   */
  meta_single_page: MetaSinglePage | Record<string, never>

  /**
   * Multi-illust details
   *
   * Used only for multi-page works. For single-page works, use {@link meta_single_page}.
   * For single-page works, this property contains an empty array.
   */
  meta_pages: MetaPages[]

  /**
   * View count
   */
  total_view: number

  /**
   * Bookmark count
   */
  total_bookmarks: number

  /**
   * Whether it is bookmarked
   */
  is_bookmarked: boolean

  /**
   * Whether it is visible
   */
  visible: boolean

  /**
   * Whether this work is muted
   */
  is_muted: boolean

  /**
   * Number of users who commented on this work
   */
  total_comments?: number

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
  illust_ai_type: number

  /**
   * The work's style?
   *
   * @beta
   */
  illust_book_style: number

  /**
   * Comment visibility control?
   *
   * @beta
   */
  comment_access_control?: number

  /**
   * Restriction attributes
   *
   * Purpose unknown. Defaults to an empty array.
   */
  restriction_attributes: string[]
}

export class PixivIllustItemCheck extends BaseSimpleCheck<PixivIllustItem> {
  checks(): CheckFunctions<PixivIllustItem> {
    return {
      id: (data: PixivIllustItem): boolean => typeof data.id === 'number',
      title: (data: PixivIllustItem): boolean => typeof data.title === 'string',
      type: (data: PixivIllustItem): boolean =>
        typeof data.type === 'string' &&
        ['illust', 'manga', 'ugoira'].includes(data.type),
      image_urls: (data: PixivIllustItem): boolean =>
        typeof data.image_urls === 'object' &&
        new ImageUrlsCheck().throwIfFailed(data.image_urls),
      caption: (data: PixivIllustItem): boolean =>
        typeof data.caption === 'string',
      restrict: (data: PixivIllustItem): boolean =>
        typeof data.restrict === 'number',
      user: (data: PixivIllustItem): boolean =>
        typeof data.user === 'object' &&
        new PixivUserCheck().throwIfFailed(data.user),
      tags: (data: PixivIllustItem): boolean =>
        typeof data.tags === 'object' &&
        Array.isArray(data.tags) &&
        data.tags.every((tag) => new TagCheck().throwIfFailed(tag)),
      tools: (data: PixivIllustItem): boolean =>
        typeof data.tools === 'object' &&
        Array.isArray(data.tools) &&
        data.tools.every((tool) => typeof tool === 'string') &&
        data.tools.length <= 3,
      create_date: (data: PixivIllustItem): boolean =>
        typeof data.create_date === 'string',
      page_count: (data: PixivIllustItem): boolean =>
        typeof data.page_count === 'number',
      width: (data: PixivIllustItem): boolean => typeof data.width === 'number',
      height: (data: PixivIllustItem): boolean =>
        typeof data.height === 'number',
      sanity_level: (data: PixivIllustItem): boolean =>
        typeof data.sanity_level === 'number',
      meta_single_page: (data: PixivIllustItem): boolean =>
        typeof data.meta_single_page === 'object' &&
        (isEmptyObject(data.meta_single_page) ||
          data.meta_single_page.original_image_url !== undefined),
      meta_pages: (data: PixivIllustItem): boolean =>
        typeof data.meta_pages === 'object' &&
        Array.isArray(data.meta_pages) &&
        data.meta_pages.every(
          (metaPage) =>
            typeof metaPage.image_urls === 'object' &&
            new ImageUrlsCheck().throwIfFailed(metaPage.image_urls)
        ),
      total_view: (data: PixivIllustItem): boolean =>
        typeof data.total_view === 'number',
      total_bookmarks: (data: PixivIllustItem): boolean =>
        typeof data.total_bookmarks === 'number',
      is_bookmarked: (data: PixivIllustItem): boolean =>
        typeof data.is_bookmarked === 'boolean',
      visible: (data: PixivIllustItem): boolean =>
        typeof data.visible === 'boolean',
      is_muted: (data: PixivIllustItem): boolean =>
        typeof data.is_muted === 'boolean',
      total_comments: (data: PixivIllustItem): boolean =>
        data.total_comments === undefined ||
        typeof data.total_comments === 'number',
      illust_ai_type: (data: PixivIllustItem): boolean =>
        typeof data.illust_ai_type === 'number',
      illust_book_style: (data: PixivIllustItem): boolean =>
        typeof data.illust_book_style === 'number',
      restriction_attributes: (data: PixivIllustItem): boolean =>
        Array.isArray(data.restriction_attributes) &&
        data.restriction_attributes.every((attr) => typeof attr === 'string'),
    }
  }
}
