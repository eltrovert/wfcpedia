# Epic Details

> **❗ UPDATED POST-PO FEEDBACK**: Epic 1 stories have been completely reordered to address
> dependency issues identified in Product Owner validation. The new structure ensures proper
> infrastructure setup before all feature development.

## Epic 1: Foundation & Community Infrastructure

> **⚠️ CRITICAL DEPENDENCY NOTICE**: Stories 1.0-1.3 MUST be completed in exact order before any UI
> development begins. These establish the technical foundation required for all subsequent features.

**Epic Goal:** Deliver a functional MVP platform where Indonesian remote workers can discover and
contribute café information within two weeks, establishing the technical foundation and community
engagement patterns that will drive organic growth.

**Updated Success Criteria Post-PO Review:**

- ✅ All external services configured before development begins
- ✅ Complete testing infrastructure established in Epic 1
- ✅ User documentation system implemented alongside features
- ✅ CI/CD pipeline operational before production deployment
- ✅ Technical dependencies properly sequenced and validated

---

### Story 1.0: Infrastructure & External Services Setup

**🔥 NEW STORY - CRITICAL FOUNDATION**

As a platform administrator,  
I want all external services and accounts configured before development begins,  
so that developers have complete infrastructure access and no development blockers occur.

**Acceptance Criteria:**

1. **Google Cloud Project Setup**
   - Google Cloud project created with billing account (free tier)
   - Google Sheets API v4 enabled in project
   - Service account created with Sheets read/write permissions
   - Service account JSON key downloaded and secured
2. **Google Sheets Database Creation**
   - Master spreadsheet created with proper sharing permissions to service account
   - "Cafes" sheet tab created with exact column schema (A=id, B=name, C=address, etc.)
   - "Ratings" sheet tab created for community feedback
   - "Analytics" sheet tab created for usage tracking
   - Sample test data added to validate API connectivity
3. **Image Hosting Service Setup**
   - Cloudinary free tier account created
   - API keys generated and documented
   - Upload presets configured for web-optimized images
   - Image transformation settings established
4. **Deployment Infrastructure Setup**
   - Netlify account created and connected to repository
   - Custom domain purchased and DNS configured (optional)
   - SSL certificate provisioning verified
   - Environment variable management established
5. **Social Media Integration Preparation**
   - Twitter API access configured for sharing features
   - Facebook App created for social sharing (if needed)
   - Social media sharing URL templates documented
6. **Service Documentation**
   - Complete setup guide created for each service
   - API key management and security procedures documented
   - Troubleshooting guide for common service issues
   - Service limits and quotas documented for monitoring

**Dependencies:** None (This IS the foundation) **Estimated Effort:** 1-2 days of administrative
setup **Success Validation:** All services accessible via API calls with test data

---

### Story 1.1: Development Environment & Testing Framework

**🔄 UPDATED - REORDERED FOR PROPER DEPENDENCIES**

As a development team,  
I want a complete development environment with testing infrastructure,  
so that code quality is maintained from the first commit and development can proceed efficiently.

**Acceptance Criteria:**

1. **Repository and Development Setup**
   - Repository structure created according to architecture specification
   - Node.js 18+ development environment documented and tested
   - Package.json with all required dependencies defined
   - Environment variables template (.env.example) created
   - Development server configuration (Vite with HTTPS for PWA testing)
2. **Testing Infrastructure Establishment**
   - Vitest configured for unit and integration testing
   - React Testing Library setup for component testing
   - Playwright configured for E2E testing with mobile viewport simulation
   - Test coverage reporting configured
   - Testing utilities and mock data generators created
3. **Code Quality Standards**
   - ESLint configuration with mobile-first and accessibility rules
   - Prettier code formatting standards established
   - TypeScript strict mode configuration
   - Pre-commit hooks for code quality enforcement
   - Accessibility testing integration (axe-core)
4. **Development Documentation**
   - Complete development setup guide (README.md)
   - Coding standards document referencing architecture
   - Component development guidelines
   - Mobile testing procedures documented
   - Troubleshooting guide for common development issues

