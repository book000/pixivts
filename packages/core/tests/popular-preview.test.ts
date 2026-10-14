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

const BASE = 'https://app-api.pixiv.net'

/** Registers auth plus one GET handler, and returns a getter for the captured query. */
function mockGet(path: string, body: unknown, status = 200) {
  const captured: { url?: string } = {}
  server.use(
    http.post('https://oauth.secure.pixiv.net/auth/token', () =>
      HttpResponse.json(AUTH_RESPONSE)
    ),
    http.get(`${BASE}${path}`, ({ request }) => {
      captured.url = request.url
      return HttpResponse.json(body as Record<string, unknown>, { status })
    })
  )
  return () => new URL(captured.url ?? 'https://invalid.example')
}

describe('novels.trendingTags()', () => {
  it('requests the endpoint without a query and maps camelCase', async () => {
    const url = mockGet('/v1/trending-tags/novel', {
      trend_tags: [{ tag: 'cat', translated_name: 'Cat', illust: { id: 1 } }],
    })
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.trendingTags()
    expect(url().search).toBe('')
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.trendTags[0].tag).toBe('cat')
    expect(result.value.trendTags[0].translatedName).toBe('Cat')
  })

  it('returns Err on a server error', async () => {
    mockGet('/v1/trending-tags/novel', {}, 500)
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.trendingTags()
    expect(result.isOk).toBe(false)
  })
})

describe('illusts.popularPreview()', () => {
  const body = { illusts: [{ id: 1 }], search_span_limit: 1000 }

  it('sends defaults and omits optional params', async () => {
    const url = mockGet('/v1/search/popular-preview/illust', body)
    const client = await PixivClient.of('test-refresh-token')
    await client.illusts.popularPreview({ word: 'cat' })
    const params = url().searchParams
    expect(params.get('word')).toBe('cat')
    expect(params.get('search_target')).toBe('partial_match_for_tags')
    expect(params.get('filter')).toBe('for_ios')
    for (const k of [
      'search_ai_type',
      'include_translated_tag_results',
      'merge_plain_keyword_results',
    ])
      expect(params.has(k)).toBe(false)
  })

  it('sends optional params as snake_case', async () => {
    const url = mockGet('/v1/search/popular-preview/illust', body)
    const client = await PixivClient.of('test-refresh-token')
    await client.illusts.popularPreview({
      word: 'cat',
      searchTarget: 'exact_match_for_tags',
      searchAiType: 1,
      includeTranslatedTagResults: true,
      mergePlainKeywordResults: false,
      filter: 'for_android',
    })
    const params = url().searchParams
    expect(params.get('search_target')).toBe('exact_match_for_tags')
    expect(params.get('search_ai_type')).toBe('1')
    expect(params.get('include_translated_tag_results')).toBe('true')
    expect(params.get('merge_plain_keyword_results')).toBe('false')
    expect(params.get('filter')).toBe('for_android')
  })

  it('maps the response to camelCase', async () => {
    mockGet('/v1/search/popular-preview/illust', body)
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.illusts.popularPreview({ word: 'cat' })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.illusts).toHaveLength(1)
    expect(result.value.searchSpanLimit).toBe(1000)
  })
})

describe('novels.popularPreview()', () => {
  const body = { novels: [{ id: 1 }], search_span_limit: 1000 }

  it('sends defaults without filter or optional params', async () => {
    const url = mockGet('/v1/search/popular-preview/novel', body)
    const client = await PixivClient.of('test-refresh-token')
    await client.novels.popularPreview({ word: 'cat' })
    const params = url().searchParams
    expect(params.get('word')).toBe('cat')
    expect(params.get('search_target')).toBe('partial_match_for_tags')
    for (const k of [
      'filter',
      'search_ai_type',
      'include_translated_tag_results',
      'merge_plain_keyword_results',
    ])
      expect(params.has(k)).toBe(false)
  })

  it('sends optional params as snake_case', async () => {
    const url = mockGet('/v1/search/popular-preview/novel', body)
    const client = await PixivClient.of('test-refresh-token')
    await client.novels.popularPreview({
      word: 'cat',
      searchAiType: 0,
      includeTranslatedTagResults: true,
      mergePlainKeywordResults: true,
    })
    const params = url().searchParams
    expect(params.get('search_ai_type')).toBe('0')
    expect(params.get('include_translated_tag_results')).toBe('true')
    expect(params.get('merge_plain_keyword_results')).toBe('true')
    expect(params.has('filter')).toBe(false)
  })

  it('maps the response to camelCase', async () => {
    mockGet('/v1/search/popular-preview/novel', body)
    const client = await PixivClient.of('test-refresh-token')
    const result = await client.novels.popularPreview({ word: 'cat' })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.novels).toHaveLength(1)
    expect(result.value.searchSpanLimit).toBe(1000)
  })
})
