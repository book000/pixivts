import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw/handlers'
import { PixivClient } from '../src/client'
import {
  mockNovelText,
  mockNovelRelated,
  mockNovelSearch,
  mockNovelRecommended,
  mockNovelSeries,
} from './msw/novels'

const NOVEL = {
  id: 100,
  title: 'Test Novel',
  caption: '',
  restrict: 0,
  x_restrict: 0,
  is_original: false,
  image_urls: {
    square_medium: 'https://i.pximg.net/sq.jpg',
    medium: 'https://i.pximg.net/m.jpg',
    large: 'https://i.pximg.net/l.jpg',
  },
  create_date: '2024-01-01T00:00:00+09:00',
  tags: [],
  page_count: 5,
  text_length: 2000,
  user: {
    id: 42,
    name: 'Author',
    account: 'author',
    profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
  },
  series: {},
  is_bookmarked: false,
  total_bookmarks: 20,
  total_view: 500,
  visible: true,
  total_comments: 3,
  is_muted: false,
  is_mypixiv_only: false,
  is_x_restricted: false,
  novel_ai_type: 0,
}

const AUTH_RESPONSE = {
  user: { id: '42' },
  response: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
  },
}

/** Wraps a WebviewNovel-shaped object literal in the HTML pixiv's WebView page embeds it in. */
function webviewNovelHtml(novel: Record<string, unknown>): string {
  return `<html><body><script>pixiv.context.novel = {novel: ${JSON.stringify(
    novel
  )}, isOwnWork: false, isMuteAll: false}</script></body></html>`
}

const WEBVIEW_NOVEL = {
  id: '100',
  title: 'Test Novel',
  series_id: undefined,
  series_title: undefined,
  series_is_watched: undefined,
  user_id: '42',
  cover_url: 'https://i.pximg.net/c.jpg',
  tags: ['tag1', 'tag2'],
  caption: 'A caption',
  cdate: '2024-01-01T00:00:00+09:00',
  rating: { like: 10, bookmark: 20, view: 500 },
  text: 'Chapter 1 text',
  marker: undefined,
  series_navigation: {},
  ai_type: 0,
  is_original: false,
}

describe('novels.detail()', () => {
  it('returns Ok with the novel', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v2/novel/detail', () =>
        HttpResponse.json({ novel: NOVEL })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.detail({ novelId: 100 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.novel.id).toBe(100)
      expect(result.value.novel.title).toBe('Test Novel')
    }
  })
})

