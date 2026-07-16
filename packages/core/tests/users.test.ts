import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw/handlers'
import { PixivClient } from '../src/client'
import {
  mockUserNovels,
  mockUserBookmarksIllust,
  mockUserRelated,
  mockUserRecommended,
  mockUserFollower,
  mockUserMypixiv,
  mockUserList,
  mockUserBookmarkTagsIllust,
  mockUserEditAiShowSettings,
} from './msw/users'

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

describe('users.detail()', () => {
  it('returns Ok with user detail', async () => {
    const USER = {
      id: 42,
      name: 'Artist',
      account: 'artist',
      profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
      comment: 'Hello!',
    }
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

describe('users.novels()', () => {
  it('returns Ok with paginated novels', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockUserNovels({
        user: {
          id: 42,
          name: 'Author',
          account: 'author',
          profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
        },
        novels: [NOVEL],
        next_url: null,
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.novels({ userId: 42 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.novels).toHaveLength(1)
      expect(result.value.novels[0].id).toBe(100)
    }
  })

  it('defaults filter to for_ios and forwards offset', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/user/novels',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({
            user: {
              id: 42,
              name: 'Author',
              account: 'author',
              profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
            },
            novels: [NOVEL],
            next_url: null,
          })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.users.novels({ userId: 42, offset: 30 })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('filter')).toBe('for_ios')
    expect(params.get('offset')).toBe('30')
  })
})

describe('users.followAdd()', () => {
  it('returns Ok and defaults restrict to public', async () => {
    let capturedBody = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.post(
        'https://app-api.pixiv.net/v1/user/follow/add',
        async ({ request }) => {
          capturedBody = await request.text()
          return HttpResponse.json({})
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.followAdd({ userId: 42 })
    expect(result.isOk).toBe(true)
    expect(capturedBody).toContain('restrict=public')
  })
})

describe('users.followDelete()', () => {
  it('returns Ok and sends user_id', async () => {
    let capturedBody = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.post(
        'https://app-api.pixiv.net/v1/user/follow/delete',
        async ({ request }) => {
          capturedBody = await request.text()
          return HttpResponse.json({})
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.followDelete({ userId: 42 })
    expect(result.isOk).toBe(true)
    const params = new URLSearchParams(capturedBody)
    expect(params.get('user_id')).toBe('42')
  })
})

describe('users.bookmarks.illusts()', () => {
  it('returns Ok with bookmarked illusts', async () => {
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
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockUserBookmarksIllust({ illusts: [ILLUST], next_url: null })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.bookmarks.illusts({ userId: 42 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.illusts).toHaveLength(1)
      expect(result.value.illusts[0].id).toBe(1)
    }
  })

  it('forwards the tag param', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/user/bookmarks/illust',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({ illusts: [], next_url: null })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.users.bookmarks.illusts({ userId: 42, tag: 'favorite' })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('tag')).toBe('favorite')
  })
})

const USER_PREVIEW = {
  user: {
    id: 99,
    name: 'Related',
    account: 'related',
    profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
  },
  illusts: [],
  novels: [],
  is_muted: false,
}

describe('users.related()', () => {
  it('returns Ok with user previews', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockUserRelated({ user_previews: [USER_PREVIEW], next_url: null })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.related({ seedUserId: 42 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.userPreviews).toHaveLength(1)
      expect(result.value.userPreviews[0].user.id).toBe(99)
    }
  })

  it('sends seed_user_id and defaults filter to for_ios', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/user/related', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ user_previews: [], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.users.related({ seedUserId: 42 })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('seed_user_id')).toBe('42')
    expect(params.get('filter')).toBe('for_ios')
  })
})

describe('users.recommended()', () => {
  it('returns Ok with user previews', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockUserRecommended({ user_previews: [USER_PREVIEW], next_url: null })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.recommended()
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.userPreviews).toHaveLength(1)
    }
  })

  it('accepts no arguments and forwards offset', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/user/recommended',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({ user_previews: [], next_url: null })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.users.recommended({ offset: 10 })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('offset')).toBe('10')
  })
})

describe('users.follower()', () => {
  it('returns Ok with user previews', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockUserFollower({ user_previews: [USER_PREVIEW], next_url: null })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.follower({ userId: 42 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.userPreviews).toHaveLength(1)
    }
  })

  it('sends user_id and defaults filter to for_ios', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/user/follower', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ user_previews: [], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.users.follower({ userId: 42 })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('user_id')).toBe('42')
    expect(params.get('filter')).toBe('for_ios')
  })
})

describe('users.mypixiv()', () => {
  it('returns Ok with user previews', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockUserMypixiv({ user_previews: [USER_PREVIEW], next_url: null })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.mypixiv({ userId: 42 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.userPreviews).toHaveLength(1)
    }
  })

  it('sends user_id and forwards offset', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v1/user/mypixiv', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ user_previews: [], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.users.mypixiv({ userId: 42, offset: 5 })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('user_id')).toBe('42')
    expect(params.get('offset')).toBe('5')
  })
})

const PLAIN_USER = {
  id: 99,
  name: 'Listed',
  account: 'listed',
  profile_image_urls: { medium: 'https://i.pximg.net/u.jpg' },
}

describe('users.list()', () => {
  it('returns Ok with users', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockUserList({ users: [PLAIN_USER], next_url: null })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.list({ userId: 42 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.users).toHaveLength(1)
    }
  })

  it('sends user_id and defaults filter to for_ios', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get('https://app-api.pixiv.net/v2/user/list', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ users: [], next_url: null })
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.users.list({ userId: 42 })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('user_id')).toBe('42')
    expect(params.get('filter')).toBe('for_ios')
  })
})

describe('users.bookmarkTagsIllust()', () => {
  it('returns Ok with bookmark tags', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockUserBookmarkTagsIllust({
        bookmark_tags: [{ name: 'favorite', count: 3, is_registered: true }],
        next_url: null,
      })
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.bookmarkTagsIllust({ userId: 42 })
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.bookmarkTags).toHaveLength(1)
      expect(result.value.bookmarkTags[0].name).toBe('favorite')
      expect(result.value.bookmarkTags[0].count).toBe(3)
    }
  })

  it('defaults restrict to public and forwards offset', async () => {
    let capturedUrl: string | undefined
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.get(
        'https://app-api.pixiv.net/v1/user/bookmark-tags/illust',
        ({ request }) => {
          capturedUrl = request.url
          return HttpResponse.json({ bookmark_tags: [], next_url: null })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.users.bookmarkTagsIllust({ userId: 42, offset: 20 })
    expect(capturedUrl).toBeDefined()
    if (capturedUrl === undefined) return
    const params = new URL(capturedUrl).searchParams
    expect(params.get('restrict')).toBe('public')
    expect(params.get('offset')).toBe('20')
  })
})

describe('users.editAiShowSettings()', () => {
  it('returns Ok', async () => {
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      mockUserEditAiShowSettings({})
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.users.editAiShowSettings({ setting: 1 })
    expect(result.isOk).toBe(true)
  })

  it('sends the setting value in the request body', async () => {
    let capturedBody = ''
    server.use(
      http.post('https://oauth.secure.pixiv.net/auth/token', () =>
        HttpResponse.json(AUTH_RESPONSE)
      ),
      http.post(
        'https://app-api.pixiv.net/v1/user/ai-show-settings/edit',
        async ({ request }) => {
          capturedBody = await request.text()
          return HttpResponse.json({})
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.users.editAiShowSettings({ setting: 1 })
    const params = new URLSearchParams(capturedBody)
    expect(params.get('setting')).toBe('1')
  })
})
