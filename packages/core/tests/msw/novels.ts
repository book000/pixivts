import { http, HttpResponse } from 'msw'

/** Builds a mock handler for GET /webview/v2/novel returning the given raw HTML body. */
export function mockNovelText(body: string) {
  return http.get('https://app-api.pixiv.net/webview/v2/novel', () =>
    HttpResponse.text(body)
  )
}

/** Builds a mock handler for GET /v1/novel/related returning the given body. */
export function mockNovelRelated(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/novel/related', () =>
    HttpResponse.json(body)
  )
}

/** Builds a mock handler for GET /v1/novel/ranking returning the given body. */
export function mockNovelRanking(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/novel/ranking', () =>
    HttpResponse.json(body)
  )
}

/** Builds a mock handler for GET /v1/search/novel returning the given body. */
export function mockNovelSearch(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/search/novel', () =>
    HttpResponse.json(body)
  )
}

/** Builds a mock handler for GET /v1/novel/recommended returning the given body. */
export function mockNovelRecommended(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/novel/recommended', () =>
    HttpResponse.json(body)
  )
}

/** Builds a mock handler for GET /v2/novel/series returning the given body. */
export function mockNovelSeries(body: unknown) {
  return http.get('https://app-api.pixiv.net/v2/novel/series', () =>
    HttpResponse.json(body)
  )
}

/** Builds a mock handler for POST /v2/novel/bookmark/add returning the given body. */
export function mockNovelBookmarkAdd(body: unknown) {
  return http.post('https://app-api.pixiv.net/v2/novel/bookmark/add', () =>
    HttpResponse.json(body)
  )
}

/** Builds a mock handler for POST /v1/novel/bookmark/delete returning the given body. */
export function mockNovelBookmarkDelete(body: unknown) {
  return http.post('https://app-api.pixiv.net/v1/novel/bookmark/delete', () =>
    HttpResponse.json(body)
  )
}
