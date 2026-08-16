# GeoMonitor 🌍

### Automated Geopolitical Event & Multi-Domain Impact Intelligence Platform

GeoMonitor is an end-to-end geopolitical intelligence platform that continuously collects real-time global news from trusted wire services, extracts structured geopolitical events using **GeoMonitor AI**, validates factual claims and credibility, and computes deterministic cross-domain causal impacts across **13 key economic and strategic domains** (covering both positive opportunities and downside risk escalations).

---

## 🌟 Key Platform Features

### 1. 📰 Consumer News Experience
- **Continuous News Feed (`/`)**: High-contrast, responsive news feed with infinite scroll, featured story hero banners, and topic filter pills (Energy Security, Trade & Tariffs, Tech & Chips, Defense, Food & Ag, Diplomacy, Markets).
- **Intelligence Discovery Engine (`/search`)**: Multi-facet search across keywords, event types, affected sectors, severity tiers, and popular countries.
- **Deep Event Dossiers (`/event/:id`)**:
  - **What Happened**: Structured factual summary and classification.
  - **Who Is Involved**: Affected countries, key named entities, and industrial sectors.
  - **Domain Impacts**: Causal impact cards with direction indicators (↑ Risk Increase, ↓ Positive Opportunity, → Neutral).
  - **Verified Fact Matrix**: Confirmed factual statements vs unverified claims/uncertainties.
  - **Briefing Export (`.txt`)**: One-click download of formatted intelligence briefs.
  - **Share & Bookmark**: Instant link clipboard sharing and reading-list bookmarking.

### 2. 🤖 "Ask GeoMonitor AI" Intelligence Assistant
- An interactive, grounded intelligence assistant embedded directly in the top navigation bar.
- Queries MongoDB Atlas for real-world dossiers and synthesizes concise executive briefings citing specific live events `[Event 1]`, `[Event 2]` with direct inspection links.

### 3. 🌐 Country Risk & Activity Matrix (`/stats`)
- Real-time country activity heatmap grouping geopolitical events and severity distributions across nations with instant search drill-down links.

### 4. 📊 Cross-Domain Impact Radar (`/impacts`)
- Explores qualitative impact assessments across all 13 core domains:
  - `ENERGY`, `OIL_AND_GAS`, `TRADE`, `SUPPLY_CHAIN`, `CURRENCY`, `INFLATION`, `DEFENSE`, `TECHNOLOGY`, `SEMICONDUCTORS`, `FOOD_AGRICULTURE`, `DIPLOMACY`, `GLOBAL_STABILITY`, `FINANCIAL_MARKETS`.
- **Direction Filters:** Quick toggles for Positive & Opportunities, De-escalation & Relief, Risk Increases, and Downside Shocks.

### 5. 🔒 User Authentication & Saved Bookmarks
- Secure user registration, login, and Google OAuth support.
- Session authentication via signed JWTs stored in secure, HTTP-only cookies (`httpOnly: true`, `sameSite: 'lax'`).
- Personal bookmarks collection managed in `/profile`.

---

## 🏗️ System Architecture

```text
Trusted News Sources (The Guardian, NewsAPI, Reuters, AP)
        ↓
Ingestion & HTML Sanitization
        ↓
SHA-256 Deduplication & Relevance Filtering
        ↓
GeoMonitor AI Event Extraction
        ↓
Corroboration & Credibility Scoring
        ↓
Deterministic Multi-Domain Impact Rules Engine (13 Domains)
        ↓
MongoDB Atlas Cluster
        ↓
Express.js RESTful API & JWT Auth
        ↓
React + Vite Intelligence UI
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `>= 18.0.0`
- MongoDB Atlas or local MongoDB instance

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_key
GUARDIAN_API_KEY=test
```

### 3. Seed Trusted News Sources
```bash
npm run seed
```

### 4. Run Development Servers
In separate terminals:
```bash
# Start Backend (Port 5000)
npm run dev:backend

# Start Frontend (Port 5173)
npm run dev:frontend
```

---

## 🧪 Testing

The backend includes a comprehensive Vitest test suite with **158 passing tests across 8 suites**:

```bash
npm test
```

Test Suites:
- `tests/auth/auth.test.js` — User registration, login, JWT cookies, and bookmarks.
- `tests/api/api.test.js` — Events, stats, country risk aggregations, impacts, sources, and Ask AI Intel.
- `tests/extraction/extraction.test.js` — LLM extraction and structured JSON validation.
- `tests/impact/impact.test.js` — Deterministic causal rules engine and domain deduplication.
- `tests/credibility/credibility.test.js` — Source credibility and multi-source corroboration scoring.
- `tests/filtering/relevance.test.js` — Geopolitical relevance classifier.
- `tests/ingestion/guardian.test.js` — Guardian RSS/REST ingestion adapter.
- `tests/ingestion/sanitizer.test.js` — HTML content sanitizer and text extractor.

---

## 📜 License
MIT License
