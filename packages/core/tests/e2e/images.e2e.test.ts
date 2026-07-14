import { beforeAll, describe, expect, it } from 'vitest'
import { PixivClient } from '../../src/client'
import { REFRESH_TOKEN, SKIP } from './helpers'

/** pixiv staff account (ID: 11) — always exists, safe for follow tests. */
const STAFF_USER_ID = 11

describe.skipIf(SKIP)('PixivClient e2e — images', () => {
  let client: PixivClient

  beforeAll(async () => {
    client = await PixivClient.of(REFRESH_TOKEN ?? '')
  })

  it('images.fetch', async () => {
    // Fetch a known user avatar (small CDN image).
    const detailResult = await client.users.detail({ userId: STAFF_USER_ID })
    expect(detailResult.isOk).toBe(true)
    if (!detailResult.isOk) return
    const avatarUrl = detailResult.value.user.profileImageUrls.medium

    // images.fetch returns ResultAsync<Response, PixivError>
    const imgResult = await client.images.fetch(avatarUrl)
    expect(imgResult.isOk).toBe(true)
    if (!imgResult.isOk) return
    expect(imgResult.value.ok).toBe(true)
    expect(imgResult.value.status).toBe(200)
  })
})