**Dependencies:** Story 1.0 (requires service account keys for integration testing) **Estimated
Effort:** 2-3 days **Success Validation:** Complete test suite runs successfully with sample
components

---

### Story 1.2: Google Sheets Backend & API Integration

**🔄 UPDATED - ENHANCED WITH PO REQUIREMENTS**

As a platform foundation,  
I want robust Google Sheets integration with proper error handling and caching,  
so that all data operations are reliable and performant for the mobile-first user experience.

**Acceptance Criteria:**

1. **Core Google Sheets Service Implementation**
   - GoogleSheetsService class with full CRUD operations
   - Service account authentication properly implemented
   - Rate limiting compliance (300 requests/minute)
   - Request/response transformation utilities
   - Batch operation support for efficient data handling
2. **Data Schema Enforcement**
   - TypeScript interfaces matching exact Google Sheets schema
   - Data validation using Zod for all incoming/outgoing data
   - Column mapping utilities for schema flexibility
   - Data migration utilities for schema updates
3. **Caching and Performance Layer**
   - IndexedDB caching service for offline functionality
   - Cache invalidation strategies (1-hour TTL)
   - Background sync queue for offline operations
   - Optimistic update patterns for better UX
4. **Error Handling and Resilience**
   - Comprehensive error handling for all API failure modes
   - Automatic retry logic with exponential backoff
   - Fallback to cached data when API unavailable
   - Network condition detection and adaptation
5. **Testing and Quality Validation**
   - Unit tests for all service methods
   - Integration tests with actual Google Sheets API
   - Mock service for development and testing
   - Performance benchmarking for mobile networks

**Dependencies:** Stories 1.0 (Google Sheets setup) and 1.1 (testing framework) **Estimated
Effort:** 3-4 days **Success Validation:** Full CRUD operations working with production Google
Sheets

---

### Story 1.3: Core Service Layer Development

**🔥 NEW STORY - ADDRESSES PO FEEDBACK ON TECHNICAL DEPENDENCIES**

As a development foundation,  
I want complete service layer abstractions before UI development,  
so that UI components have reliable, tested services to consume.

**Acceptance Criteria:**

1. **Café Management Services**
   - CafeService with business logic for café operations
   - LocationService for geolocation and address handling
   - ImageService for photo upload and compression
   - ValidationService for data quality enforcement
2. **User Session and State Management**
   - UserSessionService for anonymous user tracking
   - PreferencesService for user settings persistence
   - VisitHistoryService for WFC Journal functionality
   - ContributionTrackingService for community engagement
3. **Caching and Sync Services**
   - CacheService for intelligent data caching
   - SyncService for offline queue management
   - NetworkService for connection monitoring
   - StorageService for local data management
4. **Service Integration Layer**
   - Service locator pattern for dependency injection
   - Error boundary services for graceful failure handling
   - Analytics service for usage tracking
   - Performance monitoring service integration
5. **Service Testing and Documentation**
   - Comprehensive unit tests for all services
   - Integration tests between services
   - Service API documentation with usage examples
   - Performance benchmarks for mobile optimization

**Dependencies:** Stories 1.1 (testing framework) and 1.2 (Google Sheets integration) **Estimated
Effort:** 4-5 days **Success Validation:** Complete service layer with 90%+ test coverage

---

### Story 1.4: Platform Content Seeding

**🔄 REORDERED - NOW AFTER SERVICE LAYER IS READY** As a platform administrator,  
I want to pre-populate the platform with validated café information using the established service
layer,  
so that first-time visitors see immediate value and understand the platform's purpose.

**Acceptance Criteria:**

1. 10-15 verified work-friendly cafés added across Jakarta and Bali regions using CafeService
2. Each seeded café includes complete work-specific data (wifi, comfort, photos) validated through
   service layer
