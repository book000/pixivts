import { PixivIllustItem, PixivIllustItemCheck } from '../../../pixiv-illust'
import {
  IllustSeriesDetail,
  IllustSeriesDetailCheck,
} from '../../../pixiv-illust-series'
import { OSFilter, OSFilterCheck } from '../../../../options'
import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'

/**
 * Request for GET /v1/illust/series
 */
export interface GetV1IllustSeriesRequest {
  /**
   * Illust series ID
   */
  illust_series_id: number

  /**
   * OS filter
   *
   * @default 'for_ios'
   */
  filter: OSFilter

  // TODO: There may be an offset: number. Needs verification
}

/**
 * Response for GET /v1/illust/series
 */
export interface GetV1IllustSeriesResponse {
  /**
   * Series details
   */
  illust_series_detail: IllustSeriesDetail

  /**
   * First illust in the series
   */
  illust_series_first_illust: PixivIllustItem

  /**
   * Illusts included in the series
   */
  illusts: PixivIllustItem[]

  /**
   * Next URL
   */
  next_url: string | null
}

export class GetV1IllustSeriesCheck extends BaseMultipleCheck<
  GetV1IllustSeriesRequest,
  GetV1IllustSeriesResponse
> {
  requestChecks(): CheckFunctions<GetV1IllustSeriesRequest> {
    return {
      illust_series_id: (data) =>
        typeof data.illust_series_id === 'number' && data.illust_series_id > 0,
      filter: (data) => new OSFilterCheck().throwIfFailed(data.filter),
    }
  }

  responseChecks(): CheckFunctions<GetV1IllustSeriesResponse> {
    return {
      illust_series_detail: (data) =>
        typeof data.illust_series_detail === 'object' &&
        new IllustSeriesDetailCheck().throwIfFailed(data.illust_series_detail),
      illust_series_first_illust: (data) =>
        typeof data.illust_series_first_illust === 'object' &&
        new PixivIllustItemCheck().throwIfFailed(
          data.illust_series_first_illust
        ),
      illusts: (data) =>
        Array.isArray(data.illusts) &&
        data.illusts.length > 0 &&
        data.illusts.every((illust) =>
          new PixivIllustItemCheck().throwIfFailed(illust)
        ),
      next_url: (data) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        typeof data.next_url === 'string' || data.next_url === null,
    }
  }
}
