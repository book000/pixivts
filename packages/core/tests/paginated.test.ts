import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from './msw/handlers'
import { AuthManager } from '../src/auth'
import { HttpClient } from '../src/http'
import { PaginatedResultAsync, failedPaginated } from '../src/paginated'
import type { PagedResponse } from '../src/paginated'
import { apiError } from '../src/errors'
import { ResultAsync } from '../src/result'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

interface Item {
  id: number
  title: string
}

interface ItemPage extends PagedResponse {
  items: Item[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAuth(): AuthManager {
  return new AuthManager({ userId: '1', accessToken: 'token', refreshToken: 'rt' })
}

function makeHttp(): HttpClient {
  return new HttpClient(makeAuth(), { retry: { maxRetries: 0, waitMs: 0 } })
}

const BASE = 'https://app-api.pixiv.net'

// ---------------------------------------------------------------------------
// Single page
// ---------------------------------------------------------------------------

describe('PaginatedResultAsync — single page', () => {
  it('awaiting returns Ok(firstPage)', async () => {
    const http_ = makeHttp()
    server.use(
      http.get(`${BASE}/v1/p-single-await`, () =>
        HttpResponse.json({
          items: [{ id: 1, title: 'a' }],
          next_url: null,
        } satisfies ItemPage)
      )
    )

    const firstPage = http_.get<ItemPage>('/v1/p-single-await')
    const paginated = PaginatedResultAsync.fromResultAsync(
      firstPage,
      http_,
      (page) => page.items
    )

    const result = await paginated
    expect(result.isOk).toBe(true)
    if (result.isOk) {
      expect(result.value.items).toHaveLength(1)
      expect(result.value.items[0].id).toBe(1)
    }
  })

  it('pages() yields the single page then stops', async () => {
    const http_ = makeHttp()
    server.use(
      http.get(`${BASE}/v1/p-single-pages`, () =>
        HttpResponse.json({
          items: [{ id: 1, title: 'a' }],
          next_url: null,
        } satisfies ItemPage)
      )
    )

    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/p-single-pages'),
      http_,
      (page) => page.items
    )

    const collected: ItemPage[] = []
    for await (const page of paginated.pages()) {
      collected.push(page)
    }
    expect(collected).toHaveLength(1)
    expect(collected[0].items[0].id).toBe(1)
  })

  it('items() yields all items from the single page', async () => {
    const http_ = makeHttp()
    server.use(
      http.get(`${BASE}/v1/p-single-items`, () =>
        HttpResponse.json({
          items: [
            { id: 1, title: 'a' },
            { id: 2, title: 'b' },
          ],
          next_url: null,
        } satisfies ItemPage)
      )
    )

    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/p-single-items'),
      http_,
      (page) => page.items
    )

    const collected: Item[] = []
    for await (const item of paginated.items()) {
      collected.push(item)
    }
    expect(collected).toHaveLength(2)
    expect(collected.map((i) => i.id)).toEqual([1, 2])
  })
})

// ---------------------------------------------------------------------------
// Multi-page next_url chaining
//
// MSW v2 matches routes by path, ignoring query parameters.
// To avoid handler collisions, each page is served from a distinct path.
// ---------------------------------------------------------------------------

