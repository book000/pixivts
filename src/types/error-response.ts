interface Error {
  user_message: string
  message: string
  reason: string
  user_message_details: unknown
}

/**
 * pixiv が返すエラーレスポンス
 */
export interface PixivApiError {
  /**
   * エラーの詳細
   */
  error: Error
}
