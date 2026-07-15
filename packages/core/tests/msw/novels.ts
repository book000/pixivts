import { http, HttpResponse, type JsonBodyType } from 'msw'

export function mockNovelText(body: string) {
  return http.get('https://app-api.pixiv.net/webview/v2/novel', () =>
    HttpResponse.text(body)
  )
}

export function mockNovelRelated(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/novel/related', () =>
    HttpResponse.json(body)
  )
}

export function mockNovelRanking(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/novel/ranking', () =>
    HttpResponse.json(body)
  )
}

export function mockNovelSearch(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/search/novel', () =>
    HttpResponse.json(body)
  )
}

export function mockNovelRecommended(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/novel/recommended', () =>
    HttpResponse.json(body)
  )
}

export function mockNovelSeries(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v2/novel/series', () =>
    HttpResponse.json(body)
  )
}

export function mockNovelBookmarkAdd(body: JsonBodyType) {
  return http.post('https://app-api.pixiv.net/v2/novel/bookmark/add', () =>
    HttpResponse.json(body)
  )
}

export function mockNovelBookmarkDelete(body: JsonBodyType) {
  return http.post('https://app-api.pixiv.net/v1/novel/bookmark/delete', () =>
    HttpResponse.json(body)
  )
}
