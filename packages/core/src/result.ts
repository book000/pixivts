/**
 * Zero-dependency Result / ResultAsync implementation.
 *
 * Ergonomics are intentionally close to neverthrow so the patterns feel
 * familiar without pulling in an external dependency.
 *
 * @example
 * ```ts
 * const r = ok(42)
 * if (r.isOk) console.log(r.value) // 42
 *
 * const a = ResultAsync.fromPromise(fetch('/api'), (e) => networkError(e))
 * const text = await a
 *   .andThen((res) => ResultAsync.fromPromise(res.text(), networkError))
 *   .unwrapOr('fallback')
 * ```
 */

// ---------------------------------------------------------------------------
// Result<T, E>
// ---------------------------------------------------------------------------

/** Successful result carrying `value`. */
export interface OkResult<T> {
  readonly isOk: true
  readonly isErr: false
  readonly value: T
  /** Returns an `OkResult` with `fn(value)`. */
  map<U>(fn: (value: T) => U): OkResult<U>
  /** Returns `this` unchanged. */
  mapErr<F>(_fn: (error: never) => F): OkResult<T>
  /** Calls `fn(value)` and returns its Result. */
  andThen<U, F>(fn: (value: T) => Result<U, F>): Result<U, F>
  /** Calls `onOk` and returns its result. */
  match<U>(onOk: (value: T) => U, _onErr: (error: never) => U): U
  /** Returns `value`. */
  unwrapOr(_fallback: T): T
}

/** Failed result carrying `error`. */
export interface ErrResult<E> {
  readonly isOk: false
  readonly isErr: true
  readonly error: E
  /** Returns `this` unchanged. */
  map<U>(_fn: (value: never) => U): ErrResult<E>
  /** Returns an `ErrResult` with `fn(error)`. */
  mapErr<F>(fn: (error: E) => F): ErrResult<F>
  /** Returns `this` unchanged. */
  andThen<U, F>(_fn: (value: never) => Result<U, F>): ErrResult<E>
  /** Calls `onErr` and returns its result. */
  match<U>(_onOk: (value: never) => U, onErr: (error: E) => U): U
  /** Returns `fallback`. */
  unwrapOr<T>(fallback: T): T
}

/** A value that is either `OkResult<T>` or `ErrResult<E>`. */
export type Result<T, E> = OkResult<T> | ErrResult<E>

class OkResultImpl<T> implements OkResult<T> {
  readonly isOk = true as const
  readonly isErr = false as const

  constructor(readonly value: T) {}

  map<U>(fn: (value: T) => U): OkResult<U> {
    return new OkResultImpl(fn(this.value))
  }

  mapErr<F>(_fn: (error: never) => F): OkResult<T> {
    return this
  }

  andThen<U, F>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this.value)
  }

  match<U>(onOk: (value: T) => U, _onErr: (error: never) => U): U {
    return onOk(this.value)
  }

  unwrapOr(_fallback: T): T {
    return this.value
  }
}

class ErrResultImpl<E> implements ErrResult<E> {
  readonly isOk = false as const
  readonly isErr = true as const

  constructor(readonly error: E) {}

  map<U>(_fn: (value: never) => U): ErrResult<E> {
    return this
  }

  mapErr<F>(fn: (error: E) => F): ErrResult<F> {
    return new ErrResultImpl(fn(this.error))
  }

  andThen<U, F>(_fn: (value: never) => Result<U, F>): ErrResult<E> {
    return this
  }

  match<U>(_onOk: (value: never) => U, onErr: (error: E) => U): U {
    return onErr(this.error)
  }

  unwrapOr<T>(fallback: T): T {
    return fallback
  }
}

/**
 * Creates a successful `Result<T, never>`.
 *
 * @param value - The success value
 */
export function ok<T>(value: T): OkResult<T> {
  return new OkResultImpl(value)
}

/**
 * Creates a failed `Result<never, E>`.
 *
 * @param error - The error value
 */
export function err<E>(error: E): ErrResult<E> {
  return new ErrResultImpl(error)
}

