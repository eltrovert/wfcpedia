import React from 'react'

export function OnboardingWelcome(): JSX.Element {
  return (
    <div className='p-6 max-w-2xl mx-auto'>
      {/* Hero section */}
      <div className='text-center mb-8'>
        <div
          className='text-6xl mb-4'
          role='img'
          aria-label='Coffee and laptop emoji'
        >
          ☕💻
        </div>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>
          Welcome to WFC Pedia
        </h2>
        <p className='text-lg text-gray-600 dark:text-gray-300 leading-relaxed'>
          Your guide to work-friendly cafés designed for remote workers and
          digital nomads.
        </p>
      </div>

      {/* Value proposition */}
      <div className='space-y-6 mb-8'>
        <div className='bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4'>
          <div className='flex items-start gap-3'>
            <div className='text-2xl' role='img' aria-label='WiFi signal'>
              📶
            </div>
            <div>
              <h3 className='font-semibold text-gray-900 dark:text-white mb-1'>
                Work-Specific Ratings
              </h3>
              <p className='text-gray-600 dark:text-gray-300 text-sm'>
                Unlike generic reviews, we focus on what matters for work: WiFi
                speed, power outlets, noise levels, and workspace comfort.
              </p>
            </div>
          </div>
        </div>

        <div className='bg-green-50 dark:bg-green-900/20 rounded-lg p-4'>
          <div className='flex items-start gap-3'>
            <div className='text-2xl' role='img' aria-label='Community'>
              🤝
            </div>
            <div>
              <h3 className='font-semibold text-gray-900 dark:text-white mb-1'>
                Community-Driven
              </h3>
              <p className='text-gray-600 dark:text-gray-300 text-sm'>
                Built by remote workers, for remote workers. Real experiences
                from people who understand your workspace needs.
              </p>
            </div>
          </div>
        </div>

        <div className='bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4'>
          <div className='flex items-start gap-3'>
            <div className='text-2xl' role='img' aria-label='Indonesia flag'>
              🇮🇩
            </div>
            <div>
              <h3 className='font-semibold text-gray-900 dark:text-white mb-1'>
                Indonesia-Focused
              </h3>
              <p className='text-gray-600 dark:text-gray-300 text-sm'>
                Optimized for Indonesian cities and mobile networks, with local
                insights and community knowledge.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats or testimonial */}
      <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center'>
        <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
          Join thousands of remote workers discovering
        </p>
        <p className='font-semibold text-gray-900 dark:text-white text-lg'>
          Better Workspaces, Better Work Days
        </p>
      </div>

      {/* Next step hint */}
      <div className='mt-8 text-center'>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          Next: Learn about our work-specific rating system
        </p>
      </div>
    </div>
  )
}
