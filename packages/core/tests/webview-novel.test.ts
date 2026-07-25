import { describe, expect, it } from 'vitest'
import { parseWebviewNovel } from '../src/webview-novel'

function webviewNovelHtml(novel: Record<string, unknown>): string {
  return `<html><body><script>pixiv.context.novel = {novel: ${JSON.stringify(
    novel
  )}, isOwnWork: false, isMuteAll: false}</script></body></html>`
}

describe('parseWebviewNovel()', () => {
  it('parses a WebviewNovel object embedded in the HTML page', () => {
    const html = webviewNovelHtml({
      id: '100',
      title: 'Test Novel',
      user_id: '42',
      cover_url: 'https://i.pximg.net/c.jpg',
      tags: ['tag1'],
      caption: '',
      cdate: '2024-01-01T00:00:00+09:00',
      rating: { like: 1, bookmark: 2, view: 3 },
      text: 'body text',
      series_navigation: {},
      ai_type: 0,
      is_original: true,
    })

    const result = parseWebviewNovel(html)
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.id).toBe('100')
    expect(result.value.userId).toBe('42')
    expect(result.value.rating).toEqual({ like: 1, bookmark: 2, view: 3 })
    expect(result.value.isOriginal).toBe(true)
  })

  it('parses nested series navigation', () => {
    const html = webviewNovelHtml({
      id: '100',
      title: 'Test Novel',
      user_id: '42',
      cover_url: 'https://i.pximg.net/c.jpg',
      tags: [],
      caption: '',
      cdate: '2024-01-01T00:00:00+09:00',
      rating: { like: 0, bookmark: 0, view: 0 },
      text: 'body text',
      series_navigation: {
        next: {
          id: 101,
          viewable: true,
          content_order: '2',
          title: 'Next Chapter',
          cover_url: 'https://i.pximg.net/n.jpg',
        },
      },
      ai_type: 0,
      is_original: true,
    })

    const result = parseWebviewNovel(html)
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.seriesNavigation).toEqual({
      next: {
        id: 101,
        viewable: true,
        contentOrder: '2',
        title: 'Next Chapter',
        coverUrl: 'https://i.pximg.net/n.jpg',
      },
    })
  })

  it('parses explicit null values for series/marker fields', () => {
    const html = webviewNovelHtml({
      id: '100',
      title: 'Test Novel',
      series_id: null,
      series_title: null,
      series_is_watched: null,
      user_id: '42',
      cover_url: 'https://i.pximg.net/c.jpg',
      tags: [],
      caption: '',
      cdate: '2024-01-01T00:00:00+09:00',
      rating: { like: 0, bookmark: 0, view: 0 },
      text: 'body text',
      marker: null,
      series_navigation: {},
      ai_type: 0,
      is_original: true,
    })

    const result = parseWebviewNovel(html)
    expect(result.isOk).toBe(true)
    if (!result.isOk) return
    expect(result.value.seriesId).toBeNull()
    expect(result.value.seriesTitle).toBeNull()
    expect(result.value.seriesIsWatched).toBeNull()
    expect(result.value.marker).toBeNull()
  })

  it('returns an Err with type parse_error when no embedded JSON is found', () => {
    const result = parseWebviewNovel('<html><body>no data here</body></html>')
    expect(result.isOk).toBe(false)
    if (result.isOk) return
    expect(result.error.type).toBe('parse_error')
  })

  it('returns an Err with type parse_error and a cause when the embedded JSON is malformed', () => {
    const html =
      '<script>pixiv.context.novel = {novel: {id: "100", not valid json}, isOwnWork: false}</script>'
    const result = parseWebviewNovel(html)
    expect(result.isOk).toBe(false)
    if (result.isOk) return
    expect(result.error.type).toBe('parse_error')
    if (result.error.type !== 'parse_error') return
    expect(result.error.cause).toBeInstanceOf(SyntaxError)
  })

  it('returns an Err with type parse_error when the embedded JSON does not match the WebviewNovel shape', () => {
    const html = webviewNovelHtml({ unrelated: 'data' })
    const result = parseWebviewNovel(html)
    expect(result.isOk).toBe(false)
    if (result.isOk) return
    expect(result.error.type).toBe('parse_error')
  })
})
