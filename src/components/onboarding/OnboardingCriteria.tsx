import React, { useState } from 'react'
import { TouchTarget } from '../ui/TouchTarget'

interface ComparisonItem {
  generic: string
  workSpecific: string
  icon: string
  explanation: string
}

const COMPARISON_DATA: ComparisonItem[] = [
  {
    generic: '"Great coffee and nice atmosphere"',
    workSpecific: 'WiFi: 50 Mbps, 8 power outlets, quiet work area',
    icon: '📶',
    explanation:
      'We measure actual WiFi speeds and count available power outlets, not just vibe.',
  },
  {
    generic: '"Cozy place with good music"',
    workSpecific:
      'Noise level: Moderate (65dB), background music suitable for calls',
    icon: '🔊',
    explanation:
      'We assess noise levels for different work activities like calls, focus work, and collaboration.',
  },
  {
    generic: '"Beautiful interior design"',
    workSpecific:
      'Workspace comfort: Ergonomic seating, adjustable lighting, work tables',
    icon: '🪑',
    explanation:
      'We evaluate furniture and lighting from a productivity perspective, not just aesthetics.',
  },
  {
    generic: '"Friendly staff"',
    workSpecific:
      'Work-friendliness: 6+ hour stays welcome, no pressure to order repeatedly',
    icon: '⏰',
    explanation:
      'We check policies about extended stays and work sessions to ensure you can focus.',
  },
]

export function OnboardingCriteria(): JSX.Element {
  const [selectedComparison, setSelectedComparison] = useState<number | null>(
    null
  )

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      {/* Header */}
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>
          Work-Specific vs. Generic Reviews
        </h2>
        <p className='text-gray-600 dark:text-gray-300 text-lg'>
          See the difference our work-focused approach makes
        </p>
      </div>

      {/* Interactive comparison */}
      <div className='space-y-4 mb-8'>
        {COMPARISON_DATA.map((item, index) => (
          <div
            key={index}
            className='border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'
          >
            <TouchTarget
              onClick={() =>
                setSelectedComparison(
                  selectedComparison === index ? null : index
                )
              }
              className='w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 min-h-16'
              ariaLabel={`Compare review styles for ${item.explanation}`}
            >
              <div className='flex items-center gap-3'>
                <span className='text-2xl' role='img' aria-label={item.icon}>
                  {item.icon}
                </span>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      Review Comparison {index + 1}
                    </h3>
                    <span
                      className={`transform transition-transform ${
                        selectedComparison === index ? 'rotate-180' : ''
                      }`}
                      aria-hidden='true'
                    >
                      ⌄
                    </span>
                  </div>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Tap to see the difference
                  </p>
                </div>
              </div>
            </TouchTarget>

            {selectedComparison === index && (
              <div className='border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4'>
                <div className='grid md:grid-cols-2 gap-4 mb-4'>
                  {/* Generic review */}
                  <div className='bg-red-50 dark:bg-red-900/20 rounded-lg p-3'>
                    <h4 className='font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2'>
                      <span role='img' aria-label='Generic review'>
                        😕
                      </span>
                      Generic Review
                    </h4>
                    <p className='text-red-700 dark:text-red-300 text-sm italic'>
                      {item.generic}
                    </p>
                  </div>

                  {/* Work-specific review */}
                  <div className='bg-green-50 dark:bg-green-900/20 rounded-lg p-3'>
                    <h4 className='font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2'>
                      <span role='img' aria-label='Work-specific review'>
                        💼
                      </span>
                      WFC Pedia Style
                    </h4>
                    <p className='text-green-700 dark:text-green-300 text-sm font-medium'>
                      {item.workSpecific}
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <div className='bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3'>
                  <p className='text-blue-800 dark:text-blue-200 text-sm'>
                    <strong>Why this matters:</strong> {item.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rating categories preview */}
      <div className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6'>
        <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center'>
          Our Work-Focused Rating Categories
        </h3>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[
            { icon: '📶', label: 'WiFi Speed', detail: 'Mbps tested' },
            {
              icon: '🔌',
              label: 'Power Access',
              detail: 'Outlet availability',
            },
            {
              icon: '🪑',
              label: 'Workspace Comfort',
              detail: 'Ergonomic rating',
            },
            { icon: '🔊', label: 'Noise Level', detail: 'Work suitability' },
          ].map((category, index) => (
            <div key={index} className='text-center'>
              <div
                className='text-2xl mb-2'
                role='img'
                aria-label={category.label}
              >
                {category.icon}
              </div>
              <h4 className='font-medium text-gray-900 dark:text-white text-sm'>
                {category.label}
              </h4>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {category.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Next step hint */}
      <div className='mt-8 text-center'>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          Next: Try interactive examples of our rating system
        </p>
      </div>
    </div>
  )
}
