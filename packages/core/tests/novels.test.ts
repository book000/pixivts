import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw/handlers'
import { PixivClient } from '../src/client'

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
