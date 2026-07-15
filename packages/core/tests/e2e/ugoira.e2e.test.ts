import { beforeAll, describe, expect, it } from 'vitest'
import { PixivClient } from '../../src/client'
import { REFRESH_TOKEN, SKIP } from './helpers'

/** A published ugoira used for stable assertions. */
const UGOIRA_ID = 83_638_393

describe.skipIf(SKIP)('PixivClient e2e — ugoira', () => {
  let client: PixivClient

  beforeAll(async () => {
    client = await PixivClient.of(REFRESH_TOKEN ?? '')
  })

  it('ugoira.metadata', async () => {
    const result = await client.ugoira.metadata({ illustId: UGOIRA_ID })
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.ugoiraMetadata.zipUrls.medium).toMatch(
      /^https:\/\/i\.pximg\.net\/img-zip-ugoira\/img\/.+_ugoira600x600\.zip$/
    )
    expect(result.value.ugoiraMetadata.frames.length).toBeGreaterThan(0)
  })
})
