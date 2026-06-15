/**
 * Tests for option constants exported from options.ts.
 *
 * Verifies that:
 * 1. Each const object contains the expected values.
 * 2. Const values can be passed as API params (runtime usage via PixivClient).
 */
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw/handlers'
import { PixivClient } from '../src/client'
import {
  BookmarkRestrict,
  FollowRestrict,
  NovelRankingMode,
  OSFilter,
  RankingMode,
  SearchDuration,
  SearchSort,
  SearchTarget,
  UserIllustType,
} from '../src/options'

// ---------------------------------------------------------------------------
// Auth stub reused across tests
// ---------------------------------------------------------------------------

const AUTH_RESPONSE = {
  user: { id: '1' },
  response: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
  },
}

function stubAuth() {
  server.use(
    http.post('https://oauth.secure.pixiv.net/auth/token', () =>
      HttpResponse.json(AUTH_RESPONSE)
    )
  )
}

// ---------------------------------------------------------------------------
// Const value assertions
// ---------------------------------------------------------------------------

describe('BookmarkRestrict', () => {
  it('has PUBLIC = "public"', () => {
    expect(BookmarkRestrict.PUBLIC).toBe('public')
  })
  it('has PRIVATE = "private"', () => {
    expect(BookmarkRestrict.PRIVATE).toBe('private')
  })
})

describe('FollowRestrict', () => {
  it('has PUBLIC = "public"', () => {
    expect(FollowRestrict.PUBLIC).toBe('public')
  })
  it('has PRIVATE = "private"', () => {
    expect(FollowRestrict.PRIVATE).toBe('private')
  })
})

describe('OSFilter', () => {
  it('has FOR_IOS = "for_ios"', () => {
    expect(OSFilter.FOR_IOS).toBe('for_ios')
  })
  it('has FOR_ANDROID = "for_android"', () => {
    expect(OSFilter.FOR_ANDROID).toBe('for_android')
  })
})

describe('SearchTarget', () => {
  it('has PARTIAL_MATCH_FOR_TAGS = "partial_match_for_tags"', () => {
    expect(SearchTarget.PARTIAL_MATCH_FOR_TAGS).toBe('partial_match_for_tags')
  })
  it('has EXACT_MATCH_FOR_TAGS = "exact_match_for_tags"', () => {
    expect(SearchTarget.EXACT_MATCH_FOR_TAGS).toBe('exact_match_for_tags')
  })
  it('has TITLE_AND_CAPTION = "title_and_caption"', () => {
    expect(SearchTarget.TITLE_AND_CAPTION).toBe('title_and_caption')
  })
  it('has KEYWORD = "keyword"', () => {
    expect(SearchTarget.KEYWORD).toBe('keyword')
  })
})

describe('SearchSort', () => {
  it('has DATE_DESC = "date_desc"', () => {
    expect(SearchSort.DATE_DESC).toBe('date_desc')
  })
  it('has DATE_ASC = "date_asc"', () => {
    expect(SearchSort.DATE_ASC).toBe('date_asc')
  })
  it('has POPULAR_DESC = "popular_desc"', () => {
    expect(SearchSort.POPULAR_DESC).toBe('popular_desc')
  })
})

describe('SearchDuration', () => {
  it('has WITHIN_LAST_DAY = "within_last_day"', () => {
    expect(SearchDuration.WITHIN_LAST_DAY).toBe('within_last_day')
  })
  it('has WITHIN_LAST_WEEK = "within_last_week"', () => {
    expect(SearchDuration.WITHIN_LAST_WEEK).toBe('within_last_week')
  })
  it('has WITHIN_LAST_MONTH = "within_last_month"', () => {
    expect(SearchDuration.WITHIN_LAST_MONTH).toBe('within_last_month')
  })
})

describe('RankingMode', () => {
  it('has DAY = "day"', () => {
    expect(RankingMode.DAY).toBe('day')
  })
  it('has WEEK = "week"', () => {
    expect(RankingMode.WEEK).toBe('week')
  })
  it('has MONTH = "month"', () => {
    expect(RankingMode.MONTH).toBe('month')
  })
})

describe('NovelRankingMode', () => {
  it('has DAY = "day"', () => {
    expect(NovelRankingMode.DAY).toBe('day')
  })
  it('has WEEK = "week"', () => {
    expect(NovelRankingMode.WEEK).toBe('week')
  })
})

