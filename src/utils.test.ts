import { isEmptyObject, omit } from './utils'

describe('utils', () => {
  it('isEmptyObject', () => {
    expect(isEmptyObject({})).toBeTruthy()
    expect(isEmptyObject({ a: 1 })).toBeFalsy()
  })

  it('omit', () => {
    const object = { a: 1, b: 2, c: 3 }
    expect(omit(object, ['a', 'b'])).toEqual({ c: 3 })
    expect(object).toEqual({ a: 1, b: 2, c: 3 })
  })
})
