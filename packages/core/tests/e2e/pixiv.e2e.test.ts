/**
 * End-to-end tests for PixivClient against the real pixiv API.
 *
 * These tests require a valid PIXIV_REFRESH_TOKEN environment variable.
 * They are skipped automatically when the token is not present, so they
 * never block CI runs that do not have the secret configured.
 *
 * Run manually:
 *   PIXIV_REFRESH_TOKEN=<token> pnpm --filter @book000/pixivts run test:e2e
 */

import fs from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { PixivClient } from '../../src/client'

// ---------------------------------------------------------------------------
// Environment / skip guard
// ---------------------------------------------------------------------------

/** Load token from .env file if present, then from environment. */
function loadToken(): string | undefined {
  if (fs.existsSync('.env')) {
    for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      const value = line.slice(eq + 1).trim()
      if (key === 'PIXIV_REFRESH_TOKEN' && value) return value
    }
  }
  return process.env.PIXIV_REFRESH_TOKEN
}

const REFRESH_TOKEN = loadToken()
const SKIP = !REFRESH_TOKEN

// ---------------------------------------------------------------------------
// Test constants (stable public content)
// ---------------------------------------------------------------------------

/** A published illust (type: illust) used for stable assertions. */
const ILLUST_ID = 107_565_629
/** A published illust (type: manga) used for stable assertions. */
const MANGA_ID = 103_905_962
/** A published ugoira used for stable assertions. */
const UGOIRA_ID = 83_638_393
/** A published novel used for stable assertions. */
const NOVEL_ID = 13_574_875
/** An illust series used for stable assertions. */
const ILLUST_SERIES_ID = 147_483
/** pixiv staff account (ID: 11) — always exists, safe for follow tests. */
const STAFF_USER_ID = 11

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe.skipIf(SKIP)('PixivClient e2e', () => {
  let client: PixivClient

  beforeAll(async () => {
    // REFRESH_TOKEN is guaranteed non-empty here because of .skipIf(SKIP) above
    client = await PixivClient.of(REFRESH_TOKEN ?? '')
  })

  // -------------------------------------------------------------------------
  // Illusts
  // -------------------------------------------------------------------------

  it('illusts.detail — illust type', async () => {
    const result = await client.illusts.detail({ illustId: ILLUST_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    const { illust } = result.value
    expect(illust.id).toBe(ILLUST_ID)
    expect(illust.type).toBe('illust')
    expect(illust.user.id).toBe(16_668_308)
    expect(illust.page_count).toBe(1)
    expect(illust.tags.length).toBeGreaterThan(0)
    expect(illust.image_urls.square_medium).toMatch(
      /^https:\/\/i\.pximg\.net\/.+\.jpg$/
    )
    expect(illust.total_bookmarks).toBeGreaterThan(0)
    expect(illust.total_view).toBeGreaterThan(0)
  })

  it('illusts.detail — manga type', async () => {
    const result = await client.illusts.detail({ illustId: MANGA_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    const { illust } = result.value
    expect(illust.id).toBe(MANGA_ID)
    expect(illust.type).toBe('manga')
    expect(illust.page_count).toBeGreaterThan(1)
    expect(illust.meta_pages.length).toBeGreaterThan(1)
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
    expect(result.value.illust_series_detail.title.length).toBeGreaterThan(0)
    expect(result.value.illusts.length).toBeGreaterThan(0)
  })

  it('illusts.bookmarkAdd and illusts.bookmarkDelete', async () => {
    // Check current state before mutating
    const detailResult = await client.illusts.detail({ illustId: ILLUST_ID })
    expect(detailResult.isOk).toBe(true)
    if (!detailResult.isOk) return
    const wasBookmarked = detailResult.value.illust.is_bookmarked

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

  // -------------------------------------------------------------------------
  // Manga
  // -------------------------------------------------------------------------

  it('manga.recommended', async () => {
    const result = await client.manga.recommended({})
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.illusts.length).toBeGreaterThan(0)
  })

  // -------------------------------------------------------------------------
  // Ugoira
  // -------------------------------------------------------------------------

  it('ugoira.metadata', async () => {
    const result = await client.ugoira.metadata({ illustId: UGOIRA_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.ugoira_metadata.zip_urls.medium).toMatch(
      /^https:\/\/i\.pximg\.net\/img-zip-ugoira\/img\/.+_ugoira600x600\.zip$/
    )
    expect(result.value.ugoira_metadata.frames.length).toBeGreaterThan(0)
  })

  // -------------------------------------------------------------------------
  // Novels
  // -------------------------------------------------------------------------

  it('novels.detail', async () => {
    const result = await client.novels.detail({ novelId: NOVEL_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.novel.id).toBe(NOVEL_ID)
    expect(result.value.novel.title.length).toBeGreaterThan(0)
    expect(result.value.novel.page_count).toBeGreaterThan(0)
  })

  it('novels.text', async () => {
    const result = await client.novels.text({ novelId: NOVEL_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    // novels.text returns the raw novel text as a string
    expect(result.value.length).toBeGreaterThan(0)
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
    // Derive the series ID from the test novel to avoid hardcoding an ID that may become stale.
    const detailResult = await client.novels.detail({ novelId: NOVEL_ID })
    expect(detailResult.isOk).toBe(true)
    if (!detailResult.isOk) return

    const seriesInfo = detailResult.value.novel.series
    if (!('id' in seriesInfo)) {
      // NOVEL_ID must belong to a series for this test to be meaningful.
      // If this assertion fails, update NOVEL_ID to a novel that is part of a series.
      throw new Error(
        `NOVEL_ID ${NOVEL_ID} does not belong to a series. ` +
          'Update the NOVEL_ID constant to a novel that belongs to a series.'
      )
    }
    const seriesId = seriesInfo.id

    const result = await client.novels.series({ seriesId })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.novel_series_detail.id).toBe(seriesId)
    expect(result.value.novels.length).toBeGreaterThan(0)
  })

  it('novels.bookmarkAdd and novels.bookmarkDelete', async () => {
    const detailResult = await client.novels.detail({ novelId: NOVEL_ID })
    expect(detailResult.isOk).toBe(true)
    if (!detailResult.isOk) return
    const wasBookmarked = detailResult.value.novel.is_bookmarked

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

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  it('users.detail', async () => {
    const result = await client.users.detail({ userId: STAFF_USER_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.user.id).toBe(STAFF_USER_ID)
    expect(result.value.user.name.length).toBeGreaterThan(0)
    expect(result.value.profile).toBeDefined()
  })

  it('users.illusts', async () => {
    const result = await client.users.illusts({ userId: STAFF_USER_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    // The pixiv staff account may have no illusts; just check the shape.
    expect(Array.isArray(result.value.illusts)).toBe(true)
  })

  it('users.novels', async () => {
    const result = await client.users.novels({ userId: STAFF_USER_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.novels)).toBe(true)
  })

  it('users.following', async () => {
    const result = await client.users.following({
      userId: STAFF_USER_ID,
      restrict: 'public',
    })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.user_previews)).toBe(true)
  })

  it('users.bookmarks.illusts', async () => {
    const result = await client.users.bookmarks.illusts({
      userId: STAFF_USER_ID,
      restrict: 'public',
    })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.illusts)).toBe(true)
  })

  it('users.bookmarks.novels', async () => {
    const result = await client.users.bookmarks.novels({
      userId: STAFF_USER_ID,
      restrict: 'public',
    })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.novels)).toBe(true)
  })

  it('users.followAdd and users.followDelete', async () => {
    const detailResult = await client.users.detail({ userId: STAFF_USER_ID })
    expect(detailResult.isOk).toBe(true)
    if (!detailResult.isOk) return
    const wasFollowed = detailResult.value.user.is_followed ?? false

    try {
      if (wasFollowed) {
        const del = await client.users.followDelete({ userId: STAFF_USER_ID })
        expect(del.isOk).toBe(true)
        const add = await client.users.followAdd({
          userId: STAFF_USER_ID,
          restrict: 'public',
        })
        expect(add.isOk).toBe(true)
      } else {
        const add = await client.users.followAdd({
          userId: STAFF_USER_ID,
          restrict: 'public',
        })
        expect(add.isOk).toBe(true)
        const del = await client.users.followDelete({ userId: STAFF_USER_ID })
        expect(del.isOk).toBe(true)
      }
    } finally {
      await (wasFollowed
        ? client.users.followAdd({
            userId: STAFF_USER_ID,
            restrict: 'public',
          })
        : client.users.followDelete({ userId: STAFF_USER_ID }))
    }
  })

  // -------------------------------------------------------------------------
  // Images
  // -------------------------------------------------------------------------

  it('images.fetch', async () => {
    // Fetch a known user avatar (small CDN image).
    const detailResult = await client.users.detail({ userId: STAFF_USER_ID })
    expect(detailResult.isOk).toBe(true)
    if (!detailResult.isOk) return
    const avatarUrl = detailResult.value.user.profile_image_urls.medium

    // images.fetch returns ResultAsync<Response, PixivError>
    const imgResult = await client.images.fetch(avatarUrl)
    expect(imgResult.isOk).toBe(true)
    if (!imgResult.isOk) return
    expect(imgResult.value.ok).toBe(true)
    expect(imgResult.value.status).toBe(200)
  })

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------

  it('PaginatedResultAsync.pages() — iterates at least one page', async () => {
    let pageCount = 0
    let totalIllusts = 0
    for await (const page of client.illusts
      .search({ word: 'ホロライブ' })
      .pages()) {
      pageCount++
      totalIllusts += page.illusts.length
      if (pageCount >= 2) break
    }
    expect(pageCount).toBeGreaterThanOrEqual(1)
    expect(totalIllusts).toBeGreaterThan(0)
  })

  it('PaginatedResultAsync.items() — yields individual items', async () => {
    const illusts: unknown[] = []
    for await (const illust of client.illusts
      .search({ word: 'ホロライブ' })
      .items()) {
      illusts.push(illust)
      if (illusts.length >= 60) break // stop after ~2 pages
    }
    expect(illusts.length).toBeGreaterThan(0)
  })
})
