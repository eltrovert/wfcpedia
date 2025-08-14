import type { RateLimitInfo } from '../types/api'

interface RequestBucket {
  timestamp: number
  count: number
}

/**
 * Rate limiter for Google Sheets API (300 requests/minute compliance)
 * Uses sliding window with optimized bucket management
 */
export class RateLimiter {
  private readonly maxRequests: number
  private readonly windowMs: number
  private readonly bucketSizeMs: number = 1000 // 1 second buckets
  private requests: Map<number, RequestBucket> = new Map()

  constructor(maxRequests = 300, windowMs = 60000) {
    // 300 requests per minute
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  /**
   * Check if a request can be made
   */
  canMakeRequest(): boolean {
    this.cleanOldRequests()
    const currentRequests = Array.from(this.requests.values()).reduce(
      (sum, bucket) => sum + bucket.count,
      0
    )
    return currentRequests < this.maxRequests
  }

  /**
   * Record a request
   */
  recordRequest(): void {
    const now = Date.now()
    const bucketKey = Math.floor(now / this.bucketSizeMs)

    this.cleanOldRequests()

    const existingBucket = this.requests.get(bucketKey)
    if (existingBucket) {
      existingBucket.count++
    } else {
      this.requests.set(bucketKey, {
        timestamp: bucketKey * this.bucketSizeMs,
        count: 1,
      })
    }
  }

  /**
   * Wait until a request can be made
   */
  async waitForAvailableSlot(): Promise<void> {
    if (this.canMakeRequest()) return

    const oldestBucket = Math.min(...this.requests.keys())
    const oldestTimestamp = oldestBucket * this.bucketSizeMs
    const waitTime = oldestTimestamp + this.windowMs - Date.now()

    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  /**
   * Get current rate limit info
   */
  getRateLimitInfo(): RateLimitInfo {
    this.cleanOldRequests()
    const buckets = Array.from(this.requests.values())
    const oldestBucket =
      buckets.length > 0 ? Math.min(...Array.from(this.requests.keys())) : null

    return {
      requestsPerMinute: this.maxRequests,
      currentRequests: buckets.reduce((sum, bucket) => sum + bucket.count, 0),
      resetTime: oldestBucket
        ? oldestBucket * this.bucketSizeMs + this.windowMs
        : Date.now(),
    }
  }

  /**
   * Remove requests outside the current window
   */
  private cleanOldRequests(): void {
    const cutoffBucket = Math.floor(
      (Date.now() - this.windowMs) / this.bucketSizeMs
    )

    for (const [bucketKey] of this.requests) {
      if (bucketKey <= cutoffBucket) {
        this.requests.delete(bucketKey)
      }
    }
  }
}

// Singleton instance for the application
export const rateLimiter = new RateLimiter()
