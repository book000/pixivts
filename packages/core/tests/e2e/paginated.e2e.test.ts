import { beforeAll, describe, expect, it } from 'vitest'
import { PixivClient } from '../../src/client'
import { REFRESH_TOKEN, SKIP } from './helpers'

describe.skipIf(SKIP)('PixivClient e2e — pagination', () => {
  let client: PixivClient

  beforeAll(async () => {
    client = await PixivClient.of(REFRESH_TOKEN ?? '')
  })

  it('PaginatedResultAsync.pages() — iterates at least one page', async () => {
    let pageCount = 0
    let totalIllusts = 0
    const pageIterable = client.illusts.search({ word: 'ホロライブ' }).pages()
    for await (const page of pageIterable) {
      pageCount++
      totalIllusts += page.illusts.length
      if (pageCount >= 2) break
    }
    expect(pageCount).toBeGreaterThanOrEqual(1)
    expect(totalIllusts).toBeGreaterThan(0)
  })

  it('PaginatedResultAsync.items() — yields individual items', async () => {
    const illusts: unknown[] = []
    const itemIterable = client.illusts.search({ word: 'ホロライブ' }).items()
    for await (const illust of itemIterable) {
      illusts.push(illust)
      if (illusts.length >= 60) break // stop after ~2 pages
    }
    expect(illusts.length).toBeGreaterThan(0)
  })
})
