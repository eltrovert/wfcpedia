import React, { useState } from 'react'
import { TouchTarget } from '../ui/TouchTarget'

interface ExampleDemo {
  id: string
  title: string
  description: string
  component: React.ComponentType
}

// WiFi Speed Testing Demo Component
function WiFiSpeedDemo(): JSX.Element {
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [speedCategory, setSpeedCategory] = useState<string>('')
  const [announcement, setAnnouncement] = useState<string>('')

  const runSpeedTest = async (): Promise<void> => {
    setIsSimulating(true)
    setCurrentSpeed(0)
    setSpeedCategory('')
    setAnnouncement('WiFi speed test started')

    // Simulate speed test progression
    for (let speed = 0; speed <= 45; speed += 5) {
      setCurrentSpeed(speed)
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    const finalResult = 42
    setCurrentSpeed(finalResult)

    // Categorize speed
    let category = ''
    if (finalResult >= 50) category = '🚀 Fiber (50+ Mbps)'
    else if (finalResult >= 25) category = '💨 Fast (25-50 Mbps)'
    else if (finalResult >= 10) category = '📱 Medium (10-25 Mbps)'
    else category = '🐌 Slow (<10 Mbps)'

    setSpeedCategory(category)
    setAnnouncement(
      `Speed test complete: ${finalResult} Mbps, categorized as ${category.split(' ')[1]}`
    )
    setIsSimulating(false)
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
      <h4 className='font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
        <span role='img' aria-label='WiFi'>
          📶
        </span>
        WiFi Speed Testing
      </h4>

      <div className='text-center mb-6'>
        <div className='text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2'>
          {currentSpeed} Mbps
        </div>
        {speedCategory && (
          <div className='text-lg font-medium text-gray-700 dark:text-gray-300'>
            {speedCategory}
          </div>
        )}
      </div>

      {/* Speed visualization */}
      <div className='relative mb-4'>
        <div
          className='w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3'
          role='progressbar'
          aria-valuemin={0}
          aria-valuemax={50}
          aria-valuenow={currentSpeed}
          aria-label={`WiFi Speed: ${currentSpeed} Mbps`}
        >
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              isSimulating ? 'bg-blue-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((currentSpeed / 50) * 100, 100)}%` }}
          />
        </div>
        <div className='flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1'>
          <span>0 Mbps</span>
          <span>25 Mbps</span>
          <span>50+ Mbps</span>
        </div>
      </div>

      {/* Real-world context */}
      <div className='space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4'>
        <div className='flex justify-between'>
          <span>📧 Email & Browsing</span>
          <span
            className={
              currentSpeed >= 5
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }
          >
            {currentSpeed >= 5 ? '✓' : '✗'}
          </span>
        </div>
        <div className='flex justify-between'>
          <span>📹 Video Calls (720p)</span>
          <span
            className={
              currentSpeed >= 15
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }
          >
            {currentSpeed >= 15 ? '✓' : '✗'}
          </span>
        </div>
        <div className='flex justify-between'>
          <span>☁️ Cloud Sync & Large Files</span>
          <span
            className={
              currentSpeed >= 25
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }
          >
            {currentSpeed >= 25 ? '✓' : '✗'}
          </span>
        </div>
      </div>

      <TouchTarget
        onClick={runSpeedTest}
        disabled={isSimulating}
        className='w-full'
        ariaLabel='Run WiFi speed test simulation'
      >
        {isSimulating ? 'Testing...' : 'Run Speed Test'}
      </TouchTarget>

      {/* Screen reader announcements */}
      <div role='status' aria-live='polite' className='sr-only'>
        {announcement}
      </div>
    </div>
  )
}

// Comfort Rating Demo Component
function ComfortRatingDemo(): JSX.Element {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const ratings = [
    {
      stars: 1,
      label: 'Poor',
      description:
        'Uncomfortable seating, poor lighting, not suitable for extended work',
      icon: '😣',
    },
    {
      stars: 2,
      label: 'Fair',
      description: 'Basic seating, adequate lighting, short work sessions only',
      icon: '😐',
    },
    {
      stars: 3,
      label: 'Good',
      description: 'Comfortable seating, good lighting, suitable for 2-3 hours',
      icon: '🙂',
    },
    {
      stars: 4,
      label: 'Very Good',
      description:
        'Ergonomic seating, adjustable lighting, perfect for full workdays',
      icon: '😊',
    },
    {
      stars: 5,
      label: 'Excellent',
      description:
        'Premium workspace setup, perfect ergonomics, dedicated work zones',
      icon: '🤩',
    },
  ]

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
      <h4 className='font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
        <span role='img' aria-label='Comfort'>
          🪑
        </span>
        Workspace Comfort Rating
      </h4>

      <div className='space-y-3 mb-4'>
        {ratings.map(rating => (
          <TouchTarget
            key={rating.stars}
            onClick={() => setSelectedRating(rating.stars)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedRating === rating.stars
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            ariaLabel={`Select ${rating.stars} stars: ${rating.label}`}
          >
            <div className='flex items-center gap-3'>
              <div className='flex'>
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < rating.stars
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    aria-hidden='true'
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span className='text-lg' role='img' aria-label={rating.label}>
                {rating.icon}
              </span>
              <div className='flex-1'>
                <div className='font-medium text-gray-900 dark:text-white'>
                  {rating.label}
                </div>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  {rating.description}
                </div>
              </div>
            </div>
          </TouchTarget>
        ))}
      </div>

      {selectedRating && (
        <div className='bg-green-50 dark:bg-green-900/20 rounded-lg p-3'>
          <p className='text-green-800 dark:text-green-200 text-sm'>
            <strong>You selected:</strong> {ratings[selectedRating - 1]?.label}{' '}
            rating
            <br />
            This helps other remote workers understand the workspace quality at
            a glance.
          </p>
        </div>
      )}
    </div>
  )
}

// Noise Level Demo Component
function NoiseLevelDemo(): JSX.Element {
  const [isPlaying, setIsPlaying] = useState<string | null>(null)

  const noiseLevels = [
    {
      level: 'quiet',
      label: 'Quiet (40-50 dB)',
      description: 'Perfect for calls and focused work',
      icon: '🤫',
      color: 'green',
    },
    {
      level: 'moderate',
      label: 'Moderate (50-65 dB)',
      description: 'Good for most work, some background chatter',
      icon: '🗣️',
      color: 'yellow',
    },
    {
      level: 'lively',
      label: 'Lively (65+ dB)',
      description: 'Social atmosphere, might need headphones',
      icon: '🎵',
      color: 'orange',
    },
  ]

  const playNoiseSample = (level: string): void => {
    setIsPlaying(level)
    // In a real implementation, this would play audio samples
    setTimeout(() => setIsPlaying(null), 2000)
  }

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700'>
      <h4 className='font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
        <span role='img' aria-label='Sound'>
          🔊
        </span>
        Noise Level Assessment
      </h4>

      <div className='space-y-3'>
        {noiseLevels.map(noise => (
          <div
            key={noise.level}
            className={`border rounded-lg p-4 ${
              noise.color === 'green'
                ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                : noise.color === 'yellow'
                  ? 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <span className='text-2xl' role='img' aria-label={noise.label}>
                  {noise.icon}
                </span>
                <div>
                  <h5 className='font-medium text-gray-900 dark:text-white'>
                    {noise.label}
                  </h5>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {noise.description}
                  </p>
                </div>
              </div>

              <TouchTarget
                onClick={() => playNoiseSample(noise.level)}
                disabled={isPlaying !== null}
                variant='secondary'
                className='shrink-0'
                ariaLabel={`Listen to ${noise.label} sound sample`}
              >
                {isPlaying === noise.level ? '⏸️' : '▶️'}
              </TouchTarget>
            </div>

            {/* Visual noise indicator */}
            <div className='mt-3 flex items-center gap-1'>
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-4 rounded ${
                    (noise.level === 'quiet' && i < 2) ||
                    (noise.level === 'moderate' && i < 3) ||
                    (noise.level === 'lively' && i < 5)
                      ? `bg-${noise.color}-500`
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const DEMO_EXAMPLES: ExampleDemo[] = [
  {
    id: 'wifi-speed',
    title: 'WiFi Speed Testing',
    description: 'See how we measure real-world internet performance',
    component: WiFiSpeedDemo,
  },
  {
    id: 'comfort-rating',
    title: 'Workspace Comfort',
    description: 'Learn our 5-star comfort evaluation system',
    component: ComfortRatingDemo,
  },
  {
    id: 'noise-level',
    title: 'Noise Level Assessment',
    description: 'Understand how we categorize work environments',
    component: NoiseLevelDemo,
  },
]

export function OnboardingExamples(): JSX.Element {
  const [activeDemo, setActiveDemo] = useState(0)

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      {/* Header */}
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-3'>
          Interactive Rating Examples
        </h2>
        <p className='text-gray-600 dark:text-gray-300 text-lg'>
          Try our work-focused evaluation tools
        </p>
      </div>

      {/* Demo selector tabs */}
      <div className='flex flex-wrap gap-2 mb-6 justify-center'>
        {DEMO_EXAMPLES.map((demo, index) => (
          <TouchTarget
            key={demo.id}
            onClick={() => setActiveDemo(index)}
            variant={activeDemo === index ? 'primary' : 'secondary'}
            className='flex-1 min-w-[120px] text-center'
            ariaLabel={`Switch to ${demo.title} demo`}
          >
            <div className='text-sm font-medium'>{demo.title}</div>
          </TouchTarget>
        ))}
      </div>

      {/* Active demo */}
      <div className='mb-6'>
        <div className='text-center mb-4'>
          <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
            {DEMO_EXAMPLES[activeDemo].title}
          </h3>
          <p className='text-gray-600 dark:text-gray-300'>
            {DEMO_EXAMPLES[activeDemo].description}
          </p>
        </div>

        <div>{React.createElement(DEMO_EXAMPLES[activeDemo].component)}</div>
      </div>

      {/* Key takeaway */}
      <div className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-3 text-center'>
          Why These Details Matter
        </h3>
        <div className='grid md:grid-cols-2 gap-4 text-sm'>
          <div className='space-y-2'>
            <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
              <span role='img' aria-label='Time'>
                ⏰
              </span>
              Save Time
            </h4>
            <p className='text-gray-600 dark:text-gray-400'>
              No more guessing or disappointment. Know exactly what to expect
              before you arrive.
            </p>
          </div>
          <div className='space-y-2'>
            <h4 className='font-medium text-gray-900 dark:text-white flex items-center gap-2'>
              <span role='img' aria-label='Productivity'>
                💪
              </span>
              Stay Productive
            </h4>
            <p className='text-gray-600 dark:text-gray-400'>
              Find workspaces that match your specific needs and work style.
            </p>
          </div>
        </div>
      </div>

      {/* Next step hint */}
      <div className='mt-8 text-center'>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          Next: Discover how you can contribute to the community
        </p>
      </div>
    </div>
  )
}
