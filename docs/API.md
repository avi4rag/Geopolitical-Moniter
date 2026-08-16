# GeoMonitor — REST API Reference & Specification

---

## 1. Overview & Base URLs

The GeoMonitor API provides programmatic access to geopolitical events, multi-domain impact evaluations, analytics, and AI intelligence synthesis.

- **Local Development**: `http://localhost:3000/api/v1`
- **Production (Render)**: `https://geomoniter.onrender.com/api/v1`

---

## 2. Standard Response Envelope

All API endpoints return JSON conforming to a standardized response envelope:

### Success Response (`200 OK`, `201 Created`)
```json
{
  "success": true,
  "data": { ... } | [ ... ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 60,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "error": null
}
```

### Error Response (`400`, `401`, `404`, `500`)
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descriptive error message"
  }
}
```

---

## 3. Endpoints Reference

### 3.1 System & Health

#### `GET /api/v1/health`
Returns operational health and timestamp of the API and database.
- **Auth**: None
- **Response**:
  ```json
  {
    "success": true,
    "data": { "status": "ok", "timestamp": "2026-08-16T19:40:00.000Z" }
  }
  ```

---

### 3.2 Events & AI Intelligence

#### `GET /api/v1/events`
Query paginated geopolitical events with multi-field filtering and keyword search.
- **Auth**: None
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 12, max: 100)
  - `severity` (`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`)
  - `eventType` (`SANCTION` | `MILITARY_CONFLICT` | `TREATY` | `POLICY_CHANGE` ...)
  - `country` (string, e.g. `Ukraine`, `Japan`)
  - `sector` (string, e.g. `Energy`, `Semiconductors`)
  - `search` (string, keyword search in summary/facts)
  - `sortBy` (`createdAt` | `severity`, default: `createdAt`)
  - `sortOrder` (`desc` | `asc`, default: `desc`)

#### `GET /api/v1/events/:id`
Fetch a single event dossier with populated source article and active causal impact evaluations.
- **Auth**: None
- **URL Parameters**: `id` (MongoDB ObjectId)

#### `GET /api/v1/events/:id/impacts`
Retrieve all causal impact assessments associated with a specific event.
- **Auth**: None
- **Query Parameters**: `all=true` (include superseded historical versions)

#### `POST /api/v1/events/ask`
Natural language grounded intelligence assistant that retrieves MongoDB dossiers and synthesizes executive briefs citing `[Event 1]`, `[Event 2]`.
- **Auth**: None
- **Request Body**:
  ```json
  {
    "query": "What are the latest critical mineral supply chain risks?"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "answer": "Executive analysis citing grounded events...",
      "citedEvents": [
        {
          "_id": "6a81...",
          "eventType": "POLICY_CHANGE",
          "summary": "G7 Critical Minerals Strategic Floor...",
          "severity": "MEDIUM"
        }
      ]
    }
  }
  ```

---

### 3.3 Multi-Domain Impacts & Sources

#### `GET /api/v1/impacts`
List cross-event impact evaluations filtered by domain or direction.
- **Query Parameters**:
  - `domain` (`ENERGY`, `FINANCIAL_MARKETS`, `SUPPLY_CHAIN`, `DEFENSE`, `FOOD_AGRICULTURE`, `TECHNOLOGY`, `CRITICAL_MINERALS`...)
  - `direction` (`POSITIVE_OPPORTUNITY`, `DE_ESCALATION`, `RISK_INCREASE`, `DOWNSIDE_SHOCK`)
  - `limit` (number, default: 20)

#### `GET /api/v1/sources`
List all registered wire news sources with domain types and reliability scores.

---

### 3.4 Analytics & Country Stats

#### `GET /api/v1/stats`
System-wide metrics (total articles, structured events, active impact assessments, event distribution).

#### `GET /api/v1/stats/countries`
Aggregates geopolitical events, severity distributions, and active risk metrics grouped by country.

---

### 3.5 Authentication & User Profile

#### `POST /api/v1/auth/register`
Register a new reader account.
- **Request Body**: `{ "name": "Jane", "email": "jane@domain.com", "password": "...", "confirmPassword": "..." }`
- **Response**: Sets HTTP-only `token` cookie and returns user profile.

#### `POST /api/v1/auth/login`
Authenticate with email and password.
- **Request Body**: `{ "email": "jane@domain.com", "password": "..." }`
- **Response**: Sets HTTP-only `token` cookie.

#### `POST /api/v1/auth/logout`
Clears HTTP-only session cookie.

#### `GET /api/v1/auth/me`
Returns the current authenticated user profile or `null` if unauthenticated.

#### `GET /api/v1/auth/google`
Initiates standard Google OAuth 2.0 flow with anti-CSRF state protection.

#### `GET /api/v1/auth/google/callback`
Google OAuth 2.0 code exchange callback. Verifies cryptographic state, verifies Google ID token, provisions user, and sets HTTP-only session cookie.

---

### 3.6 Bookmarks (Protected)

#### `POST /api/v1/users/bookmarks/:eventId`
Toggle bookmark on an event for the authenticated user.
- **Auth**: Required (`token` cookie)

#### `GET /api/v1/users/bookmarks`
Retrieve all populated bookmarked events for the authenticated user.
- **Auth**: Required (`token` cookie)