describe('PaginatedResultAsync — multiple pages', () => {
  it('pages() follows next_url across three pages', async () => {
    const http_ = makeHttp()

    // Register each page at a distinct path
    server.use(
      http.get(`${BASE}/v1/multi-p1`, () =>
        HttpResponse.json({
          items: [{ id: 1, title: 'p1' }],
          next_url: `${BASE}/v1/multi-p2`,
        } satisfies ItemPage)
      ),
      http.get(`${BASE}/v1/multi-p2`, () =>
        HttpResponse.json({
          items: [{ id: 2, title: 'p2' }],
          next_url: `${BASE}/v1/multi-p3`,
        } satisfies ItemPage)
      ),
      http.get(`${BASE}/v1/multi-p3`, () =>
        HttpResponse.json({
          items: [{ id: 3, title: 'p3' }],
          next_url: null,
        } satisfies ItemPage)
      )
    )

    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/multi-p1'),
      http_,
      (page) => page.items
    )

    const ids: number[] = []
    for await (const page of paginated.pages()) {
      ids.push(...page.items.map((i) => i.id))
    }
    expect(ids).toEqual([1, 2, 3])
  })

  it('items() flattens items across all pages', async () => {
    const http_ = makeHttp()

    server.use(
      http.get(`${BASE}/v1/flat-p1`, () =>
        HttpResponse.json({
          items: [
            { id: 1, title: 'a' },
            { id: 2, title: 'b' },
          ],
          next_url: `${BASE}/v1/flat-p2`,
        } satisfies ItemPage)
      ),
      http.get(`${BASE}/v1/flat-p2`, () =>
        HttpResponse.json({
          items: [
            { id: 3, title: 'c' },
            { id: 4, title: 'd' },
          ],
          next_url: null,
        } satisfies ItemPage)
      )
    )

    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/flat-p1'),
      http_,
      (page) => page.items
    )

    const ids: number[] = []
    for await (const item of paginated.items()) {
      ids.push(item.id)
    }
    expect(ids).toEqual([1, 2, 3, 4])
  })

  it('items() early-exits correctly via break before fetching next page', async () => {
    const http_ = makeHttp()

    // Only the first page is registered — fetching next_url would throw an MSW unhandled error
    server.use(
      http.get(`${BASE}/v1/break-p1`, () =>
        HttpResponse.json({
          items: [
            { id: 1, title: 'a' },
            { id: 2, title: 'b' },
            { id: 3, title: 'c' },
          ],
          next_url: `${BASE}/v1/break-p2`,
        } satisfies ItemPage)
      )
    )

    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/break-p1'),
      http_,
      (page) => page.items
    )

    const collected: Item[] = []
    for await (const item of paginated.items()) {
      collected.push(item)
      if (collected.length === 2) break // stop before reaching next_url
    }
    expect(collected).toHaveLength(2)
    expect(collected.map((i) => i.id)).toEqual([1, 2])
  })

  it('pages() correctly counts page fetches', async () => {
    const http_ = makeHttp()
    let fetchCount = 0

    server.use(
      http.get(`${BASE}/v1/count-p1`, () => {
        fetchCount++
        return HttpResponse.json({
          items: [{ id: 1, title: 'a' }],
          next_url: `${BASE}/v1/count-p2`,
        } satisfies ItemPage)
      }),
      http.get(`${BASE}/v1/count-p2`, () => {
        fetchCount++
        return HttpResponse.json({
          items: [{ id: 2, title: 'b' }],
          next_url: null,
        } satisfies ItemPage)
      })
    )

    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/count-p1'),
      http_,
      (page) => page.items
    )

    const pages: ItemPage[] = []
    for await (const page of paginated.pages()) {
      pages.push(page)
    }

    expect(pages).toHaveLength(2)
    expect(fetchCount).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe('PaginatedResultAsync — error handling', () => {
  it('awaiting a failed first page returns Err', async () => {
    const http_ = makeHttp()
    server.use(
      http.get(`${BASE}/v1/err-first`, () =>
        HttpResponse.json({ error: 'gone' }, { status: 410 })
      )
    )
    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/err-first'),
      http_,
      (page) => page.items
    )

    const result = await paginated
    expect(result.isErr).toBe(true)
    if (result.isErr) expect(result.error.type).toBe('api_error')
  })

  it('pages() throws PixivError when first page fails', async () => {
    const http_ = makeHttp()
    server.use(
      http.get(`${BASE}/v1/err-pages`, () =>
        HttpResponse.json({ error: 'nope' }, { status: 403 })
      )
    )
    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/err-pages'),
      http_,
      (page) => page.items
    )

    await expect(async () => {
      for await (const _page of paginated.pages()) {
        // should throw before first yield
      }
    }).rejects.toMatchObject({ type: 'api_error', status: 403 })
  })

  it('pages() throws when a subsequent page fails', async () => {
    const http_ = makeHttp()
    server.use(
      http.get(`${BASE}/v1/ok-then-err`, () =>
        HttpResponse.json({
          items: [{ id: 1, title: 'ok' }],
          next_url: `${BASE}/v1/ok-then-err-next`,
        } satisfies ItemPage)
      ),
      http.get(`${BASE}/v1/ok-then-err-next`, () =>
        HttpResponse.json({ error: 'not found' }, { status: 404 })
      )
    )
    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/ok-then-err'),
      http_,
      (page) => page.items
    )

    const pagesReceived: ItemPage[] = []
    await expect(async () => {
      for await (const page of paginated.pages()) {
        pagesReceived.push(page)
      }
    }).rejects.toMatchObject({ type: 'api_error', status: 404 })

    // The first page was yielded successfully before the error
    expect(pagesReceived).toHaveLength(1)
  })

  it('items() throws when a subsequent page fails', async () => {
    const http_ = makeHttp()
    server.use(
      http.get(`${BASE}/v1/items-then-err`, () =>
        HttpResponse.json({
          items: [{ id: 1, title: 'a' }],
          next_url: `${BASE}/v1/items-then-err-next`,
        } satisfies ItemPage)
      ),
      http.get(`${BASE}/v1/items-then-err-next`, () =>
        HttpResponse.json({ error: 'fail' }, { status: 500 })
      )
    )
    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/items-then-err'),
      http_,
      (page) => page.items
    )

    const itemsReceived: Item[] = []
    await expect(async () => {
      for await (const item of paginated.items()) {
        itemsReceived.push(item)
      }
    }).rejects.toMatchObject({ type: 'api_error', status: 500 })

    expect(itemsReceived).toHaveLength(1)
  })

  it('failedPaginated() returns Err immediately', async () => {
    const http_ = makeHttp()
    const error = apiError(401, { message: 'unauthorized' })
    const paginated = failedPaginated<ItemPage, Item>(
      error,
      http_,
      (page) => page.items
    )

    const result = await paginated
    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.type).toBe('api_error')
    }
  })

  it('failedPaginated() pages() throws immediately', async () => {
    const http_ = makeHttp()
    const error = apiError(429, null)
    const paginated = failedPaginated<ItemPage, Item>(
      error,
      http_,
      (page) => page.items
    )

    await expect(async () => {
      for await (const _page of paginated.pages()) {
        // should throw
      }
    }).rejects.toMatchObject({ type: 'api_error', status: 429 })
  })
})

