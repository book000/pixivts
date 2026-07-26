import { http, HttpResponse, type JsonBodyType } from 'msw'

export function mockUserNovels(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/user/novels', () =>
    HttpResponse.json(body)
  )
}

export function mockUserFollowAdd(body: JsonBodyType) {
  return http.post('https://app-api.pixiv.net/v1/user/follow/add', () =>
    HttpResponse.json(body)
  )
}

export function mockUserFollowDelete(body: JsonBodyType) {
  return http.post('https://app-api.pixiv.net/v1/user/follow/delete', () =>
    HttpResponse.json(body)
  )
}

export function mockUserBookmarksIllust(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/user/bookmarks/illust', () =>
    HttpResponse.json(body)
  )
}

export function mockUserRelated(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/user/related', () =>
    HttpResponse.json(body)
  )
}

export function mockUserRecommended(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/user/recommended', () =>
    HttpResponse.json(body)
  )
}

export function mockUserFollower(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/user/follower', () =>
    HttpResponse.json(body)
  )
}

export function mockUserMypixiv(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/user/mypixiv', () =>
    HttpResponse.json(body)
  )
}

/** Mocks GET /v2/user/list. Note: real API returns `users`, not `user_previews`. */
export function mockUserList(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v2/user/list', () =>
    HttpResponse.json(body)
  )
}

export function mockUserBookmarkTagsIllust(body: JsonBodyType) {
  return http.get(
    'https://app-api.pixiv.net/v1/user/bookmark-tags/illust',
    () => HttpResponse.json(body)
  )
}

export function mockUserEditAiShowSettings(body: JsonBodyType) {
  return http.post(
    'https://app-api.pixiv.net/v1/user/ai-show-settings/edit',
    () => HttpResponse.json(body)
  )
}

export function mockUserSearch(body: JsonBodyType) {
  return http.get('https://app-api.pixiv.net/v1/search/user', () =>
    HttpResponse.json(body)
  )
}
