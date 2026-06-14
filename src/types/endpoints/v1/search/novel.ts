import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'
import {
  OSFilter,
  OSFilterCheck,
  SearchSort,
  SearchSortCheck,
  SearchTarget,
  SearchTargetCheck,
} from '../../../../options'
import { PixivNovelItem, PixivNovelItemCheck } from '../../../pixiv-novel'

/**
 * Request for GET /v1/search/novel
 */
export interface GetV1SearchNovelRequest {
  /**
   * Search word
   */
  word: string

  /**
   * Search target
   *
   * @default 'partial_match_for_tags'
   */
  search_target: SearchTarget

  /**
   * Sort order
   *
   * @default 'date_desc'
   */
  sort: SearchSort

  /**
   * Start date and time
   *
   * @default undefined
   */
  start_date?: string

  /**
   * End date and time
   *
   * @default undefined
   */
  end_date?: string

  /**
   * OS filter
   *
   * @default 'for_ios'
   */
  filter?: OSFilter

  /**
   * Offset
   *
   * @default undefined
   */
  offset?: number

  /**
   * Whether to merge plain keyword search results (?)
   *
   * @default true
   * @beta
   */
  merge_plain_keyword_results: boolean

  /**
   * Whether to include translated tag search results
   *
   * @default true
   * @beta
   */
  include_translated_tag_results: boolean
}

/**
 * Response for GET /v1/search/novel
 */
export interface GetV1SearchNovelResponse {
  /**
   * Search result novels
   */
  novels: PixivNovelItem[]

  /**
   * URL to use for the next request.
   *
   * @see {Pixiv.parseQueryString}
   */
  next_url: string | null

  /**
   * Unknown
   *
   * Fixed at "31536000"? One year?
   *
   * @beta
   */
  search_span_limit: number

  /**
   * Whether AI-generated works are shown in the search results
   */
  show_ai: boolean
}

export class GetV1SearchNovelCheck extends BaseMultipleCheck<
  GetV1SearchNovelRequest,
  GetV1SearchNovelResponse
> {
  requestChecks(): CheckFunctions<GetV1SearchNovelRequest> {
    return {
      word: (data) => typeof data.word === 'string' && data.word.length > 0,
      search_target: (data) =>
        new SearchTargetCheck().throwIfFailed(data.search_target),
      sort: (data) => new SearchSortCheck().throwIfFailed(data.sort),
      start_date: (data) =>
        data.start_date === undefined ||
        (typeof data.start_date === 'string' && data.start_date.length > 0),
      end_date: (data) =>
        data.end_date === undefined ||
        (typeof data.end_date === 'string' && data.end_date.length > 0),
      filter: (data) =>
        data.filter === undefined ||
        new OSFilterCheck().throwIfFailed(data.filter),
      offset: (data) =>
        data.offset === undefined || typeof data.offset === 'number',
      merge_plain_keyword_results: (data) =>
        typeof data.merge_plain_keyword_results === 'boolean',
      include_translated_tag_results: (data) =>
        typeof data.include_translated_tag_results === 'boolean',
    }
  }

  responseChecks(): CheckFunctions<GetV1SearchNovelResponse> {
    return {
      novels: (data) =>
        Array.isArray(data.novels) &&
        data.novels.every((novel) =>
          new PixivNovelItemCheck().throwIfFailed(novel)
        ),
      next_url: (data) =>
        data.next_url === null ||
        (typeof data.next_url === 'string' && data.next_url.length > 0),
      search_span_limit: (data) => typeof data.search_span_limit === 'number',
      show_ai: (data) => typeof data.show_ai === 'boolean',
    }
  }
}
