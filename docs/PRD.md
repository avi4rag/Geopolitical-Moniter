# GeoMonitor — Product Requirements Document (PRD)

---

## 1. Product Overview & Vision

**GeoMonitor** is an automated, real-time geopolitical event monitoring and multi-domain impact assessment platform. It bridges the gap between raw, overwhelming wire reports and actionable strategic intelligence by automatically extracting structured geopolitical developments, deterministically evaluating qualitative economic and supply chain impacts across 13 domains, and providing grounded natural language intelligence assistance.

### 1.1 Core Value Proposition
- **Automated Structuring**: Converts unstructured international news reports into structured geopolitical event dossiers within seconds.
- **Causal Impact Modeling**: Evaluates qualitative ripple effects across energy security, semiconductor manufacturing, defense, critical minerals, and trade corridors.
- **Grounded Intelligence Synthesis**: Enables natural language queries via "Ask GeoMonitor AI", grounded exclusively in live verified dossiers with direct citations `[Event 1]`.
- **Consumer-Grade Usability**: Fast, responsive, mobile-first reading experience with zero cost overhead (100% free-tier compliant, ₹0 budget overage).

---

## 2. Target Personas

| Persona | Role | Primary Goal | Key Features Used |
|---|---|---|---|
| **Alex M.** | Energy & Commodities Trader | Track sudden export restrictions, pipeline accords, and regional escalations | News Feed, Energy Domain Filter, Severity Alerts |
| **Elena V.** | Supply Chain & Logistics Director | Monitor maritime choke points, freight disruptions, and tariff announcements | Supply Chain Impacts, Country Risk Matrix |
| **Dr. Sanjay K.** | Policy & Geopolitics Researcher | Search historical developments, analyze causal chains, review news reliability | Multi-Domain Impacts, Sources Credibility ratings |
| **Priya R.** | Strategic Intelligence Reader | Quick executive briefings and natural language Q&A on breaking world news | Ask GeoMonitor AI Assistant, Bookmarks Dossier |

---

## 3. Functional Requirements

### FR-1: Multi-Source Wire Ingestion & Deduplication
- **FR-1.1**: The system shall periodically ingest articles from multiple international news APIs (e.g., The Guardian, NewsAPI) via configurable cron jobs.
- **FR-1.2**: The system shall generate a SHA-256 content hash of normalized title and URL to ensure 100% deduplication before triggering downstream LLM extraction.
- **FR-1.3**: The system shall pre-filter articles with relevance scores below `0.3` to conserve LLM quota.

### FR-2: Structured Geopolitical Event Extraction
- **FR-2.1**: The AI engine shall extract structured event properties: `eventType` (14 enums), `summary`, `entities`, `countries`, `regions`, `sectors`, `facts`, `severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and `credibilityLabel`.
- **FR-2.2**: The engine shall strictly conform to JSON schemas without hallucinations or arbitrary structures.

### FR-3: Multi-Domain Causal Impact Engine
- **FR-3.1**: The system shall deterministically evaluate extracted events against a library of 36 causal propagation rules across 13 strategic domains.
- **FR-3.2**: Each assessment must assign `direction` (`POSITIVE_OPPORTUNITY`, `DE_ESCALATION`, `RISK_INCREASE`, `DOWNSIDE_SHOCK`), `severity`, and an explanatory `explanation`.

### FR-4: Grounded AI Intelligence Assistant ("Ask GeoMonitor AI")
- **FR-4.1**: Users can submit natural language inquiries (e.g. "What are the latest semiconductor supply risks?").
- **FR-4.2**: The assistant must retrieve relevant live dossiers from MongoDB Atlas and synthesize an executive brief citing specific events `[Event 1]`, `[Event 2]` with direct inspection links.

### FR-5: Authentication & User Session Management
- **FR-5.1**: Support standard email/password registration and login with bcrypt hashing.
- **FR-5.2**: Support standard Google OAuth 2.0 with cryptographic state CSRF protection and official ID token verification (`google-auth-library`).
- **FR-5.3**: Store authentication sessions in secure, HTTP-only, SameSite cookies (no tokens in `localStorage`).

### FR-6: Bookmarking & User Dossier
- **FR-6.1**: Authenticated readers can toggle 1-click bookmarks on any geopolitical story.
- **FR-6.2**: Bookmarked stories must persist in the user's profile and sync in real time across sessions.

### FR-7: Analytics & Country Activity Matrix
- **FR-7.1**: The analytics dashboard shall display aggregate metrics: total events, active impacts, domain distributions, and country activity heatmaps.

---

## 4. Non-Functional Requirements

- **Performance**: P95 API response times `< 100ms` for cached feeds, `< 1.5s` for grounded AI queries.
- **Security**: Strict zero client secrets policy; HTTP-only SameSite cookies; rate-limited API endpoints (200 req/15min).
- **Cost**: 100% operable under the ₹500 lifetime budget cap (MongoDB Atlas M0, Render free tier, Vercel Edge).
- **Responsiveness**: Fluid layout across phone, tablet, and desktop viewports with dedicated mobile navigation drawer.
- **Reliability**: Graceful handling of empty databases, invalid regex queries, and external API outages with 0 uncaught 502/500 errors.

---

## 5. Success Metrics & KPIs

1. **Extraction Accuracy**: $\ge 95\%$ valid JSON schema compliance rate from LLM calls.
2. **Deduplication Rate**: $100\%$ prevention of duplicate stories across identical news articles.
3. **User Engagement**: Active bookmark saves and AI assistant queries per session.
4. **Platform Availability**: $99.9\%$ uptime on production cloud deployment.
