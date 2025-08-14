# Troubleshooting Guide

## Common Development Issues

### 🔧 Installation and Setup Problems

#### Node.js Version Issues

```bash
# Problem: Wrong Node.js version
# Solution: Use Node.js 18+ (LTS recommended)
node --version  # Should be 18.x.x or higher

# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Dependency Installation Failures

```bash
# Problem: npm install fails with peer dependency conflicts
# Solution: Use legacy peer deps
npm install --legacy-peer-deps

# Clear npm cache if issues persist
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### Git Repository Issues

```bash
# Problem: Husky hooks not working
# Solution: Reinitialize git and husky
git init
npm run prepare
chmod +x .husky/pre-commit
```

### 🌐 Development Server Issues

#### HTTPS Certificate Problems

```bash
# Problem: Browser shows "Not Secure" or certificate errors
# Solution: Accept the self-signed certificate

# Chrome: Click "Advanced" → "Proceed to localhost (unsafe)"
# Firefox: Click "Advanced" → "Accept the Risk and Continue"

# Alternative: Generate local certificates
npm install -g mkcert
mkcert -install
mkcert localhost 127.0.0.1 ::1
# Update vite.config.ts with certificate paths
```

#### Port Already in Use

```bash
# Problem: Port 5173 is busy
# Solution: Kill process or use different port
lsof -ti:5173 | xargs kill -9

# Or specify different port
npm run dev -- --port 3000
```

#### Hot Reload Not Working

```bash
# Problem: Changes not reflecting in browser
# Solution: Check file watching limits (Linux/WSL)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Restart development server
npm run dev
```

### 📱 Mobile Development Issues

#### Touch Events Not Responding

```typescript
// Problem: Click events don't work on mobile
// Solution: Use pointer events or add touch event listeners

// ❌ Mouse-only events
element.addEventListener('click', handler)

// ✅ Pointer events (recommended)
element.addEventListener('pointerdown', handler)

// ✅ Touch events for specific mobile behavior
element.addEventListener('touchstart', handler, { passive: true })
```

#### Viewport Not Scaling Correctly

```html
<!-- Problem: Page appears zoomed out on mobile -->
<!-- Solution: Ensure proper viewport meta tag -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />

<!-- Prevent zoom on input focus (iOS) -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
/>
```

#### iOS Safari Specific Issues

```css
/* Problem: Bounce scrolling on iOS */
/* Solution: Disable overscroll behavior */
body {
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}

/* Problem: Input fields zoom in on focus */
/* Solution: Set minimum font size */
input,
textarea,
select {
  font-size: 16px; /* Prevents zoom on iOS */
}

/* Problem: Safe area not respected */
/* Solution: Use safe area insets */
.header {
  padding-top: env(safe-area-inset-top);
}
.footer {
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 🧪 Testing Issues

#### Playwright Installation Problems

```bash
# Problem: Playwright browsers not installing
# Solution: Install system dependencies
sudo npx playwright install-deps
npx playwright install

# WSL specific: Install additional packages
sudo apt-get update
sudo apt-get install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libxss1 \
  libasound2
```

#### Test Failures on CI/CD

```bash
# Problem: Tests pass locally but fail on CI
# Solution: Ensure consistent test environment

# Use stable test data
# Mock external dependencies
# Set consistent viewport sizes
# Add proper wait conditions

# Example: Wait for network idle before testing
await page.waitForLoadState('networkidle');
```

#### Vitest Memory Issues

```typescript
// Problem: Tests run out of memory
// Solution: Configure Vitest pool options

// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // For memory-constrained environments
      },
    },
  },
})
```

### 🎨 Styling and Layout Issues

#### Tailwind CSS Not Working

```bash
# Problem: Tailwind classes not applying
# Solution: Check configuration and content paths

# Ensure content paths are correct in tailwind.config.js
content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}',
],

# Rebuild CSS
npm run build
```

#### Layout Shifts on Mobile

```css
/* Problem: Content jumps during loading */
/* Solution: Reserve space for dynamic content */

/* Use aspect-ratio for images */
.image-container {
  aspect-ratio: 16/9;
}

/* Use min-height for dynamic content */
.content-area {
  min-height: 200px;
}

/* Use skeleton loaders */
.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}
```

#### Dark Mode Issues

```typescript
// Problem: Flash of wrong theme on load
// Solution: Implement theme synchronization

// Check system preference and stored theme
const getInitialTheme = (): 'light' | 'dark' => {
  const stored = localStorage.getItem('theme')
  if (stored) return stored as 'light' | 'dark'

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Apply theme before React renders
document.documentElement.classList.toggle('dark', getInitialTheme() === 'dark')
```

### 🗃️ State Management Issues

#### Zustand State Not Persisting

```typescript
// Problem: State resets on page reload
// Solution: Use persist middleware

import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    set => ({
      cafes: [],
      setCafes: cafes => set({ cafes }),
    }),
    {
      name: 'wfc-pedia-storage', // Storage key
      partialize: state => ({ cafes: state.cafes }), // Only persist specific fields
    }
  )
)
```

#### React Query Cache Issues

```typescript
// Problem: Stale data showing
// Solution: Configure cache policies

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry 404s
        if (error?.status === 404) return false
        return failureCount < 3
      },
    },
  },
})
```

### 🌍 API and Data Issues

#### CORS Errors

```typescript
// Problem: CORS errors when calling APIs
// Solution: Configure Vite proxy or handle in API

// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

#### Google Sheets API Issues

```typescript
// Problem: API key not working
// Solution: Check API key configuration and permissions

const GOOGLE_SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A1:Z100`

