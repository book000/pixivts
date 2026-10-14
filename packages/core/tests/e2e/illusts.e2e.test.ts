import { beforeAll, describe, expect, it } from 'vitest'
import { PixivClient } from '../../src/client'
import { REFRESH_TOKEN, SKIP } from './helpers'

/** A published illust (type: illust) used for stable assertions. */
const ILLUST_ID = 107_565_629
/** A published illust (type: manga) used for stable assertions. */
const MANGA_ID = 103_905_962
/** An illust series used for stable assertions. */
const ILLUST_SERIES_ID = 147_483

describe.skipIf(SKIP)('PixivClient e2e — illusts', () => {
  let client: PixivClient

  beforeAll(async () => {
    // REFRESH_TOKEN is guaranteed non-empty here because of .skipIf(SKIP) above
    client = await PixivClient.of(REFRESH_TOKEN ?? '')
  })

  it('illusts.detail — illust type', async () => {
    const result = await client.illusts.detail({ illustId: ILLUST_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    const { illust } = result.value
    expect(illust.id).toBe(ILLUST_ID)
    expect(illust.type).toBe('illust')
    expect(illust.user.id).toBe(16_668_308)
    expect(illust.pageCount).toBe(1)
    expect(illust.tags.length).toBeGreaterThan(0)
    expect(illust.imageUrls.squareMedium).toMatch(
      /^https:\/\/i\.pximg\.net\/.+\.jpg$/
    )
    expect(illust.totalBookmarks).toBeGreaterThan(0)
    expect(illust.totalView).toBeGreaterThan(0)
  })

  it('illusts.detail — manga type', async () => {
    const result = await client.illusts.detail({ illustId: MANGA_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    const { illust } = result.value
    expect(illust.id).toBe(MANGA_ID)
    expect(illust.type).toBe('manga')
    expect(illust.pageCount).toBeGreaterThan(1)
    expect(illust.metaPages.length).toBeGreaterThan(1)
  })

  it('illusts.related', async () => {
    const result = await client.illusts.related({ illustId: ILLUST_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.illusts.length).toBeGreaterThan(0)
  })

  it('illusts.related — with seedIllustIds filter', async () => {
    const result = await client.illusts.related({
      illustId: ILLUST_ID,
      seedIllustIds: [ILLUST_ID],
    })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.illusts.length).toBeGreaterThan(0)
  })

  it('illusts.search', async () => {
    const result = await client.illusts.search({ word: 'ホロライブ' })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.illusts.length).toBeGreaterThan(0)
  })

  it('illusts.ranking', async () => {
    const result = await client.illusts.ranking({})
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.illusts.length).toBeGreaterThan(0)
  })

  it('illusts.recommended', async () => {
    const result = await client.illusts.recommended({})
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.illusts.length).toBeGreaterThan(0)
  })

  it('illusts.series', async () => {
    const result = await client.illusts.series({
      illustSeriesId: ILLUST_SERIES_ID,
    })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.illustSeriesDetail.title.length).toBeGreaterThan(0)
    expect(result.value.illusts.length).toBeGreaterThan(0)
  })

  it('illusts.bookmarkAdd and illusts.bookmarkDelete', async () => {
    // Check current state before mutating
    const detailResult = await client.illusts.detail({ illustId: ILLUST_ID })
    expect(detailResult.isOk).toBe(true)
    if (!detailResult.isOk) return
    const wasBookmarked = detailResult.value.illust.isBookmarked

    try {
      if (wasBookmarked) {
        // delete then re-add to verify both operations work
        const del = await client.illusts.bookmarkDelete({
          illustId: ILLUST_ID,
        })
        expect(del.isOk).toBe(true)
        const add = await client.illusts.bookmarkAdd({
          illustId: ILLUST_ID,
          restrict: 'public',
          tags: ['テスト'],
        })
        expect(add.isOk).toBe(true)
      } else {
        // add then delete to verify both operations work
        const add = await client.illusts.bookmarkAdd({
          illustId: ILLUST_ID,
          restrict: 'public',
          tags: ['テスト'],
        })
        expect(add.isOk).toBe(true)
        const del = await client.illusts.bookmarkDelete({
          illustId: ILLUST_ID,
        })
        expect(del.isOk).toBe(true)
      }
    } finally {
      // Restore original state
      await (wasBookmarked
        ? client.illusts.bookmarkAdd({
            illustId: ILLUST_ID,
            restrict: 'public',
            tags: [],
          })
        : client.illusts.bookmarkDelete({ illustId: ILLUST_ID }))
    }
  })

  it('illusts.follow', async () => {
    const result = await client.illusts.follow({ restrict: 'public' })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.illusts)).toBe(true)
  })

  it('illusts.comments', async () => {
    const result = await client.illusts.comments({ illustId: ILLUST_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.comments)).toBe(true)
    for (const comment of result.value.comments) {
      expect(typeof comment.id).toBe('number')
      if (!comment.stamp) continue
      expect(typeof comment.stamp.stampId).toBe('number')
      expect(typeof comment.stamp.stampUrl).toBe('string')
    }
  })

  it('illusts.commentReplies', async () => {
    const comments = await client.illusts.comments({ illustId: ILLUST_ID })
    expect(comments.isOk).toBe(true)
    if (!comments.isOk) return
    const parent = comments.value.comments.find((c) => c.hasReplies)
    if (!parent) return
    const result = await client.illusts.commentReplies({
      commentId: parent.id,
    })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.comments)).toBe(true)
  })

  it('illusts.bookmarkDetail', async () => {
    const result = await client.illusts.bookmarkDetail({
      illustId: ILLUST_ID,
    })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(typeof result.value.bookmarkDetail.isBookmarked).toBe('boolean')
    expect(Array.isArray(result.value.bookmarkDetail.tags)).toBe(true)
  })

  it('illusts.new', async () => {
    const result = await client.illusts.new({})
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.illusts.length).toBeGreaterThan(0)
  })

  it('illusts.trendingTags', async () => {
    const result = await client.illusts.trendingTags()
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.trendTags.length).toBeGreaterThan(0)
    expect(result.value.trendTags[0].tag.length).toBeGreaterThan(0)
    expect(result.value.trendTags[0].illust.id).toBeGreaterThan(0)
  })
})
