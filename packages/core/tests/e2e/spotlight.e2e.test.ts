import { beforeAll, describe, expect, it } from 'vitest'
import { PixivClient } from '../../src/client'
import { REFRESH_TOKEN, SKIP } from './helpers'

describe.skipIf(SKIP)('PixivClient e2e — spotlight', () => {
  let client: PixivClient

  beforeAll(async () => {
    client = await PixivClient.of(REFRESH_TOKEN ?? '')
  })

  it('spotlight.articles (category all)', async () => {
    const result = await client.spotlight.articles({ category: 'all' })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.spotlightArticles)).toBe(true)
  })

  it('spotlight.articles (category manga)', async () => {
    const result = await client.spotlight.articles({ category: 'manga' })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(Array.isArray(result.value.spotlightArticles)).toBe(true)
  })
})
