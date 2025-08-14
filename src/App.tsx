import { useState } from 'react'
import './App.css'

function App(): JSX.Element {
  const [count, setCount] = useState(0)

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4'>
      <header className='text-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>WFC Pedia</h1>
        <p className='text-lg text-gray-600'>Find Your Perfect Work Café</p>
      </header>

      <main className='bg-white rounded-lg shadow-lg p-6 max-w-md w-full'>
        <div className='text-center mb-6'>
          <h2 className='text-xl font-semibold text-gray-800 mb-2'>
            Development Environment Ready
          </h2>
          <p className='text-gray-600'>
            Your mobile-first PWA is configured and ready for development.
          </p>
        </div>

        <div className='space-y-4'>
          <button
            onClick={() => setCount(count => count + 1)}
            className='w-full bg-blue-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors min-h-11'
            aria-label={`Increment counter, current count is ${count}`}
          >
            Test Counter: {count}
          </button>

          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center p-3 bg-green-50 rounded-lg'>
              <div className='text-green-600 font-semibold'>✓ TypeScript</div>
              <div className='text-sm text-gray-600'>Strict Mode</div>
            </div>
            <div className='text-center p-3 bg-green-50 rounded-lg'>
              <div className='text-green-600 font-semibold'>✓ Tailwind</div>
              <div className='text-sm text-gray-600'>Mobile-First</div>
            </div>
            <div className='text-center p-3 bg-green-50 rounded-lg'>
              <div className='text-green-600 font-semibold'>✓ Testing</div>
              <div className='text-sm text-gray-600'>Vitest + E2E</div>
            </div>
            <div className='text-center p-3 bg-green-50 rounded-lg'>
              <div className='text-green-600 font-semibold'>✓ PWA</div>
              <div className='text-sm text-gray-600'>Offline Ready</div>
            </div>
          </div>
        </div>
      </main>

      <footer className='mt-8 text-center text-sm text-gray-500'>
        <p>Ready to build amazing café discovery experiences</p>
      </footer>
    </div>
  )
}

export default App
