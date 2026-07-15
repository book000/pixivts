import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw/handlers'
import { PixivClient } from '../src/client'

const AUTH_RESPONSE = {
  user: { id: '42' },
  response: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
  },
}

describe('images.fetch()', () => {
  it('returns Ok with a Response for an image URL', async () => {
    const imageUrl = 'https://i.pximg.net/img-original/test.jpg'
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        imageUrl,
        () =>
          new HttpResponse(new Uint8Array([0xff, 0xd8]).buffer, {
            headers: { 'Content-Type': 'image/jpeg' },
          })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.images.fetch(imageUrl)
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.ok).toBe(true)
      expect(result.value.status).toBe(200)
    }
  })
})
