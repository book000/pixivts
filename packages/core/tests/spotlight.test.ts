import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw/handlers'
import { PixivClient } from '../src/client'
import { SpotlightResource } from '../src/resources/spotlight'
import { mockSpotlightArticles } from './msw/spotlight'

function article(id: number) {
  return {
    id,
    title: `Title ${id}`,
    pure_title: `Pure title ${id}`,
    thumbnail: `https://i.pximg.net/imgaz/upload/${id}.png`,
    article_url: `https://www.pixivision.net/ja/a/${id}`,
    publish_date: '2026-10-14T18:00:00+09:00',
    category: 'spotlight',
    subcategory_label: 'Manga',
  }
}

const AUTH_RESPONSE = {
  user: { id: '42' },
  response: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
  },
}

const authHandler = http.post('https://oauth.secure.pixiv.net/auth/token', () =>
  HttpResponse.json(AUTH_RESPONSE)
)

describe('spotlight.articles()', () => {
  it('exposes the spotlight namespace on the client', async () => {
    server.use(authHandler)
    const client = await PixivClient.of('test-refresh-token')
    expect(client.spotlight).toBeInstanceOf(SpotlightResource)
  })

  it('defaults category to all and filter to for_ios without an offset', async () => {
    let capturedUrl: string | undefined
    server.use(
      authHandler,
      http.get(
        'https://app-api.pixiv.net/v1/spotlight/articles',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({
            spotlight_articles: [article(1)],
            next_url: null,
          })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.spotlight.articles()
    expect(result.isOk).toBe(true)
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('category')).toBe('all')
    expect(params.get('filter')).toBe('for_ios')
    expect(params.has('offset')).toBe(false)
  })

  it('forwards category, filter and offset', async () => {
    let capturedUrl: string | undefined
    server.use(
      authHandler,
      http.get(
        'https://app-api.pixiv.net/v1/spotlight/articles',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({
            spotlight_articles: [article(1)],
            next_url: null,
          })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.spotlight.articles({
      category: 'manga',
      filter: 'for_android',
      offset: 10,
    })
    expect(result.isOk).toBe(true)
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('category')).toBe('manga')
    expect(params.get('filter')).toBe('for_android')
    expect(params.get('offset')).toBe('10')
  })

  it('maps the snake_case response to camelCase', async () => {
    server.use(
      authHandler,
      mockSpotlightArticles({
        spotlight_articles: [article(12_145)],
        next_url:
          'https://app-api.pixiv.net/v1/spotlight/articles?category=all&filter=for_ios&offset=10',
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.spotlight.articles()
    expect(result.isOk).toBe(true)
    if (!result.isOk) return

    expect(result.value.nextUrl).toBe(
      'https://app-api.pixiv.net/v1/spotlight/articles?category=all&filter=for_ios&offset=10'
    )
    expect(result.value.spotlightArticles[0]).toEqual({
      id: 12_145,
      title: 'Title 12145',
      pureTitle: 'Pure title 12145',
      thumbnail: 'https://i.pximg.net/imgaz/upload/12145.png',
      articleUrl: 'https://www.pixivision.net/ja/a/12145',
      publishDate: '2026-10-14T18:00:00+09:00',
      category: 'spotlight',
      subcategoryLabel: 'Manga',
    })
  })

  it('items() follows next_url across pages in order', async () => {
    server.use(
      authHandler,
      http.get(
        'https://app-api.pixiv.net/v1/spotlight/articles',
        ({ request }) => {
          const offset = new URL(request.url).searchParams.get('offset')
          if (offset === '10') {
            return HttpResponse.json({
              spotlight_articles: [article(3), article(4)],
              next_url: null,
            })
          }
          return HttpResponse.json({
            spotlight_articles: [article(1), article(2)],
            next_url:
              'https://app-api.pixiv.net/v1/spotlight/articles?category=all&filter=for_ios&offset=10',
          })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const ids: number[] = []
    for await (const item of client.spotlight.articles().items()) {
      ids.push(item.id)
    }
    expect(ids).toEqual([1, 2, 3, 4])
  })
})
