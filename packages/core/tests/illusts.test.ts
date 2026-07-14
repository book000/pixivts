import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw/handlers'
import { PixivClient } from '../src/client'

const ILLUST = {
  id: 1,
  title: 'Test Illust',
  type: 'illust' as const,
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
  page_count: 1,
  width: 1000,
  height: 800,
  sanity_level: 2,
  x_restrict: 0,
  series: null,
  meta_single_page: { original_image_url: 'https://i.pximg.net/orig.jpg' },
  meta_pages: [],
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

describe('illusts.detail()', () => {
  it('returns Ok with the illust', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/illust/detail', () =>
        HttpResponse.json({ illust: ILLUST })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.detail({ illustId: 1 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.illust.id).toBe(1)
      expect(result.value.illust.title).toBe('Test Illust')
    }
  })
})

describe('illusts.search() — first page', () => {
  it('returns Ok with the first page of illusts', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/search/illust', () =>
        HttpResponse.json({ illusts: [ILLUST], next_url: null })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.search({ word: 'cat' })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.illusts).toHaveLength(1)
    }
  })
})

describe('illusts.search().pages() — multi-page', () => {
  it('yields two pages when next_url is present', async () => {
    const ILLUST2 = { ...ILLUST, id: 2 }
    // Use a single handler that dispatches based on the offset param
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/search/illust', ({ request }) => {
        const offset = new URL(request.url).searchParams.get('offset')
        if (offset === '30') {
          return HttpResponse.json({ illusts: [ILLUST2], next_url: null })
        }
        return HttpResponse.json({
          illusts: [ILLUST],
          next_url: 'https://app-api.pixiv.net/v1/search/illust?offset=30',
        })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const pages: number[] = []
    const pageIterable = client.illusts.search({ word: 'cat' }).pages()
    for await (const page of pageIterable) {
      pages.push(page.illusts.length)
    }
    expect(pages).toHaveLength(2)
    expect(pages[0]).toBe(1)
    expect(pages[1]).toBe(1)
  })
})

describe('illusts.search().items() — multi-page', () => {
  it('yields all items across pages', async () => {
    const ILLUST2 = { ...ILLUST, id: 2 }
    const ILLUST3 = { ...ILLUST, id: 3 }
    const ILLUST4 = { ...ILLUST, id: 4 }
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/search/illust', ({ request }) => {
        const offset = new URL(request.url).searchParams.get('offset')
        if (offset === '30') {
          return HttpResponse.json({
            illusts: [ILLUST3, ILLUST4],
            next_url: null,
          })
        }
        return HttpResponse.json({
          illusts: [ILLUST, ILLUST2],
          next_url: 'https://app-api.pixiv.net/v1/search/illust?offset=30',
        })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const ids: number[] = []
    const itemIterable = client.illusts.search({ word: 'cat' }).items()
    for await (const illust of itemIterable) {
      ids.push(illust.id)
    }
    expect(ids).toHaveLength(4)
    expect(ids).toEqual([1, 2, 3, 4])
  })
})

describe('illusts.ranking()', () => {
  it('passes the mode param in the URL', async () => {
    let capturedMode = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/illust/ranking', ({ request }) => {
        capturedMode = new URL(request.url).searchParams.get('mode') ?? ''
        return HttpResponse.json({ illusts: [ILLUST], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.ranking({ mode: 'week' })
    expect(result.isOk).toBe(true)
    expect(capturedMode).toBe('week')
  })
})

const RECOMMENDED_RESPONSE = {
  illusts: [ILLUST],
  ranking_illusts: [] as unknown[],
  contest_exists: false,
  next_url: null,
}

describe('illusts.recommended() — default params', () => {
  it('sends include_ranking_label=true by default', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/illust/recommended',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json(RECOMMENDED_RESPONSE)
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.recommended()
    expect(result.isOk).toBe(true)
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('include_ranking_label')).toBe('true')
  })
})

describe('illusts.recommended() — contentType param', () => {
  it('sends content_type when contentType is specified', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/illust/recommended',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json(RECOMMENDED_RESPONSE)
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.recommended({ contentType: 'manga' })
    expect(result.isOk).toBe(true)
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('content_type')).toBe('manga')
  })

  it('omits content_type when contentType is not specified', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/illust/recommended',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json(RECOMMENDED_RESPONSE)
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.recommended()
    expect(result.isOk).toBe(true)
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.has('content_type')).toBe(false)
  })
})

