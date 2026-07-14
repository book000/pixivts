import { http, HttpResponse } from 'msw'

/** Builds a mock handler for GET <url> returning raw image bytes. */
export function mockImageFetch(url: string, bytes: Uint8Array) {
  return http.get(
    url,
    () =>
      new HttpResponse(bytes.buffer as ArrayBuffer, {
        headers: { 'Content-Type': 'image/jpeg' },
      })
  )
}
