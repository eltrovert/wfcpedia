/**
 * Touch optimization utilities for Indonesian Android devices
 * Optimizes touch interactions, haptic feedback, and gesture handling
 */

export interface TouchGestureConfig {
  minSwipeDistance: number
  maxSwipeTime: number
  velocityThreshold: number
  enableHaptics: boolean
}

export interface HapticPattern {
  duration: number
  intensity: 'light' | 'medium' | 'heavy'
}

/**
 * Default configuration optimized for Indonesian Android devices
 */
export const DEFAULT_TOUCH_CONFIG: TouchGestureConfig = {
  minSwipeDistance: 50, // pixels
  maxSwipeTime: 300, // milliseconds
  velocityThreshold: 0.3, // pixels per millisecond
  enableHaptics: true,
}

/**
 * Haptic feedback patterns for different interactions
 */
export const HAPTIC_PATTERNS: Record<string, HapticPattern> = {
  light: { duration: 10, intensity: 'light' },
  selection: { duration: 20, intensity: 'medium' },
  navigation: { duration: 15, intensity: 'light' },
  success: { duration: 30, intensity: 'medium' },
  error: { duration: 50, intensity: 'heavy' },
  warning: { duration: 25, intensity: 'medium' },
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator || 'hapticFeedback' in navigator
}

/**
 * Trigger haptic feedback
 */
export function triggerHaptic(
  pattern: keyof typeof HAPTIC_PATTERNS | HapticPattern
): void {
  if (!isHapticSupported()) return

  const hapticPattern =
    typeof pattern === 'string' ? HAPTIC_PATTERNS[pattern] : pattern

  try {
    // Modern Haptic API (Chrome Android)
    if ('vibrate' in navigator) {
      navigator.vibrate(hapticPattern.duration)
    }

    // Future Web Haptics API support
    if ('hapticFeedback' in navigator) {
      ;(
        navigator as Navigator & {
          hapticFeedback?: {
            vibrate: (intensity: string, duration: number) => void
          }
        }
      ).hapticFeedback?.vibrate(hapticPattern.intensity, hapticPattern.duration)
    }
  } catch (error) {
    console.warn('Haptic feedback failed:', error)
  }
}

/**
 * Enhanced touch gesture handler
 */
export class TouchGestureHandler {
  private config: TouchGestureConfig
  private startX: number = 0
  private startY: number = 0
  private startTime: number = 0
  private element: HTMLElement
  private callbacks: {
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
    onSwipeUp?: () => void
    onSwipeDown?: () => void
    onTap?: () => void
    onLongPress?: () => void
  }

  constructor(
    element: HTMLElement,
    callbacks: TouchGestureHandler['callbacks'],
    config: Partial<TouchGestureConfig> = {}
  ) {
    this.element = element
    this.callbacks = callbacks
    this.config = { ...DEFAULT_TOUCH_CONFIG, ...config }

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    this.element.addEventListener(
      'touchstart',
      this.handleTouchStart.bind(this),
      { passive: false }
    )
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: false,
    })
    this.element.addEventListener(
      'touchmove',
      this.handleTouchMove.bind(this),
      { passive: false }
    )
  }

  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0]
    this.startX = touch.clientX
    this.startY = touch.clientY
    this.startTime = Date.now()

    // Light haptic feedback on touch start
    if (this.config.enableHaptics) {
      triggerHaptic('light')
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    // Prevent default scrolling during swipe gestures
    const touch = event.touches[0]
    const deltaX = Math.abs(touch.clientX - this.startX)
    const deltaY = Math.abs(touch.clientY - this.startY)

    // If horizontal movement is significant, prevent vertical scrolling
    if (deltaX > deltaY && deltaX > 20) {
      event.preventDefault()
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0]
    const endX = touch.clientX
    const endY = touch.clientY
    const endTime = Date.now()

    const deltaX = endX - this.startX
    const deltaY = endY - this.startY
    const deltaTime = endTime - this.startTime
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / deltaTime

    // Long press detection
    if (deltaTime > 500 && distance < 20) {
      if (this.callbacks.onLongPress) {
        this.callbacks.onLongPress()
        if (this.config.enableHaptics) {
          triggerHaptic('selection')
        }
      }
      return
    }

    // Tap detection
    if (distance < 20 && deltaTime < 200) {
      if (this.callbacks.onTap) {
        this.callbacks.onTap()
        if (this.config.enableHaptics) {
          triggerHaptic('selection')
        }
      }
      return
    }

    // Swipe detection
    if (
      distance > this.config.minSwipeDistance &&
      deltaTime < this.config.maxSwipeTime &&
      velocity > this.config.velocityThreshold
    ) {
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY)

      if (isHorizontal) {
        if (deltaX > 0) {
          // Swipe right
          if (this.callbacks.onSwipeRight) {
            this.callbacks.onSwipeRight()
            if (this.config.enableHaptics) {
              triggerHaptic('navigation')
            }
          }
        } else {
          // Swipe left
          if (this.callbacks.onSwipeLeft) {
            this.callbacks.onSwipeLeft()
            if (this.config.enableHaptics) {
              triggerHaptic('navigation')
            }
          }
        }
      } else {
        if (deltaY > 0) {
          // Swipe down
          if (this.callbacks.onSwipeDown) {
            this.callbacks.onSwipeDown()
            if (this.config.enableHaptics) {
              triggerHaptic('navigation')
            }
          }
        } else {
          // Swipe up
          if (this.callbacks.onSwipeUp) {
            this.callbacks.onSwipeUp()
            if (this.config.enableHaptics) {
              triggerHaptic('navigation')
            }
          }
        }
      }
    }
  }

  public destroy(): void {
    this.element.removeEventListener(
      'touchstart',
      this.handleTouchStart.bind(this)
    )
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.element.removeEventListener(
      'touchmove',
      this.handleTouchMove.bind(this)
    )
  }
}

