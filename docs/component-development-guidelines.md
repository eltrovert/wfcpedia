# Component Development Guidelines

## Mobile-First Component Development

### Core Principles

1. **Touch-First Design**: All interactive elements must meet 44px minimum touch target
2. **Performance-First**: Components must render in <100ms on 3G networks
3. **Accessibility-First**: All components must be WCAG 2.1 AA compliant
4. **Offline-First**: Components must gracefully handle network failures

## Component Architecture

### File Structure

```
src/components/
├── ui/                    # Base reusable components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
├── cafe/                  # Domain-specific components
├── forms/                 # Form-related components
└── navigation/            # Navigation components
```

### Component Template

```typescript
import React from 'react'
import { cn } from '@/utils/styles'

interface ComponentProps {
  /** Required props should be clearly documented */
  children: React.ReactNode
  /** Optional props with defaults */
  variant?: 'primary' | 'secondary'
  /** Loading state for async operations */
  isLoading?: boolean
  /** Accessibility label */
  'aria-label'?: string
}

export const Component = React.memo<ComponentProps>(({
  children,
  variant = 'primary',
  isLoading = false,
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <div
      className={cn(
        // Base styles
        'touch-target transition-all duration-200',
        // Variant styles
        {
          'bg-primary-500': variant === 'primary',
          'bg-secondary-500': variant === 'secondary',
        }
      )}
      aria-label={ariaLabel}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </div>
  )
})

Component.displayName = 'Component'
```

## Touch Target Requirements

### Minimum Sizes

- **Interactive Elements**: 44px × 44px minimum
- **Comfortable Targets**: 48px × 48px recommended
- **Large Targets**: 72px × 72px for primary actions

### Implementation

```typescript
// Use Tailwind utilities
<button className="touch-target"> {/* 44px minimum */}
<button className="touch-target-lg"> {/* 72px comfortable */}

// Custom implementation
<button className="min-h-11 min-w-11 p-3">
```

## Accessibility Standards

### Required Attributes

```typescript
// Interactive elements
<button
  aria-label="Add café to favorites"
  role="button"
  tabIndex={0}
>

// Form inputs
<input
  aria-describedby="error-message"
  aria-invalid={hasError}
  aria-required={required}
/>

// Loading states
<div
  aria-live="polite"
  aria-busy={isLoading}
>
```

### Focus Management

```typescript
// Focus trap for modals
import { useFocusTrap } from '@/hooks/useFocusTrap'

const Modal = () => {
  const trapRef = useFocusTrap()

  return (
    <div ref={trapRef} className="modal">
      {/* Modal content */}
    </div>
  )
}

// Skip links for navigation
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

## Performance Guidelines

### Lazy Loading

```typescript
// Component lazy loading
const CafeGallery = React.lazy(() => import('./CafeGallery'))

// Image lazy loading
<img
  loading="lazy"
  src={src}
  alt={alt}
  className="w-full h-auto"
/>
```

### Memoization

```typescript
// Expensive computations
const expensiveValue = React.useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// Event handlers
const handleClick = React.useCallback(
  (id: string) => {
    onItemClick(id)
  },
  [onItemClick]
)

// Component memoization
export const CafeCard = React.memo<CafeCardProps>(({ cafe, onSelect }) => {
  // Component implementation
})
```

### Bundle Size Optimization

```typescript
// Tree-shakable imports
import { format } from 'date-fns/format'
// NOT: import { format } from 'date-fns'

