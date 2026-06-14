import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateJapaneseRatio,
  checkPrLanguage,
  JAPANESE_RATIO_THRESHOLD,
} from './check-pr-language.mjs'

describe('calculateJapaneseRatio', () => {
  it('returns 0 for text without Japanese or Latin alphanumeric characters', () => {
    assert.equal(calculateJapaneseRatio(''), 0)
    assert.equal(calculateJapaneseRatio('!!! ??? ---'), 0)
  })

  it('returns 0 for fully Latin/English text', () => {
    assert.equal(calculateJapaneseRatio('feat: add english docs'), 0)
  })

  it('returns 1 for fully Japanese text', () => {
    assert.equal(calculateJapaneseRatio('日本語のテキストです'), 1)
  })

  it('returns a ratio between 0 and 1 for mixed text', () => {
    const ratio = calculateJapaneseRatio('feat: 日本語を追加')
    assert.ok(ratio > 0 && ratio < 1)
  })
})

describe('checkPrLanguage', () => {
  it('passes for an English title and body', () => {
    const failures = checkPrLanguage(
      'feat: add english docs',
      'This adds english documentation.'
    )
    assert.deepEqual(failures, [])
  })

  it('fails for a mostly Japanese title and body', () => {
    const failures = checkPrLanguage(
      'feat: 日本語のタイトルをここに記載する',
      'ほとんど日本語の本文です。'
    )
    assert.equal(failures.length, 2)
  })

  it('skips the body check when the body is empty', () => {
    const failures = checkPrLanguage(
      'feat: 日本語のタイトルをここに記載する',
      ''
    )
    assert.equal(failures.length, 1)
  })

  it('skips the body check when the body is only whitespace', () => {
    const failures = checkPrLanguage('feat: add english docs', '   \n  ')
    assert.deepEqual(failures, [])
  })

  it('treats a ratio exactly at the threshold as a failure', () => {
    // 8 Japanese characters and 2 Latin characters => ratio 0.8
    const text = '日本語日本語日本ab'
    assert.equal(calculateJapaneseRatio(text), JAPANESE_RATIO_THRESHOLD)
    const failures = checkPrLanguage(text, '')
    assert.equal(failures.length, 1)
  })
})
