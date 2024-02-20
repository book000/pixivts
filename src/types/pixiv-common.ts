// @ts-ignore because tsdoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseSimpleCheck, CheckFunctions } from '../checks'

/**
 * 作品の画像URL群
 *
 * 単一画像の場合、オリジナル画像へは {@link MetaSinglePage.original_image_url} から取得
 *
 * 画像へのアクセスは適切なリファラを付与する必要がある
 */
export interface ImageUrls {
  /** 360x360 */
  square_medium: string

  /** 長辺が最大 540px */
  medium: string

  /** 横幅が最大 600px, 縦幅が最大 1200px */
  large: string

  /**
   * オリジナル画像
   *
   * {@link MetaPages.image_urls} の場合のみ存在？
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
 * プロフィール画像URL群
 */
export interface ProfileImageUrls {
  /** 中サイズ */
  medium: string
}

/**
 * ユーザー情報
 */
export interface PixivUser {
  /** ユーザー内部 ID */
  id: number

  /** ユーザー名 */
  name: string

  /** pixiv ID (URLに使用) */
  account: string

  /** プロフィール画像URL群 */
  profile_image_urls: ProfileImageUrls

  /** フォローしているかどうか */
  is_followed?: boolean

  /** アクセスをブロックしているユーザーであるか */
  is_access_blocking_user?: boolean
}

export class PixivUserCheck extends BaseSimpleCheck<PixivUser> {
  checks(): CheckFunctions<PixivUser> {
    return {
      id: (data) => typeof data.id === 'number',
      name: (data) => typeof data.name === 'string',
      account: (data) => typeof data.account === 'string',
      profile_image_urls: (data) =>
        typeof data.profile_image_urls === 'object' &&
        data.profile_image_urls.medium !== undefined,
      is_followed: (data) =>
        typeof data.is_followed === 'boolean' || data.is_followed === undefined,
      is_access_blocking_user: (data) =>
        data.is_access_blocking_user === undefined ||
        typeof data.is_access_blocking_user === 'boolean',
    }
  }
}

/**
 * タグ情報
 */
export interface Tag {
  /** タグ名 */
  name: string

  /** 翻訳済みタグ名 */
  translated_name: string | null

  /** 投稿者によって追加されたタグかどうか */
  added_by_uploaded_user?: boolean
}

export class TagCheck extends BaseSimpleCheck<Tag> {
  checks(): CheckFunctions<Tag> {
    return {
      name: (data) => typeof data.name === 'string',
      translated_name: (data) =>
        typeof data.translated_name === 'string' ||
        data.translated_name === null,
      added_by_uploaded_user: (data) =>
        data.added_by_uploaded_user === undefined ||
        typeof data.added_by_uploaded_user === 'boolean',
    }
  }
}

/**
 * シリーズ情報
 */
export interface Series {
  /** シリーズ ID */
  id: number

  /** シリーズ名 */
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
   * バージョン
   */
  version?: string

  /**
   * メッセージ
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
