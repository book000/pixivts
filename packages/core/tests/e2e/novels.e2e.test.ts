import { beforeAll, describe, expect, it } from 'vitest'
import { PixivClient } from '../../src/client'
import { REFRESH_TOKEN, SKIP } from './helpers'

/** A published novel used for stable assertions. */
const NOVEL_ID = 13_574_875
/**
 * A novel series used for stable assertions.
 * Title: FGO夢まとめ (series ID 1458483, 58+ works, active since 2018)
 */
const NOVEL_SERIES_ID = 1_458_483

describe.skipIf(SKIP)('PixivClient e2e — novels', () => {
  let client: PixivClient

  beforeAll(async () => {
    client = await PixivClient.of(REFRESH_TOKEN ?? '')
  })

  it('novels.detail', async () => {
    const result = await client.novels.detail({ novelId: NOVEL_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.novel.id).toBe(NOVEL_ID)
    expect(result.value.novel.title.length).toBeGreaterThan(0)
    expect(result.value.novel.pageCount).toBeGreaterThan(0)
  })

  it('novels.text', async () => {
    const result = await client.novels.text({ novelId: NOVEL_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.id).toBe(String(NOVEL_ID))
    expect(result.value.text.length).toBeGreaterThan(0)
  })

  it('novels.related', async () => {
    const result = await client.novels.related({ novelId: NOVEL_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.novels.length).toBeGreaterThan(0)
  })

  it('novels.ranking', async () => {
    const result = await client.novels.ranking({})
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.novels.length).toBeGreaterThan(0)
  })

  it('novels.search', async () => {
    const result = await client.novels.search({ word: 'ホロライブ' })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.novels.length).toBeGreaterThan(0)
  })

  it('novels.recommended', async () => {
    const result = await client.novels.recommended({})
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.novels.length).toBeGreaterThan(0)
  })

  it('novels.series', async () => {
    const result = await client.novels.series({ seriesId: NOVEL_SERIES_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.novelSeriesDetail.id).toBe(NOVEL_SERIES_ID)
    expect(result.value.novels.length).toBeGreaterThan(0)
  })

  it('novels.bookmarkAdd and novels.bookmarkDelete', async () => {
    const detailResult = await client.novels.detail({ novelId: NOVEL_ID })
    expect(detailResult.isOk).toBe(true)
    if (!detailResult.isOk) return
    const wasBookmarked = detailResult.value.novel.isBookmarked

    try {
      if (wasBookmarked) {
        const del = await client.novels.bookmarkDelete({ novelId: NOVEL_ID })
        expect(del.isOk).toBe(true)
        const add = await client.novels.bookmarkAdd({
          novelId: NOVEL_ID,
          restrict: 'public',
          tags: ['テスト'],
        })
        expect(add.isOk).toBe(true)
      } else {
        const add = await client.novels.bookmarkAdd({
          novelId: NOVEL_ID,
          restrict: 'public',
          tags: ['テスト'],
        })
        expect(add.isOk).toBe(true)
        const del = await client.novels.bookmarkDelete({ novelId: NOVEL_ID })
        expect(del.isOk).toBe(true)
      }
    } finally {
      await (wasBookmarked
        ? client.novels.bookmarkAdd({
            novelId: NOVEL_ID,
            restrict: 'public',
            tags: [],
          })
        : client.novels.bookmarkDelete({ novelId: NOVEL_ID }))
    }
  })

  it('novels.follow', async () => {
    const result = await client.novels.follow({ restrict: 'public' })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.novels)).toBe(true)
  })

  it('novels.follow with restrict=private', async () => {
    const result = await client.novels.follow({ restrict: 'private' })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.novels)).toBe(true)
  })

  it('novels.follow with offset', async () => {
    const result = await client.novels.follow({ restrict: 'public', offset: 1 })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.novels)).toBe(true)
  })

  it('novels.comments', async () => {
    const result = await client.novels.comments({
      novelId: NOVEL_ID,
      includeTotalComments: true,
    })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.comments)).toBe(true)
    expect(typeof result.value.totalComments).toBe('number')
    if (result.value.commentAccessControl !== undefined) {
      expect(typeof result.value.commentAccessControl).toBe('number')
    }
    if (result.value.comments.length > 0) {
      const [comment] = result.value.comments
      expect(typeof comment.id).toBe('number')
      expect(typeof comment.comment).toBe('string')
      expect(typeof comment.date).toBe('string')
      expect(typeof comment.user.id).toBe('number')
    }
  })

  it('novels.comments with offset', async () => {
    const result = await client.novels.comments({
      novelId: NOVEL_ID,
      offset: 1,
    })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.comments)).toBe(true)
  })

  it('novels.new', async () => {
    const result = await client.novels.new({})
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.novels.length).toBeGreaterThan(0)
  })

  it('novels.new resumes pagination via the maxNovelId cursor', async () => {
    const first = await client.novels.new({})
    expect(first.isOk).toBe(true)
    if (!first.isOk) return
    expect(first.value.novels.length).toBeGreaterThan(0)
    if (first.value.nextUrl === null) return // no further pages to resume

    // `next_url` embeds `max_novel_id`, but `ParsedNextUrl` does not expose
    // it as a typed field — extract it manually from the raw URL.
    const maxNovelId = Number(
      new URL(first.value.nextUrl).searchParams.get('max_novel_id')
    )
    expect(Number.isNaN(maxNovelId)).toBe(false)

    const second = await client.novels.new({ maxNovelId })
    expect(second.isOk).toBe(true)
    if (!second.isOk) return
    expect(second.value.novels.length).toBeGreaterThan(0)
  })
})
