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

describe('ugoira.metadata()', () => {
  it('returns Ok with ugoira frames', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/ugoira/metadata', () =>
        HttpResponse.json({
          ugoira_metadata: {
            zip_urls: { medium: 'https://i.pximg.net/ugoira.zip' },
            frames: [
              { file: '000000.jpg', delay: 100 },
              { file: '000001.jpg', delay: 100 },
            ],
          },
        })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.ugoira.metadata({ illustId: 1 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.ugoiraMetadata.frames).toHaveLength(2)
      expect(result.value.ugoiraMetadata.frames[0].file).toBe('000000.jpg')
    }
  })
})
