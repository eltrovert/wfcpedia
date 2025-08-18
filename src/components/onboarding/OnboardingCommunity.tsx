import React, { useState } from 'react'
import { TouchTarget } from '../ui/TouchTarget'

interface ContributionType {
  id: string
  title: string
  icon: string
  description: string
  impact: string
  examples: string[]
}

const CONTRIBUTION_TYPES: ContributionType[] = [
  {
    id: 'add-cafe',
    title: 'Add New Cafés',
    icon: '🏪',
    description: 'Discover and share work-friendly spots in your area',
    impact: 'Help fellow remote workers find new productive spaces',
    examples: [
      'Upload photos and basic info',
      'Rate WiFi, comfort, and noise levels',
      'Share power outlet and seating details',
      'Earn "First Contributor" badge',
    ],
  },
  {
    id: 'rate-review',
    title: 'Rate & Review',
    icon: '⭐',
    description: 'Share your workspace experience with detailed ratings',
    impact: 'Provide reliable information for work-focused decisions',
    examples: [
      'Rate WiFi speed you experienced',
      'Assess workspace comfort and ergonomics',
      'Report noise levels for different work types',
      'Upload recent photos of the space',
    ],
  },
  {
    id: 'community-love',
    title: 'Show Community Love',
    icon: '💝',
    description: "Appreciate others' contributions and build connections",
    impact: 'Encourage quality contributions and community spirit',
    examples: [
      'Give "loves" to helpful reviews',
      'Thank contributors for great finds',
      'Share favorite cafés with your network',
      'Earn "Social Butterfly" badge',
    ],
  },
]

