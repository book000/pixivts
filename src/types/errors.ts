/**
 * レートリミットエラー時、規定回数以上リトライしてもエラーが解消されない場合にスローされるエラー
 */
export class PixivRateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PixivRateLimitError'
  }
}
