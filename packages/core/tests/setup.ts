import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './msw/handlers'

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})
