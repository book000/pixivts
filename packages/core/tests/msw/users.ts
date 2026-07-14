import { http, HttpResponse } from 'msw'

/** Builds a mock handler for GET /v1/user/novels returning the given body. */
export function mockUserNovels(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/user/novels', () =>
    HttpResponse.json(body)
  )
}

/** Builds a mock handler for POST /v1/user/follow/add returning the given body. */
export function mockUserFollowAdd(body: unknown) {
  return http.post('https://app-api.pixiv.net/v1/user/follow/add', () =>
    HttpResponse.json(body)
  )
}

/** Builds a mock handler for POST /v1/user/follow/delete returning the given body. */
export function mockUserFollowDelete(body: unknown) {
  return http.post('https://app-api.pixiv.net/v1/user/follow/delete', () =>
    HttpResponse.json(body)
  )
}

/** Builds a mock handler for GET /v1/user/bookmarks/illust returning the given body. */
export function mockUserBookmarksIllust(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/user/bookmarks/illust', () =>
    HttpResponse.json(body)
  )
}
