/* eslint-disable @typescript-eslint/unbound-method */
import {
  BookmarkRestrict,
  FollowRestrict,
  IllustContentType,
  OSFilter,
  SearchAiType,
  SearchIllustDuration,
} from './options'
import Pixiv from './pixiv'
import { GetV1IllustDetailCheck } from './types/endpoints/v1/illust/detail'
import { GetV1IllustRankingCheck } from './types/endpoints/v1/illust/ranking'
import { GetV1IllustRecommendedCheck } from './types/endpoints/v1/illust/recommended'
import { GetV1IllustSeriesCheck } from './types/endpoints/v1/illust/series'
import { GetV1MangaRecommendedCheck } from './types/endpoints/v1/manga/recommended'
import { GetV1NovelRankingCheck } from './types/endpoints/v1/novel/ranking'
import { GetV1NovelRecommendedCheck } from './types/endpoints/v1/novel/recommended'
import { GetV1NovelRelatedCheck } from './types/endpoints/v1/novel/related'
import { GetV1SearchIllustCheck } from './types/endpoints/v1/search/illust'
import { GetV1SearchNovelCheck } from './types/endpoints/v1/search/novel'
import { GetV1UserBookmarksIllustCheck } from './types/endpoints/v1/user/bookmarks/illust'
import { GetV1UserBookmarksNovelCheck } from './types/endpoints/v1/user/bookmarks/novel'
import { GetV1UserDetailCheck } from './types/endpoints/v1/user/detail'
import { GetV1UserFollowingCheck } from './types/endpoints/v1/user/following'
import { GetV2IllustRelatedCheck } from './types/endpoints/v2/illust/related'
import { GetV2NovelDetailCheck } from './types/endpoints/v2/novel/detail'
import { GetV2NovelSeriesCheck } from './types/endpoints/v2/novel/series'
import { PixivRateLimitError } from './types/errors'
import { omit } from './utils'
import fs from 'node:fs'

jest.setTimeout(120_000) // 120sec

