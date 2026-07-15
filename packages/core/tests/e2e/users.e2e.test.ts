import { beforeAll, describe, expect, it } from 'vitest'
import { PixivClient } from '../../src/client'
import { REFRESH_TOKEN, SKIP } from './helpers'

/** pixiv staff account (ID: 11) — always exists, safe for follow tests. */
const STAFF_USER_ID = 11

describe.skipIf(SKIP)('PixivClient e2e — users', () => {
  let client: PixivClient

  beforeAll(async () => {
    client = await PixivClient.of(REFRESH_TOKEN ?? '')
  })

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
    expect(Array.isArray(result.value.userPreviews)).toBe(true)
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
    const wasFollowed = detailResult.value.user.isFollowed ?? false

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
})
