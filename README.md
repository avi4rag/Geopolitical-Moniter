# Geopolitical Event Impact Monitoring System

> A full-stack platform that automatically monitors geopolitical developments, extracts structured intelligence using LLMs, and evaluates cross-domain impacts using deterministic rule-based reasoning.

## Status: 🚧 In Development

---

## What It Does

- **Monitors** trusted news sources for geopolitical events (sanctions, conflicts, treaties, elections, etc.)
- **Extracts** structured data (event type, countries, sectors, severity) using OpenAI structured outputs
- **Evaluates** cross-domain impacts (energy, trade, technology, defense, etc.) via a deterministic rule engine
- **Scores** source credibility and assessment confidence separately
- **Exposes** results via a REST API consumed by a React dashboard

## The system answers:
- What happened? Who is involved? What type of event?
- How severe is it? Which sectors are affected and in what direction?
- How credible is the information? How confident is the impact assessment?

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 20, Express.js, ES Modules |
| Database | MongoDB Atlas (M0 free tier) |
| AI | OpenAI gpt-4o-mini (structured output) |
| News | The Guardian API + NewsAPI.org |
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui |
| Validation | Zod |
| Testing | Vitest + Supertest |
| Scheduling | node-cron |

---

## Setup

> See [docs/](./docs/) for full documentation (added in Phase 20).

---

## Project Structure

```
geopolitical-monitor/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite dashboard
└── docs/             # Architecture and API docs
```

---

*This project was built systematically following a 21-phase development plan.*
