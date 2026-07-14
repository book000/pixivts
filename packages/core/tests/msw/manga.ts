import { http, HttpResponse, type JsonBodyType } from 'msw'

export function mockMangaRecommended(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/manga/recommended', () =>
    HttpResponse.json(body)
  )
}
