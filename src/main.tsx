import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

interface RootElementError extends Error {
  code: 'ROOT_ELEMENT_NOT_FOUND'
}

function initializeApp(): void {
  try {
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      const error = new Error(
        'Failed to find the root element with ID "root"'
      ) as RootElementError
      error.code = 'ROOT_ELEMENT_NOT_FOUND'
      throw error
    }

    const root = createRoot(rootElement)
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  } catch (error) {
    console.error('Failed to initialize WFC Pedia application:', error)

    // Graceful fallback - show error message in DOM
    const fallbackElement = document.createElement('div')
    fallbackElement.innerHTML = `
      <div style="padding: 20px; text-align: center; background: #fee2e2; color: #dc2626; border-radius: 8px; margin: 20px;">
        <h1>Application Initialization Error</h1>
        <p>WFC Pedia failed to start. Please refresh the page or contact support.</p>
        <p><small>Error: ${error instanceof Error ? error.message : 'Unknown error'}</small></p>
      </div>
    `
    document.body.appendChild(fallbackElement)
  }
}

// Initialize the application
initializeApp()