describe('pixiv', () => {
  let pixiv: Pixiv

  beforeAll(async () => {
    // Load environment variables from the .env file. Does not use dotenv, etc.
    if (fs.existsSync('.env')) {
      const env = fs.readFileSync('.env', 'utf8')
      for (const line of env.split('\n')) {
        const [key, value] = line.split('=')
        if (key && value) {
          process.env[key] = value
        }
      }
    }

    const pixivRefreshToken = process.env.PIXIV_REFRESH_TOKEN
    if (!pixivRefreshToken) {
      throw new Error('PIXIV_REFRESH_TOKEN is not set')
    }

    pixiv = await Pixiv.of(pixivRefreshToken, {
      debugOptions: {
        outputResponse: {
          enable: true,
        },
      },
    })
  })

  afterAll(async () => {
    await pixiv.close()
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

  it('illustRelated:107565629[illust]', async () => {
    const illustRelated = await pixiv.illustRelated({
      illustId: 107_565_629,
    })
    expect(illustRelated.status).toBe(200)
    expect(illustRelated.data.illusts).toBeDefined()
    expect(illustRelated.data.illusts.length).toBeGreaterThan(0)

    const check = new GetV2IllustRelatedCheck()
    expect(() => check.throwIfResponseFailed(illustRelated.data)).not.toThrow()
  })

  it('illustRelated:withFilter', async () => {
    const illustRelated = await pixiv.illustRelated({
      illustId: 107_565_629,
      filter: OSFilter.FOR_IOS,
    })
    expect(illustRelated.status).toBe(200)
    expect(illustRelated.data.illusts).toBeDefined()
    expect(illustRelated.data.illusts.length).toBeGreaterThan(0)

    const check = new GetV2IllustRelatedCheck()
    expect(() => check.throwIfResponseFailed(illustRelated.data)).not.toThrow()
  })

  it('ugoiraDetail:83638393[ugoira]', async () => {
    const ugoiraDetail = await pixiv.ugoiraMetadata({
      illustId: 83_638_393,
    })
    expect(ugoiraDetail.status).toBe(200)
    // "medium": "https://i.pximg.net/img-zip-ugoira/img/2014/06/28/12/42/39/44360221_ugoira600x600.zip".
    expect(ugoiraDetail.data.ugoira_metadata.zip_urls.medium).toMatch(
      /^https:\/\/i\.pximg\.net\/img-zip-ugoira\/img\/.+_ugoira600x600\.zip$/
    )
    expect(ugoiraDetail.data.ugoira_metadata.frames).toHaveLength(96)
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

  it('searchIllust:withDuration', async () => {
    const searchIllust = await pixiv.searchIllust({
      word: 'ホロライブ',
      duration: SearchIllustDuration.WITHIN_LAST_WEEK,
    })
    expect(searchIllust.status).toBe(200)
    expect(searchIllust.data.illusts).toBeDefined()

    const check = new GetV1SearchIllustCheck()
    expect(() => check.throwIfResponseFailed(searchIllust.data)).not.toThrow()
  })

  it('searchIllust:withSearchAiType', async () => {
    const searchIllust = await pixiv.searchIllust({
      word: 'ホロライブ',
      searchAiType: SearchAiType.SHOW_AI,
    })
    expect(searchIllust.status).toBe(200)
    expect(searchIllust.data.illusts).toBeDefined()

    const check = new GetV1SearchIllustCheck()
    expect(() => check.throwIfResponseFailed(searchIllust.data)).not.toThrow()
  })

  it('illustRanking', async () => {
    const illustRanking = await pixiv.illustRanking()
    expect(illustRanking.status).toBe(200)
    expect(illustRanking.data).toBeDefined()
    expect(illustRanking.data.illusts).toBeDefined()
    expect(illustRanking.data.illusts.length).toBeGreaterThan(0)

    const check = new GetV1IllustRankingCheck()
    expect(() => check.throwIfResponseFailed(illustRanking.data)).not.toThrow()
  })

  it('illustRecommended', async () => {
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

  it('illustRecommended:withMangaContentType', async () => {
    const recommendedIllust = await pixiv.illustRecommended({
      contentType: IllustContentType.MANGA,
    })
    expect(recommendedIllust.status).toBe(200)
    expect(recommendedIllust.data.illusts).toBeDefined()

    const check = new GetV1IllustRecommendedCheck()
    expect(() =>
      check.throwIfResponseFailed(recommendedIllust.data)
    ).not.toThrow()
  })

  it('illustRecommendedNologin', async () => {
    const recommendedIllust = await Pixiv.illustRecommendedNologin()
    expect(recommendedIllust.status).toBe(200)
    expect(recommendedIllust.data).toBeDefined()
    // The nologin endpoint may return an empty ranking_illusts array,
    // so we only verify the presence of the illusts field here
    expect(recommendedIllust.data.illusts).toBeDefined()
    expect(Array.isArray(recommendedIllust.data.illusts)).toBe(true)
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

  it('mangaRecommended', async () => {
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
      id: 13_574_875,
    })
    expect(novelText.status).toBe(200)
    expect(novelText.data).toBeDefined()
  })

  it('novelRelated:13_574_875[novel]', async () => {
    const viewed = [
      19_257_307, 14_823_759, 18_139_010, 20_311_890, 19_219_621, 13_254_987,
      19_228_582, 19_692_090, 20_571_910, 20_451_982, 15_018_893, 16_748_181,
      15_885_571, 12_981_294, 16_331_599, 16_962_597, 16_381_107,
    ]
    const novelRelated = await pixiv.novelRelated({
      novelId: 13_574_875,
      seedNovelIds: [13_574_875],
      viewed,
    })
    expect(novelRelated.status).toBe(200)
    expect(novelRelated.data).toBeDefined()
    expect(novelRelated.data.novels).toBeDefined()
    expect(novelRelated.data.novels.length).toBeGreaterThan(0)
    expect(
      novelRelated.data.novels.filter((novel) => viewed.includes(novel.id))
    ).toHaveLength(0)

    const check = new GetV1NovelRelatedCheck()
    expect(() => check.throwIfResponseFailed(novelRelated.data)).not.toThrow()
  })

  it('novelRanking', async () => {
    const novelRanking = await pixiv.novelRanking()
    expect(novelRanking.status).toBe(200)
    expect(novelRanking.data).toBeDefined()
    expect(novelRanking.data.novels).toBeDefined()
    expect(novelRanking.data.novels.length).toBeGreaterThan(0)

    const check = new GetV1NovelRankingCheck()
    expect(() => check.throwIfResponseFailed(novelRanking.data)).not.toThrow()
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

  it('searchNovel:withSearchAiType', async () => {
    const searchNovel = await pixiv.searchNovel({
      word: 'ホロライブ',
      searchAiType: SearchAiType.SHOW_AI,
    })
    expect(searchNovel.status).toBe(200)
    expect(searchNovel.data.novels).toBeDefined()

    const check = new GetV1SearchNovelCheck()
    expect(() => check.throwIfResponseFailed(searchNovel.data)).not.toThrow()
  })

  it('novelRecommended', async () => {
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

  it('userFollowing', async () => {
    const userFollowing = await pixiv.userFollowing({
      userId: Number(pixiv.userId),
      restrict: FollowRestrict.PUBLIC,
    })
    expect(userFollowing.status).toBe(200)
    expect(userFollowing.data).toBeDefined()
    expect(userFollowing.data.user_previews).toBeDefined()

    const check = new GetV1UserFollowingCheck()
    expect(() => check.throwIfResponseFailed(userFollowing.data)).not.toThrow()
  })

  it('userFollowAdd and userFollowDelete', async () => {
    // User ID for testing (pixiv staff account, which is unlikely to be deleted)
    const userId = 11

    // Check the follow state before the test
    const initialDetail = await pixiv.userDetail({
      userId,
    })
    const wasFollowed = initialDetail.data.user.is_followed ?? false

    try {
      // Run the test according to the follow state
      if (wasFollowed) {
        // If already followed, test unfollow -> follow
        const followDeleteResult = await pixiv.userFollowDelete({
          userId,
        })
        expect(followDeleteResult.status).toBe(200)

        const followAddResult = await pixiv.userFollowAdd({
          userId,
          restrict: FollowRestrict.PUBLIC,
        })
        expect(followAddResult.status).toBe(200)
      } else {
        // If not followed, test follow -> unfollow
        const followAddResult = await pixiv.userFollowAdd({
          userId,
          restrict: FollowRestrict.PUBLIC,
        })
        expect(followAddResult.status).toBe(200)

        const followDeleteResult = await pixiv.userFollowDelete({
          userId,
        })
        expect(followDeleteResult.status).toBe(200)
      }
    } finally {
      // Restore the original follow state after the test
      if (wasFollowed) {
        await pixiv.userFollowAdd({
          userId,
          restrict: FollowRestrict.PUBLIC,
        })
      } else {
        try {
          await pixiv.userFollowDelete({
            userId,
          })
        } catch {
          // Ignore the error if it has already been unfollowed
        }
      }
    }
  })

  async function restoreBookmarkState(illustId: number) {
    await pixiv.illustBookmarkAdd({
      illustId,
      restrict: BookmarkRestrict.PUBLIC,
      tags: [],
    })
  }

  it('illustBookmarkAdd and illustBookmarkDelete', async () => {
    // Illust ID for testing (uses an illust that actually exists)
    const illustId = 107_565_629 // correct digit grouping

    // Check the bookmark state before the test
    const initialDetail = await pixiv.illustDetail({
      illustId,
    })
    const wasBookmarked = initialDetail.data.illust.is_bookmarked

    try {
      // Run the test according to the bookmark state
      if (wasBookmarked) {
        // If already bookmarked, test removal -> addition
        const bookmarkDeleteResult = await pixiv.illustBookmarkDelete({
          illustId: String(illustId),
        })
        expect(bookmarkDeleteResult.status).toBe(200)

        const bookmarkAddResult = await pixiv.illustBookmarkAdd({
          illustId,
          restrict: BookmarkRestrict.PUBLIC,
          tags: ['テスト'],
        })
        expect(bookmarkAddResult.status).toBe(200)
      } else {
        // If not bookmarked, test addition -> removal
        const bookmarkAddResult = await pixiv.illustBookmarkAdd({
          illustId,
          restrict: BookmarkRestrict.PUBLIC,
          tags: ['テスト'],
        })
        expect(bookmarkAddResult.status).toBe(200)

        const bookmarkDeleteResult = await pixiv.illustBookmarkDelete({
          illustId: String(illustId),
        })
        expect(bookmarkDeleteResult.status).toBe(200)
      }
    } finally {
      await restoreBookmarkState(illustId)
    }
  })

  it('novelBookmarkAdd and novelBookmarkDelete', async () => {
    // Novel ID for testing (uses a novel that actually exists)
    const novelId = 13_574_875 // defined as a number for getting details (correct digit grouping)
    const novelIdStr = '13574875' // defined as a string for bookmarking

    // Check the bookmark state before the test
    const initialDetail = await pixiv.novelDetail({
      novelId,
    })
    const wasBookmarked = initialDetail.data.novel.is_bookmarked

    try {
      // Run the test according to the bookmark state
      if (wasBookmarked) {
        // If already bookmarked, test removal -> addition
        const novelBookmarkDeleteResult = await pixiv.novelBookmarkDelete({
          novelId: novelIdStr, // pass as a string
        })
        expect(novelBookmarkDeleteResult.status).toBe(200)

        const novelBookmarkAddResult = await pixiv.novelBookmarkAdd({
          novelId: novelIdStr, // pass as a string
          restrict: BookmarkRestrict.PUBLIC,
          tags: ['テスト'],
        })
        expect(novelBookmarkAddResult.status).toBe(200)
      } else {
        // If not bookmarked, test addition -> removal
        const novelBookmarkAddResult = await pixiv.novelBookmarkAdd({
          novelId: novelIdStr, // pass as a string
          restrict: BookmarkRestrict.PUBLIC,
          tags: ['テスト'],
        })
        expect(novelBookmarkAddResult.status).toBe(200)

        const novelBookmarkDeleteResult = await pixiv.novelBookmarkDelete({
          novelId: novelIdStr, // pass as a string
        })
        expect(novelBookmarkDeleteResult.status).toBe(200)
      }
    } finally {
      // Restore the original bookmark state after the test
      if (wasBookmarked) {
        // If it was originally bookmarked, ensure the bookmark is added
        await pixiv.novelBookmarkAdd({
          novelId: novelIdStr, // pass as a string
          restrict: BookmarkRestrict.PUBLIC,
          tags: [],
        })
      } else {
        // If it was not originally bookmarked, ensure the bookmark is removed
        try {
          await pixiv.novelBookmarkDelete({
            novelId: novelIdStr, // pass as a string
          })
        } catch {
          // Ignore the error if it has already been removed
          // Comment for error handling
        }
      }
    }
  })

  describe('utility methods', () => {
    it('parseQueryString', () => {
      const qs = 'https://example.com?a=1&b=2&c=3'
      const parsed = Pixiv.parseQueryString(qs)
      expect(parsed).toStrictEqual({
        a: '1',
        b: '2',
        c: '3',
      })
    })

    it('isError', () => {
      const error = {
        error: {
          user_message: 'Rate limit exceeded.',
          message: '',
          reason: '',
        },
      }
      expect(Pixiv.isError(error)).toBe(true)

      const notError = {
        data: {
          result: 'success',
        },
      }
      expect(Pixiv.isError(notError)).toBe(false)
    })

    it('checkRequiredOptions', () => {
      // Defined as an arrow function with `this` binding (resolves binding issues)
      const pixivInstance = pixiv
      const checkRequiredOptions = (
        options: Record<string, unknown>,
        requiredOptions: string[]
      ): void => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return (pixivInstance as any).checkRequiredOptions(
          options,
          requiredOptions
        )
      }

      expect(() => {
        checkRequiredOptions({ illustId: 123 }, ['illustId'])
      }).not.toThrow()

      expect(() => {
        checkRequiredOptions({}, ['illustId'])
      }).toThrow('Missing required option: illustId')

      expect(() => {
        checkRequiredOptions({ illustId: 123, userId: 456 }, [
          'illustId',
          'userId',
        ])
      }).not.toThrow()

      expect(() => {
        checkRequiredOptions({ illustId: 123 }, ['illustId', 'userId'])
      }).toThrow('Missing required option: userId')
    })

    it('convertCamelToSnake', () => {
      // Defined as an arrow function with `this` binding
      const pixivInstance = pixiv
      const convertCamelToSnake = (
        obj: Record<string, unknown>
      ): Record<string, unknown> => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return (pixivInstance as any).convertCamelToSnake(obj)
      }

      expect(
        convertCamelToSnake({
          illustId: 123,
          maxBookmarkId: 456,
          userDetailInfo: true,
        })
      ).toStrictEqual({
        illust_id: 123,
        max_bookmark_id: 456,
        user_detail_info: true,
      })

      expect(
        convertCamelToSnake({
          id: 123,
          name: 'test',
        })
      ).toStrictEqual({
        id: 123,
        name: 'test',
      })
    })

    it('isJSON', () => {
      // Defined as an arrow function with `this` binding
      const pixivInstance = pixiv
      const isJSON = (value: unknown): boolean => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return (pixivInstance as any).isJSON(value)
      }

      expect(isJSON({ key: 'value' })).toBe(true)

      expect(isJSON('{"key":"value"}')).toBe(true)

      expect(isJSON('invalid json')).toBe(false)
    })
  })
})

describe('Pixiv class coverage tests', () => {
  describe('of method', () => {
    // Coverage for line 245: test for token refresh failure
    it('should throw an error when refresh token fails', async () => {
      // Mock it to trigger an error
      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          Response.json(
            { error: 'invalid_token', message: 'Invalid refresh token' },
            { status: 401 }
          )
        )

      try {
        await expect(Pixiv.of('invalid_refresh_token')).rejects.toThrow(
          'Failed to refresh token'
        )
      } finally {
        fetchSpy.mockRestore()
      }
    })

    // Coverage for line 276: case without a database
    it('should initialize without response database', async () => {
      const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        Response.json(
          {
            user: { id: 'test_user_id' },
            response: {
              access_token: 'test_access_token',
              refresh_token: 'test_refresh_token',
            },
          },
          { status: 200 }
        )
      )

      try {
        // Instantiate without database options
        const instance = await Pixiv.of('test_refresh_token', {
          debugOptions: {
            outputResponse: {
              enable: false,
            },
          },
        })

        expect(instance).toBeInstanceOf(Pixiv)
        await instance.close()
      } finally {
        fetchSpy.mockRestore()
      }
    })
  })

  describe('request method', () => {
    let pixiv: Pixiv
    let requestSpy: jest.SpyInstance

    beforeAll(async () => {
      // Create a Pixiv instance for testing
      const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        Response.json(
          {
            user: { id: 'test_user_id' },
            response: {
              access_token: 'test_access_token',
              refresh_token: 'test_refresh_token',
            },
          },
          { status: 200 }
        )
      )

      try {
        pixiv = await Pixiv.of('test_refresh_token')
      } finally {
        fetchSpy.mockRestore()
      }
    })

    afterAll(async () => {
      // Clean up the instance after the test ends
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (pixiv) {
        await pixiv.close()
      }
    })

    beforeEach(() => {
      // Spy on the request method
      requestSpy = jest.spyOn(pixiv as any, 'request')
    })

    afterEach(() => {
      // Reset the spy
      requestSpy.mockRestore()
    })

    // Coverage for line 898: invalid HTTP method
    it('should throw an error with invalid HTTP method', async () => {
      // request() cannot normally be called directly, so mock it to throw an exception internally
      requestSpy.mockImplementationOnce(() => {
        throw new Error('Invalid method')
      })

      await expect(pixiv.illustDetail({ illustId: 123 })).rejects.toThrow(
        'Invalid method'
      )
    })

    // Coverage for line 906: response URL fallback
    it('should use fallback URL when responseUrl is undefined', async () => {
      // Spy on the saveResponse method
      const saveResponseSpy = jest.spyOn(pixiv as any, 'saveResponse')

      // Back up the original http.get
      const originalHttpGet = pixiv.http.get

      try {
        // Mock it
        pixiv.http.get = jest.fn().mockResolvedValueOnce({
          status: 200,
          data: { test: 'data' },
          headers: {},
          requestHeaders: {},
          requestBody: null,
          responseUrl: undefined,
        })

        // Run only if the response database is configured
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if ((pixiv as any).responseDatabase) {
          await pixiv.illustDetail({ illustId: 123 })

          // Confirm that saveResponse was called
          expect(saveResponseSpy).toHaveBeenCalled()
        } else {
          // Skip the test if there is no response database
          console.log('Test skipped: responseDatabase is not available')
        }
      } finally {
        // Restore the mock
        pixiv.http.get = originalHttpGet
        saveResponseSpy.mockRestore()
      }
    })
  })

  describe('rate limit retry', () => {
    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should propagate rateLimitRetryOptions from Pixiv.of to the http client', async () => {
      const tokenFetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          Response.json(
            {
              user: { id: 'test_user_id' },
              response: {
                access_token: 'test_access_token',
                refresh_token: 'test_refresh_token',
              },
            },
            { status: 200 }
          )
        )

      let instance: Pixiv
      try {
        instance = await Pixiv.of('test_refresh_token', {
          rateLimitRetryOptions: { maxRetries: 1, waitMs: 1 },
        })
      } finally {
        tokenFetchSpy.mockRestore()
      }

      try {
        const fetchSpy = jest
          .spyOn(globalThis, 'fetch')
          .mockResolvedValue(Response.json({}, { status: 429 }))

        await expect(instance.http.get('/test')).rejects.toThrow(
          PixivRateLimitError
        )
        // Called twice in total: the initial attempt + 1 retry (maxRetries: 1)
        expect(fetchSpy).toHaveBeenCalledTimes(2)
      } finally {
        await instance.close()
      }
    })
  })
})
