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

describe('client.userId', () => {
  it('returns a number even though the OAuth response contains a string', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    // AUTH_RESPONSE has user.id = '42' (string); userId should be coerced to number
    expect(typeof client.userId).toBe('number')
    expect(client.userId).toBe(42)
  })

  it('throws when the OAuth response contains a non-numeric user id', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json({
          ...AUTH_RESPONSE,
          user: { id: 'not-a-number' },
        })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    expect(() => client.userId).toThrow(TypeError)
    expect(() => client.userId).toThrow('Invalid userId')
  })
})

describe('client.getAccessToken() / getRefreshToken()', () => {
  it('getAccessToken() returns the current access token', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    expect(client.getAccessToken()).toBe('test-access-token')
  })

  it('getRefreshToken() returns the refresh token used at login', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    expect(client.getRefreshToken()).toBe('test-refresh-token')
  })
})
