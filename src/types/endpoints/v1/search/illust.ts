import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'
import {
  OSFilter,
  OSFilterCheck,
  SearchSort,
  SearchSortCheck,
  SearchTarget,
  SearchTargetCheck,
} from '../../../../options'

// @ts-expect-error because tsdoc
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Pixiv from '../../../../pixiv'
import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'

/**
 * Request for GET /v1/search/illust
 */
export interface GetV1SearchIllustRequest {
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
 * Response for GET /v1/search/illust
 */
export interface GetV1SearchIllustResponse {
  /**
   * Search result illusts
   */
  illusts: PixivIllustItem[]

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
}

export class GetV1SearchIllustCheck extends BaseMultipleCheck<
  GetV1SearchIllustRequest,
  GetV1SearchIllustResponse
> {
  requestChecks(): CheckFunctions<GetV1SearchIllustRequest> {
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

  responseChecks(): CheckFunctions<GetV1SearchIllustResponse> {
    return {
      illusts: (data) =>
        Array.isArray(data.illusts) &&
        data.illusts.every((illust) =>
          new PixivIllustItemCheck().throwIfFailed(illust)
        ),
      next_url: (data) =>
        data.next_url === null ||
        (typeof data.next_url === 'string' && data.next_url.length > 0),
      search_span_limit: (data) => typeof data.search_span_limit === 'number',
    }
  }
}
