import { beforeAll, describe, expect, it } from 'vitest'
import { PixivClient } from '../../src/client'
import { REFRESH_TOKEN, SKIP } from './helpers'

describe.skipIf(SKIP)('PixivClient e2e — manga', () => {
  let client: PixivClient

  beforeAll(async () => {
    client = await PixivClient.of(REFRESH_TOKEN ?? '')
  })

  it('manga.recommended', async () => {
    const result = await client.manga.recommended({})
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.illusts.length).toBeGreaterThan(0)
  })
})
