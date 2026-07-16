import { http, HttpResponse, type JsonBodyType } from 'msw'

export function mockIllustDetail(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/illust/detail', () =>
    HttpResponse.json(body)
  )
}

export function mockIllustRelated(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v2/illust/related', () =>
    HttpResponse.json(body)
  )
}

export function mockIllustSeries(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/illust/series', () =>
    HttpResponse.json(body)
  )
}

export function mockIllustBookmarkDelete(body: JsonBodyType) {
  return http.post('https://app-api.pixiv.net/v1/illust/bookmark/delete', () =>
    HttpResponse.json(body)
  )
}

export function mockIllustTrendingTags(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/trending-tags/illust', () =>
    HttpResponse.json(body)
  )
}
