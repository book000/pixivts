# Option Constants

All option types are exported as both a `const` object and a string literal
type with the same name.
Use whichever style you prefer — both are fully type-safe and interchangeable.

```typescript
import { BookmarkRestrict, RankingMode, SearchSort } from '@book000/pixivts'

// Const-object style — shows up in IDE autocomplete
await client.illusts.bookmarkAdd({ illustId: 123, restrict: BookmarkRestrict.PUBLIC })
await client.illusts.ranking({ mode: RankingMode.WEEK })
await client.illusts.search({ word: 'cat', sort: SearchSort.POPULAR_DESC })

// Plain string literal — also valid
await client.illusts.bookmarkAdd({ illustId: 123, restrict: 'public' })
```

## Available constants

### `BookmarkRestrict`

| Key | Value |
|---|---|
| `PUBLIC` | `'public'` |
| `PRIVATE` | `'private'` |

### `FollowRestrict`

| Key | Value |
|---|---|
| `PUBLIC` | `'public'` |
| `PRIVATE` | `'private'` |

### `RankingMode`

| Key | Value |
|---|---|
| `DAY` | `'day'` |
| `DAY_MALE` | `'day_male'` |
| `DAY_FEMALE` | `'day_female'` |
| `WEEK` | `'week'` |
| `WEEK_ORIGINAL` | `'week_original'` |
| `WEEK_ROOKIE` | `'week_rookie'` |
| `MONTH` | `'month'` |
| `DAY_AI` | `'day_ai'` |
| `DAY_R18` | `'day_r18'` |
| `WEEK_R18` | `'week_r18'` |
| `DAY_MALE_R18` | `'day_male_r18'` |
| `DAY_FEMALE_R18` | `'day_female_r18'` |
| `DAY_R18_AI` | `'day_r18_ai'` |

### `NovelRankingMode`

| Key | Value |
|---|---|
| `DAY` | `'day'` |
| `WEEK` | `'week'` |
| `DAY_MALE` | `'day_male'` |
| `DAY_FEMALE` | `'day_female'` |
| `WEEK_ROOKIE` | `'week_rookie'` |
| `DAY_R18` | `'day_r18'` |
| `WEEK_R18` | `'week_r18'` |
| `DAY_R18_AI` | `'day_r18_ai'` |

### `SearchTarget`

| Key | Value |
|---|---|
| `PARTIAL_MATCH_FOR_TAGS` | `'partial_match_for_tags'` |
| `EXACT_MATCH_FOR_TAGS` | `'exact_match_for_tags'` |
| `TITLE_AND_CAPTION` | `'title_and_caption'` |
| `KEYWORD` | `'keyword'` |

### `SearchSort`

| Key | Value |
|---|---|
| `DATE_DESC` | `'date_desc'` |
| `DATE_ASC` | `'date_asc'` |
| `POPULAR_DESC` | `'popular_desc'` |

### `SearchDuration`

| Key | Value |
|---|---|
| `WITHIN_LAST_DAY` | `'within_last_day'` |
| `WITHIN_LAST_WEEK` | `'within_last_week'` |
| `WITHIN_LAST_MONTH` | `'within_last_month'` |

### `OSFilter`

| Key | Value |
|---|---|
| `FOR_IOS` | `'for_ios'` |
| `FOR_ANDROID` | `'for_android'` |

### `UserIllustType`

| Key | Value |
|---|---|
| `ILLUST` | `'illust'` |
| `MANGA` | `'manga'` |