3. Seeded content demonstrates proper rating methodology and comment examples
4. Geographic distribution covers major remote work areas in target cities
5. Content quality establishes community standards for future contributions
6. **Data validation testing** ensures all seeded content passes service layer validation rules
7. **Performance testing** with seeded data on mobile networks
8. **Cache warming** with initial content for faster first-load experience

**Dependencies:** Stories 1.2 (Google Sheets integration) and 1.3 (Service layer) **Success
Validation:** Seeded content displays correctly in gallery view with sub-2s load times

---

### Story 1.5: Basic Café Gallery Display

**🔄 REORDERED - NOW AFTER CONTENT AND SERVICES ARE READY**

As a remote worker seeking work-friendly spaces,  
I want to view cafés in a visual gallery format with location-based defaults,  
so that I can quickly browse nearby options with work-specific information.

**Acceptance Criteria:**

1. Responsive gallery layout displays café cards with essential work information
2. Default view shows cafés "near me" using LocationService and geolocation API
3. Each card shows café name, location, wifi rating, comfort score, and operating hours
4. Mobile-optimized design tested on Indonesian Android devices
5. Loading states, empty states, and offline capability provide clear user feedback
6. Bootstrap-inspired styling creates clean, functional visual design optimized for mobile networks
7. **Accessibility compliance:** WCAG 2.1 AA standards verified through automated axe-core testing
   and manual keyboard navigation testing
8. **Performance optimization:** Image lazy loading, infinite scroll, touch-optimized interactions
9. **Service integration:** Proper error handling and caching through service layer

**Dependencies:** Stories 1.3 (Service layer) and 1.4 (Content seeding) **Success Validation:**
Gallery loads and displays seeded content with excellent mobile performance

---

### Story 1.6: User Onboarding & Education

**🔄 REORDERED - AFTER CORE GALLERY IS FUNCTIONAL**

As a first-time platform visitor,  
I want to understand work-specific rating criteria and platform value,  
so that I can effectively evaluate cafés and contribute quality information.

**Acceptance Criteria:**

1. Brief onboarding explains work-specific criteria differences from generic reviews
2. Interactive examples demonstrate wifi speed scales and comfort rating methodology
3. Community contribution benefits clearly communicated (recognition, helping others)
4. Progressive disclosure allows skipping onboarding for returning users
5. Mobile-friendly tutorial optimized for quick understanding
6. **Accessibility compliance:** Screen reader compatibility verified, keyboard navigation support,
   sufficient color contrast ratios maintained throughout onboarding flow
7. **Integration with services:** User preferences stored through PreferencesService
8. **Analytics integration:** Onboarding completion tracking for optimization

**Dependencies:** Stories 1.3 (Service layer) and 1.5 (Gallery display) **Success Validation:** New
users can complete onboarding and immediately use gallery effectively

---

### Story 1.7: Community Café Addition System

**🔄 REORDERED - AFTER DISPLAY AND ONBOARDING ARE COMPLETE**

As a remote worker who discovers great work spaces,  
I want to add new cafés to the platform with duplicate prevention,  
so that I can contribute unique value to the community efficiently.

**Acceptance Criteria:**

1. Multi-step form captures café name, address, wifi speed, comfort rating, and hours
2. Duplicate detection system checks existing café proximity using LocationService
3. Data validation through service layer ensures quality before submission
4. **Progressive photo upload functionality** using ImageService with compression
5. Success confirmation provides user feedback and encourages further contributions
6. **Submission queue system** handles approval workflow through service layer
7. **Offline support:** Form data saved locally and synced when online
8. **Accessibility:** Form fully navigable with keyboard and screen readers

**Dependencies:**

- **CRITICAL:** Story 1.0 (image hosting service setup) for photo upload features
- Stories 1.3 (Service layer), 1.5 (Gallery), 1.6 (Onboarding) **Success Validation:** Users can
  successfully add cafés that appear in gallery after approval

---

### Story 1.8: User Documentation & Help System

**🔥 NEW STORY - ADDRESSES PO FEEDBACK ON MISSING USER DOCUMENTATION**

