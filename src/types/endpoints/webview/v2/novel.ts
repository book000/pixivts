import { BaseMultipleCheck, CheckFunctions } from '../../../../checks'

/**
 * GET /webview/v2/novel のリクエスト
 */
export interface GetWebViewV2NovelRequest {
  /**
   * 小説ID
   */
  id: number
}

/**
 * GET /webview/v2/novel のレスポンス
 *
 * HTMLが返る。
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