// Dynamic imports for large dependencies
const MapComponent = React.lazy(() =>
  import('react-leaflet').then(module => ({
    default: module.MapContainer,
  }))
)
```

## Mobile Patterns

### Bottom Sheet Pattern

```typescript
const BottomSheet = ({ isOpen, onClose, children }) => (
  <div
    className={cn(
      'fixed inset-x-0 bottom-0 bg-white rounded-t-xl shadow-lg transform transition-transform duration-300',
      'safe-bottom', // Handle safe area
      isOpen ? 'translate-y-0' : 'translate-y-full'
    )}
  >
    {/* Drag handle */}
    <div className="flex justify-center pt-3">
      <div className="w-10 h-1 bg-gray-300 rounded-full" />
    </div>
    {children}
  </div>
)
```

### Pull to Refresh

```typescript
const usePullToRefresh = (onRefresh: () => void) => {
  const [isPulling, setIsPulling] = useState(false)

  const handleTouchStart = (e: TouchEvent) => {
    // Implementation
  }

  const handleTouchMove = (e: TouchEvent) => {
    // Implementation
  }

  return { isPulling }
}
```

### Infinite Scroll

```typescript
const useInfiniteScroll = (loadMore: () => void) => {
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore, loading])

  return sentinelRef
}
```

## Form Components

### Touch-Friendly Inputs

```typescript
const FormInput = ({ label, error, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      {...props}
      className={cn(
        'form-input', // Custom utility class
        'min-h-11 px-4 py-3 text-base', // Touch-friendly sizing
        {
          'border-red-300': error,
          'focus:border-red-500': error,
        }
      )}
    />
    {error && (
      <p className="text-sm text-red-600" role="alert">
        {error}
      </p>
    )}
  </div>
)
```

### Form Validation

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email')
})

const CafeForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data) => {
    // Handle submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        {...register('name')}
        label="Café Name"
        error={errors.name?.message}
      />
      {/* More fields */}
    </form>
  )
}
```

## Testing Guidelines

### Component Tests

```typescript
import { render, screen, fireEvent } from '@/tests/utils/test-utils'
import { CafeCard } from './CafeCard'
import { mockCafe } from '@/tests/__mocks__/cafe-data'

describe('CafeCard', () => {
  it('renders café information correctly', () => {
    render(<CafeCard cafe={mockCafe} onSelect={vi.fn()} />)

    expect(screen.getByText(mockCafe.name)).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('alt', mockCafe.name)
  })

  it('meets accessibility standards', async () => {
    const { container } = render(
      <CafeCard cafe={mockCafe} onSelect={vi.fn()} />
    )

    await axe(container)
  })

  it('handles touch interactions', () => {
    const onSelect = vi.fn()
    render(<CafeCard cafe={mockCafe} onSelect={onSelect} />)

    const card = screen.getByRole('button')
    fireEvent.click(card)

    expect(onSelect).toHaveBeenCalledWith(mockCafe)
  })

  it('meets minimum touch target size', () => {
    render(<CafeCard cafe={mockCafe} onSelect={vi.fn()} />)

    const interactive = screen.getByRole('button')
    const styles = window.getComputedStyle(interactive)

    expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44)
    expect(parseInt(styles.minWidth)).toBeGreaterThanOrEqual(44)
  })
})
```

## Error Handling

### Error Boundaries

```typescript
class ComponentErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo)
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />
    }

    return this.props.children
  }
}
```

### Loading and Error States

```typescript
const DataComponent = () => {
  const { data, error, isLoading } = useQuery('cafes', fetchCafes)

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!data?.length) return <EmptyState />

  return <CafeList cafes={data} />
}
```

## Styling Guidelines

### Utility-First Approach

```typescript
// Prefer utility classes
<button className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-lg transition-colors">

// Use component classes for complex patterns
<div className="card cafe-card">
```

### Responsive Design

```typescript
// Mobile-first responsive classes
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Conditional rendering for mobile
{isMobile ? <MobileView /> : <DesktopView />}
```

### Dark Mode Support

```typescript
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

## Component Documentation

### JSDoc Comments

````typescript
/**
 * CafeCard component displays café information in a touch-friendly card format
 *
 * @example
 * ```tsx
 * <CafeCard
 *   cafe={cafeData}
 *   onSelect={(cafe) => navigate(`/cafe/${cafe.id}`)}
 * />
 * ```
 */
export interface CafeCardProps {
  /** Café data to display */
  cafe: Cafe
  /** Callback when café is selected */
  onSelect: (cafe: Cafe) => void
  /** Optional loading state */
  isLoading?: boolean
}
````

## Performance Monitoring

### Performance Metrics

```typescript
// Measure component render time
const ComponentWithMetrics = () => {
  useEffect(() => {
    performance.mark('component-start')

    return () => {
      performance.mark('component-end')
      performance.measure('component-render', 'component-start', 'component-end')
    }
  }, [])

  return <Component />
}
```

This guide ensures all components follow mobile-first, accessible, and performant patterns suitable
for the WFC Pedia application.
