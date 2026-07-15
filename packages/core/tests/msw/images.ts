import { http, HttpResponse } from 'msw'

export function mockImageFetch(url: string, bytes: Uint8Array) {
  return http.get(
    url,
    () =>
      new HttpResponse(bytes.buffer as ArrayBuffer, {
        headers: { 'Content-Type': 'image/jpeg' },
      })
  )
}
