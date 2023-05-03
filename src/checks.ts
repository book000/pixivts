export type CheckFunction<T> = (data: T) => boolean
export type CheckFunctions<T> = {
  [key: string]: CheckFunction<T>
}

export abstract class BaseSimpleCheck<T> {
  abstract checks(): CheckFunctions<T>

  getFailedChecks(data: T, reThrow = false): string[] {
    const checks = this.checks()
    return Object.keys(checks).filter((key) => {
      // 失敗ならtrueを返す
      try {
        return !checks[key](data) // Trueかつ例外が発生しない場合は成功 (falseを返す)
      } catch (error) {
        if (reThrow) {
          throw error
        }
        return true // 例外の場合は失敗 (true)
      }
    })
  }

  is(data: T): data is T {
    return this.getFailedChecks(data).length === 0
  }

  throwIfFailed(data: T) {
    const failedChecks = this.getFailedChecks(data, true)
    if (failedChecks.length > 0) {
      throw new Error(`Failed checks: ${failedChecks.join(', ')}`)
    }
    return true
  }
}

export abstract class BaseMultipleCheck<T, U> {
  abstract requestChecks(): CheckFunctions<T>

  abstract responseChecks(): CheckFunctions<U>

  getFailureRequestChecks(data: T, reThrow = false): string[] {
    const checks = this.requestChecks()
    return Object.keys(checks).filter((key) => {
      // 失敗ならtrueを返す
      try {
        return !checks[key](data) // Trueかつ例外が発生しない場合は成功 (falseを返す)
      } catch (error) {
        if (reThrow) {
          throw error
        }
        return true // 例外の場合は失敗 (true)
      }
    })
  }

  isRequest(data: T): data is T {
    return this.getFailureRequestChecks(data).length === 0
  }

  throwIfRequestFailed(data: T) {
    const failedChecks = this.getFailureRequestChecks(data, true)
    if (failedChecks.length > 0) {
      throw new Error(`Failed checks: ${failedChecks.join(', ')}`)
    }
    return true
  }

  getFailedResponseChecks(data: U, reThrow = false): string[] {
    const checks = this.responseChecks()
    return Object.keys(checks).filter((key) => {
      // 失敗ならtrueを返す
      try {
        return !checks[key](data) // Trueかつ例外が発生しない場合は成功 (falseを返す)
      } catch (error) {
        if (reThrow) {
          throw error
        }
        return true // 例外の場合は失敗 (true)
      }
    })
  }

  isResponse(data: U): data is U {
    return this.getFailedResponseChecks(data).length === 0
  }

  throwIfResponseFailed(data: U) {
    const failedChecks = this.getFailedResponseChecks(data, true)
    if (failedChecks.length > 0) {
      throw new Error(`Failed checks: ${failedChecks.join(', ')}`)
    }
    return true
  }
}
