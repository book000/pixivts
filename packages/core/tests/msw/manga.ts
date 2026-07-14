import { http, HttpResponse } from 'msw'

/** Builds a mock handler for GET /v1/manga/recommended returning the given body. */
export function mockMangaRecommended(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/manga/recommended', () =>
    HttpResponse.json(body)
  )
}
