export interface GoogleSheetsResponse<T = unknown> {
  range: string
  majorDimension: 'ROWS' | 'COLUMNS'
  values: T[][]
}

export interface GoogleSheetsError {
  error: {
    code: number
    message: string
    status: string
  }
}

export interface RateLimitInfo {
  requestsPerMinute: number
  currentRequests: number
  resetTime: number
}

export interface CacheEntry<T = unknown> {
  key: string
  data: T
  timestamp: number
  ttl: number
}

export interface SyncQueueItem {
  id: string
  type: 'addCafe' | 'addRating' | 'updateCafe'
  data: unknown
  retries: number
  createdAt: string
  lastAttempt?: string
}

export interface NetworkStatus {
  online: boolean
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
  downlink?: number
  rtt?: number
}
