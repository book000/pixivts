import { http, HttpResponse } from 'msw'

/** Builds a mock handler for GET /v1/illust/detail returning the given body. */
export function mockIllustDetail(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/illust/detail', () =>
    HttpResponse.json(body)
  )
}

/** Builds a mock handler for GET /v2/illust/related returning the given body. */
export function mockIllustRelated(body: unknown) {
  return http.get('https://app-api.pixiv.net/v2/illust/related', () =>
    HttpResponse.json(body)
  )
}

/** Builds a mock handler for GET /v1/illust/series returning the given body. */
export function mockIllustSeries(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/illust/series', () =>
    HttpResponse.json(body)
  )
}

/** Builds a mock handler for POST /v1/illust/bookmark/delete returning the given body. */
export function mockIllustBookmarkDelete(body: unknown) {
  return http.post('https://app-api.pixiv.net/v1/illust/bookmark/delete', () =>
    HttpResponse.json(body)
  )
}
