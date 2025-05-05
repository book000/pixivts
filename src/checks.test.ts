import { BaseSimpleCheck, BaseMultipleCheck } from './checks'

interface TestData {
  name?: string
  age?: number
  id?: number
  data?: unknown
}

class SimpleCheckTest extends BaseSimpleCheck<TestData> {
  checks() {
    return {
      isObject: (data: TestData): boolean => typeof data === 'object',
      hasName: (data: TestData): boolean =>
        'name' in data && typeof data.name === 'string',
      nameNotEmpty: (data: TestData): boolean => {
        return (
          'name' in data &&
          typeof data.name === 'string' &&
          data.name.length > 0
        )
      },
      hasValidAge: (data: TestData): boolean => {
        return 'age' in data && typeof data.age === 'number' && data.age >= 0
      },
      throwingCheck: (): never => {
        throw new Error('Test error')
      },
    }
  }
}

class MultipleCheckTest extends BaseMultipleCheck<TestData, TestData> {
  requestChecks() {
    return {
      isObject: (data: TestData): boolean => typeof data === 'object',
      hasId: (data: TestData): boolean =>
        'id' in data && typeof data.id === 'number',
      idPositive: (data: TestData): boolean => {
        return 'id' in data && typeof data.id === 'number' && data.id > 0
      },
      throwingCheck: (): never => {
        throw new Error('Test error in request')
      },
    }
  }

  responseChecks() {
    return {
      isObject: (data: TestData): boolean => typeof data === 'object',
      hasData: (data: TestData): boolean => 'data' in data,
      dataIsArray: (data: TestData): boolean => {
        return 'data' in data && Array.isArray(data.data)
      },
      throwingCheck: (): never => {
        throw new Error('Test error in response')
      },
    }
  }
}

describe('BaseSimpleCheck', () => {
  let simpleCheck: SimpleCheckTest

  beforeEach(() => {
    simpleCheck = new SimpleCheckTest()
  })

  describe('getFailedChecks', () => {
    it('should return appropriate failures for valid data', () => {
      const data = { name: 'Test', age: 20 }
      const failedChecks = simpleCheck.getFailedChecks(data)
      // throwingCheckは常に失敗するので、それ以外のチェックは通過していることを確認
      expect(failedChecks).toEqual(['throwingCheck'])
    })

    it('should return all failed check names for invalid data', () => {
      const data = { name: '', age: -5 }
      const failedChecks = simpleCheck.getFailedChecks(data)
      // throwingCheckに加えて、他の検証も失敗することを確認
      expect(failedChecks).toContain('nameNotEmpty')
      expect(failedChecks).toContain('hasValidAge')
      expect(failedChecks).toContain('throwingCheck')
    })

    it('should include throwing checks by default', () => {
      const data = { name: 'Test', age: 20 }
      const failedChecks = simpleCheck.getFailedChecks(data)
      expect(failedChecks).toContain('throwingCheck')
    })

    it('should rethrow exceptions when reThrow is true', () => {
      const data = { name: 'Test', age: 20 }
      expect(() => simpleCheck.getFailedChecks(data, true)).toThrow(
        'Test error'
      )
    })
  })

  describe('is', () => {
    it('should return true for valid data', () => {
      const data = { name: 'Test', age: 20 }
      // throwingCheckはエラーを投げるので常に失敗するが、テストのためこれを除く
      jest.spyOn(simpleCheck, 'getFailedChecks').mockReturnValue([])
      expect(simpleCheck.is(data)).toBe(true)
    })

    it('should return false for invalid data', () => {
      // 文字列をnumberプロパティに割り当てないように修正
      const data = { name: 'Test' } // name のみ指定、age は undefined
      expect(simpleCheck.is(data)).toBe(false)
    })
  })

  describe('throwIfFailed', () => {
    it('should not throw for valid data when mocked', () => {
      const data = { name: 'Test', age: 20 }
      // throwingCheckはエラーを投げるので常に失敗するが、テストのためこれを除く
      jest.spyOn(simpleCheck, 'getFailedChecks').mockReturnValue([])
      expect(() => simpleCheck.throwIfFailed(data)).not.toThrow()
      expect(simpleCheck.throwIfFailed(data)).toBe(true)
    })

    it('should throw with correct message for invalid data', () => {
      const data = { name: '', age: -5 }
      // throwingCheckに加えて、nameNotEmptyとhasValidAgeも失敗するので、
      // getFailedChecksの結果をモックして特定のエラーのみにする
      jest
        .spyOn(simpleCheck, 'getFailedChecks')
        .mockReturnValue(['nameNotEmpty', 'hasValidAge'])
      expect(() => simpleCheck.throwIfFailed(data)).toThrow(
        'Failed checks: nameNotEmpty, hasValidAge'
      )
    })
  })
})

