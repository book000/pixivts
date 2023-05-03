export function isEmptyObject(object: object): object is Record<string, never> {
  return Object.keys(object).length === 0
}
