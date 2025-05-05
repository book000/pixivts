import {
  SearchTarget,
  SearchTargetCheck,
  SearchSort,
  SearchSortCheck,
  SearchIllustDuration,
  SearchIllustDurationCheck,
  OSFilter,
  OSFilterCheck,
  BookmarkRestrict,
  BookmarkRestrictCheck,
  RankingMode,
  RankingModeCheck,
} from './options'

describe('options', () => {
  describe('SearchTargetCheck', () => {
    let check: SearchTargetCheck

    beforeEach(() => {
      check = new SearchTargetCheck()
    })

    it('should validate valid SearchTarget values', () => {
      expect(check.is(SearchTarget.PARTIAL_MATCH_FOR_TAGS)).toBe(true)
      expect(check.is(SearchTarget.EXACT_MATCH_FOR_TAGS)).toBe(true)
      expect(check.is(SearchTarget.TITLE_AND_CAPTION)).toBe(true)
      expect(check.is(SearchTarget.KEYWORD)).toBe(true)
    })

    it('should invalidate invalid SearchTarget values', () => {
      expect(check.is('invalid' as SearchTarget)).toBe(false)
      expect(check.is('' as SearchTarget)).toBe(false)
      expect(check.is(undefined as unknown as SearchTarget)).toBe(false)
      expect(check.is(null as unknown as SearchTarget)).toBe(false)
    })
  })

  describe('SearchSortCheck', () => {
    let check: SearchSortCheck

    beforeEach(() => {
      check = new SearchSortCheck()
    })

    it('should validate valid SearchSort values', () => {
      expect(check.is(SearchSort.DATE_DESC)).toBe(true)
      expect(check.is(SearchSort.DATE_ASC)).toBe(true)
      expect(check.is(SearchSort.POPULAR_DESC)).toBe(true)
    })

    it('should invalidate invalid SearchSort values', () => {
      expect(check.is('invalid' as SearchSort)).toBe(false)
      expect(check.is('' as SearchSort)).toBe(false)
      expect(check.is(undefined as unknown as SearchSort)).toBe(false)
      expect(check.is(null as unknown as SearchSort)).toBe(false)
    })
  })

  describe('SearchIllustDurationCheck', () => {
    let check: SearchIllustDurationCheck

    beforeEach(() => {
      check = new SearchIllustDurationCheck()
    })

    it('should validate valid SearchIllustDuration values', () => {
      expect(check.is(SearchIllustDuration.WITHIN_LAST_DAY)).toBe(true)
      expect(check.is(SearchIllustDuration.WITHIN_LAST_WEEK)).toBe(true)
      expect(check.is(SearchIllustDuration.WITHIN_LAST_MONTH)).toBe(true)
    })

    it('should invalidate invalid SearchIllustDuration values', () => {
      expect(check.is('invalid' as SearchIllustDuration)).toBe(false)
      expect(check.is('' as SearchIllustDuration)).toBe(false)
      expect(check.is(undefined as unknown as SearchIllustDuration)).toBe(false)
      expect(check.is(null as unknown as SearchIllustDuration)).toBe(false)
    })
  })

  describe('OSFilterCheck', () => {
    let check: OSFilterCheck

    beforeEach(() => {
      check = new OSFilterCheck()
    })

    it('should validate valid OSFilter values', () => {
      expect(check.is(OSFilter.FOR_IOS)).toBe(true)
      expect(check.is(OSFilter.FOR_ANDROID)).toBe(true)
    })

    it('should invalidate invalid OSFilter values', () => {
      expect(check.is('invalid' as OSFilter)).toBe(false)
      expect(check.is('' as OSFilter)).toBe(false)
      expect(check.is(undefined as unknown as OSFilter)).toBe(false)
      expect(check.is(null as unknown as OSFilter)).toBe(false)
    })
  })

  describe('BookmarkRestrictCheck', () => {
    let check: BookmarkRestrictCheck

    beforeEach(() => {
      check = new BookmarkRestrictCheck()
    })

    it('should validate valid BookmarkRestrict values', () => {
      expect(check.is(BookmarkRestrict.PUBLIC)).toBe(true)
      expect(check.is(BookmarkRestrict.PRIVATE)).toBe(true)
    })

    it('should invalidate invalid BookmarkRestrict values', () => {
      expect(check.is('invalid' as BookmarkRestrict)).toBe(false)
      expect(check.is('' as BookmarkRestrict)).toBe(false)
      expect(check.is(undefined as unknown as BookmarkRestrict)).toBe(false)
      expect(check.is(null as unknown as BookmarkRestrict)).toBe(false)
    })
  })

  describe('RankingModeCheck', () => {
    let check: RankingModeCheck

    beforeEach(() => {
      check = new RankingModeCheck()
    })

    it('should validate valid RankingMode values', () => {
      expect(check.is(RankingMode.DAY)).toBe(true)
      expect(check.is(RankingMode.DAY_MALE)).toBe(true)
      expect(check.is(RankingMode.DAY_FEMALE)).toBe(true)
      expect(check.is(RankingMode.WEEK_ORIGINAL)).toBe(true)
      expect(check.is(RankingMode.WEEK_ROOKIE)).toBe(true)
      expect(check.is(RankingMode.WEEK)).toBe(true)
      expect(check.is(RankingMode.MONTH)).toBe(true)
      expect(check.is(RankingMode.DAY_AI)).toBe(true)
      expect(check.is(RankingMode.DAY_R18)).toBe(true)
      expect(check.is(RankingMode.WEEK_R18)).toBe(true)
      expect(check.is(RankingMode.DAY_MALE_R18)).toBe(true)
      expect(check.is(RankingMode.DAY_FEMALE_R18)).toBe(true)
      expect(check.is(RankingMode.DAY_R18_AI)).toBe(true)
    })

    it('should invalidate invalid RankingMode values', () => {
      expect(check.is('invalid' as RankingMode)).toBe(false)
      expect(check.is('' as RankingMode)).toBe(false)
      expect(check.is(undefined as unknown as RankingMode)).toBe(false)
      expect(check.is(null as unknown as RankingMode)).toBe(false)
    })
  })
})