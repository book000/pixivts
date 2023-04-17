/** 検索対象 */
export type SearchTargets =
  | 'partial_match_for_tags'
  | 'exact_match_for_tags'
  | 'title_and_caption'
  | 'keyword'
/** ソート */
export type SearchSorts = 'date_desc' | 'date_asc' | 'popular_desc'
/** 対象期間 */
export type SearchIllustDurations =
  | 'within_last_day'
  | 'within_last_week'
  | 'within_last_month'
/** OSフィルタ */
export type Filters = 'for_ios' | 'for_android'
/** コンテンツタイプ */
export type ContentType = 'illust' | 'manga'
/** 公開範囲 */
export type BookmarkRestrict = 'public' | 'private'

/**
 * イラスト検索オプション
 */
export interface SearchIllustOptions {
  /**
   * 検索ワード
   */
  word: string

  /**
   * 検索対象
   */
  searchTarget?: SearchTargets

  /**
   * ソート順
   */
  sort?: SearchSorts

  /**
   * 対象期間
   */
  duration?: SearchIllustDurations

  /**
   * 開始日時
   */
  startDate?: string

  /**
   * 終了日時
   */
  endDate?: string

  /**
   * OSフィルタ
   */
  filter?: Filters

  /**
   * オフセット
   */
  offset?: number
}

/**
 * イラスト詳細取得オプション
 */
export interface GetIllustDetailOptions {
  /**
   * イラストID
   */
  illustId: number
}

/**
 * おすすめイラスト取得オプション
 */
export interface RecommendedIllustOptions {
  /**
   * コンテンツタイプ (illust or manga)
   */
  contentType: ContentType

  /**
   * ランキングラベルを含めるか
   */
  includeRankingLabel?: boolean

  /**
   * OSフィルタ
   */
  filter?: Filters

  /**
   * おすすめイラストの最大ブックマークID (?)
   */
  maxBookmarkIdForRecommend?: number

  /**
   * 最近のイラストの最小ブックマークID (?)
   */
  minBookmarkIdForRecentIllust?: number

  /**
   * オフセット
   */
  offset?: number

  /**
   * ランキングイラストを含めるか (?)
   */
  includeRankingIllusts?: boolean

  /**
   * ブックマーク済みのイラストID
   */
  bookmarkIllustIds?: number[]

  /**
   * プライバシーポリシーを含めるか (?)
   */
  includePrivacyPolicy?: boolean

  /**
   * 閲覧済みのイラストID
   */
  // viewed: number[] // めんどくさいから対応しない
}

/**
 * イラストブックマーク追加オプション
 */
export interface IllustBookmarkAddOptions {
  /**
   * イラストID
   */
  illustId: number

  /**
   * 公開範囲
   */
  restrict?: BookmarkRestrict

  /**
   * タグ
   */
  tags?: string[]
}

/**
 * 小説詳細取得オプション
 */
export interface GetNovelDetailOptions {
  /**
   * 小説ID
   */
  novelId: number
}

/**
 * 小説検索オプション
 */
export interface SearchNovelOptions {
  /**
   * 検索ワード
   */
  word: string

  /**
   * 検索対象
   */
  searchTarget?: SearchTargets

  /**
   * ソート順
   */
  sort?: SearchSorts

  /**
   * プレーンキーワード検索結果をマージするか (?)
   */
  mergePlainKeywordResults?: boolean

  /**
   * 翻訳タグ検索結果を含むか
   */
  includeTranslatedTagResults?: boolean

  /**
   * 開始日時
   */
  startDate?: string

  /**
   * 終了日時
   */
  endDate?: string

  /**
   * OSフィルタ
   */
  filter?: Filters

  /**
   * オフセット
   */
  offset?: number
}

/**
 * おすすめ小説取得オプション
 */
export interface RecommendedNovelOptions {
  /**
   * ランキングラベルを含めるか
   */
  includeRankingLabel?: boolean

  /**
   * OSフィルタ
   */
  filter?: Filters

  /**
   * オフセット
   */
  offset?: number

  /**
   * ランキング小説を含めるか (?)
   */
  includeRankingNovels?: boolean

  /**
   * おすすめ済みの小説ID
   */
  alreadyRecommended?: number[]

  /**
   * おすすめ小説の最大ブックマークID (?)
   */
  maxBookmarkIdForRecommend?: number

  /**
   * プライバシーポリシーを含めるか (?)
   */
  includePrivacyPolicy?: boolean
}

/**
 * 小説シリーズ詳細取得オプション
 */
export interface GetNovelSeriesOptions {
  /**
   * 小説シリーズID
   */
  seriesId: number

  /**
   * OSフィルタ
   */
  filter?: Filters

  /**
   * (?)
   */
  lastOrder?: string
}

/**
 * ユーザー詳細取得オプション
 */
export interface GetUserDetailOptions {
  /**
   * ユーザーID
   */
  userId: number

  /**
   * OSフィルタ
   */
  filter?: Filters
}
