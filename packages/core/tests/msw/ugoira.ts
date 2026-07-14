import { http, HttpResponse } from 'msw'

/** Builds a mock handler for GET /v1/ugoira/metadata returning the given body. */
export function mockUgoiraMetadata(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/ugoira/metadata', () =>
    HttpResponse.json(body)
  )
}