describe('novels.follow()', () => {
  it('returns Ok with followed novels and defaults restrict to public', async () => {
    let capturedRestrict = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/novel/follow', ({ request }) => {
        capturedRestrict =
          new URL(request.url).searchParams.get('restrict') ?? ''
        return HttpResponse.json({ novels: [NOVEL], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.follow()
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.novels).toHaveLength(1)
    }
    expect(capturedRestrict).toBe('public')
  })

  it('sends restrict=private when explicitly requested', async () => {
    let capturedRestrict = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/novel/follow', ({ request }) => {
        capturedRestrict =
          new URL(request.url).searchParams.get('restrict') ?? ''
        return HttpResponse.json({ novels: [NOVEL], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.follow({ restrict: 'private' })
    expect(result.isOk).toBe(true)
    expect(capturedRestrict).toBe('private')
  })

  it('forwards the offset param', async () => {
    let capturedOffset = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/novel/follow', ({ request }) => {
        capturedOffset = new URL(request.url).searchParams.get('offset') ?? ''
        return HttpResponse.json({ novels: [NOVEL], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.follow({ offset: 30 })
    expect(result.isOk).toBe(true)
    expect(capturedOffset).toBe('30')
  })
})

describe('novels.comments()', () => {
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
      http.get('https://app-api.pixiv.net/v1/novel/comments', () =>
        HttpResponse.json({
          total_comments: 1,
          comments: [COMMENT],
          next_url: null,
        })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.comments({ novelId: 100 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.totalComments).toBe(1)
      expect(result.value.comments[0].comment).toBe('Nice!')
    }
  })

  it('forwards the offset param', async () => {
    let capturedOffset = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/novel/comments', ({ request }) => {
        capturedOffset = new URL(request.url).searchParams.get('offset') ?? ''
        return HttpResponse.json({ comments: [], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.comments({ novelId: 100, offset: 10 })
    expect(result.isOk).toBe(true)
    expect(capturedOffset).toBe('10')
  })

  it('omits the includeTotalComments param when not requested', async () => {
    let hasIncludeTotalComments = true
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/novel/comments', ({ request }) => {
        hasIncludeTotalComments = new URL(request.url).searchParams.has(
          'include_total_comments'
        )
        return HttpResponse.json({ comments: [], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.comments({ novelId: 100 })
    expect(result.isOk).toBe(true)
    expect(hasIncludeTotalComments).toBe(false)
  })

  it('maps commentAccessControl, hasReplies, and a nested parentComment', async () => {
    const PARENT_COMMENT = {
      id: 1,
      comment: 'Original comment',
      date: '2024-01-01T00:00:00+09:00',
      user: {
        id: 98,
        name: 'Original commenter',
        account: 'original-commenter',
        profile_image_urls: { medium: 'https://i.pximg.net/u1.jpg' },
      },
      parent_comment: {},
    }
    const REPLY_COMMENT = {
      id: 2,
      comment: 'A reply',
      date: '2024-01-02T00:00:00+09:00',
      user: {
        id: 99,
        name: 'Commenter',
        account: 'commenter',
        profile_image_urls: { medium: 'https://i.pximg.net/u2.jpg' },
      },
      has_replies: true,
      parent_comment: PARENT_COMMENT,
    }
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/novel/comments', () =>
        HttpResponse.json({
          comments: [REPLY_COMMENT],
          next_url: null,
          comment_access_control: 1,
        })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.comments({ novelId: 100 })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.commentAccessControl).toBe(1)
    const [reply] = result.value.comments
    expect(reply.hasReplies).toBe(true)
    expect(reply.parentComment).toMatchObject({
      id: 1,
      comment: 'Original comment',
    })
  })
})

describe('novels.new()', () => {
  it('passes the maxNovelId param in the URL', async () => {
    let capturedMaxNovelId = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/novel/new', ({ request }) => {
        capturedMaxNovelId =
          new URL(request.url).searchParams.get('max_novel_id') ?? ''
        return HttpResponse.json({ novels: [NOVEL], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.new({ maxNovelId: 100 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.novels).toHaveLength(1)
    }
    expect(capturedMaxNovelId).toBe('100')
  })

  it('defaults filter to for_ios when omitted', async () => {
    let capturedFilter = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/novel/new', ({ request }) => {
        capturedFilter = new URL(request.url).searchParams.get('filter') ?? ''
        return HttpResponse.json({ novels: [NOVEL], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.new()
    expect(result.isOk).toBe(true)
    expect(capturedFilter).toBe('for_ios')
  })
})

describe('novels.text()', () => {
  it('returns Ok with the parsed WebviewNovel', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockNovelText(webviewNovelHtml(WEBVIEW_NOVEL))
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.text({ novelId: 100 })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.id).toBe('100')
    expect(result.value.text).toBe('Chapter 1 text')
    expect(result.value.rating).toEqual({ like: 10, bookmark: 20, view: 500 })
    expect(result.value.seriesId).toBeUndefined()
  })

  it('passes id (not novel_id) and viewer_version in the query string', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/webview/v2/novel', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.text(webviewNovelHtml(WEBVIEW_NOVEL))
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.novels.text({ novelId: 100 })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('id')).toBe('100')
    expect(params.has('novel_id')).toBe(false)
    expect(params.get('viewer_version')).toBe('20221031_ai')
  })

  it('returns Err with type parse_error when the embedded JSON cannot be found', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockNovelText('<html><body>not a webview page</body></html>')
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.text({ novelId: 100 })
    expect(result.isOk).toBe(false)
    if (result.isOk) return
    expect(result.error.type).toBe('parse_error')
  })

  it('returns Err with type parse_error when the embedded JSON is malformed', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockNovelText(
        '<html><body><script>pixiv.context.novel = {novel: {id: "100", not valid json}, isOwnWork: false}</script></body></html>'
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.text({ novelId: 100 })
    expect(result.isOk).toBe(false)
    if (result.isOk) return
    expect(result.error.type).toBe('parse_error')
  })
})

describe('novels.related()', () => {
  it('returns Ok with related novels', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockNovelRelated({ novels: [NOVEL], next_url: null })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.related({ novelId: 100 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.novels).toHaveLength(1)
      expect(result.value.novels[0].id).toBe(100)
    }
  })
})

describe('novels.ranking()', () => {
  it('defaults mode to day', async () => {
    let capturedMode = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/novel/ranking', ({ request }) => {
        capturedMode = new URL(request.url).searchParams.get('mode') ?? ''
        return HttpResponse.json({ novels: [NOVEL], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.ranking()
    expect(result.isOk).toBe(true)
    expect(capturedMode).toBe('day')
  })

  it('passes an explicit mode', async () => {
    let capturedMode = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/novel/ranking', ({ request }) => {
        capturedMode = new URL(request.url).searchParams.get('mode') ?? ''
        return HttpResponse.json({ novels: [NOVEL], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.ranking({ mode: 'week' })
    expect(result.isOk).toBe(true)
    expect(capturedMode).toBe('week')
  })
})

describe('novels.search()', () => {
  it('returns Ok with the first page of novels', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockNovelSearch({ novels: [NOVEL], next_url: null })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.search({ word: 'fantasy' })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.novels).toHaveLength(1)
    }
  })

  it('defaults searchTarget and sort', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/search/novel', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ novels: [NOVEL], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.novels.search({ word: 'fantasy' })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('search_target')).toBe('partial_match_for_tags')
    expect(params.get('sort')).toBe('date_desc')
  })
})

describe('novels.recommended()', () => {
  it('returns Ok with recommended novels', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockNovelRecommended({ novels: [NOVEL], next_url: null })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.recommended()
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.novels).toHaveLength(1)
    }
  })

  it('sends include_ranking_novels=true', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/novel/recommended', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ novels: [NOVEL], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.novels.recommended()
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('include_ranking_novels')).toBe('true')
  })
})

