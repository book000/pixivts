import { BaseSimpleCheck, CheckFunctions } from '../checks'

/**
 * URL of the compressed frames
 *
 * As with {@link ImageUrls}, an appropriate referer must be set for these URLs
 */
export interface ZipUrls {
  /**
   * Long side is at most 600px
   *
   * Converting "600x600" to "1920x1080" may yield the original image?
   */
  medium: string
}

/**
 * Frame information
 */
export interface Frames {
  /**
   * Frame file name
   */
  file: string
  /**
   * Frame display duration (ms)
   */
  delay: number
}

/**
 * pixiv ugoira item
 */
export interface PixivUgoiraItem {
  /**
   * URL of the compressed frames
   */
  zip_urls: ZipUrls
  /**
   * Frame information
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
