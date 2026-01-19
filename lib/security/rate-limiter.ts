// Rate limiting configuration
interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const RATE_LIMIT_CONFIG: Record<string, RateLimitConfig> = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  signup: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  payment: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
}

class RateLimiter {
  private store: Map<string, Array<number>> = new Map()

  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now()
    const timestamps = this.store.get(key) || []

    // Remove old timestamps outside the window
    const recentTimestamps = timestamps.filter((ts) => now - ts < config.windowMs)

    if (recentTimestamps.length >= config.maxRequests) {
      return false // Rate limit exceeded
    }

    recentTimestamps.push(now)
    this.store.set(key, recentTimestamps)
    return true // Request allowed
  }

  reset(key: string): void {
    this.store.delete(key)
  }
}

export const rateLimiter = new RateLimiter()
export { RATE_LIMIT_CONFIG }
