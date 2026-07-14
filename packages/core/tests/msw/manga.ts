import { http, HttpResponse } from 'msw'

export function mockMangaRecommended(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/manga/recommended', () =>
    HttpResponse.json(body)
  )
}
