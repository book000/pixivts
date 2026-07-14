import { http, HttpResponse } from 'msw'

export function mockUgoiraMetadata(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/ugoira/metadata', () =>
    HttpResponse.json(body)
  )
}
