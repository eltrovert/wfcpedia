# Security & Performance

## Security Implementation

```typescript
// Content Security Policy
const cspPolicy = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Needed for Vite dev
  'style-src': ["'self'", "'unsafe-inline'"], // Needed for Tailwind
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://sheets.googleapis.com'],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'media-src': ["'self'"],
  'frame-src': ["'none'"],
}

// API Security
class SecureAPIClient {
  private readonly apiKey: string

  constructor() {
    // API key validation
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    if (!this.apiKey) {
      throw new Error('Google API key not configured')
    }
  }

  async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Rate limiting
    await this.rateLimiter.acquire()

    // Request validation
    const sanitizedUrl = this.sanitizeUrl(url)

    // Add API key securely
    const urlWithKey = `${sanitizedUrl}${sanitizedUrl.includes('?') ? '&' : '?'}key=${this.apiKey}`

    const response = await fetch(urlWithKey, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        ...options.headers,
      },
    })

    // Response validation
    if (!response.ok) {
      throw new APIError(response.status, response.statusText)
    }

    return response
  }

  private sanitizeUrl(url: string): string {
    // Prevent URL injection
    const allowedDomains = ['sheets.googleapis.com']
    const urlObj = new URL(url)

    if (!allowedDomains.includes(urlObj.hostname)) {
      throw new Error('Unauthorized domain')
    }

    return url
  }
}

// User Input Sanitization
class InputSanitizer {
  static sanitizeCafeName(name: string): string {
    return name
      .trim()
      .slice(0, 100) // Length limit
      .replace(/<[^>]*>/g, '') // Remove HTML
      .replace(/[^\w\s\-'.,]/g, '') // Allow only safe characters
  }

  static sanitizeComment(comment: string): string {
    return comment
      .trim()
      .slice(0, 280) // Twitter-like limit
      .replace(/<[^>]*>/g, '') // Remove HTML
      .replace(/javascript:/gi, '') // Remove JS injection
      .replace(/data:/gi, '') // Remove data URLs
  }

  static validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !isNaN(lat) && !isNaN(lng)
  }
}
```

## Performance Optimization

```typescript
// Image Optimization Service
class ImageOptimizationService {
  async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate optimal dimensions
        const { width, height } = this.calculateOptimalSize(img.width, img.height)

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          blob => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/webp',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Compression failed'))
            }
          },
          'image/webp',
          0.8 // Quality
        )
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  private calculateOptimalSize(originalWidth: number, originalHeight: number) {
    const maxWidth = 800
    const maxHeight = 600

    let { width, height } = { width: originalWidth, height: originalHeight }

    if (width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }

    return { width: Math.round(width), height: Math.round(height) }
  }
}

// Performance Monitoring
class PerformanceMonitor {
  static measureCoreWebVitals() {
    // First Contentful Paint
    new PerformanceObserver(entryList => {
      const entries = entryList.getEntries()
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint')
      if (fcp) {
        this.reportMetric('FCP', fcp.startTime)
      }
    }).observe({ entryTypes: ['paint'] })

    // Largest Contentful Paint
    new PerformanceObserver(entryList => {
      const entries = entryList.getEntries()
      const lcp = entries[entries.length - 1]
      this.reportMetric('LCP', lcp.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      }
      this.reportMetric('CLS', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  static reportMetric(name: string, value: number) {
    // Send to analytics if enabled
    if (import.meta.env.PROD) {
      console.log(`Performance metric: ${name} = ${value}`)
      // Optional: Send to external monitoring service
    }
  }
}

// Network-Aware Loading
class NetworkAwareLoader {
  private connection: any

  constructor() {
    this.connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection
  }

  getOptimalImageQuality(): number {
    if (!this.connection) return 0.8 // Default quality

    const effectiveType = this.connection.effectiveType

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 0.3 // Very low quality
      case '3g':
        return 0.6 // Medium quality
      case '4g':
      default:
        return 0.8 // High quality
    }
  }

  shouldLazyLoad(): boolean {
    if (!this.connection) return true // Default to lazy loading

    return this.connection.saveData || ['slow-2g', '2g'].includes(this.connection.effectiveType)
  }

  getOptimalPageSize(): number {
    if (!this.connection) return 10 // Default page size

    const effectiveType = this.connection.effectiveType

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 5 // Fewer items per page
      case '3g':
        return 10 // Standard page size
      case '4g':
      default:
        return 20 // More items per page
    }
  }
}
```

---
