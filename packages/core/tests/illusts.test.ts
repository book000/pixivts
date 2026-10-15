import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw/handlers'
import { PixivClient } from '../src/client'
import {
  mockIllustRelated,
  mockIllustSeries,
  mockIllustTrendingTags,
} from './msw/illusts'

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
    if (!result.isOk) {
      return
    }

    expect(result.value.illust.id).toBe(1)
    expect(result.value.illust.title).toBe('Test Illust')
  })

  it('maps request, eventBanners, and seasonalEffectAnimationUrls to camelCase', async () => {
    const REQUEST = {
      request_info: {
        fan_user_id: 7,
        collaborate_status: {
          collaborating: true,
          collaborate_anonymous_flag: false,
          collaborate_user_samples: [{ user_id: null, anonymous_flag: true }],
        },
        role: 'creator',
      },
      request_users: [
        {
          id: 8,
          name: 'Requested',
          account: 'requested',
          profile_image_urls: { medium: 'https://i.pximg.net/r.jpg' },
          is_followed: false,
          is_access_blocking_user: false,
          is_accept_request: true,
        },
      ],
    }
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/illust/detail', () =>
        HttpResponse.json({
          illust: {
            ...ILLUST,
            request: REQUEST,
            event_banners: null,
            seasonal_effect_animation_urls: null,
          },
        })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.detail({ illustId: 1 })
    expect(result.isOk).toBe(true)
    if (!result.isOk) {
      return
    }

    const { illust } = result.value
    expect(illust.eventBanners).toBeNull()
    expect(illust.seasonalEffectAnimationUrls).toBeNull()
    expect(illust.request?.requestInfo.fanUserId).toBe(7)
    expect(
      illust.request?.requestInfo.collaborateStatus.collaborateUserSamples[0]
    ).toEqual({ userId: null, anonymousFlag: true })
    expect(illust.request?.requestUsers[0].isAcceptRequest).toBe(true)
    expect(illust.request?.requestUsers[0].profileImageUrls.medium).toBe(
      'https://i.pximg.net/r.jpg'
    )
  })

  it('maps a null request', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/illust/detail', () =>
        HttpResponse.json({ illust: { ...ILLUST, request: null } })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.detail({ illustId: 1 })
    expect(result.isOk).toBe(true)
    if (!result.isOk) {
      return
    }

    expect(result.value.illust.request).toBeNull()
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
        return offset === '30'
          ? HttpResponse.json({ illusts: [ILLUST2], next_url: null })
          : HttpResponse.json({
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
        return offset === '30'
          ? HttpResponse.json({
              illusts: [ILLUST3, ILLUST4],
              next_url: null,
            })
          : HttpResponse.json({
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
    if (!result.isOk) return
    const illust = result.value.illusts[0]
    expect(illust.type).toBe('manga')
    expect(illust.metaSinglePage.originalImageUrl).toBeUndefined()
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

describe('illusts.mypixiv()', () => {
  const AUTH_HANDLER = http.post(
    'https://oauth.secure.pixiv.net/auth/token',
    () => HttpResponse.json(AUTH_RESPONSE)
  )

  it('requests /v2/illust/mypixiv without a query and maps the response to camelCase', async () => {
    let capturedSearch = 'unset'
    server.use(
      AUTH_HANDLER,
      http.get('https://app-api.pixiv.net/v2/illust/mypixiv', ({ request }) => {
        capturedSearch = new URL(request.url).search
        return HttpResponse.json({
          illusts: [ILLUST],
          next_url: 'https://app-api.pixiv.net/v2/illust/mypixiv?offset=30',
        })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.mypixiv()
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.illusts).toHaveLength(1)
      expect(result.value.illusts[0].imageUrls.medium).toBe(
        'https://i.pximg.net/m.jpg'
      )
      expect(result.value.nextUrl).toBe(
        'https://app-api.pixiv.net/v2/illust/mypixiv?offset=30'
      )
    }
    expect(capturedSearch).toBe('')
  })

  it('sends offset when specified', async () => {
    let capturedOffset = ''
    server.use(
      AUTH_HANDLER,
      http.get('https://app-api.pixiv.net/v2/illust/mypixiv', ({ request }) => {
        capturedOffset = new URL(request.url).searchParams.get('offset') ?? ''
        return HttpResponse.json({ illusts: [ILLUST], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.mypixiv({ offset: 30 })
    expect(result.isOk).toBe(true)
    expect(capturedOffset).toBe('30')
  })

  it('follows next_url across pages with items()', async () => {
    server.use(
      AUTH_HANDLER,
      http.get('https://app-api.pixiv.net/v2/illust/mypixiv', ({ request }) => {
        const offset = new URL(request.url).searchParams.get('offset')
        return offset === '30'
          ? HttpResponse.json({
              illusts: [{ ...ILLUST, id: 2 }],
              next_url: null,
            })
          : HttpResponse.json({
              illusts: [ILLUST],
              next_url: 'https://app-api.pixiv.net/v2/illust/mypixiv?offset=30',
            })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const ids: number[] = []
    for await (const illust of client.illusts.mypixiv().items()) {
      ids.push(illust.id)
    }
    expect(ids).toEqual([1, 2])
  })
})

describe('illusts.comments()', () => {
  const COMMENT_USER = {
    id: 99,
    name: 'Commenter',
    account: 'commenter',
    profile_image_urls: { medium: 'https://i.pximg.net/u2.jpg' },
  }
  const COMMENT_WITH_STAMP = {
    id: 1,
    comment: '',
    date: '2024-01-01T00:00:00+09:00',
    user: COMMENT_USER,
    has_replies: false,
    stamp: {
      stamp_id: 101,
      stamp_url:
        'https://s.pximg.net/common/images/stamp/generated-stamps/101_s.jpg',
    },
  }
  const COMMENT_WITHOUT_STAMP = {
    id: 2,
    comment: 'Nice!',
    date: '2024-01-02T00:00:00+09:00',
    user: COMMENT_USER,
    has_replies: true,
    stamp: null,
  }

  it('returns Ok with v3 comments including stamps', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v3/illust/comments', () =>
        HttpResponse.json({
          comments: [COMMENT_WITH_STAMP, COMMENT_WITHOUT_STAMP],
          next_url: null,
          comment_access_control: 0,
        })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.comments({ illustId: 1 })
    expect(result.isOk).toBe(true)
    if (!result.isOk) {
      return
    }

    expect(result.value.totalComments).toBeUndefined()
    expect(result.value.comments[0].stamp).toEqual({
      stampId: 101,
      stampUrl: COMMENT_WITH_STAMP.stamp.stamp_url,
    })
    expect(result.value.comments[1].comment).toBe('Nice!')
    expect(result.value.comments[1].stamp).toBeNull()
  })

  it('requests /v3/illust/comments with illust_id and offset', async () => {
    let requestUrl: URL | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v3/illust/comments',
        ({ request }) => {
          requestUrl = new URL(request.url)
          return HttpResponse.json({ comments: [], next_url: null })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.comments({ illustId: 1, offset: 30 })
    expect(result.isOk).toBe(true)

    expect(requestUrl?.pathname).toBe('/v3/illust/comments')
    expect(requestUrl?.searchParams.get('illust_id')).toBe('1')
    expect(requestUrl?.searchParams.get('offset')).toBe('30')
  })

  it('does not send include_total_comments', async () => {
    let hasIncludeTotalComments = true
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v3/illust/comments',
        ({ request }) => {
          hasIncludeTotalComments = new URL(request.url).searchParams.has(
            'include_total_comments'
          )
          return HttpResponse.json({ comments: [], next_url: null })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.illusts.comments({ illustId: 1, includeTotalComments: true })

    expect(hasIncludeTotalComments).toBe(false)
  })
})

describe('illusts.commentReplies()', () => {
  const REPLY_USER = {
    id: 99,
    name: 'Replier',
    account: 'replier',
    profile_image_urls: { medium: 'https://i.pximg.net/u2.jpg' },
  }
  const REPLY_WITH_STAMP = {
    id: 11,
    comment: '',
    date: '2024-01-01T00:00:00+09:00',
    user: REPLY_USER,
    has_replies: false,
    stamp: {
      stamp_id: 101,
      stamp_url:
        'https://s.pximg.net/common/images/stamp/generated-stamps/101_s.jpg',
    },
  }
  const REPLY_WITHOUT_STAMP = {
    id: 12,
    comment: 'Thanks!',
    date: '2024-01-02T00:00:00+09:00',
    user: REPLY_USER,
    has_replies: false,
    stamp: null,
  }
  const AUTH_HANDLER = http.post(
    'https://oauth.secure.pixiv.net/auth/token',
    () => HttpResponse.json(AUTH_RESPONSE)
  )

  it('maps replies to camelCase', async () => {
    server.use(
      AUTH_HANDLER,
      http.get('https://app-api.pixiv.net/v2/illust/comment/replies', () =>
        HttpResponse.json({
          comments: [REPLY_WITH_STAMP, REPLY_WITHOUT_STAMP],
          next_url: null,
        })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.commentReplies({ commentId: 1 })
    expect(result.isOk).toBe(true)
    if (!result.isOk) {
      return
    }

    expect(result.value.nextUrl).toBeNull()
    expect(result.value.comments[0].hasReplies).toBe(false)
    expect(result.value.comments[0].stamp).toEqual({
      stampId: 101,
      stampUrl: REPLY_WITH_STAMP.stamp.stamp_url,
    })
    expect(result.value.comments[1].comment).toBe('Thanks!')
    expect(result.value.comments[1].stamp).toBeNull()
  })

  it('requests /v2/illust/comment/replies with comment_id only by default', async () => {
    let requestUrl: URL | undefined
    server.use(
      AUTH_HANDLER,
      http.get(
        'https://app-api.pixiv.net/v2/illust/comment/replies',
        ({ request }) => {
          requestUrl = new URL(request.url)
          return HttpResponse.json({ comments: [], next_url: null })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.commentReplies({ commentId: 7 })
    expect(result.isOk).toBe(true)

    expect(requestUrl?.pathname).toBe('/v2/illust/comment/replies')
    expect(requestUrl?.searchParams.get('comment_id')).toBe('7')
    expect(requestUrl?.searchParams.has('offset')).toBe(false)
  })

  it('sends offset verbatim, including 0', async () => {
    const offsets: (string | null)[] = []
    server.use(
      AUTH_HANDLER,
      http.get(
        'https://app-api.pixiv.net/v2/illust/comment/replies',
        ({ request }) => {
          offsets.push(new URL(request.url).searchParams.get('offset'))
          return HttpResponse.json({ comments: [], next_url: null })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.illusts.commentReplies({ commentId: 7, offset: 0 })
    await client.illusts.commentReplies({ commentId: 7, offset: 30 })

    expect(offsets).toEqual(['0', '30'])
  })

  it('follows next_url across pages with pages() and items()', async () => {
    server.use(
      AUTH_HANDLER,
      http.get(
        'https://app-api.pixiv.net/v2/illust/comment/replies',
        ({ request }) => {
          const offset = new URL(request.url).searchParams.get('offset')
          return offset === '30'
            ? HttpResponse.json({
                comments: [REPLY_WITHOUT_STAMP],
                next_url: null,
              })
            : HttpResponse.json({
                comments: [REPLY_WITH_STAMP],
                next_url:
                  'https://app-api.pixiv.net/v2/illust/comment/replies?comment_id=1&offset=30',
              })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const pageSizes: number[] = []
    const pageIterable = client.illusts.commentReplies({ commentId: 1 }).pages()
    for await (const page of pageIterable) {
      pageSizes.push(page.comments.length)
    }
    expect(pageSizes).toEqual([1, 1])

    const ids: number[] = []
    const itemIterable = client.illusts.commentReplies({ commentId: 1 }).items()
    for await (const reply of itemIterable) {
      ids.push(reply.id)
    }
    expect(ids).toEqual([11, 12])
  })

  it('returns Err on an HTTP error', async () => {
    server.use(
      AUTH_HANDLER,
      http.get(
        'https://app-api.pixiv.net/v2/illust/comment/replies',
        () => new HttpResponse(null, { status: 404 })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.commentReplies({ commentId: 1 })
    expect(result.isOk).toBe(false)
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
    if (!result.isOk) {
      return
    }

    expect(result.value.bookmarkDetail.isBookmarked).toBe(true)
    expect(result.value.bookmarkDetail.tags[0].name).toBe('favorite')
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

describe('illusts.related()', () => {
  it('returns Ok with related illusts', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockIllustRelated({ illusts: [ILLUST], next_url: null })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.related({ illustId: 1 })
    expect(result.isOk).toBe(true)
    if (!result.isOk) {
      return
    }

    expect(result.value.illusts).toHaveLength(1)
    expect(result.value.illusts[0].id).toBe(1)
  })

  it('sends seed_illust_ids[] when seedIllustIds is specified', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v2/illust/related', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ illusts: [ILLUST], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.illusts.related({ illustId: 1, seedIllustIds: [2, 3] })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.getAll('seed_illust_ids[]')).toEqual(['2', '3'])
  })
})

describe('illusts.series()', () => {
  it('returns Ok with series detail and illusts', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockIllustSeries({
        illust_series_detail: {
          id: 500,
          title: 'Test Series',
          caption: '',
          cover_image_urls: { medium: 'https://i.pximg.net/cover.jpg' },
          series_work_count: 1,
          create_date: '2024-01-01T00:00:00+09:00',
          width: 600,
          height: 600,
          user: {
            id: 42,
            name: 'Artist',
            account: 'artist',
            profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
          },
          watchlist_added: false,
        },
        illust_series_first_illust: ILLUST,
        illusts: [ILLUST],
        next_url: null,
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.series({ illustSeriesId: 500 })
    expect(result.isOk).toBe(true)
    if (!result.isOk) {
      return
    }

    expect(result.value.illustSeriesDetail.id).toBe(500)
    expect(result.value.illusts).toHaveLength(1)
  })

  it('passes illust_series_id in the URL', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/illust/series', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({
          illust_series_detail: {
            id: 500,
            title: 'Test Series',
            caption: '',
            cover_image_urls: { medium: 'https://i.pximg.net/cover.jpg' },
            series_work_count: 1,
            create_date: '2024-01-01T00:00:00+09:00',
            width: 600,
            height: 600,
            user: {
              id: 42,
              name: 'Artist',
              account: 'artist',
              profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
            },
            watchlist_added: false,
          },
          illust_series_first_illust: ILLUST,
          illusts: [ILLUST],
          next_url: null,
        })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.illusts.series({ illustSeriesId: 500 })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('illust_series_id')).toBe('500')
  })
})

describe('illusts.bookmarkDelete()', () => {
  it('returns Ok and sends illust_id', async () => {
    let capturedBody = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.post(
        'https://app-api.pixiv.net/v1/illust/bookmark/delete',
        async ({ request }) => {
          capturedBody = await request.text()
          return HttpResponse.json({})
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.bookmarkDelete({ illustId: 1 })
    expect(result.isOk).toBe(true)
    const params = new URLSearchParams(capturedBody)
    expect(params.get('illust_id')).toBe('1')
  })
})

describe('illusts.trendingTags()', () => {
  it('returns Ok with trend tags', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockIllustTrendingTags({
        trend_tags: [{ tag: 'cat', translated_name: 'Cat', illust: ILLUST }],
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.trendingTags()
    expect(result.isOk).toBe(true)
    if (!result.isOk) {
      return
    }

    expect(result.value.trendTags).toHaveLength(1)
    expect(result.value.trendTags[0].tag).toBe('cat')
    expect(result.value.trendTags[0].translatedName).toBe('Cat')
    expect(result.value.trendTags[0].illust.id).toBe(1)
  })

  it('defaults filter to for_ios', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/trending-tags/illust',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({ trend_tags: [] })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.illusts.trendingTags()
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('filter')).toBe('for_ios')
  })
})

describe('illusts.search() — optional pass-through params', () => {
  async function capture(
    opts: Partial<Parameters<PixivClient['illusts']['search']>[0]>
  ) {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/search/illust', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ illusts: [ILLUST], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.illusts.search({ word: 'cat', ...opts })
    expect(capturedUrl).toBeDefined()
    return new URL(capturedUrl ?? 'https://invalid.example').searchParams
  }

  it('omits the new params by default', async () => {
    const params = await capture({})
    for (const k of [
      'include_translated_tag_results',
      'merge_plain_keyword_results',
      'include_potential_violation_works',
      'content_type',
    ])
      expect(params.has(k)).toBe(false)
  })

  it('sends the new params as snake_case when provided', async () => {
    const params = await capture({
      includeTranslatedTagResults: true,
      mergePlainKeywordResults: true,
      includePotentialViolationWorks: false,
      contentType: 'illust_and_manga_and_ugoira',
    })
    expect(params.get('include_translated_tag_results')).toBe('true')
    expect(params.get('merge_plain_keyword_results')).toBe('true')
    expect(params.get('include_potential_violation_works')).toBe('false')
    expect(params.get('content_type')).toBe('illust_and_manga_and_ugoira')
  })
})
