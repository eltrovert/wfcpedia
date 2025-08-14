# Error Handling Strategy

## Unified Error System

```typescript
// Error Types
export enum ErrorCode {
  // Network Errors
  NETWORK_UNAVAILABLE = 'NETWORK_UNAVAILABLE',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_UNAUTHORIZED = 'API_UNAUTHORIZED',

  // Data Errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  CAFE_NOT_FOUND = 'CAFE_NOT_FOUND',

  // User Errors
  LOCATION_PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  CAMERA_PERMISSION_DENIED = 'CAMERA_PERMISSION_DENIED',

  // System Errors
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  UNSUPPORTED_BROWSER = 'UNSUPPORTED_BROWSER'
}

export class WFCError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown,
    public recoverable = false
  ) {
    super(message);
    this.name = 'WFCError';
  }
}

// Error Handler Service
class ErrorHandlerService {
  private errorQueue: WFCError[] = [];

  handle(error: WFCError): void {
    // Log error
    console.error(`[${error.code}] ${error.message}`, error.details);

    // Queue for offline retry if recoverable
    if (error.recoverable && navigator.onLine === false) {
      this.errorQueue.push(error);
      return;
    }

    // Show user-friendly message
    this.showUserError(error);

    // Report to monitoring (in production)
    if (import.meta.env.PROD) {
      this.reportError(error);
    }
  }

  private showUserError(error: WFCError): void {
    const userMessage = this.getUserMessage(error);

    // Show toast notification
    toast.error(userMessage.message, {
      action: userMessage.action ? {
        label: userMessage.action.label,
        onClick: userMessage.action.handler
      } : undefined
    });
  }

  private getUserMessage(error: WFCError): UserMessage {
    switch (error.code) {
      case ErrorCode.NETWORK_UNAVAILABLE:
        return {
          message: 'No internet connection. Using offline data.',
          action: {
            label: 'Retry',
            handler: () => window.location.reload()
          }
        };

      case ErrorCode.LOCATION_PERMISSION_DENIED:
        return {
          message: 'Location needed to find nearby cafés.',
          action: {
            label: 'Enable',
            handler: () => this.requestLocationPermission()
          }
        };

      case ErrorCode.API_RATE_LIMIT:
        return {
          message: 'Too many requests. Please wait a moment.',
          action: {
            label: 'Retry in 1min',
            handler: () => setTimeout(() => window.location.reload(), 60000)
          }
        };

      default:
        return {
          message: 'Something went wrong. Please try again.',
          action: {
            label: 'Retry',
            handler: () => window.location.reload()
          }
        };
    }
  }

  // Process queued errors when back online
  async processErrorQueue(): Promise<void> {
    if (navigator.onLine && this.errorQueue.length > 0) {
      const errors = [...this.errorQueue];
      this.errorQueue = [];

      for (const error of errors) {
        try {
          await this.retryOperation(error);
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          this.handle(error); // Re-handle if retry fails
        }
      }
    }
  }
}

// React Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error: Error; retry: () => void }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const wfcError = new WFCError(
      ErrorCode.VALIDATION_FAILED,
      'React component error',
      { error: error.message, errorInfo }
    );

    errorHandler.handle(wfcError);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      return (
        <Fallback
          error={this.state.error!}
          retry={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

// Service-level error handling
class CafeService {
  async getCafes(filters?: FilterOptions): Promise<Cafe[]> {
    try {
      const response = await this.api.getCafes(filters);
      return response.data;
    } catch (error) {
      if (error instanceof Response) {
        if (error.status === 429) {
          throw new WFCError(
            ErrorCode.API_RATE_LIMIT,
            'API rate limit exceeded',
            { status: error.status },
            true // Recoverable
          );
        }

        if (error.status === 401) {
          throw new WFCError(
            ErrorCode.API_UNAUTHORIZED,
            'API authentication failed',
            { status: error.status }
          );
        }
      }

      if (!navigator.onLine) {
        // Try to return cached data
        const cachedCafes = await this.getCachedCafes();
        if (cachedCafes.length > 0) {
          return cachedCafes;
        }

        throw new WFCError(
          ErrorCode.NETWORK_UNAVAILABLE,
          'No internet connection and no cached data',
          error,
          true
        );
      }

      throw new WFCError(
        ErrorCode.VALIDATION_FAILED,
        'Failed to fetch cafés',
        error
      );
    }
  }
}
```

---
