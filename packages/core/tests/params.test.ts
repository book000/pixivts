import { describe, expect, it } from 'vitest'
import {
  buildParams,
  buildSearchParams,
  camelToSnake,
  camelizeKeys,
  parseNextUrl,
  snakeToCamel,
  toSnakeKeys,
} from '../src/params'

describe('camelToSnake()', () => {
  it('converts a single uppercase letter', () => {
    expect(camelToSnake('illustId')).toBe('illust_id')
  })

  it('converts multiple uppercase letters', () => {
    expect(camelToSnake('searchAiType')).toBe('search_ai_type')
  })

  it('leaves already-snake strings unchanged', () => {
    expect(camelToSnake('word')).toBe('word')
  })

  it('handles leading uppercase (PascalCase)', () => {
    expect(camelToSnake('UserId')).toBe('_user_id')
  })
})

describe('toSnakeKeys()', () => {
  it('converts all keys to snake_case', () => {
    expect(toSnakeKeys({ illustId: 1, searchTarget: 'a' })).toEqual({
      illust_id: 1,
      search_target: 'a',
    })
  })

  it('preserves values unchanged', () => {
    const obj = { maxBookmarkId: undefined, tag: 'test' }
    const result = toSnakeKeys(obj)
    expect(result.max_bookmark_id).toBeUndefined()
    expect(result.tag).toBe('test')
  })
})

describe('buildSearchParams()', () => {
  it('serialises strings and numbers', () => {
    const usp = buildSearchParams({ word: 'hello', offset: 30 })
    expect(usp.get('word')).toBe('hello')
    expect(usp.get('offset')).toBe('30')
  })

  it('skips null and undefined', () => {
    const usp = buildSearchParams({ a: null, b: undefined, c: 'x' })
    expect(usp.has('a')).toBe(false)
    expect(usp.has('b')).toBe(false)
    expect(usp.get('c')).toBe('x')
  })

  it('serialises booleans', () => {
    const usp = buildSearchParams({ flag: true, other: false })
    expect(usp.get('flag')).toBe('true')
    expect(usp.get('other')).toBe('false')
  })

  it('appends array values with bracket suffix (Rails/pixiv convention)', () => {
    const usp = buildSearchParams({ ids: [1, 2, 3] })
    // pixiv API expects key[]=value1&key[]=value2, not key=value1&key=value2
    expect(usp.getAll('ids[]')).toEqual(['1', '2', '3'])
    expect(usp.has('ids')).toBe(false)
  })

  it('appends string arrays with bracket suffix', () => {
    const usp = buildSearchParams({ tags: ['a', 'b'] })
    expect(usp.getAll('tags[]')).toEqual(['a', 'b'])
  })
})

describe('buildParams()', () => {
  it('converts keys to snake_case and builds URLSearchParams', () => {
    const usp = buildParams({ illustId: 12_345, filter: 'for_ios' })
    expect(usp.get('illust_id')).toBe('12345')
    expect(usp.get('filter')).toBe('for_ios')
  })

  it('converts camelCase array keys to snake_case with bracket suffix', () => {
    const usp = buildParams({ seedIllustIds: [1, 2, 3] })
    // camelCase → snake_case: seedIllustIds → seed_illust_ids
    // array → bracket suffix: seed_illust_ids → seed_illust_ids[]
    expect(usp.getAll('seed_illust_ids[]')).toEqual(['1', '2', '3'])
    expect(usp.has('seed_illust_ids')).toBe(false)
    expect(usp.has('seedIllustIds')).toBe(false)
  })

  it('converts camelCase string array keys (tags) to snake_case with bracket suffix', () => {
    const usp = buildParams({ tags: ['foo', 'bar'] })
    expect(usp.getAll('tags[]')).toEqual(['foo', 'bar'])
    expect(usp.has('tags')).toBe(false)
  })
})