describe('UserIllustType', () => {
  it('has ILLUST = "illust"', () => {
    expect(UserIllustType.ILLUST).toBe('illust')
  })
  it('has MANGA = "manga"', () => {
    expect(UserIllustType.MANGA).toBe('manga')
  })
})

// ---------------------------------------------------------------------------
// Runtime usage: const values are accepted as API params
// ---------------------------------------------------------------------------

describe('BookmarkRestrict.PUBLIC used as API param', () => {
  it('passes restrict=public to illusts.bookmarkAdd', async () => {
    let capturedRestrict: string | null = null
    stubAuth()
    server.use(
      http.post(
        'https://app-api.pixiv.net/v2/illust/bookmark/add',
        async ({ request }) => {
          const body = await request.formData()
          capturedRestrict = body.get('restrict') as string | null
          return HttpResponse.json({})
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.bookmarkAdd({
      illustId: 1,
      restrict: BookmarkRestrict.PUBLIC,
    })
    expect(result.isOk).toBe(true)
    expect(capturedRestrict).toBe('public')
  })

  it('passes restrict=private to illusts.bookmarkAdd', async () => {
    let capturedRestrict: string | null = null
    stubAuth()
    server.use(
      http.post(
        'https://app-api.pixiv.net/v2/illust/bookmark/add',
        async ({ request }) => {
          const body = await request.formData()
          capturedRestrict = body.get('restrict') as string | null
          return HttpResponse.json({})
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.bookmarkAdd({
      illustId: 1,
      restrict: BookmarkRestrict.PRIVATE,
    })
    expect(result.isOk).toBe(true)
    expect(capturedRestrict).toBe('private')
  })
})

describe('SearchTarget used as API param', () => {
  it('passes search_target to illusts.search', async () => {
    let capturedTarget: string | null = null
    stubAuth()
    server.use(
      http.get(
        'https://app-api.pixiv.net/v1/search/illust',
        ({ request }) => {
          capturedTarget =
            new URL(request.url).searchParams.get('search_target')
          return HttpResponse.json({ illusts: [], next_url: null })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.illusts.search({
      word: 'cat',
      searchTarget: SearchTarget.EXACT_MATCH_FOR_TAGS,
    })
    expect(capturedTarget).toBe('exact_match_for_tags')
  })
})

describe('RankingMode used as API param', () => {
  it('passes mode to illusts.ranking', async () => {
    let capturedMode: string | null = null
    stubAuth()
    server.use(
      http.get(
        'https://app-api.pixiv.net/v1/illust/ranking',
        ({ request }) => {
          capturedMode = new URL(request.url).searchParams.get('mode')
          return HttpResponse.json({ illusts: [], next_url: null })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.illusts.ranking({ mode: RankingMode.WEEK })
    expect(capturedMode).toBe('week')
  })
})

describe('OSFilter used as API param', () => {
  it('passes filter to illusts.detail', async () => {
    let capturedFilter: string | null = null
    stubAuth()
    server.use(
      http.get(
        'https://app-api.pixiv.net/v1/illust/detail',
        ({ request }) => {
          capturedFilter = new URL(request.url).searchParams.get('filter')
          return HttpResponse.json({
            illust: {
              id: 1,
              title: 'T',
              type: 'illust',
              image_urls: {
                square_medium: '',
                medium: '',
                large: '',
              },
              caption: '',
              restrict: 0,
              user: {
                id: 1,
                name: 'A',
                account: 'a',
                profile_image_urls: { medium: '' },
              },
              tags: [],
              tools: [],
              create_date: '2024-01-01T00:00:00+09:00',
              page_count: 1,
              width: 100,
              height: 100,
              sanity_level: 2,
              x_restrict: 0,
              series: null,
              meta_single_page: { original_image_url: '' },
              meta_pages: [],
              total_view: 0,
              total_bookmarks: 0,
              is_bookmarked: false,
              visible: true,
              is_muted: false,
              illust_ai_type: 0,
              illust_book_style: 0,
            },
          })
        }
      )
    )
    const client = await PixivClient.of('test-refresh-token')
    await client.illusts.detail({ illustId: 1, filter: OSFilter.FOR_ANDROID })
    expect(capturedFilter).toBe('for_android')
  })
})
