/* eslint-disable no-console */
import { BookmarkRestrict } from './options'
import Pixiv from './pixiv'
import { GetV1IllustDetailCheck } from './types/endpoints/v1/illust/detail'
import { GetV1IllustRecommendedCheck } from './types/endpoints/v1/illust/recommended'
import { GetV1IllustSeriesCheck } from './types/endpoints/v1/illust/series'
import { GetV1MangaRecommendedCheck } from './types/endpoints/v1/manga/recommended'
import { GetV1NovelRecommendedCheck } from './types/endpoints/v1/novel/recommended'
import { GetV1NovelTextCheck } from './types/endpoints/v1/novel/text'
import { GetV1SearchIllustCheck } from './types/endpoints/v1/search/illust'
import { GetV1SearchNovelCheck } from './types/endpoints/v1/search/novel'
import { GetV1UserBookmarksIllustCheck } from './types/endpoints/v1/user/bookmarks/illust'
import { GetV1UserBookmarksNovelCheck } from './types/endpoints/v1/user/bookmarks/novel'
import { GetV1UserDetailCheck } from './types/endpoints/v1/user/detail'
import { GetV2NovelDetailCheck } from './types/endpoints/v2/novel/detail'
import { GetV2NovelSeriesCheck } from './types/endpoints/v2/novel/series'
import { isEmptyObject, omit } from './utils'

jest.setTimeout(120_000) // 120sec