/**
 * Optimize touch targets for Indonesian Android devices
 */
export function optimizeTouchTarget(element: HTMLElement): void {
  const computedStyle = window.getComputedStyle(element)
  const minSize = 44 // WCAG minimum touch target size

  const currentWidth = parseInt(computedStyle.width, 10)
  const currentHeight = parseInt(computedStyle.height, 10)

  if (currentWidth < minSize) {
    element.style.minWidth = `${minSize}px`
  }

  if (currentHeight < minSize) {
    element.style.minHeight = `${minSize}px`
  }

  // Ensure proper touch-action for better responsiveness
  element.style.touchAction = 'manipulation'

  // Remove default mobile highlights
  element.style.webkitTapHighlightColor = 'transparent'

  // Improve scrolling performance
  element.style.webkitOverflowScrolling = 'touch'
}

/**
 * Create touch-optimized button handler
 */
export function createTouchButton(
  element: HTMLElement,
  onClick: () => void,
  options: {
    hapticFeedback?: boolean
    preventDoubleClick?: boolean
    longPressAction?: () => void
  } = {}
): () => void {
  const {
    hapticFeedback = true,
    preventDoubleClick = true,
    longPressAction,
  } = options

  let lastClickTime = 0
  let touchStartTime = 0
  let longPressTimer: NodeJS.Timeout | null = null

  const handleTouchStart = (): void => {
    touchStartTime = Date.now()

    if (hapticFeedback) {
      triggerHaptic('light')
    }

    // Set up long press detection
    if (longPressAction) {
      longPressTimer = setTimeout(() => {
        longPressAction()
        if (hapticFeedback) {
          triggerHaptic('selection')
        }
      }, 500)
    }
  }

  const handleTouchEnd = (): void => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }

    const touchDuration = Date.now() - touchStartTime

    // Ignore if it was a long press
    if (touchDuration > 500) {
      return
    }
  }

  const handleClick = (): void => {
    const now = Date.now()

    // Prevent double clicks
    if (preventDoubleClick && now - lastClickTime < 300) {
      return
    }

    lastClickTime = now

    if (hapticFeedback) {
      triggerHaptic('selection')
    }

    onClick()
  }

  // Add event listeners
  element.addEventListener('touchstart', handleTouchStart, { passive: true })
  element.addEventListener('touchend', handleTouchEnd, { passive: true })
  element.addEventListener('click', handleClick)

  // Optimize the element
  optimizeTouchTarget(element)

  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchend', handleTouchEnd)
    element.removeEventListener('click', handleClick)

    if (longPressTimer) {
      clearTimeout(longPressTimer)
    }
  }
}

/**
 * Test touch capabilities and performance
 */
export function detectTouchCapabilities(): {
  hasTouch: boolean
  maxTouchPoints: number
  supportsHaptics: boolean
  isHighFrequencyDisplay: boolean
} {
  return {
    hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    supportsHaptics: isHapticSupported(),
    isHighFrequencyDisplay:
      window.screen &&
      (window.screen as Screen & { refreshRate?: number }).refreshRate
        ? (window.screen as Screen & { refreshRate: number }).refreshRate > 60
        : false,
  }
}

/**
 * Get optimal touch configuration for current device
 */
export function getOptimalTouchConfig(): TouchGestureConfig {
  const capabilities = detectTouchCapabilities()

  return {
    minSwipeDistance: capabilities.hasTouch ? 40 : 60,
    maxSwipeTime: capabilities.isHighFrequencyDisplay ? 250 : 300,
    velocityThreshold: capabilities.isHighFrequencyDisplay ? 0.4 : 0.3,
    enableHaptics: capabilities.supportsHaptics,
  }
}
