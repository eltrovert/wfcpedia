import React from 'react'

interface TouchTargetProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  ariaLabel?: string
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost'
}

/**
 * TouchTarget component ensures minimum 44px touch target size
 * for mobile accessibility compliance (WCAG 2.1 Level AA)
 */
export function TouchTarget({
  children,
  onClick,
  className = '',
  disabled = false,
  ariaLabel,
  type = 'button',
  variant = 'primary',
}: TouchTargetProps): JSX.Element {
  const baseClasses =
    'min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    secondary:
      'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}
