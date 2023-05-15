export function isEmptyObject(object: object): object is Record<string, never> {
  return Object.keys(object).length === 0
}

export function omit<T extends object, K extends keyof T>(
  object: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...object }
  for (const key of keys) delete result[key]
  return result
}
