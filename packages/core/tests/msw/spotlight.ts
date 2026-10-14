import { http, HttpResponse, type JsonBodyType } from 'msw'

export function mockSpotlightArticles(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/spotlight/articles', () =>
    HttpResponse.json(body)
  )
}