// ---------------------------------------------------------------------------
// ResultAsync inheritance
// ---------------------------------------------------------------------------

describe('PaginatedResultAsync — inherits ResultAsync', () => {
  it('supports .map()', async () => {
    const http_ = makeHttp()
    server.use(
      http.get(`${BASE}/v1/map-test`, () =>
        HttpResponse.json({
          items: [{ id: 10, title: 'x' }],
          next_url: null,
        } satisfies ItemPage)
      )
    )
    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/map-test'),
      http_,
      (page) => page.items
    )

    // .map() on the first page only (standard ResultAsync behaviour)
    const mapped = await (paginated as ResultAsync<ItemPage, unknown>).map(
      (page) => page.items.length
    )
    expect(mapped.isOk).toBe(true)
    if (mapped.isOk) expect(mapped.value).toBe(1)
  })

  it('supports .unwrapOr() on failure', async () => {
    const http_ = makeHttp()
    server.use(
      http.get(`${BASE}/v1/unwrap-test`, () =>
        HttpResponse.json({ error: 'gone' }, { status: 410 })
      )
    )
    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/unwrap-test'),
      http_,
      (page) => page.items
    )

    const fallback: ItemPage = { items: [], next_url: null }
    const value = await paginated.unwrapOr(fallback)
    expect(value).toEqual(fallback)
  })

  it('supports .andThen() chaining', async () => {
    const http_ = makeHttp()
    server.use(
      http.get(`${BASE}/v1/andthen-test`, () =>
        HttpResponse.json({
          items: [{ id: 5, title: 'z' }],
          next_url: null,
        } satisfies ItemPage)
      )
    )
    const paginated = PaginatedResultAsync.fromResultAsync(
      http_.get<ItemPage>('/v1/andthen-test'),
      http_,
      (page) => page.items
    )

    const { ok: okFn } = await import('../src/result.js')
    const chained = await paginated.andThen((page) =>
      okFn(page.items[0]?.id ?? 0)
    )
    expect(chained.isOk).toBe(true)
    if (chained.isOk) expect(chained.value).toBe(5)
  })
})
