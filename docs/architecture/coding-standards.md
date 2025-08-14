# Coding Standards

## Critical AI Development Rules

```typescript
/**
 * CRITICAL: These coding standards are mandatory for AI agents
 * Violation of these rules will result in system instability
 */

// 1. ALWAYS validate user input before processing
function addCafe(cafeData: unknown): Promise<void> {
  // ❌ NEVER do this
  // return cafeService.add(cafeData);

  // ✅ ALWAYS do this
  const validatedCafe = CafeSchema.parse(cafeData);
  return cafeService.add(validatedCafe);
}

// 2. ALWAYS handle errors gracefully
async function fetchCafes(): Promise<Cafe[]> {
  try {
    return await cafeService.getCafes();
  } catch (error) {
    // ❌ NEVER let errors bubble uncaught
    // throw error;

    // ✅ ALWAYS provide fallbacks
    console.error('Failed to fetch cafes:', error);
    return await cafeService.getCachedCafes(); // Fallback to cache
  }
}

// 3. ALWAYS use TypeScript strictly
// ❌ NEVER use 'any' type
function processData(data: any): any {
  return data.something;
}

// ✅ ALWAYS define proper types
interface ProcessableData {
  id: string;
  value: number;
}

function processData(data: ProcessableData): ProcessedResult {
  return { processedValue: data.value * 2 };
}

// 4. ALWAYS implement offline-first patterns
class DataService {
  async getData(): Promise<Data[]> {
    try {
      // Try network first
      const networkData = await this.fetchFromNetwork();
      await this.cacheData(networkData);
      return networkData;
    } catch (error) {
      // ✅ ALWAYS fallback to cache
      const cachedData = await this.getCachedData();
      if (cachedData.length > 0) {
        return cachedData;
      }
      throw new Error('No data available offline');
    }
  }
}

// 5. ALWAYS optimize for mobile performance
// ❌ NEVER load all data at once
function loadAllCafes(): Promise<Cafe[]> {
  return api.getCafes({ limit: 10000 }); // Will crash on mobile
}

// ✅ ALWAYS implement pagination
function loadCafes(page = 0, limit = 10): Promise<PaginatedResponse<Cafe>> {
  return api.getCafes({ page, limit });
}

// 6. ALWAYS implement proper loading states
function CafeList() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ ALWAYS show loading states
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} retry={loadCafes} />;
  if (cafes.length === 0) return <EmptyState />;

  return <CafeGallery cafes={cafes} />;
}

// 7. ALWAYS implement accessibility
function TouchButton({ children, onClick, ariaLabel }: TouchButtonProps) {
  return (
    <button
      className="min-h-11 min-w-11" // ✅ 44px minimum
      onClick={onClick}
      aria-label={ariaLabel} // ✅ ALWAYS provide ARIA labels
      role="button"
      tabIndex={0}
    >
      {children}
    </button>
  );
}
```

## Code Quality Rules

```typescript
// Naming Conventions
interface CafeWorkMetrics { // PascalCase for types
  wifiSpeed: WifiSpeed;     // camelCase for properties
  comfortRating: number;
}

const WIFI_SPEED_OPTIONS = [ // SCREAMING_SNAKE_CASE for constants
  'slow', 'medium', 'fast', 'fiber'
] as const;

function calculateDistance() {} // camelCase for functions
const CafeCard = () => {};    // PascalCase for components

// File Organization Rules
// ✅ One component per file
// ✅ Co-locate related files
// ✅ Index files for clean imports
// ✅ Separate concerns (hooks, utils, types)

// Performance Rules
// ✅ Always use React.memo for expensive components
const CafeCard = React.memo(({ cafe }: CafeCardProps) => {
  // Component implementation
});

// ✅ Always implement proper dependency arrays
useEffect(() => {
  fetchCafes(filters);
}, [filters]); // Include all dependencies

// ✅ Always debounce user input
const debouncedSearch = useDebounce(searchTerm, 300);

// Error Handling Patterns
class CafeError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'CafeError';
  }
}

// ✅ Use error boundaries
function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Router />
    </ErrorBoundary>
  );
}
```

---