describe('novels.series()', () => {
  it('returns Ok with series detail and novels', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockNovelSeries({
        novel_series_detail: {
          id: 700,
          title: 'Test Novel Series',
          caption: '',
          is_original: false,
          is_concluded: false,
          content_count: 1,
          total_character_count: 2000,
          user: {
            id: 42,
            name: 'Author',
            account: 'author',
            profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
          },
          display_text: '1 work',
          novel_ai_type: 0,
          watchlist_added: false,
        },
        novel_series_first_novel: NOVEL,
        novel_series_latest_novel: NOVEL,
        novels: [NOVEL],
        next_url: null,
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.series({ seriesId: 700 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.novelSeriesDetail.id).toBe(700)
      expect(result.value.novels).toHaveLength(1)
    }
  })

  it('forwards the lastOrder param', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v2/novel/series', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({
          novel_series_detail: {
            id: 700,
            title: 'Test Novel Series',
            caption: '',
            is_original: false,
            is_concluded: false,
            content_count: 1,
            total_character_count: 2000,
            user: {
              id: 42,
              name: 'Author',
              account: 'author',
              profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
            },
            display_text: '1 work',
            novel_ai_type: 0,
            watchlist_added: false,
          },
          novel_series_first_novel: NOVEL,
          novel_series_latest_novel: NOVEL,
          novels: [NOVEL],
          next_url: null,
        })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.novels.series({ seriesId: 700, lastOrder: 5 })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('last_order')).toBe('5')
  })
})

describe('novels.bookmarkAdd()', () => {
  it('returns Ok and defaults restrict to public', async () => {
    let capturedBody = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.post(
        'https://app-api.pixiv.net/v2/novel/bookmark/add',
        async ({ request }) => {
          capturedBody = await request.text()
          return HttpResponse.json({})
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.bookmarkAdd({ novelId: 100 })
    expect(result.isOk).toBe(true)
    const params = new URLSearchParams(capturedBody)
    expect(params.get('novel_id')).toBe('100')
    expect(params.get('restrict')).toBe('public')
  })

  it('sends tags[] when tags are specified', async () => {
    let capturedBody = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.post(
        'https://app-api.pixiv.net/v2/novel/bookmark/add',
        async ({ request }) => {
          capturedBody = await request.text()
          return HttpResponse.json({})
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.novels.bookmarkAdd({
      novelId: 100,
      tags: ['tag1', 'tag2'],
    })
    const params = new URLSearchParams(capturedBody)
    expect(params.getAll('tags[]')).toEqual(['tag1', 'tag2'])
  })
})

describe('novels.bookmarkDelete()', () => {
  it('returns Ok and sends novel_id', async () => {
    let capturedBody = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.post(
        'https://app-api.pixiv.net/v1/novel/bookmark/delete',
        async ({ request }) => {
          capturedBody = await request.text()
          return HttpResponse.json({})
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.bookmarkDelete({ novelId: 100 })
    expect(result.isOk).toBe(true)
    const params = new URLSearchParams(capturedBody)
    expect(params.get('novel_id')).toBe('100')
  })
})