As a platform user needing assistance,  
I want comprehensive help documentation and troubleshooting guides,  
so that I can resolve issues independently and understand all platform features.

**Acceptance Criteria:**

1. **Comprehensive Help System**
   - In-app help center with searchable articles
   - Step-by-step guides for all major user actions
   - FAQ section addressing common user questions
   - Video tutorials for complex workflows (if needed)
2. **User Guide Documentation**
   - Complete user manual covering all features
   - Work criteria rating guide with examples
   - Community guidelines and contribution best practices
   - Privacy policy and data usage transparency
3. **Error Message Documentation**
   - User-friendly error messages with clear resolution steps
   - Troubleshooting guide for common technical issues
   - Offline mode explanation and functionality guide
   - Browser compatibility and mobile optimization tips
4. **Onboarding Integration**
   - Contextual help throughout user journey
   - Progressive disclosure of advanced features
   - Achievement system explaining community contributions
   - Getting started checklist for new users
5. **Feedback and Support System**
   - Easy feedback submission form
   - Community support through user forums (if applicable)
   - Admin contact system for serious issues
   - Feature request submission and tracking

**Dependencies:** Stories 1.5-1.7 (all major user features implemented) **Estimated Effort:** 2-3
days **Success Validation:** Users can self-resolve 90%+ of common issues through documentation

---

### Story 1.9: CI/CD Pipeline & Quality Automation

**🔥 NEW STORY - ADDRESSES PO FEEDBACK ON MISSING CI/CD**

As a development team maintaining code quality,  
I want automated testing, code quality checks, and deployment processes,  
so that code quality is maintained and deployments are reliable.

**Acceptance Criteria:**

1. **Automated Testing Pipeline**
   - GitHub Actions workflow for automated testing
   - Unit test execution on every pull request
   - Integration test execution against Google Sheets API
   - E2E testing on mobile viewports
   - Test coverage reporting and quality gates
2. **Code Quality Automation**
   - ESLint and Prettier checks in CI pipeline
   - TypeScript compilation verification
   - Accessibility testing with axe-core
   - Performance testing with Lighthouse CI
   - Bundle size monitoring and optimization
3. **Automated Deployment Pipeline**
   - Netlify deployment automation from main branch
   - Environment-specific configurations
   - Automated rollback on deployment failures
   - Preview deployments for pull requests
   - Production deployment with health checks
4. **Monitoring and Alerting**
   - Error tracking integration (optional)
   - Performance monitoring setup
   - API health check automation
   - Service availability monitoring
   - Alert system for critical failures
5. **Quality Gates and Standards**
   - Minimum test coverage requirements (80%+)
   - Performance budget enforcement
   - Accessibility compliance verification
   - Code review automation and requirements
   - Security vulnerability scanning

**Dependencies:** Story 1.1 (Testing framework) and all development infrastructure **Estimated
Effort:** 2-3 days **Success Validation:** Complete CI/CD pipeline operational with quality gates
enforced

---

### Story 1.10: Community Engagement Features

**🔄 REORDERED - NOW AFTER DOCUMENTATION AND CI/CD ARE READY** As a platform administrator,  
I want to pre-populate the platform with validated café information,  
so that first-time visitors see immediate value and understand the platform's purpose.

**Acceptance Criteria:**

1. 10-15 verified work-friendly cafés added across Jakarta and Bali regions
2. Each seeded café includes complete work-specific data (wifi, comfort, photos)
3. Seeded content demonstrates proper rating methodology and comment examples
4. Geographic distribution covers major remote work areas in target cities
5. Content quality establishes community standards for future contributions

### Story 1.3: Basic Café Gallery Display

As a remote worker seeking work-friendly spaces,  
I want to view cafés in a visual gallery format with location-based defaults,  
so that I can quickly browse nearby options with work-specific information.

**Acceptance Criteria:**