describe('parseNextUrl()', () => {
  it('extracts offset', () => {
    const result = parseNextUrl(
      'https://app-api.pixiv.net/v1/search/illust?word=cat&offset=30'
    )
    expect(result.offset).toBe(30)
    expect(result.maxBookmarkId).toBeUndefined()
  })

  it('extracts max_bookmark_id', () => {
    const result = parseNextUrl(
      'https://app-api.pixiv.net/v1/user/bookmarks/illust?user_id=1&max_bookmark_id=99999'
    )
    expect(result.maxBookmarkId).toBe(99_999)
    expect(result.offset).toBeUndefined()
  })

  it('extracts last_order', () => {
    const result = parseNextUrl(
      'https://app-api.pixiv.net/v2/novel/series?series_id=1&last_order=10'
    )
    expect(result.lastOrder).toBe(10)
  })

  it('extracts max_bookmark_id_for_recommend and min_bookmark_id_for_recent_illust', () => {
    const result = parseNextUrl(
      'https://app-api.pixiv.net/v1/illust/recommended?max_bookmark_id_for_recommend=888&min_bookmark_id_for_recent_illust=777'
    )
    expect(result.maxBookmarkIdForRecommend).toBe(888)
    expect(result.minBookmarkIdForRecentIllust).toBe(777)
  })

  it('returns an empty object when no cursor params are present', () => {
    const result = parseNextUrl('https://app-api.pixiv.net/v1/illust/ranking?filter=for_ios')
    expect(result).toEqual({})
  })

  it('returns numeric values, not strings', () => {
    const result = parseNextUrl(
      'https://app-api.pixiv.net/v1/search/illust?offset=60'
    )
    expect(typeof result.offset).toBe('number')
  })

  it('returns undefined for non-numeric cursor params', () => {
    const result = parseNextUrl(
      'https://app-api.pixiv.net/v1/search/illust?offset=abc&max_bookmark_id='
    )
    expect(result.offset).toBeUndefined()
    expect(result.maxBookmarkId).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// snakeToCamel
// ---------------------------------------------------------------------------

describe('snakeToCamel()', () => {
  it('converts snake_case to camelCase', () => {
    expect(snakeToCamel('image_urls')).toBe('imageUrls')
    expect(snakeToCamel('x_restrict')).toBe('xRestrict')
    expect(snakeToCamel('create_date')).toBe('createDate')
    expect(snakeToCamel('profile_image_urls')).toBe('profileImageUrls')
    expect(snakeToCamel('illust_ai_type')).toBe('illustAiType')
  })

  it('leaves already-camelCase keys unchanged (idempotent)', () => {
    expect(snakeToCamel('imageUrls')).toBe('imageUrls')
    expect(snakeToCamel('xRestrict')).toBe('xRestrict')
    expect(snakeToCamel('title')).toBe('title')
    expect(snakeToCamel('id')).toBe('id')
  })

  it('handles single-word keys', () => {
    expect(snakeToCamel('title')).toBe('title')
    expect(snakeToCamel('id')).toBe('id')
    expect(snakeToCamel('user')).toBe('user')
  })
})

// ---------------------------------------------------------------------------
// camelizeKeys
// ---------------------------------------------------------------------------

describe('camelizeKeys()', () => {
  it('converts top-level object keys', () => {
    expect(camelizeKeys({ image_urls: 'x', create_date: 'y' })).toEqual({
      imageUrls: 'x',
      createDate: 'y',
    })
  })

  it('recursively converts nested object keys', () => {
    expect(
      camelizeKeys({
        user: { profile_image_urls: { square_medium: 'url' } },
      })
    ).toEqual({
      user: { profileImageUrls: { squareMedium: 'url' } },
    })
  })

  it('recursively converts keys inside arrays', () => {
    expect(
      camelizeKeys([
        { image_urls: { square_medium: 'a' } },
        { image_urls: { square_medium: 'b' } },
      ])
    ).toEqual([
      { imageUrls: { squareMedium: 'a' } },
      { imageUrls: { squareMedium: 'b' } },
    ])
  })

  it('passes through primitives and null unchanged', () => {
    expect(camelizeKeys(null)).toBeNull()
    expect(camelizeKeys(42)).toBe(42)
    expect(camelizeKeys('hello')).toBe('hello')
    expect(camelizeKeys(true)).toBe(true)
  })

  it('is idempotent on already-camelCase keys', () => {
    const input = { imageUrls: { squareMedium: 'url' } }
    expect(camelizeKeys(input)).toEqual(input)
  })

  it('converts dynamic map keys uniformly', () => {
    expect(
      camelizeKeys({ user_message_details: { error_code: 123 } })
    ).toEqual({ userMessageDetails: { errorCode: 123 } })
  })
})
