import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Home } from './pages'
import { ErrorBoundary } from './components/ui'
import { getQueryClient } from './hooks'
import './App.css'

const queryClient = getQueryClient()

function App(): JSX.Element {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to console in development
        console.error('App Error Boundary:', error, errorInfo)
        // TODO: In production, send to error reporting service
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
