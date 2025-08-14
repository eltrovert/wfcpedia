# WFC Pedia - Work-Friendly Café Discovery Platform

> **🚀 Mobile-First PWA** for discovering and sharing great cafés for remote work in Indonesia

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🎯 Overview

WFC Pedia is a Progressive Web App designed to help remote workers and digital nomads discover the
perfect cafés for working. Built with mobile-first principles and optimized for Indonesian mobile
networks.

### ✨ Key Features

- 📱 **Mobile-First Design** - Optimized for touchscreens with 44px+ touch targets
- 🌐 **Offline-First PWA** - Works without internet connection
- ♿ **Accessibility-First** - WCAG 2.1 AA compliant
- 🚀 **Performance-Optimized** - <2.5s load times, <1.5s FCP
- 🎨 **Modern UI/UX** - Clean, intuitive interface built with Tailwind CSS

## 🛠️ Tech Stack

| Category      | Technology              | Purpose                               |
| ------------- | ----------------------- | ------------------------------------- |
| **Framework** | React 18 + Vite         | Fast development & mobile performance |
| **Language**  | TypeScript              | Type safety & developer experience    |
| **Styling**   | Tailwind CSS            | Mobile-first, utility-based styling   |
| **State**     | Zustand + React Query   | Lightweight state & caching           |
| **Testing**   | Vitest + Playwright     | Unit, integration & E2E testing       |
| **PWA**       | Workbox                 | Offline-first functionality           |
| **Maps**      | Leaflet + OpenStreetMap | Lightweight mapping solution          |

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** or **yarn**
- **Git**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd wfc-pedia

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server (HTTPS for PWA testing)
npm run dev
```

The application will be available at `https://localhost:5173`

### Development Scripts

```bash
# Development
npm run dev          # Start dev server with HTTPS
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run with coverage report
npm run test:e2e     # Run E2E tests

# Code Quality
npm run lint         # Check linting
npm run lint:fix     # Fix linting issues
npm run typecheck    # TypeScript type checking
```

## 🏗️ Project Structure

```
wfc-pedia/
├── public/                    # Static assets
│   ├── icons/                # PWA icons (multiple sizes)
│   └── images/               # Static images
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base components (TouchTarget, etc.)
│   │   ├── cafe/            # Café-specific components
│   │   ├── forms/           # Form components
│   │   └── navigation/      # Navigation components
│   ├── pages/               # Route components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Business logic & API calls
│   ├── stores/              # State management
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript definitions
│   └── styles/              # Global styles
├── tests/                   # Test files
│   ├── __mocks__/          # Test mocks
│   ├── setup/              # Test setup
│   ├── utils/              # Test utilities
│   └── e2e/                # End-to-end tests
├── scripts/                 # Build & setup scripts
└── docs/                    # Documentation
```

## 🧪 Testing Strategy

### Testing Pyramid

- **70%** Unit Tests (Vitest + React Testing Library)
- **20%** Integration Tests (API & component integration)
- **10%** E2E Tests (Playwright with mobile viewports)

### Mobile Testing

All E2E tests run on **375x667** mobile viewport by default:

```bash
# Mobile-focused E2E testing
npm run test:e2e

# Test specific mobile scenarios
npx playwright test tests/e2e/mobile/
```

### Accessibility Testing

Automated accessibility testing with axe-core:

```bash
# Run accessibility tests
npx playwright test tests/accessibility/
```

## 🎨 Development Guidelines

### Mobile-First Principles

1. **Touch Targets**: Minimum 44px (2.75rem)
2. **Performance**: Optimize for 3G networks
3. **Responsive**: Start with 375px viewport
4. **Offline**: Design for intermittent connectivity

### Code Standards

```typescript
// ✅ Always validate input with Zod
const CafeSchema = z.object({
  name: z.string().min(1),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
})

// ✅ Handle errors gracefully
try {
  const cafes = await getCafes()
  return cafes
} catch (error) {
  return await getCachedCafes() // Fallback
}

// ✅ Use strict TypeScript
interface CafeProps {
  cafe: Cafe // No 'any' types allowed
  onSelect: (cafe: Cafe) => void
}
```

### Accessibility Requirements

- **ARIA Labels**: All interactive elements
- **Keyboard Navigation**: Tab-accessible
- **Screen Readers**: Semantic HTML
- **Color Contrast**: WCAG AA compliant

## 📱 PWA Configuration

### Manifest Settings

- **Theme Color**: `#3B82F6` (Primary blue)
- **Background**: `#FFFFFF`
- **Display**: `standalone`
- **Orientation**: `portrait`

### Service Worker Features

- **Offline Caching**: App shell + data
- **Background Sync**: Queue actions when offline
- **Push Notifications**: Café updates (optional)

## 🌍 Environment Variables

```bash
# Required - Google Sheets API
VITE_GOOGLE_SHEETS_API_KEY=your_api_key
VITE_GOOGLE_SHEETS_SHEET_ID=your_sheet_id

# Optional - Feature flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

## 🚀 Deployment

### Build Process

```bash
npm run build  # Creates optimized production build
npm run preview # Test production build locally
```

### Deployment Targets

- **Primary**: Netlify (configured for SPA routing)
- **Alternative**: Vercel, GitHub Pages

### Performance Targets

- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

## 🔧 Troubleshooting

### Common Issues

**HTTPS Certificate Issues**

```bash
# Generate local HTTPS certificates
npm run dev -- --host --https
```

**Playwright Browser Issues**

```bash
# Install system dependencies
npx playwright install-deps
npx playwright install
```

**TypeScript Path Resolution**

```bash
# Ensure paths are configured in tsconfig.json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

### Development Tips

1. **Mobile Testing**: Use Chrome DevTools device simulation
2. **Performance**: Monitor bundle size with `npm run build`
3. **Accessibility**: Test with screen readers (NVDA, JAWS)
4. **PWA**: Test offline functionality in DevTools

## 🤝 Contributing

1. Follow mobile-first development principles
2. Write tests for all new features
3. Ensure accessibility compliance
4. Use semantic commit messages
5. Run pre-commit hooks (automatic)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Indonesian remote work community**