1. Responsive gallery layout displays café cards with essential work information
2. Default view shows cafés "near me" using geolocation API
3. Each card shows café name, location, wifi rating, comfort score, and operating hours
4. Mobile-optimized design tested on Indonesian Android devices
5. Loading states, empty states, and offline capability provide clear user feedback
6. Bootstrap 5 styling creates clean, functional visual design optimized for mobile networks
7. **Accessibility compliance:** WCAG 2.1 AA standards verified through automated axe-core testing
   and manual keyboard navigation testing

### Story 1.4: User Onboarding & Education

As a first-time platform visitor,  
I want to understand work-specific rating criteria and platform value,  
so that I can effectively evaluate cafés and contribute quality information.

**Acceptance Criteria:**

1. Brief onboarding explains work-specific criteria differences from generic reviews
2. Interactive examples demonstrate wifi speed scales and comfort rating methodology
3. Community contribution benefits clearly communicated (recognition, helping others)
4. Progressive disclosure allows skipping onboarding for returning users
5. Mobile-friendly tutorial optimized for quick understanding
6. **Accessibility compliance:** Screen reader compatibility verified, keyboard navigation support,
   sufficient color contrast ratios maintained throughout onboarding flow

As a remote worker using the platform,  
I want to rate and comment on cafés with immediate impact visibility,  
so that I can share my experience and see how I help the community.

**Acceptance Criteria:**

1. Love/thumbs-up rating system allows quick café appreciation through service layer
2. Comment system enables detailed experience sharing with proper validation
3. Social media sharing integration promotes platform growth (requires Story 1.0 setup)
4. Rating aggregation displays community consensus with contributor impact shown
5. User engagement data tracks contribution levels for community recognition
6. Contribution recognition display shows user how their ratings affect café scores
7. **Quality integration:** All engagement data processed through established service layer
8. **Performance optimization:** Real-time updates with optimistic UI patterns

**Dependencies:** All previous stories (requires complete foundation) **Success Validation:** Users
can engage with community features and see immediate feedback

---

### Story 1.11: Basic Content Moderation

**🔄 REORDERED - FINAL STORY AFTER ALL SYSTEMS ARE OPERATIONAL** As a platform administrator,  
I want to review and approve community submissions through a complete moderation system,  
so that platform quality and community trust are maintained at scale.

**Acceptance Criteria:**

1. **Admin interface displays pending café submissions** for review with full service integration
2. **Approval workflow** allows accepting, rejecting, or requesting modifications
3. **Basic spam detection** flags suspicious submissions using service layer validation
4. **Approved content appears in gallery** immediately through service layer updates
5. **Contributor feedback system** notifies users of submission status changes
6. **Quality metrics tracking** monitors approval rates and content quality trends
7. **Moderation queue management** handles high-volume submissions efficiently
8. **Appeal system** allows users to contest moderation decisions

**Role Clarifications:**

- **Admin Responsibilities:** Final approval/rejection decisions, spam review, policy enforcement,
  quality standards maintenance
- **User Responsibilities:** Content reporting through community flagging system (basic reporting
  only)
- **System Responsibilities:** Automated spam detection, notification delivery, content publishing
  after admin approval

**Dependencies:** ALL previous stories (complete system operational) **Success Validation:** Content
moderation system handles community submissions efficiently with quality maintained

## Epic 2: Mobile-Optimized Discovery & Filtering

**Epic Goal:** Enable efficient café discovery through location-based search, work-specific
filtering, and comparison tools optimized for Indonesian mobile usage patterns, reducing user search
time from 30-60 minutes to under 10 minutes.

### Story 2.1: Advanced Location-Based Search

As a remote worker in different areas of the city, I want to search for cafés in specific
neighborhoods beyond just "near me", so that I can plan work sessions in various locations
efficiently.

**Acceptance Criteria:**

1. Location selector allows manual area/neighborhood selection
2. Map integration shows café locations with work-specific indicators
3. Distance-based sorting from selected location
4. Saved location preferences for frequent areas (home, office, client locations)
5. Offline location search using cached neighborhood data

