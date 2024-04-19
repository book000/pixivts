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

/** 単一イラスト詳細情報 */
export interface MetaSinglePage {
  /** オリジナル画像URL */
  original_image_url: string
}

/** 複数イラスト詳細情報 */
export interface MetaPages {
  /** 画像URL群 */
  image_urls: Required<ImageUrls>
}

/**
 * pixiv イラストアイテム
 */
export interface PixivIllustItem {
  /**
   * 作品 ID
   *
   * イラスト・小説それぞれでIDの振り方が異なり、重複するので注意。
   */
  id: number

  /**
   * 作品タイトル
   */
  title: string

  /**
   * 作品種別
   *
   * illust: イラスト
   * manga: マンガ
   * ugoira: うごイラ
   */
  type: 'illust' | 'manga' | 'ugoira'

  /**
   * 作品の画像URL群
   *
   * イラスト・マンガの場合は1枚目の画像が入っている。
   * 2枚目以降の画像は {@link meta_pages} に入っている。
   */
  image_urls: ImageUrls

  /**
   * キャプション（説明文）
   */
  caption: string

  /**
   * 公開範囲
   *
   * 詳細不明。0 が公開なのは確定
   */
  restrict: number

  /**
   * 作品投稿者情報
   */
  user: PixivUser

  /**
   * 作品タグ
   */
  tags: Tag[]

  /**
   * 使用ツール
   *
   * SAI, CLIP STUDIO PAINT など。投稿者は最大3つまで登録できる。選択式。
   */
  tools: string[]

  /**
   * 投稿日時
   *
   * ISO 8601 形式。YYYY-MM-DD'T'HH:mm:ss+09:00
   */
  create_date: string

  /**
   * ページ数
   */
  page_count: number

  /** 画像の横幅 */
  width: number

  /** 画像の縦幅 */
  height: number

  /**
   * 正気度? (表現内容設定？)
   *
   * 詳細不明。2, 4, 6 をとりうる。2 は全年齢、6 は R-18？
   *
   * @beta
   */
  sanity_level: number

  /**
   * 年齢制限
   *
   * 0 が全年齢、1 が R-18、2 が R-18G
   */
  x_restrict: number

  /**
   * シリーズ情報
   *
   * イラスト・マンガの場合、シリーズに属していない場合 null が入っている。
   */
  series: Series | null

  /**
   * 単一イラスト詳細情報
   *
   * 単一ページの場合のみ利用。複数ページの場合は {@link meta_pages} を利用する。
   * 複数ページの場合、このプロパティには空オブジェクトが入っている。
   */
  meta_single_page: MetaSinglePage | Record<string, never>

  /**
   * 複数イラスト詳細情報
   *
   * 複数ページの場合のみ利用。単一ページの場合は {@link meta_single_page} を利用する。
   * 単一ページの場合、このプロパティには空配列が入っている。
   */
  meta_pages: MetaPages[]

  /**
   * 閲覧数
   */
  total_view: number

  /**
   * ブックマーク数
   */
  total_bookmarks: number

  /**
   * ブックマークしているかどうか
   */
  is_bookmarked: boolean

  /**
   * 閲覧可能かどうか
   */
  visible: boolean

  /**
   * この作品をミュートしているかどうか
   */
  is_muted: boolean

  /**
   * この作品にコメントしたユーザーの数
   */
  total_comments?: number

  /**
   * AI使用フラグ
   *
   * 0: 未使用
   * 1: 補助的に使用
   * 2: 使用
   *
   * 2022/11/02時点で投稿画面に「補助的に使用」を選択できるUIは存在しないように見えるが、実際に 1 が入っている作品はある。
   *
   * @see https://www.pixiv.help/hc/ja/articles/11866194231577
   * @see https://github.com/ArkoClub/async-pixiv/blob/fa45c81093a5c6f4eabfcc942915fc479e42174f/src/async_pixiv/model/other.py#L40-L48
   */
  illust_ai_type: number

  /**
   * 作品のスタイル？
   *
   * @beta
   */
  illust_book_style: number

  /**
   * コメントの閲覧制御？
   *
   * @beta
   */
  comment_access_control?: number
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
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
    }
  }
}
