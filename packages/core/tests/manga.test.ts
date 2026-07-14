import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw/handlers'
import { PixivClient } from '../src/client'
import { mockMangaRecommended } from './msw/manga'

const MANGA_ILLUST = {
  id: 1,
  title: 'Test Manga',
  type: 'manga' as const,
  image_urls: {
    square_medium: 'https://i.pximg.net/sq.jpg',
    medium: 'https://i.pximg.net/m.jpg',
    large: 'https://i.pximg.net/l.jpg',
  },
  caption: '',
  restrict: 0,
  user: {
    id: 42,
    name: 'Artist',
    account: 'artist',
    profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
  },
  tags: [],
  tools: [],
  create_date: '2024-01-01T00:00:00+09:00',
  page_count: 3,
  width: 1000,
  height: 800,
  sanity_level: 2,
  x_restrict: 0,
  series: null,
  meta_single_page: {},
  meta_pages: [
    { image_urls: { original: 'https://i.pximg.net/p0.jpg' } },
    { image_urls: { original: 'https://i.pximg.net/p1.jpg' } },
  ],
  total_view: 1000,
  total_bookmarks: 50,
  is_bookmarked: false,
  visible: true,
  is_muted: false,
  illust_ai_type: 0,
  illust_book_style: 0,
}

const AUTH_RESPONSE = {
  user: { id: '42' },
  response: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
  },
}

describe('manga.recommended()', () => {
  it('returns Ok with recommended manga', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockMangaRecommended({
        illusts: [MANGA_ILLUST],
        ranking_illusts: [],
        next_url: null,
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.manga.recommended()
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.illusts).toHaveLength(1)
      expect(result.value.illusts[0].type).toBe('manga')
      expect(result.value.illusts[0].pageCount).toBe(3)
    }
  })

  it('defaults filter to for_ios and forwards offset', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/manga/recommended',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({
            illusts: [MANGA_ILLUST],
            ranking_illusts: [],
            next_url: null,
          })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.manga.recommended({ offset: 30 })
    expect(result.isOk).toBe(true)
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('filter')).toBe('for_ios')
    expect(params.get('offset')).toBe('30')
  })
})
