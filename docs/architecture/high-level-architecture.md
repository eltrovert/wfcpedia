# High Level Architecture

## Mobile-First System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    WFC-Pedia Mobile-First Architecture      │
├─────────────────────────────────────────────────────────────┤
│  Progressive Web App (PWA) - Offline-First Design          │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   App Shell     │ │  Service Worker │ │  IndexedDB      ││
│  │   (Instant)     │ │   (Offline)     │ │   (Storage)     ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                    Component Architecture                   │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │ Bottom Nav      │ │  Café Gallery   │ │  Filter System  ││
│  │ (5 Tabs, 60px)  │ │  (Masonry)      │ │  (GPS-First)    ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                     Data Layer                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │  Google Sheets  │ │   Cache Layer   │ │   Sync Queue    ││
│  │  (Source of     │ │   (1hr TTL)     │ │   (Offline)     ││
│  │   Truth)        │ │                 │ │                 ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Mobile Performance Targets (Post-PO Review)

- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Time to Interactive**: < 3.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **Data Usage**: < 1MB initial load
- **Service Layer Response**: < 500ms for cached data
- **Offline Functionality**: 100% for core features

## Indonesian Network Optimizations

- **2G/3G Primary**: Assume slow, unreliable connections
- **Data-Conscious Loading**: Progressive image delivery, lazy loading
- **Offline-First**: Core functionality without network
- **Smart Caching**: Aggressive caching with intelligent invalidation

---
