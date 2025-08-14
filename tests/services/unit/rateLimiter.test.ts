import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { RateLimiter } from '../../../src/services/rateLimiter'

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    vi.useFakeTimers()
    rateLimiter = new RateLimiter(5, 1000) // 5 requests per second for testing
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('canMakeRequest', () => {
    it('should allow requests within the limit', () => {
      expect(rateLimiter.canMakeRequest()).toBe(true)

      rateLimiter.recordRequest()
      expect(rateLimiter.canMakeRequest()).toBe(true)

      // Record 4 more requests (total 5)
      for (let i = 0; i < 4; i++) {
        rateLimiter.recordRequest()
      }

      expect(rateLimiter.canMakeRequest()).toBe(false) // Should be at limit
    })

    it('should clean old requests outside the window', () => {
      // Make 5 requests at time 0
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest()
      }
      expect(rateLimiter.canMakeRequest()).toBe(false)

      // Move time forward past the window
      vi.advanceTimersByTime(1100)

      expect(rateLimiter.canMakeRequest()).toBe(true)
    })

    it('should handle concurrent requests at same timestamp', () => {
      rateLimiter.recordRequest()
      rateLimiter.recordRequest() // Same timestamp

      const info = rateLimiter.getRateLimitInfo()
      expect(info.currentRequests).toBe(2)
    })
  })

  describe('recordRequest', () => {
    it('should record a request', () => {
      rateLimiter.recordRequest()
      const info = rateLimiter.getRateLimitInfo()

      expect(info.currentRequests).toBe(1)
    })

    it('should increment count for concurrent requests', () => {
      const originalNow = Date.now
      const fixedTime = 1000000
      Date.now = vi.fn(() => fixedTime)

      rateLimiter.recordRequest()
      rateLimiter.recordRequest()
      rateLimiter.recordRequest()

      const info = rateLimiter.getRateLimitInfo()
      expect(info.currentRequests).toBe(3)

      Date.now = originalNow
    })
  })

  describe('waitForAvailableSlot', () => {
    it('should resolve immediately when slots are available', async () => {
      const promise = rateLimiter.waitForAvailableSlot()
      await expect(promise).resolves.toBeUndefined()
    })

    it('should wait when rate limit is exceeded', async () => {
      // Fill up the rate limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordRequest()
      }

      // Confirm we're at the limit
      expect(rateLimiter.canMakeRequest()).toBe(false)

      // Start waiting
      const waitPromise = rateLimiter.waitForAvailableSlot()

      // Advance time to trigger setTimeout
      vi.advanceTimersByTime(1001) // Past window

      // Wait for the promise to resolve
      await waitPromise

      // Should now be able to make request
      expect(rateLimiter.canMakeRequest()).toBe(true)
    }, 10000) // Increase timeout to 10 seconds
  })

  describe('getRateLimitInfo', () => {
    it('should return correct rate limit information', () => {
      rateLimiter.recordRequest()
      rateLimiter.recordRequest()

      const info = rateLimiter.getRateLimitInfo()

      expect(info.requestsPerMinute).toBe(5)
      expect(info.currentRequests).toBe(2)
      expect(info.resetTime).toBeGreaterThan(Date.now())
    })

    it('should handle empty request history', () => {
      const info = rateLimiter.getRateLimitInfo()

      expect(info.currentRequests).toBe(0)
      expect(info.resetTime).toBe(Date.now())
    })
  })

  describe('default configuration', () => {
    it('should use 300 requests per minute by default', () => {
      const defaultRateLimiter = new RateLimiter()
      const info = defaultRateLimiter.getRateLimitInfo()

      expect(info.requestsPerMinute).toBe(300)
    })
  })

  describe('edge cases', () => {
    it('should handle rapid consecutive requests', () => {
      // Simulate rapid requests
      for (let i = 0; i < 10; i++) {
        if (rateLimiter.canMakeRequest()) {
          rateLimiter.recordRequest()
        }
      }

      const info = rateLimiter.getRateLimitInfo()
      expect(info.currentRequests).toBeLessThanOrEqual(5)
    })

    it('should clean up old requests efficiently', () => {
      // Add requests at different times
      rateLimiter.recordRequest()
      vi.advanceTimersByTime(200)
      rateLimiter.recordRequest()
      vi.advanceTimersByTime(200)
      rateLimiter.recordRequest()

      // Move forward to expire some requests
      vi.advanceTimersByTime(700)

      const info = rateLimiter.getRateLimitInfo()
      expect(info.currentRequests).toBeLessThan(3)
    })
  })
})
