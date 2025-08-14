import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  }
}

// Mobile viewport utilities
export const setMobileViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 667,
  })
  window.dispatchEvent(new Event('resize'))
}

// Touch event utilities
export const createTouchEvent = (
  type: string,
  touches: Array<{ clientX: number; clientY: number }>
) => {
  return new TouchEvent(type, {
    touches: touches.map(touch => ({
      ...touch,
      identifier: 0,
      target: document.body,
      radiusX: 44, // 44px touch target
      radiusY: 44,
      force: 1,
      rotationAngle: 0,
    })) as any,
    bubbles: true,
    cancelable: true,
  })
}

// Network condition mocks
export const mockSlowNetwork = () => {
  // Mock slow network conditions typical in Indonesia
  const originalFetch = global.fetch
  global.fetch = (...args) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(originalFetch(...args)), 2000)
    })
  }
}

export const mockOfflineMode = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: false,
  })
  window.dispatchEvent(new Event('offline'))
}

export const mockOnlineMode = () => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  })
  window.dispatchEvent(new Event('online'))
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { customRender as render }
