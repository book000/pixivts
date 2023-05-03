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
 * pixiv 小説アイテム
 */
export interface PixivNovelItem {
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
   * 年齢制限
   *
   * 0 が全年齢、1 が R-18、2 が R-18G
   */
  x_restrict: number

  /**
   * オリジナル作品かどうか
   */
  is_original: boolean

  /**
   * 作品の画像URL群
   *
   * 小説の場合は表紙の画像が入っている。
   */
  image_urls: ImageUrls

  /**
   * 投稿日時
   *
   * ISO 8601 形式。YYYY-MM-DD'T'HH:mm:ss+09:00
   */
  create_date: string

  /**
   * 作品タグ
   */
  tags: Tag[]

  /**
   * ページ数
   */
  page_count: number

  /**
   * 文字数
   */
  text_length: number

  /**
   * 作品投稿者情報
   */
  user: PixivUser

  /**
   * シリーズ情報
   *
   * 小説の場合、シリーズに属していない場合空オブジェクトが入っている。
   */
  series: Series | Record<string, never>

  /**
   * ブックマークしているかどうか
   */
  is_bookmarked: boolean

  /**
   * ブックマーク数
   */
  total_bookmarks: number

  /**
   * 閲覧数
   */
  total_view: number

  /**
   * 閲覧可能かどうか
   */
  visible: boolean

  /**
   * コメント数
   */
  total_comments: number

  /**
   * この作品をミュートしているかどうか
   */
  is_muted: boolean

  /**
   * マイピクへの公開限定にしているかどうか
   */
  is_mypixiv_only: boolean

  /**
   * 不明 (公開制限をしているかどうか？)
   *
   * @beta
   */
  is_x_restricted: boolean

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
