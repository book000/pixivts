import { describe, expect, expectTypeOf, it } from 'vitest'
import type {
  IllustCommentStamp,
  IllustRequest,
  NovelComment,
  PixivIllustItem,
} from '../src/types'
import { PixivIllustItemSchema } from '../src/schemas/illust'
import { NovelCommentSchema } from '../src/schemas/novel'

const USER = {
  id: 1,
  name: 'User',
  account: 'user',
  profileImageUrls: { medium: 'https://i.pximg.net/u.jpg' },
}

const ILLUST = {
  id: 1,
  title: 'Test Illust',
  type: 'illust' as const,
  imageUrls: {
    squareMedium: 'https://i.pximg.net/sq.jpg',
    medium: 'https://i.pximg.net/m.jpg',
    large: 'https://i.pximg.net/l.jpg',
  },
  caption: '',
  restrict: 0,
  user: USER,
  tags: [],
  tools: [],
  createDate: '2024-01-01T00:00:00+09:00',
  pageCount: 1,
  width: 1000,
  height: 800,
  sanityLevel: 2,
  xRestrict: 0,
  series: null,
  metaSinglePage: { originalImageUrl: 'https://i.pximg.net/orig.jpg' },
  metaPages: [],
  totalView: 1000,
  totalBookmarks: 50,
  isBookmarked: false,
  visible: true,
  isMuted: false,
  illustAiType: 0,
  illustBookStyle: 0,
}

const REQUEST = {
  requestInfo: {
    fanUserId: null,
    collaborateStatus: {
      collaborating: false,
      collaborateAnonymousFlag: false,
      collaborateUserSamples: [{ userId: null, anonymousFlag: true }],
    },
    role: 'creator',
  },
  requestUsers: [
    {
      ...USER,
      isFollowed: false,
      isAccessBlockingUser: false,
      isAcceptRequest: true,
    },
  ],
}

const NOVEL_COMMENT = {
  id: 1,
  comment: 'Nice!',
  date: '2024-01-01T00:00:00+09:00',
  user: USER,
}

describe('PixivIllustItem types', () => {
  it('exposes request, eventBanners, and seasonalEffectAnimationUrls', () => {
    expectTypeOf<PixivIllustItem['request']>().toEqualTypeOf<
      IllustRequest | null | undefined
    >()
    expectTypeOf<PixivIllustItem['eventBanners']>().toEqualTypeOf<unknown>()
    expectTypeOf<
      PixivIllustItem['seasonalEffectAnimationUrls']
    >().toEqualTypeOf<unknown>()
  })

  it('accepts an illust without the new fields', () => {
    expect(PixivIllustItemSchema.safeParse(ILLUST).success).toBe(true)
  })

  it('accepts an illust with the new fields', () => {
    const withFields = {
      ...ILLUST,
      request: REQUEST,
      eventBanners: null,
      seasonalEffectAnimationUrls: null,
    }
    expect(PixivIllustItemSchema.safeParse(withFields).success).toBe(true)
    expect(
      PixivIllustItemSchema.safeParse({ ...ILLUST, request: null }).success
    ).toBe(true)
  })
})

describe('NovelComment types', () => {
  it('exposes stamp', () => {
    expectTypeOf<NovelComment['stamp']>().toEqualTypeOf<
      IllustCommentStamp | null | undefined
    >()
  })

  it('accepts a comment without a stamp', () => {
    expect(NovelCommentSchema.safeParse(NOVEL_COMMENT).success).toBe(true)
  })

  it('accepts a comment with a stamp or a null stamp', () => {
    const stamp = { stampId: 101, stampUrl: 'https://s.pximg.net/101.jpg' }
    expect(
      NovelCommentSchema.safeParse({ ...NOVEL_COMMENT, stamp }).success
    ).toBe(true)
    expect(
      NovelCommentSchema.safeParse({ ...NOVEL_COMMENT, stamp: null }).success
    ).toBe(true)
  })
})
