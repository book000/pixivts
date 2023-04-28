interface Error {
  user_message: string
  message: string
  reason: string
  user_message_details: unknown
}

export interface PixivApiError {
  error: Error
}
