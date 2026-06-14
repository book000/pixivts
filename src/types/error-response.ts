/**
 * Detailed error information returned by the pixiv API
 */
export interface PixivErrorDetail {
  /**
   * Error message for the user
   */
  user_message: string

  /**
   * Error message
   */
  message: string

  /**
   * Cause of the error
   */
  reason: string

  /**
   * Details of the error message for the user
   */
  user_message_details?: unknown
}

/**
 * Error response returned by pixiv
 */
export interface PixivApiError {
  /**
   * Error details
   */
  error: PixivErrorDetail
}
