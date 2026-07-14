import { http, HttpResponse } from 'msw'

export function mockNovelText(body: string) {
  return http.get('https://app-api.pixiv.net/webview/v2/novel', () =>
    HttpResponse.text(body)
  )
}

export function mockNovelRelated(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/novel/related', () =>
    HttpResponse.json(body)
  )
}

export function mockNovelRanking(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/novel/ranking', () =>
    HttpResponse.json(body)
  )
}

export function mockNovelSearch(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/search/novel', () =>
    HttpResponse.json(body)
  )
}

export function mockNovelRecommended(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/novel/recommended', () =>
    HttpResponse.json(body)
  )
}

export function mockNovelSeries(body: unknown) {
  return http.get('https://app-api.pixiv.net/v2/novel/series', () =>
    HttpResponse.json(body)
  )
}

export function mockNovelBookmarkAdd(body: unknown) {
  return http.post('https://app-api.pixiv.net/v2/novel/bookmark/add', () =>
    HttpResponse.json(body)
  )
}

export function mockNovelBookmarkDelete(body: unknown) {
  return http.post('https://app-api.pixiv.net/v1/novel/bookmark/delete', () =>
    HttpResponse.json(body)
  )
}
