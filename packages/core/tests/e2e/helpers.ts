/**
 * Shared environment/token loading and skip-guard logic for e2e test files.
 *
 * These tests require a valid PIXIV_REFRESH_TOKEN environment variable.
 * They are skipped automatically when the token is not present, so they
 * never block CI runs that do not have the secret configured.
 *
 * Run manually:
 *   PIXIV_REFRESH_TOKEN=<token> pnpm --filter @book000/pixivts run test:e2e
 */
import fs from 'node:fs'

/** Load token from .env file if present, then from environment. */
function loadToken(): string | undefined {
  if (fs.existsSync('.env')) {
    for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      const value = line.slice(eq + 1).trim()
      if (key === 'PIXIV_REFRESH_TOKEN' && value) return value
    }
  }
  return process.env.PIXIV_REFRESH_TOKEN
}

/** The refresh token loaded from `.env` or the environment, if any. */
export const REFRESH_TOKEN = loadToken()
/** Whether e2e tests should be skipped (no refresh token available). */
export const SKIP = !REFRESH_TOKEN
