import { BaseSimpleCheck, CheckFunctions } from "src/checks"

/**
 * 圧縮されたフレームのURL
 * 
 * ここのURLも {@link ImageUrls} と同様に、適切なリファラを付与する必要がある
 */
export interface ZipUrls {
  /**
   * 長辺が最大 600px
   * 
   * "600x600" を "1920x1080" に変換したらオリジナル画像が得られる？
   */
  medium: string
}

/**
 * フレーム情報
 */
export interface Frames {
  /**
   * フレームのファイル名
   */
  file: string
  /**
   * フレームの表示時間(ms)
   */
  delay: number
}

/**
 * pixiv うごイラアイテム
 */
export interface PixivUgoiraItem {
  /**
   * 圧縮されたフレームのURL
   */
  zip_urls: ZipUrls
  /**
   * フレーム情報
   */
  frames: Frames[]
}

export class ZipUrlsCheck extends BaseSimpleCheck<ZipUrls> {
  checks(): CheckFunctions<ZipUrls> {
    return {
      medium: (data) => typeof data.medium === 'string',
    }
  }
}

export class FramesCheck extends BaseSimpleCheck<Frames> {
  checks(): CheckFunctions<Frames> {
    return {
      file: (data) => typeof data.file === 'string',
      delay: (data) => typeof data.delay === 'number',
    }
  }
}

export class PixivUgoiraItemCheck extends BaseSimpleCheck<PixivUgoiraItem> {
  checks(): CheckFunctions<PixivUgoiraItem> {
    return {
      zip_urls: (data) => 
        typeof data.zip_urls === 'object' &&
        new ZipUrlsCheck().throwIfFailed(data.zip_urls),
      frames: (data) => 
        typeof data.frames === 'object' &&
        Array.isArray(data.frames) &&
        data.frames.every((frame) => new FramesCheck().throwIfFailed(frame)),
    }
  }
}