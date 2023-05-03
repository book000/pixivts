import { isEmptyObject } from './utils'

describe('utils', () => {
  it('isEmptyObject', () => {
    expect(isEmptyObject({})).toBeTruthy()
    expect(isEmptyObject({ a: 1 })).toBeFalsy()
  })
})