const fetchCafes = async () => {
  try {
    const response = await fetch(`${GOOGLE_SHEETS_API_URL}?key=${API_KEY}`)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    // Fallback to cached data
    return getCachedCafes()
  }
}

// Check API key format
if (!API_KEY || !API_KEY.startsWith('AIza')) {
  console.error('Invalid Google Sheets API key format')
}
```

### 🔄 PWA and Service Worker Issues

#### Service Worker Not Updating

```bash
# Problem: Service worker caches old version
# Solution: Force update service worker

# In browser DevTools:
# Application tab → Service Workers → Update on reload (check)
# Application tab → Storage → Clear storage

# Programmatic solution:
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.update();
    });
  });
}
```

#### PWA Not Installing

```typescript
// Problem: PWA install prompt doesn't appear
// Solution: Check PWA requirements

// Ensure HTTPS (or localhost)
// Valid manifest.json
// Service worker registered
// Meets PWA installability criteria

// Debug manifest
const checkManifest = async () => {
  try {
    const response = await fetch('/manifest.json')
    const manifest = await response.json()
    console.log('Manifest:', manifest)

    // Check required fields
    const required = ['name', 'short_name', 'start_url', 'display', 'icons']
    const missing = required.filter(field => !manifest[field])

    if (missing.length > 0) {
      console.error('Missing manifest fields:', missing)
    }
  } catch (error) {
    console.error('Manifest error:', error)
  }
}
```

### 🎯 Performance Issues

#### Large Bundle Size

```bash
# Problem: App bundle too large (>500KB)
# Solution: Analyze and optimize bundle

# Analyze bundle composition
npm run build
npx vite-bundle-analyzer dist

# Common optimizations:
# - Tree shake unused imports
# - Use dynamic imports for large dependencies
# - Optimize images (use WebP)
# - Remove unused CSS
```

#### Slow Initial Load

```typescript
// Problem: App takes too long to load
// Solution: Implement code splitting

// Route-based splitting
const Home = React.lazy(() => import('./pages/Home'));
const CafeDetail = React.lazy(() => import('./pages/CafeDetail'));

// Component-based splitting
const MapComponent = React.lazy(() =>
  import('react-leaflet').then(module => ({
    default: module.MapContainer
  }))
);

// Preload critical resources
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
```

#### Memory Leaks

```typescript
// Problem: Memory usage grows over time
// Solution: Proper cleanup of subscriptions

useEffect(() => {
  const subscription = eventEmitter.on('event', handler)
  const timer = setInterval(pollData, 1000)

  return () => {
    subscription.unsubscribe() // Clean up subscriptions
    clearInterval(timer) // Clean up timers
  }
}, [])

// Use AbortController for fetch requests
useEffect(() => {
  const abortController = new AbortController()

  fetch('/api/data', { signal: abortController.signal })
    .then(handleData)
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error(error)
      }
    })

  return () => abortController.abort()
}, [])
```

## Environment-Specific Issues

### WSL (Windows Subsystem for Linux)

```bash
# Problem: File watching not working
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Problem: Port not accessible from Windows
# Use --host flag
npm run dev -- --host

# Problem: HTTPS certificates not trusted
# Install Windows certificates in WSL
```

### Docker Development

```dockerfile
# Problem: Node modules not found in container
# Solution: Proper volume mounting and node_modules handling

# Use .dockerignore
node_modules/
.git/
dist/

# Multi-stage Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

## Debug Tools and Scripts

### Performance Profiling

```bash
#!/bin/bash
# scripts/profile-performance.sh

echo "Running performance audit..."

# Build production version
npm run build

# Start preview server
npm run preview &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Run Lighthouse
lighthouse http://localhost:4173 \
  --preset=perf \
  --output=html \
  --output-path=./lighthouse-report.html \
  --view

# Clean up
kill $SERVER_PID
```

### Bundle Analysis

```bash
#!/bin/bash
# scripts/analyze-bundle.sh

echo "Analyzing bundle size..."

npm run build
echo "Build complete. Bundle sizes:"
ls -lh dist/assets/

echo "Running bundle analyzer..."
npx vite-bundle-analyzer dist --open
```

### Test Debug

```typescript
// tests/utils/debug-helpers.ts
export const debugElement = async (page: Page, selector: string) => {
  const element = page.locator(selector)
  const boundingBox = await element.boundingBox()
  const styles = await element.evaluate(el => {
    const computed = window.getComputedStyle(el)
    return {
      display: computed.display,
      visibility: computed.visibility,
      opacity: computed.opacity,
      position: computed.position,
      zIndex: computed.zIndex,
    }
  })

  console.log(`Debug ${selector}:`, {
    exists: (await element.count()) > 0,
    visible: await element.isVisible(),
    boundingBox,
    styles,
  })
}
```

## Getting Help

### Internal Resources

1. Check existing GitHub issues
2. Review architecture documentation
3. Consult component guidelines
4. Run diagnostic scripts

### External Resources

1. **Vite**: https://vitejs.dev/guide/troubleshooting.html
2. **React**: https://react.dev/learn/troubleshooting
3. **Playwright**: https://playwright.dev/docs/debug
4. **Tailwind**: https://tailwindcss.com/docs/troubleshooting

### Creating Bug Reports

```markdown
## Bug Report Template

**Environment:**

- OS:
- Node.js version:
- Browser:
- Viewport size:

**Steps to Reproduce:**

1.
2.
3.

**Expected Behavior:**

**Actual Behavior:**

**Screenshots/Videos:**

**Console Errors:**

**Additional Context:**
```

Remember: Most issues can be resolved by following mobile-first development principles and ensuring
proper testing on actual devices.
