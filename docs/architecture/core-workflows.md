# Core Workflows

## 1. Café Discovery Workflow

```
User Journey: Discover Work-Friendly Cafés
┌─────────────────────────────────────────────────────────────┐
│ 1. App Launch (PWA)                                         │
│    ├─ Load app shell from cache (instant)                  │
│    ├─ Request location permission (one-time)               │
│    └─ Load café data (cached or API)                       │
├─────────────────────────────────────────────────────────────┤
│ 2. Location-Based Discovery                                 │
│    ├─ GPS → Nearby cafés (5km radius)                     │
│    ├─ Manual → City search + filter                        │
│    └─ Filters → Work criteria preferences                  │
├─────────────────────────────────────────────────────────────┤
│ 3. Gallery Interaction                                      │
│    ├─ Scroll → Infinite load (10 cafés per page)          │
│    ├─ Pull-to-refresh → Update live data                   │
│    └─ Tap café → Navigate to details                       │
├─────────────────────────────────────────────────────────────┤
│ 4. Café Selection                                           │
│    ├─ Review work metrics                                   │
│    ├─ Check operating hours                                 │
│    ├─ View community photos                                 │
│    └─ Get directions (external maps app)                   │
└─────────────────────────────────────────────────────────────┘
```

## 2. Café Contribution Workflow

```
User Journey: Add New Café to Community
┌─────────────────────────────────────────────────────────────┐
│ 1. Add Café Trigger                                         │
│    ├─ Bottom nav "Add" button                               │
│    ├─ Empty state CTA                                       │
│    └─ Search "not found" fallback                          │
├─────────────────────────────────────────────────────────────┤
│ 2. Multi-Step Form (3 Steps)                               │
│    ├─ Step 1: Basic Info (name, location, hours)           │
│    │   ├─ GPS auto-detection                                │
│    │   ├─ Map pin adjustment                                │
│    │   └─ Operating hours grid                              │
│    ├─ Step 2: Work Criteria                                 │
│    │   ├─ WiFi speed (test or manual)                      │
│    │   ├─ Comfort rating (1-5 stars)                       │
│    │   ├─ Noise level (quiet/moderate/lively)              │
│    │   └─ Amenities checklist                              │
│    └─ Step 3: Photos & Submit                              │
│        ├─ Camera + gallery access                          │
│        ├─ Auto-compression (WebP)                          │
│        └─ Community guidelines acceptance                   │
├─────────────────────────────────────────────────────────────┤
│ 3. Data Processing                                          │
│    ├─ Client-side validation                                │
│    ├─ Optimistic UI update                                  │
│    ├─ Background sync queue                                 │
│    └─ Google Sheets append                                  │
├─────────────────────────────────────────────────────────────┤
│ 4. Community Integration                                    │
│    ├─ Success feedback                                      │
│    ├─ Navigate to new café detail                          │
│    └─ Update personal contribution stats                    │
└─────────────────────────────────────────────────────────────┘
```

## 3. Work Session Tracking

```
User Journey: Personal Work Productivity Tracking
┌─────────────────────────────────────────────────────────────┐
│ 1. Café Check-In                                            │
│    ├─ "Check In" button on café detail                     │
│    ├─ Confirm location accuracy                             │
│    └─ Start session timer                                   │
├─────────────────────────────────────────────────────────────┤
│ 2. Session Management                                       │
│    ├─ Background timer (local storage)                     │
│    ├─ Optional productivity notes                           │
│    └─ Ambient condition updates                            │
├─────────────────────────────────────────────────────────────┤
│ 3. Session Completion                                       │
│    ├─ Manual check-out or auto-detect                      │
│    ├─ Session summary (duration, productivity)             │
│    └─ Optional café rating update                          │
├─────────────────────────────────────────────────────────────┤
│ 4. Journal Entry                                            │
│    ├─ Personal stats update                                 │
│    ├─ Weekly/monthly analytics                              │
│    └─ Achievement progress                                  │
└─────────────────────────────────────────────────────────────┘
```

---
