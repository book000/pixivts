import { http, HttpResponse } from 'msw'

export function mockUserNovels(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/user/novels', () =>
    HttpResponse.json(body)
  )
}

export function mockUserFollowAdd(body: unknown) {
  return http.post('https://app-api.pixiv.net/v1/user/follow/add', () =>
    HttpResponse.json(body)
  )
}

export function mockUserFollowDelete(body: unknown) {
  return http.post('https://app-api.pixiv.net/v1/user/follow/delete', () =>
    HttpResponse.json(body)
  )
}

export function mockUserBookmarksIllust(body: unknown) {
  return http.get('https://app-api.pixiv.net/v1/user/bookmarks/illust', () =>
    HttpResponse.json(body)
  )
}