### Story 2.2: Work-Specific Filtering System

As a remote worker with specific work requirements, I want to filter cafés by work criteria that
matter for my productivity, so that I only see options that meet my needs.

**Acceptance Criteria:**

1. Filter by wifi speed ranges (basic/good/excellent)
2. Filter by comfort level for extended work sessions
3. Filter by noise level preferences (quiet/moderate/bustling)
4. Filter by power outlet availability and seating arrangements
5. Filter by operating hours including 24/7 options
6. Combined filter results with clear "no results" messaging

### Story 2.3: Café Comparison Interface

As a remote worker evaluating multiple café options, I want to compare 2-3 cafés side-by-side, so
that I can make informed decisions quickly.

**Acceptance Criteria:**

1. Select up to 3 cafés for direct comparison
2. Side-by-side mobile-optimized comparison view
3. Work-specific criteria highlighted in comparison table
4. Distance and commute information for each option
5. Direct action buttons (directions, call, add to favorites)

## Epic 3: Community Engagement & Personal Tracking

**Epic Goal:** Build user retention and content generation through personal WFC Journal tracking,
social sharing, and community recognition systems that transform users into active platform
advocates.

### Story 3.1: WFC Journal Personal Dashboard

As a regular remote worker, I want to track my café visits and work session quality, so that I can
optimize my workspace choices and build personal productivity patterns.

**Acceptance Criteria:**

1. Personal dashboard shows café visit history with dates and ratings
2. Work session tracking with productivity self-assessments
3. Personal notes and photos for each café experience
4. Statistics on favorite café types and work patterns
5. Achievement badges for exploration and contribution milestones

### Story 3.2: Social Sharing & Community Recognition

As an active platform contributor, I want recognition for my contributions and easy sharing
capabilities, so that I feel valued and can promote the platform to my network.

**Acceptance Criteria:**

1. Contributor profile showing community impact and statistics
2. Social media sharing templates for café discoveries and recommendations
3. Local expert badges for users with high contribution rates in specific areas
4. Community leaderboards and contribution streaks
5. Referral tracking for users who successfully bring new contributors

## Epic 4: Advanced Community Features & Content Quality

**Epic Goal:** Enhance platform value and maintain quality through real-time status updates,
comprehensive content moderation, and community-driven discovery features that support sustainable
growth.

### Story 4.1: Real-Time Café Status Tracking

As a remote worker planning my work session, I want to know current café conditions (busy/quiet,
wifi issues, etc.), so that I can avoid disappointing visits and optimize my work time.

**Acceptance Criteria:**

1. Live status updates from current café visitors
2. Quick status reporting interface (busy/quiet, wifi quality, availability)
3. Recent status history showing pattern trends
4. **Push notifications for status changes at favorited cafés** (requires PWA notification setup)
5. Integration with WFC Journal for automatic session condition tracking

**Infrastructure Dependencies:**

- **CRITICAL:** PWA notification service setup and browser permission handling must be completed
  before push notification features
- Status reporting and history features can be implemented independently of notifications

### Story 4.2: Community Feed & Discovery

As a platform user interested in community activity, I want to see recent contributions and
discoveries from other users, so that I can find new cafés and stay engaged with the community.

**Acceptance Criteria:**

1. Community feed showing recent café additions and reviews
2. Featured café discoveries and high-quality contributions
3. Local community activity focused on user's areas of interest
4. Follow other contributors and see their recommendations
5. Community challenges and discovery campaigns for engagement

### Story 4.3: Enhanced Content Moderation & Quality Control

As a platform administrator managing growing community content, I want comprehensive moderation
tools and automated quality detection, so that platform quality scales without overwhelming manual
review.

**Acceptance Criteria:**

1. Automated spam and inappropriate content detection
2. Community reporting system for content quality issues
3. Contributor reputation scoring based on content quality
4. Bulk moderation tools for handling multiple submissions
5. Community self-moderation through user voting on content quality
