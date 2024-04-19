export function isEmptyObject(object: object): object is Record<string, never> {
  return Object.keys(object).length === 0
}

export function omit<T extends object, K extends keyof T>(
  object: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...object }
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  for (const key of keys) delete result[key]
  return result
}
