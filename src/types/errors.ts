/**
 * Error thrown when a rate limit error is not resolved even after retrying the configured number of times
 */
export class PixivRateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PixivRateLimitError'
  }
}
