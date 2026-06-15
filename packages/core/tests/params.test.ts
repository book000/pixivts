import { describe, expect, it } from 'vitest'
import { buildParams, buildSearchParams, camelToSnake, toSnakeKeys } from '../src/params'

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