describe('pixiv', () => {
  let pixiv: Pixiv

  beforeAll(async () => {
    const pixivRefreshToken = process.env.PIXIV_REFRESH_TOKEN
    if (!pixivRefreshToken) {
      throw new Error('PIXIV_REFRESH_TOKEN is not set')
    }

    pixiv = await Pixiv.of(pixivRefreshToken)
  })

  it('illustDetail:107565629[illust]', async () => {
    const illustDetail = await pixiv.illustDetail({
      illustId: 107_565_629,
    })
    expect(illustDetail.status).toBe(200)
    expect(illustDetail.data.illust.id).toBe(107_565_629)
    expect(illustDetail.data.illust.title).toBe(
      'フブキちゃん衣装着てみたみょ～ん余'
    )
    expect(illustDetail.data.illust.type).toBe('illust')
    // "square_medium": "https://i.pximg.net/c/360x360_70/img-master/img/2023/04/27/13/39/51/107565629_p0_square1200.jpg",
    expect(illustDetail.data.illust.image_urls.square_medium).toMatch(
      /^https:\/\/i\.pximg\.net\/c\/360x360_70\/img-master\/img\/.+_square1200\.jpg$/
    )
    // "medium": "https://i.pximg.net/c/540x540_70/img-master/img/2023/04/27/13/39/51/107565629_p0_master1200.jpg",
    expect(illustDetail.data.illust.image_urls.medium).toMatch(
      /^https:\/\/i\.pximg\.net\/c\/540x540_70\/img-master\/img\/.+_master1200\.jpg$/
    )
    // "large": "https://i.pximg.net/c/600x1200_90/img-master/img/2023/04/27/13/39/51/107565629_p0_master1200.jpg",
    expect(illustDetail.data.illust.image_urls.large).toMatch(
      /^https:\/\/i\.pximg\.net\/c\/600x1200_90\/img-master\/img\/.+_master1200\.jpg$/
    )
    expect(illustDetail.data.illust.caption).toBe('')
    expect(illustDetail.data.illust.restrict).toBe(0)
    expect(illustDetail.data.illust.user.id).toBe(16_668_308)
    expect(illustDetail.data.illust.user.name).toBe('桜もち')
    expect(illustDetail.data.illust.user.account).toBe('yukitohoshizora')
    // https://i.pximg.net/user-profile/img/
    expect(illustDetail.data.illust.user.profile_image_urls.medium).toMatch(
      /^https:\/\/i\.pximg\.net\/user-profile\/img\/.+\.png$/
    )
    expect(illustDetail.data.illust.tags.length).toBeGreaterThan(0)
    expect(illustDetail.data.illust.tools).toBeDefined()
    expect(illustDetail.data.illust.tools.length).toBe(0)
    expect(illustDetail.data.illust.create_date).toBe(
      '2023-04-27T13:39:51+09:00'
    )
    expect(illustDetail.data.illust.page_count).toBe(1)
    expect(illustDetail.data.illust.width).toBe(1728)
    expect(illustDetail.data.illust.height).toBe(2626)
    expect(illustDetail.data.illust.sanity_level).toBe(2)
    expect(illustDetail.data.illust.x_restrict).toBe(0)
    expect(illustDetail.data.illust.series).toBeNull()
    // "original_image_url": "https://i.pximg.net/img-original/img/2023/04/27/13/39/51/107565629_p0.png",
    expect(
      illustDetail.data.illust.meta_single_page.original_image_url
    ).toMatch(/^https:\/\/i\.pximg\.net\/img-original\/img\/.+_p0\.png$/)
    expect(illustDetail.data.illust.meta_pages).toHaveLength(0)
    expect(illustDetail.data.illust.total_bookmarks).toBeGreaterThan(0)
    expect(illustDetail.data.illust.total_view).toBeGreaterThan(0)
    expect(illustDetail.data.illust.visible).toBe(true)
    expect(illustDetail.data.illust.illust_ai_type).toBe(1)
    expect(illustDetail.data.illust.illust_book_style).toBe(0)

    const check = new GetV1IllustDetailCheck()
    expect(() => check.throwIfResponseFailed(illustDetail.data)).not.toThrow()

    expect(
      omit(illustDetail.data.illust, [
        'total_bookmarks',
        'total_comments',
        'total_view',
      ])
    ).toMatchSnapshot()
  })

  it('illustDetail:103905962[manga]', async () => {
    const illustDetail = await pixiv.illustDetail({
      illustId: 103_905_962,
    })
    expect(illustDetail.status).toBe(200)
    expect(illustDetail.data.illust.id).toBe(103_905_962)
    expect(illustDetail.data.illust.title).toBe('【C101】あくあに恋した猫の話')
    expect(illustDetail.data.illust.type).toBe('manga')
    // "square_medium": "https://i.pximg.net/c/360x360_70/img-master/img/2023/04/27/13/39/51/107565629_p0_square1200.jpg",
    expect(illustDetail.data.illust.image_urls.square_medium).toMatch(
      /^https:\/\/i\.pximg\.net\/c\/360x360_70\/img-master\/img\/.+_square1200\.jpg$/
    )
    // "medium": "https://i.pximg.net/c/540x540_70/img-master/img/2023/04/27/13/39/51/107565629_p0_master1200.jpg",
    expect(illustDetail.data.illust.image_urls.medium).toMatch(
      /^https:\/\/i\.pximg\.net\/c\/540x540_70\/img-master\/img\/.+_master1200\.jpg$/
    )
    // "large": "https://i.pximg.net/c/600x1200_90/img-master/img/2023/04/27/13/39/51/107565629_p0_master1200.jpg",
    expect(illustDetail.data.illust.image_urls.large).toMatch(
      /^https:\/\/i\.pximg\.net\/c\/600x1200_90\/img-master\/img\/.+_master1200\.jpg$/
    )
    expect(illustDetail.data.illust.caption).toBe(
      "C101の新刊サンプルです！<br /><br />恋愛アドベンチャーゲーム『あくありうむ。』に登場する「猫」。<br />彼はどんなことを考えていたのか?<br />彼にとって、これはどんな物語だったのか?<br />そういった本編で語られなかった部分を想像で掘り下げたお話です。<br />※本文は『あくありうむ。』のネタバレおよび多少の負傷描写を含みます。苦手な方はご注意ください。<br /><br />【1日目東C-13b/くらうでぃ】でお待ちしています！<br /><br />メロンブックス様にて新刊の事前予約も始まっています！<br />気になる方は是非チェックしてみてください！<br />【<a href=\"https://www.melonbooks.co.jp/detail/detail.php?product_id=1746005\" target='_blank' rel='noopener noreferrer'>https://www.melonbooks.co.jp/detail/detail.php?product_id=1746005</a>】"
    )
    expect(illustDetail.data.illust.restrict).toBe(0)
    expect(illustDetail.data.illust.user.id).toBe(8_166_267)
    expect(illustDetail.data.illust.user.name).toBe('くらうど')
    expect(illustDetail.data.illust.user.account).toBe('borinn0812')
    // https://i.pximg.net/user-profile/img/
    expect(illustDetail.data.illust.user.profile_image_urls.medium).toMatch(
      /^https:\/\/i\.pximg\.net\/user-profile\/img\/.+\.(?:jpg|png)$/
    )
    expect(illustDetail.data.illust.tags.length).toBeGreaterThan(0)
    expect(illustDetail.data.illust.tools).toBeDefined()
    expect(illustDetail.data.illust.tools.length).toBeGreaterThan(0)
    expect(illustDetail.data.illust.create_date).toBe(
      '2022-12-25T18:31:02+09:00'
    )
    expect(illustDetail.data.illust.page_count).toBe(8)
    expect(illustDetail.data.illust.width).toBe(2508)
    expect(illustDetail.data.illust.height).toBe(3541)
    expect(illustDetail.data.illust.sanity_level).toBe(2)
    expect(illustDetail.data.illust.x_restrict).toBe(0)
    expect(illustDetail.data.illust.series).toBeNull()
    expect(illustDetail.data.illust.meta_single_page).toStrictEqual({})
    expect(illustDetail.data.illust.meta_pages).toHaveLength(8)
    expect(illustDetail.data.illust.total_bookmarks).toBeGreaterThan(0)
    expect(illustDetail.data.illust.total_view).toBeGreaterThan(0)
    expect(illustDetail.data.illust.visible).toBe(true)
    expect(illustDetail.data.illust.illust_ai_type).toBe(1)
    expect(illustDetail.data.illust.illust_book_style).toBe(0)

    const check = new GetV1IllustDetailCheck()
    expect(() => check.throwIfResponseFailed(illustDetail.data)).not.toThrow()

    expect(
      omit(illustDetail.data.illust, [
        'total_bookmarks',
        'total_comments',
        'total_view',
      ])
    ).toMatchSnapshot()
  })

  it('searchIllust', async () => {
    const searchIllust = await pixiv.searchIllust({
      word: 'ホロライブ',
    })
    expect(searchIllust.status).toBe(200)
    expect(searchIllust.data).toBeDefined()
    expect(searchIllust.data.illusts).toBeDefined()
    expect(searchIllust.data.illusts.length).toBeGreaterThan(0)

    const check = new GetV1SearchIllustCheck()
    expect(() => check.throwIfResponseFailed(searchIllust.data)).not.toThrow()
  })

  it('recommendedIllust', async () => {
    const recommendedIllust = await pixiv.illustRecommended()
    expect(recommendedIllust.status).toBe(200)
    expect(recommendedIllust.data).toBeDefined()
    expect(recommendedIllust.data.illusts).toBeDefined()
    expect(recommendedIllust.data.illusts.length).toBeGreaterThan(0)

    const check = new GetV1IllustRecommendedCheck()
    expect(() =>
      check.throwIfResponseFailed(recommendedIllust.data)
    ).not.toThrow()
  })

  it('illustSeries', async () => {
    const illustSeries = await pixiv.illustSeries({
      illustSeriesId: 147_483,
    })
    expect(illustSeries.status).toBe(200)
    expect(illustSeries.data).toBeDefined()
    expect(illustSeries.data.illust_series_detail.title).toBe(
      'ホロライブ学パロ'
    )
    expect(illustSeries.data.illusts).toBeDefined()
    expect(illustSeries.data.illusts.length).toBeGreaterThan(0)

    const check = new GetV1IllustSeriesCheck()
    expect(() => check.throwIfResponseFailed(illustSeries.data)).not.toThrow()

    expect(
      omit(illustSeries.data.illust_series_detail, ['series_work_count'])
    ).toMatchSnapshot('illust_series_detail')
    expect(
      omit(illustSeries.data.illust_series_first_illust, [
        'total_bookmarks',
        'total_comments',
        'total_view',
      ])
    ).toMatchSnapshot('illust_series_first_illust')
  })

  it('recommendedManga', async () => {
    const mangaRecommended = await pixiv.mangaRecommended()
    expect(mangaRecommended.status).toBe(200)
    expect(mangaRecommended.data).toBeDefined()
    expect(mangaRecommended.data.illusts).toBeDefined()
    expect(mangaRecommended.data.illusts.length).toBeGreaterThan(0)

    const check = new GetV1MangaRecommendedCheck()
    expect(() =>
      check.throwIfResponseFailed(mangaRecommended.data)
    ).not.toThrow()
  })

  it('novelDetail', async () => {
    const novelDetail = await pixiv.novelDetail({
      novelId: 13_574_875,
    })
    expect(novelDetail.status).toBe(200)
    expect(novelDetail.data).toBeDefined()
    expect(novelDetail.data.novel).toBeDefined()
    expect(novelDetail.data.novel.id).toBe(13_574_875)
    expect(novelDetail.data.novel.title).toBe(
      'それはまるで鍵盤を奏でる細指の如く'
    )
    expect(novelDetail.data.novel.caption).toBe(
      '色々と独自解釈、設定捏造があります。<br />張り詰めるものが多いと、人はいつか破裂する。<br /><br />Twitterやってます→【<strong><a href="https://twitter.com/somari1101" target="_blank">twitter/somari1101</a></strong>】'
    )
    expect(novelDetail.data.novel.restrict).toBe(0)
    expect(novelDetail.data.novel.x_restrict).toBe(0)
    expect(novelDetail.data.novel.is_original).toBe(false)
    expect(novelDetail.data.novel.image_urls).toBeDefined()
    expect(novelDetail.data.novel.image_urls.large).toMatch(
      /^https:\/\/i\.pximg\.net\/c\/240x480_80\/novel-cover-master\/img\/.+_master1200\.jpg$/
    )
    expect(novelDetail.data.novel.image_urls.medium).toMatch(
      /^https:\/\/i\.pximg\.net\/c\/176x352\/novel-cover-master\/img\/.+_master1200\.jpg$/
    )
    expect(novelDetail.data.novel.image_urls.square_medium).toMatch(
      /^https:\/\/i\.pximg\.net\/c\/128x128\/novel-cover-master\/img\/.+_square1200\.jpg$/
    )
    expect(novelDetail.data.novel.create_date).toBe('2020-08-22T21:24:48+09:00')
    expect(novelDetail.data.novel.page_count).toBe(7)
    expect(novelDetail.data.novel.text_length).toBe(6931)
    expect(novelDetail.data.novel.user).toBeDefined()
    expect(novelDetail.data.novel.user.id).toBe(53_003_997)
    expect(novelDetail.data.novel.user.name).toBe('蘇鞠-そまり-')
    expect(novelDetail.data.novel.user.account).toBe('user_wrmt2824')
    expect(novelDetail.data.novel.user.profile_image_urls).toBeDefined()
    expect(novelDetail.data.novel.user.profile_image_urls.medium).toMatch(
      /^https:\/\/i\.pximg\.net\/user-profile\/img\/.+\.(?:jpg|png)$/
    )
    expect(novelDetail.data.novel.user.is_followed).toBeDefined()
    expect(novelDetail.data.novel.series).toStrictEqual({})
    expect(novelDetail.data.novel.is_bookmarked).toBeDefined()
    expect(novelDetail.data.novel.total_bookmarks).toBeGreaterThan(0)
    expect(novelDetail.data.novel.total_view).toBeGreaterThan(0)
    expect(novelDetail.data.novel.visible).toBe(true)
    expect(novelDetail.data.novel.total_comments).toBeGreaterThan(0)
    expect(novelDetail.data.novel.is_muted).toBeDefined()
    expect(novelDetail.data.novel.is_mypixiv_only).toBeDefined()
    expect(novelDetail.data.novel.is_x_restricted).toBe(false)
    expect(novelDetail.data.novel.novel_ai_type).toBe(0)

    const check = new GetV2NovelDetailCheck()
    expect(() => check.throwIfResponseFailed(novelDetail.data)).not.toThrow()

    expect(
      omit(novelDetail.data.novel, [
        'total_bookmarks',
        'total_comments',
        'total_view',
      ])
    ).toMatchSnapshot()
  })

  it('novelText', async () => {
    const novelText = await pixiv.novelText({
      novelId: 13_574_875,
    })
    expect(novelText.status).toBe(200)
    expect(novelText.data).toBeDefined()
    expect(novelText.data.novel_text).toBeDefined()
    expect(novelText.data.novel_text.length).toBeGreaterThan(0)
    if (!isEmptyObject(novelText.data.novel_marker)) {
      expect(novelText.data.novel_marker.page).toBeGreaterThan(0)
    }
    expect(novelText.data.series_prev).toStrictEqual({})
    expect(novelText.data.series_next).toStrictEqual({})

    const check = new GetV1NovelTextCheck()
    expect(() => check.throwIfResponseFailed(novelText.data)).not.toThrow()

    expect(novelText.data.novel_marker).toMatchSnapshot('novel_marker')
    expect(novelText.data.novel_text).toMatchSnapshot()
  })

  it('searchNovel', async () => {
    const searchNovel = await pixiv.searchNovel({
      word: 'ホロライブ',
    })
    expect(searchNovel.status).toBe(200)
    expect(searchNovel.data).toBeDefined()
    expect(searchNovel.data.novels).toBeDefined()
    expect(searchNovel.data.novels.length).toBeGreaterThan(0)

    const check = new GetV1SearchNovelCheck()
    expect(() => check.throwIfResponseFailed(searchNovel.data)).not.toThrow()
  })

  it('recommendedNovel', async () => {
    const novelRecommended = await pixiv.novelRecommended()
    expect(novelRecommended.status).toBe(200)
    expect(novelRecommended.data).toBeDefined()
    expect(novelRecommended.data.novels).toBeDefined()
    expect(novelRecommended.data.novels.length).toBeGreaterThan(0)

    const check = new GetV1NovelRecommendedCheck()
    expect(() =>
      check.throwIfResponseFailed(novelRecommended.data)
    ).not.toThrow()
  })

  it('novelSeries', async () => {
    const novelSeries = await pixiv.novelSeries({
      seriesId: 7_474_721,
    })
    expect(novelSeries.status).toBe(200)
    expect(novelSeries.data).toBeDefined()
    expect(novelSeries.data.novel_series_detail.title).toBe(
      '夏色吹雪の恋人生活'
    )
    expect(novelSeries.data.novels).toBeDefined()
    expect(novelSeries.data.novels.length).toBeGreaterThan(0)

    const check = new GetV2NovelSeriesCheck()
    expect(() => check.throwIfResponseFailed(novelSeries.data)).not.toThrow()

    expect(
      omit(novelSeries.data.novel_series_detail, ['content_count'])
    ).toMatchSnapshot('novel_series_detail')
    expect(
      omit(novelSeries.data.novel_series_first_novel, [
        'total_bookmarks',
        'total_comments',
        'total_view',
      ])
    ).toMatchSnapshot('novel_series_first_novel')
    expect(
      omit(novelSeries.data.novel_series_latest_novel, [
        'total_bookmarks',
        'total_comments',
        'total_view',
      ])
    ).toMatchSnapshot('illust_series_first_illust')
  })

  it('userDetail', async () => {
    const userDetail = await pixiv.userDetail({
      userId: 16_568_776,
    })
    expect(userDetail.status).toBe(200)
    expect(userDetail.data).toBeDefined()
    expect(userDetail.data.user).toBeDefined()
    expect(userDetail.data.user.id).toBe(16_568_776)
    expect(userDetail.data.user.name).toBe('ihcamot')

    const check = new GetV1UserDetailCheck()
    expect(() => check.throwIfResponseFailed(userDetail.data)).not.toThrow()

    expect(userDetail.data.user).toMatchSnapshot('user')
    expect(
      omit(userDetail.data.profile, [
        'total_follow_users',
        'total_illust_bookmarks_public',
      ])
    ).toMatchSnapshot('profile')
    expect(userDetail.data.profile_publicity).toMatchSnapshot(
      'profile_publicity'
    )
    expect(userDetail.data.workspace).toMatchSnapshot('workspace')
  })

  it('userBookmarksIllust', async () => {
    const userBookmarksIllust = await pixiv.userBookmarksIllust({
      userId: 16_568_776,
      restrict: BookmarkRestrict.PRIVATE,
    })
    expect(userBookmarksIllust.status).toBe(200)
    expect(userBookmarksIllust.data).toBeDefined()
    expect(userBookmarksIllust.data.illusts).toBeDefined()
    expect(userBookmarksIllust.data.illusts.length).toBeGreaterThan(0)

    const check = new GetV1UserBookmarksIllustCheck()
    expect(() =>
      check.throwIfResponseFailed(userBookmarksIllust.data)
    ).not.toThrow()
  })

  it('userBookmarksNovel', async () => {
    const userBookmarksNovel = await pixiv.userBookmarksNovel({
      userId: 16_568_776,
      restrict: BookmarkRestrict.PRIVATE,
    })
    expect(userBookmarksNovel.status).toBe(200)
    expect(userBookmarksNovel.data).toBeDefined()
    expect(userBookmarksNovel.data.novels).toBeDefined()
    expect(userBookmarksNovel.data.novels.length).toBeGreaterThan(0)

    const check = new GetV1UserBookmarksNovelCheck()
    expect(() =>
      check.throwIfResponseFailed(userBookmarksNovel.data)
    ).not.toThrow()
  })

  it('parseQueryString', async () => {
    const qs = 'https://example.com?a=1&b=2&c=3'
    const parsed = Pixiv.parseQueryString(qs)
    expect(parsed).toStrictEqual({
      a: '1',
      b: '2',
      c: '3',
    })
  })

  it('isError', async () => {
    const error = {
      error: {
        user_message: 'Rate limit exceeded.',
        message: '',
        reason: '',
      },
    }
    expect(Pixiv.isError(error)).toBe(true)
  })
})
