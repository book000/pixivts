import qs from 'qs'
import { PixivRateLimitError } from './types/errors'

/**
 * 429エラー時のリトライ設定。
 */
export interface PixivRateLimitRetryOptions {
  /**
   * リクエストがレートリミットに達した場合の最大リトライ回数。
   */
  maxRetries: number

  /**
   * リクエストがレートリミットに達した場合のリトライまでの待機時間（ミリ秒）。
   */
  waitMs: number
}

/**
 * pixiv API へのリクエストに対するレスポンス。
 */
export interface PixivApiResponse<T> {
  data: T
  status: number
  headers: Record<string, string>
  requestHeaders: Record<string, string>
  requestBody: string | null
  responseUrl: string | undefined
}

function headersToRecord(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, value] of headers) {
    result[key] = value
  }
  return result
}

/**
 * Retry-After ヘッダーの値から待機時間（ミリ秒）を算出する。
 * 秒数形式 (delay-seconds) と HTTP-date 形式の両方に対応し、
 * いずれの形式でも解釈できない場合はデフォルトの待機時間 (waitMs) を返す。
 * @param retryAfter - Retry-After ヘッダーの値（未指定の場合は null）
 * @param waitMs - デフォルトの待機時間（ミリ秒）
 * @returns 待機時間（ミリ秒）
 */
function getRetryAfterWaitTime(
  retryAfter: string | null,
  waitMs: number
): number {
  if (!retryAfter) {
    return waitMs
  }

  // 秒数形式 (delay-seconds)
  if (/^\d+$/.test(retryAfter.trim())) {
    return Number.parseInt(retryAfter, 10) * 1000
  }

  // HTTP-date 形式 (例: "Wed, 21 Oct 2026 07:28:00 GMT")
  const retryDate = Date.parse(retryAfter)
  if (!Number.isNaN(retryDate)) {
    return Math.max(0, retryDate - Date.now())
  }

  return waitMs
}

/**
 * pixiv API への HTTP リクエストを行うクライアント。
 *
 * 429 (レートリミット) のレスポンスを受け取った場合、
 * Retry-After ヘッダーまたは設定された待機時間に基づいて自動的にリトライする。
 */
export class PixivHttpClient {
  private readonly baseURL: string
  private readonly defaultHeaders: Record<string, string>
  private readonly rateLimitRetryOptions: PixivRateLimitRetryOptions | null

  /**
   * コンストラクタ。
   *
   * @param baseURL リクエスト先のベース URL
   * @param headers 全リクエストに付与するデフォルトヘッダー
   * @param rateLimitRetryOptions 429エラー時のリトライ設定
   */
  constructor(
    baseURL: string,
    headers: Record<string, string>,
    rateLimitRetryOptions?: PixivRateLimitRetryOptions | null
  ) {
    this.baseURL = baseURL
    this.defaultHeaders = headers
    this.rateLimitRetryOptions = rateLimitRetryOptions ?? null
  }

  /**
   * GET リクエストを送信する。
   *
   * @param path リクエストパス
   * @param options クエリパラメータなどのオプション
   * @returns レスポンス
   */
  async get<U>(
    path: string,
    options: { params?: Record<string, any> } = {}
  ): Promise<PixivApiResponse<U>> {
    let url = `${this.baseURL}${path}`
    if (options.params) {
      const queryString = qs.stringify(options.params)
      if (queryString) url += `?${queryString}`
    }
    const response = await this.fetchWithRetry(url, {
      headers: this.defaultHeaders,
    })
    const contentType = response.headers.get('content-type') ?? ''
    const text = await response.text()
    const data = (
      contentType.includes('application/json') ? JSON.parse(text) : text
    ) as U
    return {
      data,
      status: response.status,
      headers: headersToRecord(response.headers),
      requestHeaders: this.defaultHeaders,
      requestBody: null,
      responseUrl: response.url || undefined,
    }
  }

  /**
   * POST リクエストを送信する。
   *
   * @param path リクエストパス
   * @param body リクエストボディ
   * @param options ヘッダーなどのオプション
   * @returns レスポンス
   */
  async post<U>(
    path: string,
    body: string,
    options: { headers?: Record<string, string> } = {}
  ): Promise<PixivApiResponse<U>> {
    const url = `${this.baseURL}${path}`
    const headers = { ...this.defaultHeaders, ...options.headers }
    const response = await this.fetchWithRetry(url, {
      method: 'POST',
      headers,
      body,
    })
    const contentType = response.headers.get('content-type') ?? ''
    const text = await response.text()
    const data = (
      contentType.includes('application/json') ? JSON.parse(text) : text
    ) as U
    return {
      data,
      status: response.status,
      headers: headersToRecord(response.headers),
      requestHeaders: headers,
      requestBody: body,
      responseUrl: response.url || undefined,
    }
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    // 負の値が渡された場合でもループが必ず1回以上実行されるよう0以上にクランプする
    const maxRetries = Math.max(0, this.rateLimitRetryOptions?.maxRetries ?? 3)
    // 負の値が渡された場合に setTimeout への待機時間が負値にならないよう0以上にクランプする
    const waitMs = Math.max(0, this.rateLimitRetryOptions?.waitMs ?? 10_000) // default 10 sec

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const response = await fetch(url, options)
      if (response.status !== 429) {
        return response
      }

      // 429のレスポンスボディは使用しないため、コネクション解放のため破棄する
      await response.body?.cancel()

      if (attempt < maxRetries) {
        const retryAfter = response.headers.get('Retry-After')
        const waitTime = getRetryAfterWaitTime(retryAfter, waitMs)

        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }

    throw new PixivRateLimitError('Rate limit exceeded after maximum retries')
  }
}
