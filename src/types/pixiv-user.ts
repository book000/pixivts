import { BaseSimpleCheck, CheckFunctions } from '../checks'
import { PixivUser, PixivUserCheck } from './pixiv-common'

/**
 * pixiv user item
 */
export type PixivUserItem = PixivUser & {
  /**
   * Self-introduction
   *
   * Line breaks appear to be \r\n.
   */
  comment: string
}

export class PixivUserItemCheck extends BaseSimpleCheck<PixivUserItem> {
  checks(): CheckFunctions<PixivUserItem> {
    return {
      pixivUser: (data) => new PixivUserCheck().throwIfFailed(data),
      comment: (data) => typeof data.comment === 'string',
    }
  }
}

/**
 * Gender of the pixiv user
 */
export type Gender = 'male' | 'female' | 'unknown'

/**
 * pixiv user profile
 */
export interface PixivUserProfile {
  /** Website */
  webpage: string | null

  /** Gender */
  gender: Gender

  /** Date of birth (YYYY-MM-DD) */
  birth: string

  /** Birthday (MM-DD) */
  birth_day: string

  /** Birth year (YYYY) */
  birth_year: number

  /** Address (country name, and prefecture if public, space-separated) */
  region: string

  /**
   * Prefecture number
   *
   * - 0: Private
   * - 1-47: Prefecture number
   * - 48: Outside Japan?
   */
  address_id: number

  /**
   * Country code
   *
   * - Empty string for Japan
   * - ISO 3166-1 alpha-2 format
   */
  country_code: string

  /** Occupation */
  job: string

  /**
   * Occupation ID
   *
   * The numbering is as follows.
   * 0: Unspecified or private
   * 1: IT-related
   * 2: Office work
   * 3: Technical
   * 4: Sales / planning
   * 5: Creator
   * 6: Sales
   * 7: Service industry
   * 8: Manual labor
   * 9: Executive / manager
   * 10: Specialist
   * 11: Civil servant
   * 12: Teacher
   * 13: Self-employed
   * 14: Artist
   * 15: Freeter (part-time worker)
   * 16: Elementary school student
   * 17: Junior high school student
   * 18: High school student
   * 19: University / graduate student
   * 20: Vocational school student
   * 21: Homemaker
   * 22: Job seeker
   * 23: Other
   */
  job_id: number

  /** Number of users being followed */
  total_follow_users: number

  /** Number of "mypixiv" users */
  total_mypixiv_users: number

  /** Number of posted illusts */
  total_illusts: number

  /** Number of posted manga */
  total_manga: number

  /** Number of posted novels */
  total_novels: number

  /** Number of public bookmarks */
  total_illust_bookmarks_public: number

  /** Number of created illust series */
  total_illust_series: number

  /** Number of created novel series */
  total_novel_series: number

  /** Background image URL */
  background_image_url: string | null

  /**
   * Twitter account screen name
   *
   * - Empty string if not set
   * - Does not include @
   * - This is manually entered rather than linked, so it may not exist due to a screen name change, account deletion, etc.
   * - Other services such as Instagram or Tumblr cannot be retrieved
   */
  twitter_account: string

  /** Twitter account URL */
  twitter_url: string

  /**
   * Pawoo account URL
   *
   * - Only present if linked with a Pawoo account and "Show link to Pawoo account" is checked.
   * - Empty string if not linked or not displayed
   */
  pawoo_url: string

  /** Whether it is a premium account */
  is_premium: boolean

  /** Whether a custom profile image is used */
  is_using_custom_profile_image: boolean
}

