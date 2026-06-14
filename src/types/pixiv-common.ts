import { BaseSimpleCheck, CheckFunctions } from '../checks'

/**
 * Image URLs for a work
 *
 * For a single image, the original image can be obtained from {@link MetaSinglePage.original_image_url}
 *
 * Accessing the images requires an appropriate referer to be set
 */
export interface ImageUrls {
  /** 360x360 */
  square_medium: string

  /** Long side is at most 540px */
  medium: string

  /** Width is at most 600px, height is at most 1200px */
  large: string

  /**
   * Original image
   *
   * Only present for {@link MetaPages.image_urls}?
   */
  original?: string
}

export class ImageUrlsCheck extends BaseSimpleCheck<ImageUrls> {
  checks(): CheckFunctions<ImageUrls> {
    return {
      square_medium: (data) => typeof data.square_medium === 'string',
      medium: (data) => typeof data.medium === 'string',
      large: (data) => typeof data.large === 'string',
      original: (data) =>
        data.original === undefined || typeof data.original === 'string',
    }
  }
}

/**
 * Profile image URLs
 */
export interface ProfileImageUrls {
  /** Medium size */
  medium: string
}

/**
 * User information
 */
export interface PixivUser {
  /** Internal user ID */
  id: number

  /** Username */
  name: string

  /** pixiv ID (used in the URL) */
  account: string

  /** Profile image URLs */
  profile_image_urls: ProfileImageUrls

  /** Whether the user is followed */
  is_followed?: boolean

  /** Whether this user has blocked access */
  is_access_blocking_user?: boolean

  /**
   * Whether the user accepts work requests
   *
   * Returned by following/follower endpoints. Indicates whether the user's
   * request acceptance setting is enabled.
   */
  is_accept_request?: boolean
}

export class PixivUserCheck extends BaseSimpleCheck<PixivUser> {
  checks(): CheckFunctions<PixivUser> {
    return {
      id: (data) => typeof data.id === 'number',
      name: (data) => typeof data.name === 'string',
      account: (data) => typeof data.account === 'string',
      profile_image_urls: (data) =>
        typeof data.profile_image_urls === 'object' &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        data.profile_image_urls.medium !== undefined,
      is_followed: (data) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeof data.is_followed === 'boolean' || data.is_followed === undefined,
      is_access_blocking_user: (data) =>
        data.is_access_blocking_user === undefined ||
        typeof data.is_access_blocking_user === 'boolean',
      is_accept_request: (data) =>
        data.is_accept_request === undefined ||
        typeof data.is_accept_request === 'boolean',
    }
  }
}

/**
 * Tag information
 */
export interface Tag {
  /** Tag name */
  name: string

  /** Translated tag name */
  translated_name: string | null

  /** Whether the tag was added by the uploader */
  added_by_uploaded_user?: boolean
}

export class TagCheck extends BaseSimpleCheck<Tag> {
  checks(): CheckFunctions<Tag> {
    return {
      name: (data) => typeof data.name === 'string',
      translated_name: (data) =>
        typeof data.translated_name === 'string' ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        data.translated_name === null,
      added_by_uploaded_user: (data) =>
        data.added_by_uploaded_user === undefined ||
        typeof data.added_by_uploaded_user === 'boolean',
    }
  }
}

/**
 * Series information
 */
export interface Series {
  /** Series ID */
  id: number

  /** Series title */
  title: string
}

export class SeriesCheck extends BaseSimpleCheck<Series> {
  checks(): CheckFunctions<Series> {
    return {
      id: (data) => typeof data.id === 'number',
      title: (data) => typeof data.title === 'string',
    }
  }
}

export interface PrivacyPolicy {
  /**
   * Version
   */
  version?: string

  /**
   * Message
   */
  message?: string

  /**
   * URL
   */
  url?: string
}

export class PrivacyPolicyCheck extends BaseSimpleCheck<PrivacyPolicy> {
  checks(): CheckFunctions<PrivacyPolicy> {
    return {
      version: (data) =>
        data.version === undefined || typeof data.version === 'string',
      message: (data) =>
        data.message === undefined || typeof data.message === 'string',
      url: (data) => data.url === undefined || typeof data.url === 'string',
    }
  }
}
