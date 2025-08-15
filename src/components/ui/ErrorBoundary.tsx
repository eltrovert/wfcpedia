import React, { Component, ErrorInfo, ReactNode } from 'react'
import { TouchTarget } from './TouchTarget'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

/**
 * Error boundary component for graceful error handling in React components
 * Provides fallback UI and error logging for production stability
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center'>
            <div className='text-6xl mb-4'>😵</div>

            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Oops! Something went wrong
            </h2>

            <p className='text-gray-600 mb-6'>
              We encountered an unexpected error. Please try refreshing the page
              or contact support if the problem persists.
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className='mb-6 text-left'>
                <summary className='cursor-pointer text-sm text-red-600 hover:text-red-700'>
                  Show error details
                </summary>
                <div className='mt-2 p-3 bg-red-50 rounded border text-xs font-mono text-red-700 overflow-auto max-h-32'>
                  <div className='font-bold mb-1'>Error:</div>
                  <div className='mb-2'>{this.state.error.message}</div>

                  {this.state.errorInfo && (
                    <>
                      <div className='font-bold mb-1'>Stack trace:</div>
                      <pre className='whitespace-pre-wrap'>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className='flex gap-3'>
              <TouchTarget
                onClick={this.handleReset}
                variant='secondary'
                className='flex-1'
              >
                Try Again
              </TouchTarget>

              <TouchTarget
                onClick={() => window.location.reload()}
                variant='primary'
                className='flex-1'
              >
                Refresh Page
              </TouchTarget>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook-based error boundary for functional components
 * This is a simple implementation - for production use consider react-error-boundary
 */
interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error) => void
}

export function AsyncErrorBoundary({
  children,
  fallback,
  onError,
}: AsyncErrorBoundaryProps) {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  React.useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  // Error event handler for async errors
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(new Error(event.message))
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(new Error(event.reason))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (error) {
    if (fallback) return <>{fallback}</>

    return (
      <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
        <div className='flex items-center gap-2 text-red-700 mb-2'>
          <span>⚠️</span>
          <span className='font-medium'>An error occurred</span>
        </div>
        <p className='text-red-600 text-sm mb-3'>{error.message}</p>
        <TouchTarget
          onClick={resetError}
          variant='primary'
          className='bg-red-600 hover:bg-red-700'
        >
          Try Again
        </TouchTarget>
      </div>
    )
  }

  return <>{children}</>
}
