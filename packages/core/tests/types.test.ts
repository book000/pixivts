import { describe, expect, expectTypeOf, it } from 'vitest'
import type {
  IllustCommentStamp,
  IllustRequest,
  NovelComment,
  PixivIllustItem,
  Publicity,
} from '../src/types'
import type {
  PixivUserProfileBadge,
  PixivUserProfilePublicityV2,
  PixivUserProfileV2,
  PixivUserProfileWorkspaceV2,
  UserDetailV2Response,
} from '../src/index'
import { PixivIllustItemSchema } from '../src/schemas/illust'
import { NovelCommentSchema } from '../src/schemas/novel'
import { UserDetailV2ResponseSchema } from '../src/schemas/user'

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

const V2_USER = {
  ...USER,
  comment: 'Hello!',
  isFollowed: false,
  isAccessBlockingUser: false,
  isAcceptRequest: true,
}

const V2_PROFILE = {
  webpage: null,
  gender: null,
  birth: null,
  birthDay: null,
  birthYear: null,
  region: null,
  addressId: null,
  countryCode: null,
  job: null,
  jobId: null,
  totalFollowUsers: 1,
  totalMypixivUsers: 2,
  totalIllusts: 3,
  totalManga: 4,
  totalNovels: 5,
  totalIllustSeries: 6,
  totalNovelSeries: 7,
  backgroundImageUrl: null,
  twitterAccount: null,
  twitterUrl: null,
  isPremium: false,
  isUsingCustomProfileImage: false,
  badge: null,
}

const V2_DETAIL = {
  user: V2_USER,
  profile: V2_PROFILE,
  profilePublicity: {
    gender: null,
    region: null,
    birthDay: null,
    birthYear: null,
    job: null,
  },
  workspace: {
    pc: '',
    monitor: '',
    tool: '',
    scanner: '',
    tablet: '',
    mouse: '',
    printer: '',
    desktop: '',
    music: '',
    desk: '',
    chair: '',
    comment: '',
  },
  disabledLinks: [],
}

describe('UserDetailV2Response types', () => {
  it('models the nullable v2 profile values', () => {
    type Profile = UserDetailV2Response['profile']
    expectTypeOf<Profile>().toEqualTypeOf<PixivUserProfileV2>()
    expectTypeOf<Profile['gender']>().toEqualTypeOf<number | null>()
    expectTypeOf<Profile['birth']>().toEqualTypeOf<string | null>()
    expectTypeOf<Profile['birthDay']>().toEqualTypeOf<string | null>()
    expectTypeOf<Profile['job']>().toEqualTypeOf<string | null>()
    expectTypeOf<Profile['region']>().toEqualTypeOf<string | null>()
    expectTypeOf<Profile['countryCode']>().toEqualTypeOf<string | null>()
    expectTypeOf<Profile['twitterAccount']>().toEqualTypeOf<string | null>()
    expectTypeOf<Profile['birthYear']>().toEqualTypeOf<number | null>()
    expectTypeOf<Profile['jobId']>().toEqualTypeOf<number | null>()
    expectTypeOf<Profile['addressId']>().toEqualTypeOf<number | null>()
    expectTypeOf<
      Profile['badge']
    >().toEqualTypeOf<PixivUserProfileBadge | null>()
  })

  it('models the nullable v2 profile publicity values', () => {
    type Publicities = UserDetailV2Response['profilePublicity']
    expectTypeOf<Publicities>().toEqualTypeOf<PixivUserProfilePublicityV2>()
    expectTypeOf<Publicities['gender']>().toEqualTypeOf<Publicity | null>()
    expectTypeOf<Publicities['region']>().toEqualTypeOf<Publicity | null>()
    expectTypeOf<Publicities['birthDay']>().toEqualTypeOf<Publicity | null>()
    expectTypeOf<Publicities['birthYear']>().toEqualTypeOf<Publicity | null>()
    expectTypeOf<Publicities['job']>().toEqualTypeOf<Publicity | null>()
  })

  it('exposes v2-only fields and requires user.isAcceptRequest', () => {
    expectTypeOf<UserDetailV2Response['disabledLinks']>().toEqualTypeOf<
      unknown[]
    >()
    expectTypeOf<
      UserDetailV2Response['user']['isAcceptRequest']
    >().toEqualTypeOf<boolean>()
    expectTypeOf<PixivUserProfileBadge>().toEqualTypeOf<{
      type: string
      url: string | null
    }>()
  })

  it('omits the v1-only fields', () => {
    expectTypeOf<'pawooUrl'>().not.toExtend<keyof PixivUserProfileV2>()
    expectTypeOf<'totalIllustBookmarksPublic'>().not.toExtend<
      keyof PixivUserProfileV2
    >()
    expectTypeOf<'pawoo'>().not.toExtend<keyof PixivUserProfilePublicityV2>()
    expectTypeOf<'workspaceImageUrl'>().not.toExtend<
      keyof PixivUserProfileWorkspaceV2
    >()
  })

  it('accepts a v2 detail with a null badge and null values', () => {
    expect(UserDetailV2ResponseSchema.safeParse(V2_DETAIL).success).toBe(true)
  })

  it('accepts a v2 detail with a non-null badge and disclosed values', () => {
    const disclosed = {
      ...V2_DETAIL,
      profile: {
        ...V2_PROFILE,
        gender: 1,
        birthYear: 1990,
        job: 'Illustrator',
        badge: { type: 'official', url: 'https://s.pximg.net/badge.png' },
      },
      profilePublicity: {
        gender: 'public',
        region: 'private',
        birthDay: 'mypixiv',
        birthYear: 'public',
        job: 'public',
      },
    }
    expect(UserDetailV2ResponseSchema.safeParse(disclosed).success).toBe(true)
  })
})
