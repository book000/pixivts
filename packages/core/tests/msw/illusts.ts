import { http, HttpResponse } from 'msw'

export function mockIllustDetail(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/illust/detail', () =>
    HttpResponse.json(body)
  )
}

export function mockIllustRelated(body: unknown) {
  return http.get('https://app-api.pixiv.net/v2/illust/related', () =>
    HttpResponse.json(body)
  )
}

export function mockIllustSeries(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/illust/series', () =>
    HttpResponse.json(body)
  )
}

export function mockIllustBookmarkDelete(body: unknown) {
  return http.post('https://app-api.pixiv.net/v1/illust/bookmark/delete', () =>
    HttpResponse.json(body)
  )
}
