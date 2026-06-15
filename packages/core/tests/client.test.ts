import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw/handlers'
import { PixivClient } from '../src/client'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

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

const USER = {
  id: 42,
  name: 'Artist',
  account: 'artist',
  profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
  comment: 'Hello!',
}

const AUTH_RESPONSE = {
  user: { id: '42' },
  response: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
  },
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

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
      http.get(
        'https://app-api.pixiv.net/v1/search/illust',
        ({ request }) => {
          const offset = new URL(request.url).searchParams.get('offset')
          if (offset === '30') {
            return HttpResponse.json({ illusts: [ILLUST2], next_url: null })
          }
          return HttpResponse.json({
            illusts: [ILLUST],
            next_url:
              'https://app-api.pixiv.net/v1/search/illust?offset=30',
          })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const pages: number[] = []
    for await (const page of client.illusts
      .search({ word: 'cat' })
      .pages()) {
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
      http.get(
        'https://app-api.pixiv.net/v1/search/illust',
        ({ request }) => {
          const offset = new URL(request.url).searchParams.get('offset')
          if (offset === '30') {
            return HttpResponse.json({
              illusts: [ILLUST3, ILLUST4],
              next_url: null,
            })
          }
          return HttpResponse.json({
            illusts: [ILLUST, ILLUST2],
            next_url:
              'https://app-api.pixiv.net/v1/search/illust?offset=30',
          })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const ids: number[] = []
    for await (const illust of client.illusts
      .search({ word: 'cat' })
      .items()) {
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
      http.get(
        'https://app-api.pixiv.net/v1/illust/ranking',
        ({ request }) => {
          capturedMode =
            new URL(request.url).searchParams.get('mode') ?? ''
          return HttpResponse.json({ illusts: [ILLUST], next_url: null })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.ranking({ mode: 'week' })
    expect(result.isOk).toBe(true)
    expect(capturedMode).toBe('week')
  })
})

describe('illusts.bookmarkAdd()', () => {
  it('returns Ok', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.post(
        'https://app-api.pixiv.net/v2/illust/bookmark/add',
        () => HttpResponse.json({})
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.bookmarkAdd({ illustId: 1 })
    expect(result.isOk).toBe(true)
  })
})

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

describe('users.detail()', () => {
  it('returns Ok with user detail', async () => {
    const profile = {
      webpage: null,
      gender: 'unknown' as const,
      birth: '',
      birth_day: '',
      birth_year: 0,
      region: '',
      address_id: 0,
      country_code: '',
      job: '',
      job_id: 0,
      total_follow_users: 0,
      total_mypixiv_users: 0,
      total_illusts: 0,
      total_manga: 0,
      total_novels: 0,
      total_illust_bookmarks_public: 0,
      total_illust_series: 0,
      total_novel_series: 0,
      background_image_url: null,
      twitter_account: '',
      twitter_url: null,
      pawoo_url: null,
      is_premium: false,
      is_using_custom_profile_image: false,
    }
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/user/detail', () =>
        HttpResponse.json({
          user: USER,
          profile,
          profile_publicity: {
            gender: 'public',
            region: 'public',
            birth_day: 'public',
            birth_year: 'public',
            job: 'public',
            pawoo: false,
          },
          workspace: {
            pc: '',
            monitor: '',
            tool: '',
            scanner: '',
            tablet: '',
            mouse: '',
            printer: '',
            desktop: '',
            music: '',
            desk: '',
            chair: '',
            comment: '',
            workspace_image_url: null,
          },
        })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.detail({ userId: 42 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.user.id).toBe(42)
      expect(result.value.user.name).toBe('Artist')
    }
  })
})

describe('users.illusts()', () => {
  it('returns Ok with paginated illusts', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/user/illusts', () =>
        HttpResponse.json({
          user: {
            id: 42,
            name: 'Artist',
            account: 'artist',
            profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
          },
          illusts: [ILLUST],
          next_url: null,
        })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.illusts({ userId: 42 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.illusts).toHaveLength(1)
      expect(result.value.illusts[0].id).toBe(1)
    }
  })
})

describe('users.following()', () => {
  it('returns Ok with user previews', async () => {
    const userPreview = {
      user: {
        id: 99,
        name: 'Followed',
        account: 'followed',
        profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
      },
      illusts: [],
      novels: [],
      is_muted: false,
    }
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/user/following', () =>
        HttpResponse.json({ user_previews: [userPreview], next_url: null })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.following({ userId: 42 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.userPreviews).toHaveLength(1)
      expect(result.value.userPreviews[0].user.id).toBe(99)
    }
  })
})

describe('users.bookmarks.novels()', () => {
  it('returns Ok with bookmarked novels', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/user/bookmarks/novel', () =>
        HttpResponse.json({ novels: [NOVEL], next_url: null })
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.bookmarks.novels({ userId: 42 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.novels).toHaveLength(1)
      expect(result.value.novels[0].id).toBe(100)
    }
  })

  it('sends max_bookmark_id when maxBookmarkId is specified', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/user/bookmarks/novel',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({ novels: [NOVEL], next_url: null })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.users.bookmarks.novels({ userId: 42, maxBookmarkId: 9999 })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('max_bookmark_id')).toBe('9999')
  })
})

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

describe('images.fetch()', () => {
  it('returns Ok with a Response for an image URL', async () => {
    const imageUrl = 'https://i.pximg.net/img-original/test.jpg'
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(imageUrl, () =>
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
