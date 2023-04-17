import { PixivUser } from './pixivCommon'

/**
 * pixiv ユーザーアイテム
 */
export type PixivUserItem = PixivUser & {
  /**
   * 自己紹介
   *
   * 改行は \r\n っぽい。
   */
  comment: string
}

/**
 * pixiv ユーザープロフィール
 */
export interface PixivUserProfile {
  webpage: string
  gender: string
  birth: string
  birth_day: string
  birth_year: number
  region: string
  address_id: number
  country_code: string
  job: string
  job_id: number
  total_follow_users: number
  total_mypixiv_users: number
  total_illusts: number
  total_manga: number
  total_novels: number
  total_illust_bookmarks_public: number
  total_illust_series: number
  total_novel_series: number
  background_image_url?: any
  twitter_account: string
  twitter_url: string
  pawoo_url: string
  is_premium: boolean
  is_using_custom_profile_image: boolean
}

export interface PixivUserProfilePublicity {
  gender: string
  region: string
  birth_day: string
  birth_year: string
  job: string
  pawoo: boolean
}

export interface PixivUserProfileWorkspace {
  pc: string
  monitor: string
  tool: string
  scanner: string
  tablet: string
  mouse: string
  printer: string
  desktop: string
  music: string
  desk: string
  chair: string
  comment: string
  workspace_image_url?: any
}