describe('BaseMultipleCheck', () => {
  let multipleCheck: MultipleCheckTest

  beforeEach(() => {
    multipleCheck = new MultipleCheckTest()
  })

  describe('getFailureRequestChecks', () => {
    it('should return empty array for valid request data', () => {
      const data = { id: 1 }
      // throwingCheckはエラーを投げるので常に失敗するが、テストのためこれを無視する
      jest.spyOn(multipleCheck, 'requestChecks').mockImplementation(() => {
        return {
          isObject: (data: TestData): boolean => typeof data === 'object',
          hasId: (data: TestData): boolean =>
            'id' in data && typeof data.id === 'number',
          idPositive: (data: TestData): boolean => {
            return 'id' in data && typeof data.id === 'number' && data.id > 0
          },
          throwingCheck: (): never => {
            throw new Error('Test error in request')
          },
        }
      })

      // requestChecksの結果内のthrowingCheckを上書きしないようにした上で、
      // getFailureRequestChecksを一部モックして、throwingCheckによる失敗を無視
      const originalGetFailureRequestChecks =
        multipleCheck.getFailureRequestChecks.bind(multipleCheck)
      jest
        .spyOn(multipleCheck, 'getFailureRequestChecks')
        .mockImplementation((data, reThrow = false) => {
          const failures = originalGetFailureRequestChecks(data, reThrow)
          return failures.filter((key) => key !== 'throwingCheck')
        })

      const failedChecks = multipleCheck.getFailureRequestChecks(data)
      expect(failedChecks).toEqual([])
    })

    it('should return failed check names for invalid request data', () => {
      const data = { id: 0 }
      // throwingCheckはエラーを投げるので常に失敗するが、テストのためこれを無視する
      jest.spyOn(multipleCheck, 'requestChecks').mockImplementation(() => {
        return {
          isObject: (data: TestData): boolean => typeof data === 'object',
          hasId: (data: TestData): boolean =>
            'id' in data && typeof data.id === 'number',
          idPositive: (data: TestData): boolean => {
            return 'id' in data && typeof data.id === 'number' && data.id > 0
          },
          throwingCheck: (): never => {
            throw new Error('Test error in request')
          },
        }
      })

      // requestChecksの結果内のthrowingCheckを上書きしないようにした上で、
      // getFailureRequestChecksを一部モックして、throwingCheckによる失敗を無視
      const originalGetFailureRequestChecks =
        multipleCheck.getFailureRequestChecks.bind(multipleCheck)
      jest
        .spyOn(multipleCheck, 'getFailureRequestChecks')
        .mockImplementation((data, reThrow = false) => {
          const failures = originalGetFailureRequestChecks(data, reThrow)
          return failures.filter((key) => key !== 'throwingCheck')
        })

      const failedChecks = multipleCheck.getFailureRequestChecks(data)
      expect(failedChecks).toEqual(['idPositive'])
    })

    it('should include throwing checks by default', () => {
      const data = { id: 1 }
      const failedChecks = multipleCheck.getFailureRequestChecks(data)
      expect(failedChecks).toContain('throwingCheck')
    })

    it('should rethrow exceptions when reThrow is true', () => {
      const data = { id: 1 }
      expect(() => multipleCheck.getFailureRequestChecks(data, true)).toThrow(
        'Test error in request'
      )
    })
  })

  describe('isRequest', () => {
    it('should return true for valid request data', () => {
      const data = { id: 1 }
      // throwingCheckはエラーを投げるので常に失敗するが、テストのためこれを除く
      jest.spyOn(multipleCheck, 'getFailureRequestChecks').mockReturnValue([])
      expect(multipleCheck.isRequest(data)).toBe(true)
    })

    it('should return false for invalid request data', () => {
      // 文字列をnumberプロパティに割り当てないように修正
      const data = {} // id を指定しない
      expect(multipleCheck.isRequest(data)).toBe(false)
    })
  })

  describe('throwIfRequestFailed', () => {
    it('should not throw for valid request data', () => {
      const data = { id: 1 }
      // throwingCheckはエラーを投げるので常に失敗するが、テストのためこれを除く
      jest.spyOn(multipleCheck, 'getFailureRequestChecks').mockReturnValue([])
      expect(() => multipleCheck.throwIfRequestFailed(data)).not.toThrow()
      expect(multipleCheck.throwIfRequestFailed(data)).toBe(true)
    })

    it('should throw for invalid request data', () => {
      const data = { id: -1 }
      // throwingCheckはエラーを投げるので常に失敗するが、テストのためこれを一部無視する
      const spy = jest.spyOn(multipleCheck, 'getFailureRequestChecks')
      spy.mockReturnValue(['idPositive'])
      expect(() => multipleCheck.throwIfRequestFailed(data)).toThrow(
        'Failed checks: idPositive'
      )
      spy.mockRestore()
    })
  })

  describe('getFailedResponseChecks', () => {
    it('should return empty array for valid response data', () => {
      const data = { data: [] }
      // throwingCheckはエラーを投げるので常に失敗するが、テストのためこれを無視する
      jest.spyOn(multipleCheck, 'responseChecks').mockImplementation(() => {
        return {
          isObject: (data: TestData): boolean => typeof data === 'object',
          hasData: (data: TestData): boolean => 'data' in data,
          dataIsArray: (data: TestData): boolean => {
            return 'data' in data && Array.isArray(data.data)
          },
          throwingCheck: (): never => {
            throw new Error('Test error in response')
          },
        }
      })

      // responseChecksの結果内のthrowingCheckを上書きしないようにした上で、
      // getFailedResponseChecksを一部モックして、throwingCheckによる失敗を無視
      const originalGetFailedResponseChecks =
        multipleCheck.getFailedResponseChecks.bind(multipleCheck)
      jest
        .spyOn(multipleCheck, 'getFailedResponseChecks')
        .mockImplementation((data, reThrow = false) => {
          const failures = originalGetFailedResponseChecks(data, reThrow)
          return failures.filter((key) => key !== 'throwingCheck')
        })

      const failedChecks = multipleCheck.getFailedResponseChecks(data)
      expect(failedChecks).toEqual([])
    })

    it('should return failed check names for invalid response data', () => {
      const data = { data: 'not an array' }
      // throwingCheckはエラーを投げるので常に失敗するが、テストのためこれを無視する
      jest.spyOn(multipleCheck, 'responseChecks').mockImplementation(() => {
        return {
          isObject: (data: TestData): boolean => typeof data === 'object',
          hasData: (data: TestData): boolean => 'data' in data,
          dataIsArray: (data: TestData): boolean => {
            return 'data' in data && Array.isArray(data.data)
          },
          throwingCheck: (): never => {
            throw new Error('Test error in response')
          },
        }
      })

      // responseChecksの結果内のthrowingCheckを上書きしないようにした上で、
      // getFailedResponseChecksを一部モックして、throwingCheckによる失敗を無視
      const originalGetFailedResponseChecks =
        multipleCheck.getFailedResponseChecks.bind(multipleCheck)
      jest
        .spyOn(multipleCheck, 'getFailedResponseChecks')
        .mockImplementation((data, reThrow = false) => {
          const failures = originalGetFailedResponseChecks(data, reThrow)
          return failures.filter((key) => key !== 'throwingCheck')
        })

      const failedChecks = multipleCheck.getFailedResponseChecks(data)
      expect(failedChecks).toEqual(['dataIsArray'])
    })

    it('should include throwing checks by default', () => {
      const data = { data: [] }
      const failedChecks = multipleCheck.getFailedResponseChecks(data)
      expect(failedChecks).toContain('throwingCheck')
    })

    it('should rethrow exceptions when reThrow is true', () => {
      const data = { data: [] }
      expect(() => multipleCheck.getFailedResponseChecks(data, true)).toThrow(
        'Test error in response'
      )
    })
  })

  describe('isResponse', () => {
    it('should return true for valid response data', () => {
      const data = { data: [] }
      // throwingCheckはエラーを投げるので常に失敗するが、テストのためこれを除く
      jest.spyOn(multipleCheck, 'getFailedResponseChecks').mockReturnValue([])
      expect(multipleCheck.isResponse(data)).toBe(true)
    })

    it('should return false for invalid response data', () => {
      const data = { data: 'not an array' }
      expect(multipleCheck.isResponse(data)).toBe(false)
    })
  })

  describe('throwIfResponseFailed', () => {
    it('should not throw for valid response data', () => {
      const data = { data: [] }
      // throwingCheckはエラーを投げるので常に失敗するが、テストのためこれを除く
      jest.spyOn(multipleCheck, 'getFailedResponseChecks').mockReturnValue([])
      expect(() => multipleCheck.throwIfResponseFailed(data)).not.toThrow()
      expect(multipleCheck.throwIfResponseFailed(data)).toBe(true)
    })

    it('should throw for invalid response data', () => {
      const data = { data: 'not an array' }
      // throwingCheckはエラーを投げるので常に失敗するが、テストのためこれを一部無視する
      const spy = jest.spyOn(multipleCheck, 'getFailedResponseChecks')
      spy.mockReturnValue(['dataIsArray'])
      expect(() => multipleCheck.throwIfResponseFailed(data)).toThrow(
        'Failed checks: dataIsArray'
      )
      spy.mockRestore()
    })
  })
})
