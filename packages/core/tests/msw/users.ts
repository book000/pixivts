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
