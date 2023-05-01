interface Error {
  /**
   * ユーザ向けのエラーメッセージ
   */
  user_message: string

  /**
   * エラーメッセージ
   */
  message: string

  /**
   * エラーの原因
   */
  reason: string

  /**
   * ユーザ向けのエラーメッセージ詳細
   */
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