export class PixivUserProfileCheck extends BaseSimpleCheck<PixivUserProfile> {
  checks(): CheckFunctions<PixivUserProfile> {
    return {
      webpage: (data) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeof data.webpage === 'string' || data.webpage === null,
      gender: (data) =>
        typeof data.gender === 'string' &&
        ['male', 'female', 'unknown'].includes(data.gender),
      birth: (data) =>
        typeof data.birth === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(data.birth),
      birth_day: (data) =>
        typeof data.birth_day === 'string' &&
        /^\d{2}-\d{2}$/.test(data.birth_day),
      birth_year: (data) =>
        typeof data.birth_year === 'number' &&
        data.birth_year >= 1000 &&
        data.birth_year <= 9999,
      region: (data) => typeof data.region === 'string',
      address_id: (data) =>
        typeof data.address_id === 'number' &&
        (data.address_id === 0 ||
          (data.address_id >= 1 && data.address_id <= 48)),
      country_code: (data) =>
        typeof data.country_code === 'string' &&
        (data.country_code === '' || /^[A-Z]{2}$/.test(data.country_code)),
      job: (data) => typeof data.job === 'string',
      job_id: (data) =>
        typeof data.job_id === 'number' &&
        (data.job_id === 0 || (data.job_id >= 1 && data.job_id <= 23)),
      total_follow_users: (data) =>
        typeof data.total_follow_users === 'number' &&
        data.total_follow_users >= 0,
      total_mypixiv_users: (data) =>
        typeof data.total_mypixiv_users === 'number' &&
        data.total_mypixiv_users >= 0,
      total_illusts: (data) =>
        typeof data.total_illusts === 'number' && data.total_illusts >= 0,
      total_manga: (data) =>
        typeof data.total_manga === 'number' && data.total_manga >= 0,
      total_novels: (data) =>
        typeof data.total_novels === 'number' && data.total_novels >= 0,
      total_illust_bookmarks_public: (data) =>
        typeof data.total_illust_bookmarks_public === 'number' &&
        data.total_illust_bookmarks_public >= 0,
      total_illust_series: (data) =>
        typeof data.total_illust_series === 'number' &&
        data.total_illust_series >= 0,
      total_novel_series: (data) =>
        typeof data.total_novel_series === 'number' &&
        data.total_novel_series >= 0,
      background_image_url: (data) =>
        typeof data.background_image_url === 'string',
      twitter_account: (data) => typeof data.twitter_account === 'string',
      twitter_url: (data) => typeof data.twitter_url === 'string',
      pawoo_url: (data) => typeof data.pawoo_url === 'string',
      is_premium: (data) => typeof data.is_premium === 'boolean',
      is_using_custom_profile_image: (data) =>
        typeof data.is_using_custom_profile_image === 'boolean',
    }
  }
}

/**
 * Visibility setting value for a pixiv user profile
 */
export type Publicity = 'public' | 'private' | 'mypixiv'

/**
 * pixiv user profile visibility settings
 *
 * Basically one of public, private, or mypixiv.
 * public means visible to everyone, private means hidden, and mypixiv means visible only to "mypixiv" users.
 */
export interface PixivUserProfilePublicity {
  /** Gender */
  gender: Publicity
  /** Address (prefecture) */
  region: Publicity
  /** Birthday */
  birth_day: Publicity
  /** Birth year */
  birth_year: Publicity
  /** Occupation */
  job: Publicity
  /** Whether to show a link to the Pawoo account */
  pawoo: boolean
}

export class PixivUserProfilePublicityCheck extends BaseSimpleCheck<PixivUserProfilePublicity> {
  checks(): CheckFunctions<PixivUserProfilePublicity> {
    return {
      gender: (data) => ['public', 'private', 'mypixiv'].includes(data.gender),
      region: (data) => ['public', 'private', 'mypixiv'].includes(data.region),
      birth_day: (data) =>
        ['public', 'private', 'mypixiv'].includes(data.birth_day),
      birth_year: (data) =>
        ['public', 'private', 'mypixiv'].includes(data.birth_year),
      job: (data) => ['public', 'private', 'mypixiv'].includes(data.job),
      pawoo: (data) => typeof data.pawoo === 'boolean',
    }
  }
}

/**
 * pixiv user workspace information
 */
export interface PixivUserProfileWorkspace {
  /** Computer */
  pc: string
  /** Monitor */
  monitor: string
  /** Software */
  tool: string
  /** Scanner */
  scanner: string
  /** Tablet */
  tablet: string
  /** Mouse */
  mouse: string
  /** Printer */
  printer: string
  /** Items on the desk */
  desktop: string
  /** Music listened to while drawing */
  music: string
  /** Desk */
  desk: string
  /** Chair */
  chair: string
  /** Other */
  comment: string
  /** Image */
  workspace_image_url: string | null
}

export class PixivUserProfileWorkspaceCheck extends BaseSimpleCheck<PixivUserProfileWorkspace> {
  checks(): CheckFunctions<PixivUserProfileWorkspace> {
    return {
      pc: (data) => typeof data.pc === 'string',
      monitor: (data) => typeof data.monitor === 'string',
      tool: (data) => typeof data.tool === 'string',
      scanner: (data) => typeof data.scanner === 'string',
      tablet: (data) => typeof data.tablet === 'string',
      mouse: (data) => typeof data.mouse === 'string',
      printer: (data) => typeof data.printer === 'string',
      desktop: (data) => typeof data.desktop === 'string',
      music: (data) => typeof data.music === 'string',
      desk: (data) => typeof data.desk === 'string',
      chair: (data) => typeof data.chair === 'string',
      comment: (data) => typeof data.comment === 'string',
      workspace_image_url: (data) =>
        typeof data.workspace_image_url === 'string' ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        data.workspace_image_url === null,
    }
  }
}
