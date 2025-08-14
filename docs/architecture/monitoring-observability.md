# Monitoring & Observability

## Analytics & Performance Monitoring

```typescript
// Privacy-First Analytics
class AnalyticsService {
  private enabled: boolean

  constructor() {
    // Only enable in production and with user consent
    this.enabled = import.meta.env.PROD && this.hasUserConsent()
  }

  // Core user journey tracking
  trackPageView(page: string): void {
    if (!this.enabled) return

    // Use privacy-focused analytics (e.g., Plausible)
    plausible('pageview', {
      url: page,
      // No personal data collected
    })
  }

  trackUserAction(action: string, properties?: Record<string, any>): void {
    if (!this.enabled) return

    // Track anonymous user behaviors
    plausible(action, {
      props: {
        ...properties,
        // Remove any PII
        user_id: undefined,
        session_id: this.getAnonymousSessionId(),
      },
    })
  }

  trackPerformanceMetric(metric: string, value: number): void {
    if (!this.enabled) return

    plausible('performance', {
      props: {
        metric,
        value: Math.round(value),
        connection: this.getConnectionType(),
        device: this.getDeviceType(),
      },
    })
  }

  // Error tracking (anonymized)
  trackError(error: WFCError): void {
    if (!this.enabled) return

    plausible('error', {
      props: {
        error_code: error.code,
        error_type: error.name,
        // No sensitive error details
        recoverable: error.recoverable,
      },
    })
  }

  private getAnonymousSessionId(): string {
    // Generate session ID without personal identification
    return btoa(Date.now().toString()).slice(0, 8)
  }

  private hasUserConsent(): boolean {
    // Check for user consent (GDPR compliance)
    return localStorage.getItem('analytics-consent') === 'granted'
  }
}

// Performance Observer Integration
class PerformanceMonitoringService {
  private metrics: Map<string, number[]> = new Map()

  init(): void {
    this.observeCoreWebVitals()
    this.observeResourceTiming()
    this.observeUserTiming()
  }

  private observeCoreWebVitals(): void {
    // First Contentful Paint
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('FCP', entry.startTime)
          analytics.trackPerformanceMetric('FCP', entry.startTime)
        }
      }
    }).observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    new PerformanceObserver(list => {
      const entries = list.getEntries()
      const lcp = entries[entries.length - 1]
      this.recordMetric('LCP', lcp.startTime)
      analytics.trackPerformanceMetric('LCP', lcp.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        const fid = entry.processingStart - entry.startTime
        this.recordMetric('FID', fid)
        analytics.trackPerformanceMetric('FID', fid)
      }
    }).observe({ entryTypes: ['first-input'] })
  }

  private observeResourceTiming(): void {
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('sheets.googleapis.com')) {
          const apiTime = entry.responseEnd - entry.requestStart
          this.recordMetric('API_Response_Time', apiTime)
          analytics.trackPerformanceMetric('API_Response_Time', apiTime)
        }
      }
    }).observe({ entryTypes: ['resource'] })
  }

  // Custom timing measurements
  measureUserJourney(name: string): () => void {
    const start = performance.now()

    return () => {
      const duration = performance.now() - start
      this.recordMetric(`Journey_${name}`, duration)
      analytics.trackPerformanceMetric(`Journey_${name}`, duration)
    }
  }

  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const values = this.metrics.get(name)!
    values.push(value)

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  getMetricSummary(name: string): MetricSummary | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    const average = values.reduce((sum, val) => sum + val, 0) / values.length

    return {
      average: Math.round(average),
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    }
  }
}

// Usage Monitoring
class UsageMonitoringService {
  private sessionStart: number = Date.now()
  private pageViews: string[] = []
  private actions: string[] = []

  trackUserFlow(): void {
    // Track user journey through the app
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.pageViews.push(entry.name)
          analytics.trackPageView(entry.name)
        }
      }
    })

    observer.observe({ entryTypes: ['navigation'] })
  }

  trackFeatureUsage(feature: string): void {
    this.actions.push(feature)
    analytics.trackUserAction('feature_used', { feature })
  }

  getSessionSummary(): SessionSummary {
    const sessionDuration = Date.now() - this.sessionStart

    return {
      duration: Math.round(sessionDuration / 1000), // seconds
      pageViews: this.pageViews.length,
      actions: this.actions.length,
      uniquePages: new Set(this.pageViews).size,
      topFeatures: this.getTopFeatures(),
    }
  }

  private getTopFeatures(): Array<{ feature: string; count: number }> {
    const featureCount = this.actions.reduce(
      (acc, action) => {
        acc[action] = (acc[action] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(featureCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([feature, count]) => ({ feature, count }))
  }
}

// Health Check Service
class HealthCheckService {
  async performHealthCheck(): Promise<HealthStatus> {
    const results: HealthCheckResult[] = []

    // API Health
    try {
      const start = Date.now()
      await fetch('https://sheets.googleapis.com/v4/spreadsheets/test')
      results.push({
        service: 'Google Sheets API',
        status: 'healthy',
        responseTime: Date.now() - start,
      })
    } catch (error) {
      results.push({
        service: 'Google Sheets API',
        status: 'unhealthy',
        error: error.message,
      })
    }

    // Storage Health
    try {
      const testKey = 'health-check'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      results.push({
        service: 'Local Storage',
        status: 'healthy',
      })
    } catch (error) {
      results.push({
        service: 'Local Storage',
        status: 'unhealthy',
        error: 'Storage quota exceeded',
      })
    }

    // IndexedDB Health
    try {
      const db = await this.openTestDB()
      db.close()
      results.push({
        service: 'IndexedDB',
        status: 'healthy',
      })
    } catch (error) {
      results.push({
        service: 'IndexedDB',
        status: 'unhealthy',
        error: error.message,
      })
    }

    const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded'

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
    }
  }

  private openTestDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('health-check', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}
```

---

This architecture document provides a comprehensive, mobile-first approach to building WFC-Pedia
that perfectly aligns with your front-end specification. The architecture emphasizes:

1. **Mobile-First Design**: Every component optimized for touch, thumb-zone navigation, and mobile
   performance
2. **Indonesian Market Focus**: Network-aware loading, data-conscious design, offline-first
   functionality
3. **Community-Centric**: Wikipedia-like transparency with Google Sheets backend
4. **Zero-Cost Operations**: Strategic use of free-tier services for sustainability
5. **Progressive Web App**: Full offline functionality with native app-like experience

The architecture is ready for AI-driven implementation, with clear coding standards, comprehensive
error handling, and detailed component specifications that match your front-end requirements
exactly.

<function_calls> <invoke name="TodoWrite"> <parameter name="todos">[{"id": "1", "content": "Analyze
front-end specification requirements", "status": "completed"}, {"id": "2", "content": "Create
full-stack architecture aligned with front-end spec", "status": "completed"}, {"id": "3", "content":
"Ensure architecture supports mobile-first design requirements", "status": "completed"}, {"id": "4",
"content": "Validate technical constraints and implementation phases", "status": "completed"},
{"id": "5", "content": "Generate final architecture document", "status": "completed"}]
