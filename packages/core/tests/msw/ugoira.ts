import { http, HttpResponse, type JsonBodyType } from 'msw'

export function mockUgoiraMetadata(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/ugoira/metadata', () =>
    HttpResponse.json(body)
  )
}
