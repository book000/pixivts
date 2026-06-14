import { PixivHttpClient } from './http-client'
import { PixivRateLimitError } from './types/errors'

describe('PixivHttpClient', () => {
  describe('rate limit retry', () => {
    let setTimeoutSpy: jest.SpyInstance

    beforeEach(() => {
      // setTimeoutをモック化し、実際には待機せずコールバックを即時実行する
      setTimeoutSpy = jest
        .spyOn(globalThis, 'setTimeout')
        .mockImplementation((callback: () => void) => {
          callback()
          return 0 as unknown as NodeJS.Timeout
        })
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should retry and return the response when a 429 is followed by a success', async () => {
      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(Response.json({}, { status: 429 }))
        .mockResolvedValueOnce(Response.json({ ok: true }, { status: 200 }))

      const client = new PixivHttpClient('https://example.com', {})
      const response = await client.get<{ ok: boolean }>('/test')

      expect(response.status).toBe(200)
      expect(response.data).toEqual({ ok: true })
      expect(fetchSpy).toHaveBeenCalledTimes(2)
      // デフォルトの待機時間 (10秒) で待機すること
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10_000)
    })

    it('should throw an error when 429 persists beyond maxRetries', async () => {
      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(Response.json({}, { status: 429 }))

      const client = new PixivHttpClient(
        'https://example.com',
        {},
        { maxRetries: 2, waitMs: 1 }
      )

      await expect(client.get('/test')).rejects.toThrow(PixivRateLimitError)
      // 初回 + maxRetriesの2回 = 計3回呼び出される
      expect(fetchSpy).toHaveBeenCalledTimes(3)
      expect(setTimeoutSpy).toHaveBeenCalledTimes(2)
    })

    it('should retry multiple times in a row and succeed once 429 stops', async () => {
      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(Response.json({}, { status: 429 }))
        .mockResolvedValueOnce(Response.json({}, { status: 429 }))
        .mockResolvedValueOnce(Response.json({ ok: true }, { status: 200 }))

      const client = new PixivHttpClient(
        'https://example.com',
        {},
        { maxRetries: 3, waitMs: 1 }
      )
      const response = await client.get<{ ok: boolean }>('/test')

      expect(response.status).toBe(200)
      expect(response.data).toEqual({ ok: true })
      // 429が2回続いた後に成功するため、計3回呼び出される
      expect(fetchSpy).toHaveBeenCalledTimes(3)
      expect(setTimeoutSpy).toHaveBeenCalledTimes(2)
    })

    it('should use the Retry-After header value (in seconds) as the wait time', async () => {
      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          Response.json({}, { status: 429, headers: { 'Retry-After': '5' } })
        )
        .mockResolvedValueOnce(Response.json({ ok: true }, { status: 200 }))

      const client = new PixivHttpClient(
        'https://example.com',
        {},
        { maxRetries: 3, waitMs: 10_000 }
      )
      await client.get('/test')

      // Retry-After ヘッダーの値(秒)をミリ秒に変換した値で待機すること
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000)
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })

    it('should fall back to waitMs when the Retry-After header is neither a number nor a valid date', async () => {
      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          Response.json(
            {},
            {
              status: 429,
              // 秒数・HTTP-date いずれの形式としても解釈できない Retry-After
              headers: { 'Retry-After': 'invalid-value' },
            }
          )
        )
        .mockResolvedValueOnce(Response.json({ ok: true }, { status: 200 }))

      const client = new PixivHttpClient(
        'https://example.com',
        {},
        { maxRetries: 3, waitMs: 12_345 }
      )
      await client.get('/test')

      // 秒数・HTTP-date いずれとしても解釈できない Retry-After の場合は waitMs にフォールバックすること
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 12_345)
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })

    it('should use the Retry-After header value when given as an HTTP-date', async () => {
      const now = Date.UTC(2026, 0, 1, 0, 0, 0)
      jest.spyOn(Date, 'now').mockReturnValue(now)

      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          Response.json(
            {},
            {
              status: 429,
              // 現在時刻 (2026-01-01T00:00:00Z) から7秒後のHTTP-date
              headers: { 'Retry-After': 'Thu, 01 Jan 2026 00:00:07 GMT' },
            }
          )
        )
        .mockResolvedValueOnce(Response.json({ ok: true }, { status: 200 }))

      const client = new PixivHttpClient(
        'https://example.com',
        {},
        { maxRetries: 3, waitMs: 10_000 }
      )
      await client.get('/test')

      // HTTP-dateと現在時刻の差分(ミリ秒)で待機すること
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 7000)
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })

    it('should not wait a negative time when the Retry-After HTTP-date is in the past', async () => {
      const now = Date.UTC(2026, 0, 1, 0, 0, 10)
      jest.spyOn(Date, 'now').mockReturnValue(now)

      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          Response.json(
            {},
            {
              status: 429,
              // 現在時刻 (2026-01-01T00:00:10Z) より過去のHTTP-date
              headers: { 'Retry-After': 'Thu, 01 Jan 2026 00:00:00 GMT' },
            }
          )
        )
        .mockResolvedValueOnce(Response.json({ ok: true }, { status: 200 }))

      const client = new PixivHttpClient(
        'https://example.com',
        {},
        { maxRetries: 3, waitMs: 10_000 }
      )
      await client.get('/test')

      // 過去日時の場合は待機時間を0にクランプすること
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0)
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })

    it('should throw immediately without waiting when maxRetries is 0', async () => {
      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(Response.json({}, { status: 429 }))

      const client = new PixivHttpClient(
        'https://example.com',
        {},
        { maxRetries: 0, waitMs: 10_000 }
      )

      await expect(client.get('/test')).rejects.toThrow(PixivRateLimitError)
      expect(fetchSpy).toHaveBeenCalledTimes(1)
      expect(setTimeoutSpy).not.toHaveBeenCalled()
    })

    it('should not retry when the response status is not 429', async () => {
      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(Response.json({}, { status: 500 }))

      const client = new PixivHttpClient('https://example.com', {})
      const response = await client.get('/test')

      expect(response.status).toBe(500)
      expect(fetchSpy).toHaveBeenCalledTimes(1)
      expect(setTimeoutSpy).not.toHaveBeenCalled()
    })

    it('should retry on post() as well', async () => {
      const fetchSpy = jest
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(Response.json({}, { status: 429 }))
        .mockResolvedValueOnce(Response.json({ ok: true }, { status: 200 }))

      const client = new PixivHttpClient(
        'https://example.com',
        {},
        { maxRetries: 1, waitMs: 1 }
      )
      const response = await client.post<{ ok: boolean }>('/test', 'body')

      expect(response.status).toBe(200)
      expect(response.data).toEqual({ ok: true })
      expect(fetchSpy).toHaveBeenCalledTimes(2)
    })
  })
})
