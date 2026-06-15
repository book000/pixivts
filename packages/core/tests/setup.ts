import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './msw/handlers.js'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
