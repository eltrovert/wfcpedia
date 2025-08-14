# Database Schema

## Google Sheets Structure

### Sheet 1: "Cafes" (Main café data)

```
A: id (UUID)
B: name (string)
C: address (string)
D: latitude (number)
E: longitude (number)
F: city (string)
G: district (string)
H: wifi_speed (enum)
I: comfort_rating (1-5)
J: noise_level (enum)
K: amenities (JSON array)
L: operating_hours (JSON object)
M: images (JSON array)
N: love_count (number)
O: contributor_id (anonymous hash)
P: verification_status (enum)
Q: created_at (ISO date)
R: updated_at (ISO date)
```

### Sheet 2: "Ratings" (Community feedback)

```
A: rating_id (UUID)
B: cafe_id (reference)
C: session_id (anonymous)
D: wifi_speed (enum, optional)
E: comfort_rating (1-5, optional)
F: noise_level (enum, optional)
G: comment (string, max 280)
H: photos (JSON array)
I: love_given (boolean)
J: rated_at (ISO date)
```

### Sheet 3: "Analytics" (Usage tracking)

```
A: session_id (anonymous)
B: event_type (enum)
C: cafe_id (reference, optional)
D: data (JSON object)
E: timestamp (ISO date)
F: user_agent (string)
G: city (string)
```

## IndexedDB Schema (Client-side)

```typescript
// Offline storage structure
interface IndexedDBSchema {
  cafes: {
    key: string // cafe.id
    value: Cafe
    indexes: {
      city: string
      updated_at: Date
      love_count: number
    }
  }

  user_sessions: {
    key: string // session.id
    value: UserSession
    indexes: {
      created_at: Date
    }
  }

  sync_queue: {
    key: string // operation.id
    value: {
      type: 'add_cafe' | 'add_rating' | 'update_cafe'
      data: any
      retries: number
      created_at: Date
    }
    indexes: {
      type: string
      created_at: Date
      retries: number
    }
  }

  cache: {
    key: string // cache key
    value: {
      data: any
      timestamp: number
      ttl: number
    }
    indexes: {
      timestamp: number
    }
  }
}
```

---
