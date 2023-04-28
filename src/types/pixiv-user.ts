import { PixivUser } from './pixiv-common'

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

type Gender = 'male' | 'female' | 'unknown'

/**
 * pixiv ユーザープロフィール
 */
export interface PixivUserProfile {
  /** ウェブサイト */
  webpage: string

  /** 性別 */
  gender: Gender

  /** 生年月日（YYYY-MM-DD） */
  birth: string

  /** 誕生日（MM-DD） */
  birth_day: string

  /** 誕生年（YYYY） */
  birth_year: number

  /** 住所（国名と公開なら都道府県。スペース区切り） */
  region: string

  /**
   * 都道府県番号
   *
   * ・0: 非公開
   * ・1～47: 都道府県番号
   * ・48: 日本国外？
   */
  address_id: number

  /**
   * 国名コード
   *
   * ・日本の場合は空文字列
   * ・ISO 3166-1 alpha-2 形式
   */
  country_code: string

  /** 職業 */
  job: string

  /**
   * 職業ID
   *
   * ナンバリングは以下の通り。
   * 0: 未指定、または非公開
   * 1: IT関係
   * 2: 事務系
   * 3: 技術系
   * 4: 営業・企画系
   * 5: クリエーター系
   * 6: 販売系
   * 7: サービス業
   * 8: ガテン系
   * 9: 役員・管理職
   * 10: 専門職
   * 11: 公務員
   * 12: 教員
   * 13: 自営業
   * 14: アーティスト
   * 15: フリーター
   * 16: 小学生
   * 17: 中学生
   * 18: 高校生
   * 19: 大学生・院生
   * 20: 専門学校生
   * 21: 主婦
   * 22: 求職中
   * 23: その他
   */
  job_id: number

  /** フォロー中のユーザ数 */
  total_follow_users: number

  /** マイピクのユーザ数 */
  total_mypixiv_users: number

  /** 投稿イラスト数 */
  total_illusts: number

  /** 投稿マンガ数 */
  total_manga: number

  /** 投稿小説数 */
  total_novels: number

  /** 公開でのブックマーク数 */
  total_illust_bookmarks_public: number

  /** 作成イラストシリーズ数 */
  total_illust_series: number

  /** 作成小説シリーズ数 */
  total_novel_series: number

  /** 背景画像 URL */
  background_image_url: string | null

  /**
   * Twitter アカウントのスクリーンネーム
   *
   * ・未設定の場合は空文字列
   * ・@ は含まない
   * ・連携しているわけではなく手動入力なので、スクリーンネーム変更やアカウント削除などによって存在しない可能性あり
   * ・Twitter 以外の Instagram や Tumblr などは取得できない
   */
  twitter_account: string

  /** Twitter アカウント URL */
  twitter_url: string

  /**
   * Pawoo アカウント URL
   *
   * ・Pawoo でアカウント連携をしており、「Pawooアカウントへのリンクを表示」にチェックが入っている場合のみ。
   * ・連携していない場合や表示させていない場合は空文字列
   */
  pawoo_url: string

  /** プレミアムアカウントかどうか */
  is_premium: boolean

  /** カスタムプロフィール画像を使用しているかどうか */
  is_using_custom_profile_image: boolean
}

type Publicity = 'public' | 'private' | 'mypixiv'

/**
 * pixiv ユーザープロフィール公開設定
 *
 * 基本として public, private, mypixiv のいずれか。
 * public は公開、private は非公開、mypixiv はマイピクのみ公開。
 */
export interface PixivUserProfilePublicity {
  /** 性別 */
  gender: Publicity
  /** 住所（都道府県） */
  region: Publicity
  /** 誕生日 */
  birth_day: Publicity
  /** 誕生年 */
  birth_year: Publicity
  /** 職業 */
  job: Publicity
  /** Pawoo アカウントへのリンクを表示するか */
  pawoo: boolean
}

/**
 * pixiv ユーザー作業環境情報
 */
export interface PixivUserProfileWorkspace {
  /** コンピュータ */
  pc: string
  /** モニター */
  monitor: string
  /** ソフト */
  tool: string
  /** スキャナー */
  scanner: string
  /** タブレット */
  tablet: string
  /** マウス */
  mouse: string
  /** プリンター */
  printer: string
  /** 机の上にあるもの */
  desktop: string
  /** 絵を描く時に聴く音楽 */
  music: string
  /** 机 */
  desk: string
  /** 椅子 */
  chair: string
  /** その他 */
  comment: string
  /** 画像 */
  workspace_image_url: string | null
}