function CommunityImpactVisualization(): JSX.Element {
  const [showStats, setShowStats] = useState(false)

  const stats = [
    {
      label: 'Remote Workers Helped',
      value: '2,847',
      trend: '+23% this month',
    },
    {
      label: 'Work Sessions Improved',
      value: '15,291',
      trend: 'Better workspace matches',
    },
    { label: 'Hours Saved', value: '8,734', trend: 'No more bad café visits' },
    {
      label: 'Community Contributors',
      value: '592',
      trend: 'Growing every day',
    },
  ]

  return (
    <div className='bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6'>
      <h4 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center'>
        Community Impact So Far
      </h4>

      <TouchTarget
        onClick={() => setShowStats(!showStats)}
        className='w-full mb-4'
        ariaLabel='Toggle community impact statistics'
      >
        {showStats ? 'Hide Impact Stats' : 'See Our Community Impact'}
      </TouchTarget>

      {showStats && (
        <div className='grid grid-cols-2 gap-4 animate-fadeIn'>
          {stats.map((stat, index) => (
            <div
              key={index}
              className='bg-white dark:bg-gray-800 rounded-lg p-4 text-center'
            >
              <div className='text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1'>
                {stat.value}
              </div>
              <div className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                {stat.label}
              </div>
              <div className='text-xs text-green-600 dark:text-green-400'>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className='mt-4 text-center'>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          <strong>Your contributions matter!</strong> Every review helps someone
          find their perfect workspace.
        </p>
      </div>
    </div>
  )
}

export function OnboardingCommunity(): JSX.Element {
  const [selectedContribution, setSelectedContribution] = useState<
    string | null
  >(null)

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      {/* Header */}
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>
          Join Our Growing Community
        </h2>
        <p className='text-gray-600 dark:text-gray-300 text-lg'>
          Contribute, earn recognition, and help fellow remote workers
        </p>
      </div>

      {/* Contribution types */}
      <div className='space-y-4 mb-8'>
        {CONTRIBUTION_TYPES.map(contribution => (
          <div
            key={contribution.id}
            className='border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'
          >
            <TouchTarget
              onClick={() =>
                setSelectedContribution(
                  selectedContribution === contribution.id
                    ? null
                    : contribution.id
                )
              }
              className='w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-800 min-h-16'
              ariaLabel={`Learn about ${contribution.title}`}
            >
              <div className='flex items-center gap-4'>
                <span
                  className='text-3xl'
                  role='img'
                  aria-label={contribution.title}
                >
                  {contribution.icon}
                </span>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>
                    {contribution.title}
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>
                    {contribution.description}
                  </p>
                </div>
                <span
                  className={`transform transition-transform ${
                    selectedContribution === contribution.id ? 'rotate-180' : ''
                  }`}
                  aria-hidden='true'
                >
                  ⌄
                </span>
              </div>
            </TouchTarget>

            {selectedContribution === contribution.id && (
              <div className='border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4'>
                <div className='mb-4'>
                  <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
                    Community Impact:
                  </h4>
                  <p className='text-gray-600 dark:text-gray-400 text-sm'>
                    {contribution.impact}
                  </p>
                </div>

                <div>
                  <h4 className='font-medium text-gray-900 dark:text-white mb-2'>
                    What You Can Do:
                  </h4>
                  <ul className='space-y-1'>
                    {contribution.examples.map((example, index) => (
                      <li
                        key={index}
                        className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'
                      >
                        <span className='text-green-500' aria-hidden='true'>
                          ✓
                        </span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Community impact visualization */}
      <CommunityImpactVisualization />

      {/* Recognition system preview */}
      <div className='mt-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center'>
          Earn Recognition & Badges
        </h3>

        <div className='grid grid-cols-3 md:grid-cols-5 gap-4 mb-4'>
          {[
            {
              emoji: '🏪',
              name: 'First Contributor',
              desc: 'Add your first café',
            },
            {
              emoji: '⭐',
              name: 'First Reviewer',
              desc: 'Rate your first visit',
            },
            { emoji: '📸', name: 'Photo Enthusiast', desc: 'Upload 10 photos' },
            {
              emoji: '🗺️',
              name: 'City Explorer',
              desc: 'Visit 5 different cities',
            },
            {
              emoji: '🔥',
              name: 'Streak Master',
              desc: 'Contribute 7 days straight',
            },
          ].map((badge, index) => (
            <div key={index} className='text-center'>
              <div className='text-2xl mb-2' role='img' aria-label={badge.name}>
                {badge.emoji}
              </div>
              <h4 className='font-medium text-gray-900 dark:text-white text-xs mb-1'>
                {badge.name}
              </h4>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                {badge.desc}
              </p>
            </div>
          ))}
        </div>

        <div className='text-center'>
          <p className='text-sm text-purple-700 dark:text-purple-300'>
            Build your reputation and help others discover amazing workspaces!
          </p>
        </div>
      </div>

      {/* Before & After comparison */}
      <div className='mt-8 grid md:grid-cols-2 gap-6'>
        {/* Before community */}
        <div className='bg-red-50 dark:bg-red-900/20 rounded-lg p-4'>
          <h4 className='font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center gap-2'>
            <span role='img' aria-label='Before'>
              😟
            </span>
            Before WFC Pedia
          </h4>
          <ul className='space-y-2 text-sm text-red-700 dark:text-red-300'>
            <li>• Wasted time on unsuitable cafés</li>
            <li>• Unreliable generic reviews</li>
            <li>• No work-specific information</li>
            <li>• Trial and error approach</li>
            <li>• Missed deadlines due to poor WiFi</li>
          </ul>
        </div>

        {/* After community */}
        <div className='bg-green-50 dark:bg-green-900/20 rounded-lg p-4'>
          <h4 className='font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2'>
            <span role='img' aria-label='After'>
              😊
            </span>
            With Our Community
          </h4>
          <ul className='space-y-2 text-sm text-green-700 dark:text-green-300'>
            <li>• Confident workspace choices</li>
            <li>• Reliable work-focused reviews</li>
            <li>• Detailed tech and comfort info</li>
            <li>• Productive work sessions</li>
            <li>• Contributing back to help others</li>
          </ul>
        </div>
      </div>

      {/* Call to action */}
      <div className='mt-8 text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6'>
        <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-3'>
          Ready to Start Contributing?
        </h3>
        <p className='text-gray-600 dark:text-gray-400 mb-4'>
          Every review, photo, and café addition helps build a better workspace
          ecosystem for remote workers everywhere.
        </p>
        <p className='text-sm text-blue-700 dark:text-blue-300'>
          <strong>
            Let's build the ultimate work-friendly café guide together!
          </strong>
        </p>
      </div>
    </div>
  )
}