describe('illusts.recommended() — includeRankingLabel param', () => {
  it('sends include_ranking_label=false when explicitly set to false', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/illust/recommended',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json(RECOMMENDED_RESPONSE)
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.recommended({
      includeRankingLabel: false,
    })
    expect(result.isOk).toBe(true)
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('include_ranking_label')).toBe('false')
  })
})

describe('illusts.recommended() — viewed param', () => {
  it('sends viewed[] for each ID when viewed is specified', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/illust/recommended',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json(RECOMMENDED_RESPONSE)
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.recommended({ viewed: [101, 202] })
    expect(result.isOk).toBe(true)
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.getAll('viewed[]')).toEqual(['101', '202'])
  })

  it('omits viewed[] when viewed is not specified', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/illust/recommended',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json(RECOMMENDED_RESPONSE)
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.recommended()
    expect(result.isOk).toBe(true)
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.has('viewed[]')).toBe(false)
  })
})

describe('illusts.recommended() — meta_single_page regression (PIXIVTS-39)', () => {
  it('handles meta_single_page as empty object without errors', async () => {
    const MANGA_ILLUST = {
      ...ILLUST,
      type: 'manga' as const,
      meta_single_page: {},
    }
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/illust/recommended', () =>
        HttpResponse.json({
          ...RECOMMENDED_RESPONSE,
          illusts: [MANGA_ILLUST],
        })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.recommended()
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      const illust = result.value.illusts[0]
      expect(illust.type).toBe('manga')
      expect(illust.metaSinglePage.originalImageUrl).toBeUndefined()
    }
  })
})

describe('illusts.bookmarkAdd()', () => {
  it('returns Ok', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.post('https://app-api.pixiv.net/v2/illust/bookmark/add', () =>
        HttpResponse.json({})
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.bookmarkAdd({ illustId: 1 })
    expect(result.isOk).toBe(true)
  })
})

describe('illusts.follow()', () => {
  it('returns Ok with followed illusts and defaults restrict to public', async () => {
    let capturedRestrict = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v2/illust/follow', ({ request }) => {
        capturedRestrict =
          new URL(request.url).searchParams.get('restrict') ?? ''
        return HttpResponse.json({ illusts: [ILLUST], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.follow()
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.illusts).toHaveLength(1)
    }
    expect(capturedRestrict).toBe('public')
  })
})

describe('illusts.comments()', () => {
  it('returns Ok with comments', async () => {
    const COMMENT = {
      id: 1,
      comment: 'Nice!',
      date: '2024-01-01T00:00:00+09:00',
      user: {
        id: 99,
        name: 'Commenter',
        account: 'commenter',
        profile_image_urls: { medium: 'https://i.pximg.net/u2.jpg' },
      },
      parent_comment: {},
    }
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/illust/comments', () =>
        HttpResponse.json({
          total_comments: 1,
          comments: [COMMENT],
          next_url: null,
        })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.comments({ illustId: 1 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.totalComments).toBe(1)
      expect(result.value.comments[0].comment).toBe('Nice!')
    }
  })
})

describe('illusts.bookmarkDetail()', () => {
  it('returns Ok with bookmark metadata', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v2/illust/bookmark/detail', () =>
        HttpResponse.json({
          bookmark_detail: {
            is_bookmarked: true,
            tags: [{ name: 'favorite', is_registered: true }],
            restrict: 'public',
          },
        })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.bookmarkDetail({ illustId: 1 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.bookmarkDetail.isBookmarked).toBe(true)
      expect(result.value.bookmarkDetail.tags[0].name).toBe('favorite')
    }
  })
})

describe('illusts.new()', () => {
  it('passes the maxIllustId param in the URL', async () => {
    let capturedMaxIllustId = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/illust/new', ({ request }) => {
        capturedMaxIllustId =
          new URL(request.url).searchParams.get('max_illust_id') ?? ''
        return HttpResponse.json({ illusts: [ILLUST], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.new({ maxIllustId: 100 })
    expect(result.isOk).toBe(true)
    expect(capturedMaxIllustId).toBe('100')
  })
})
