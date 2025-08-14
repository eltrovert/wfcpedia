# Technical Assumptions

## Repository Structure: Monorepo

Single repository containing web application, documentation, and configuration. Simplifies
development workflow and maintenance for single-developer constraint while supporting modular
component organization.

## Service Architecture

**Static Web Application with API Integration:** Client-side JavaScript application connecting to
Google Sheets API for data operations. No backend server required, eliminating hosting costs and
complexity while maintaining real-time data access.

## Testing Requirements

**Unit + Integration Testing:** Essential for single-developer maintainability. Focus on API
integration testing, form validation, and core business logic. Manual testing for UI/UX validation
given budget constraints.

## Additional Technical Assumptions and Requests

**Frontend Framework:**

- **Vanilla JavaScript + Bootstrap 5** for ultra-lean approach, avoiding framework licensing and
  build complexity
- **Alternative consideration:** Vue.js 3 for component organization if complexity grows beyond
  vanilla capabilities
- **Rationale:** Eliminates build tooling overhead, reduces bundle size, maximizes compatibility
  with free hosting

**Data Architecture:**

- **Google Sheets as primary database** with structured schema for café data, user contributions,
  and ratings
- **Local Storage API** for offline caching and user session persistence
- **Abstraction layer required** for future migration to Airtable API or Firebase if Google Sheets
  limits are reached
- **Rationale:** Zero database costs, built-in backup/versioning, community-accessible data
  transparency

**Deployment & Hosting:**

- **Primary:** Netlify free tier (300 build minutes, 100GB bandwidth)
- **Backup:** Vercel free tier for redundancy
- **CDN:** Leverage hosting provider's global CDN for Indonesian performance
- **Rationale:** Maximum reliability within budget constraint, global edge distribution

**Authentication & User Management:**

- **Progressive enhancement approach:** Anonymous usage with optional social login (Google/Facebook)
- **Local storage for user preferences** and WFC Journal data
- **Rationale:** Reduces friction for community contributions while enabling personalization

**API & Integration Strategy:**

- **Google Sheets API v4** for primary data operations with service account authentication
- **Rate limit management:** 300 requests/minute supports ~1,200 concurrent users
- **Geolocation API** for location-based café discovery
- **Social sharing APIs** for community growth (Web Share API where supported)
- **Image storage:** Cloudinary free tier (25GB) for photo uploads beyond Sheets limitations
- **Rationale:** Leverages free APIs aligned with architectural constraints

**Performance & Optimization:**

- **Progressive Web App (PWA)** capabilities for offline functionality and mobile app-like
  experience
- **Service Worker caching** for 24-48 hour offline café data access
- **Image optimization** through lazy loading and WebP format with fallbacks
- **Critical CSS inlining** for sub-3-second load times on mobile networks
- **Data sharding strategy** for regional performance (separate sheets per city)
- **Rationale:** Essential for Indonesian mobile-first user base and bandwidth considerations

**Development & Maintenance:**

- **Version control:** Git with GitHub for community transparency potential
- **Documentation:** Inline code comments and README-driven development
- **Monitoring:** Basic analytics through Google Analytics (free tier) plus API usage tracking
- **Migration readiness:** Database export scripts and backup strategies implemented early
- **Community contributor pipeline** for distributed maintenance as platform scales
- **Rationale:** Supports single-developer workflow while enabling future community contributions

**Code Quality & Accessibility Standards:**

- **JavaScript Coding Patterns:** ES6+ modules, consistent naming conventions (camelCase for
  variables, PascalCase for components), error-first callback patterns for async operations
- **CSS Organization:** BEM methodology for class naming, mobile-first breakpoints (320px, 768px,
  1024px), component-scoped styles using CSS custom properties
- **Accessibility Testing:** WCAG 2.1 AA compliance validation using axe-core automated testing,
  manual keyboard navigation testing, screen reader compatibility verification
- **Component Architecture:** Vanilla JS component pattern with lifecycle methods (init, render,
  destroy), event delegation for performance, progressive enhancement principles
- **Error Handling Patterns:** Standardized error logging, user-friendly error messages, graceful
  degradation for network failures
- **Technical Debt Tracking:** Code complexity monitoring, regular refactoring cycles scheduled,
  migration scripts versioning for future platform changes

**Risk Mitigation Strategies:**

- **API Dependency:** Abstraction layer enables migration to alternative backends
- **Scaling Limits:** Data sharding and migration scripts ready before hitting 25,000 rows
- **Performance Monitoring:** Track Core Web Vitals for Indonesian mobile users
- **Content Moderation:** Admin tools and reporting system for community-driven content quality
- **Bandwidth Management:** Image compression and CDN optimization to stay within free tier limits
- **Code Quality:** Automated linting, accessibility auditing, and technical debt measurement
  integrated into development workflow
