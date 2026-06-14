export type CheckFunction<T> = (data: T) => boolean
export type CheckFunctions<T> = Record<string, CheckFunction<T>>

export abstract class BaseSimpleCheck<T> {
  abstract checks(): CheckFunctions<T>

  getFailedChecks(data: T, reThrow = false): string[] {
    const checks = this.checks()
    return Object.keys(checks).filter((key) => {
      // Returns true if it failed
      try {
        return !checks[key](data) // Success if it returns true without throwing (returns false)
      } catch (error) {
        if (reThrow) {
          throw error
        }
        return true // An exception means failure (true)
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
      // Returns true if it failed
      try {
        return !checks[key](data) // Success if it returns true without throwing (returns false)
      } catch (error) {
        if (reThrow) {
          throw error
        }
        return true // An exception means failure (true)
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
      // Returns true if it failed
      try {
        return !checks[key](data) // Success if it returns true without throwing (returns false)
      } catch (error) {
        if (reThrow) {
          throw error
        }
        return true // An exception means failure (true)
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