// ---------------------------------------------------------------------------
// ResultAsync<T, E>
// ---------------------------------------------------------------------------

/**
 * A `PromiseLike<Result<T, E>>` that is directly `await`-able and supports
 * chainable `map / mapErr / andThen` operators.
 *
 * @example
 * ```ts
 * const result = await ResultAsync.fromPromise(fetch('/api'), networkError)
 *   .andThen((res) =>
 *     ResultAsync.fromPromise(res.json() as Promise<unknown>, networkError)
 *   )
 * ```
 */
export class ResultAsync<T, E> implements PromiseLike<Result<T, E>> {
  private readonly _promise: Promise<Result<T, E>>

  constructor(promise: Promise<Result<T, E>>) {
    this._promise = promise
  }

  // PromiseLike contract — makes `await resultAsync` work
  then<TResult1 = Result<T, E>, TResult2 = never>(
    onfulfilled?:
      | ((value: Result<T, E>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this._promise.then(onfulfilled as any, onrejected as any)
  }

  /**
   * Wraps a `Promise<T>` into a `ResultAsync<T, E>`.
   *
   * If the promise rejects, `onError` maps the rejection reason to `E`.
   *
   * @param promise - The promise to wrap
   * @param onError - Error mapper
   */
  static fromPromise<T, E>(
    promise: Promise<T>,
    onError: (reason: unknown) => E
  ): ResultAsync<T, E> {
    return new ResultAsync(
      promise.then(
        (v) => ok(v) as Result<T, E>,
        (r: unknown) => err(onError(r)) as Result<T, E>
      )
    )
  }

  /**
   * Wraps an already-resolved `Result<T, E>` into a `ResultAsync<T, E>`.
   *
   * @param result - The result to wrap
   */
  static fromResult<T, E>(result: Result<T, E>): ResultAsync<T, E> {
    return new ResultAsync(Promise.resolve(result))
  }

  /**
   * Transforms the success value.
   *
   * If the inner result is `Err`, `fn` is not called.
   *
   * @param fn - Synchronous mapper
   */
  map<U>(fn: (value: T) => U): ResultAsync<U, E> {
    return new ResultAsync(this._promise.then((r) => r.map(fn) as Result<U, E>))
  }

  /**
   * Transforms the error value.
   *
   * If the inner result is `Ok`, `fn` is not called.
   *
   * @param fn - Synchronous error mapper
   */
  mapErr<F>(fn: (error: E) => F): ResultAsync<T, F> {
    return new ResultAsync(
      this._promise.then((r) => r.mapErr(fn) as Result<T, F>)
    )
  }

  /**
   * Chains another async operation that may fail.
   *
   * If the inner result is `Err`, `fn` is not called.
   *
   * @param fn - Async mapper that returns a `ResultAsync<U, F>`
   */
  andThen<U, F>(
    fn: (value: T) => ResultAsync<U, F> | Result<U, F>
  ): ResultAsync<U, E | F> {
    return new ResultAsync(
      this._promise.then(async (r): Promise<Result<U, E | F>> => {
        if (r.isErr) return r as ErrResult<E>
        const next = fn(r.value)
        if (next instanceof ResultAsync) {
          return next._promise as Promise<Result<U, F>>
        }
        return next as Result<U, F>
      })
    )
  }

  /**
   * Pattern-matches on success / failure.
   *
   * @param onOk - Called with the success value
   * @param onErr - Called with the error value
   * @returns A `Promise<U>`
   */
  async match<U>(
    onOk: (value: T) => U | Promise<U>,
    onErr: (error: E) => U | Promise<U>
  ): Promise<U> {
    const r = await this._promise
    if (r.isOk) return onOk(r.value)
    return onErr(r.error)
  }

  /**
   * Returns the success value, or `fallback` if the result is `Err`.
   *
   * @param fallback - The fallback value
   */
  async unwrapOr(fallback: T): Promise<T> {
    const r = await this._promise
    // Avoid calling r.unwrapOr(fallback) directly to work around TypeScript 6
    // Awaited<T> inference issues with union method signatures.
    if (r.isOk) return r.value
    return fallback
  }
}
