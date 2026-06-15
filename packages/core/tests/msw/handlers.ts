import { setupServer } from 'msw/node'

// Handlers are registered per test using server.use(...)
// This file only sets up the server instance.
export const server = setupServer()
