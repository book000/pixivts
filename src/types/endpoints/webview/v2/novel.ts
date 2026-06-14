import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'

/**
 * Request for GET /webview/v2/novel
 */
export interface GetWebViewV2NovelRequest {
  /**
   * Novel ID
   */
  id: number
}

/**
 * Response for GET /webview/v2/novel
 *
 * Returns HTML.
 */
export type GetWebViewV2NovelResponse = string

export class GetWebViewV2NovelCheck extends BaseMultipleCheck<
  GetWebViewV2NovelRequest,
  GetWebViewV2NovelResponse
> {
  requestChecks(): CheckFunctions<GetWebViewV2NovelRequest> {
    return {
      id: (data) => typeof data.id === 'number',
    }
  }

  responseChecks(): CheckFunctions<GetWebViewV2NovelResponse> {
    return {
      _: (data) => typeof data === 'string',
    }
  }
}
