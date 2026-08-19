# GeoMonitor — Production Deployment Guide

Complete instructions for deploying the GeoMonitor backend on **Render** and the frontend on **Vercel** under free tier limits.

---

## 1. Prerequisites

- GitHub repository with code pushed to `main`.
- [Render Account](https://render.com) (Free Tier).
- [Vercel Account](https://vercel.com) (Free Tier).
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) with active M0 cluster.
- [Google Cloud Console](https://console.cloud.google.com/) OAuth 2.0 Client ID.

---

## 2. Backend Deployment on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/) → Click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name:** `geomoniter` (or `geomonitor-api`)
   - **Region:** `Singapore` / `Frankfurt` / `Ohio` (nearest your MongoDB cluster)
   - **Branch:** `main`
   - **Root Directory:** `backend` ⚠️ *(Crucial)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free`

4. Add **Environment Variables** in the Render Dashboard:

| Variable | Value / Description |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render default) |
| `NODE_VERSION` | `20.18.0` |
| `MONGO_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | Min. 32-character random string |
| `LLM_PROVIDER` | `gemini` |
| `GEMINI_API_KEY` | Your Google AI Studio key |
| `GEMINI_MODEL` | `gemini-3.6-flash` |
| `GUARDIAN_API_KEY` | Your Guardian API key |
| `NEWS_API_KEY` | Your NewsAPI key |
| `RELEVANCE_THRESHOLD` | `0.3` |
| `ENABLE_CRON` | `true` |
| `RUN_PIPELINE_ON_START` | `true` (Runs catch-up ingestion on container startup/wake) |
| `ADMIN_API_KEY` | Secret token for automated/admin pipeline triggers |
| `FRONTEND_URL` | `https://geopolitical-moniter.vercel.app` |
| `CORS_ORIGINS` | `https://geopolitical-moniter.vercel.app` |
| `GOOGLE_CLIENT_ID` | Your Google Cloud Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Cloud Client Secret |
| `GOOGLE_CALLBACK_URL` | `https://geomoniter.onrender.com/api/v1/auth/google/callback` |

5. Click **Create Web Service** and wait for deployment to complete.

---

## 2.1 Automated Ingestion on Render Free Tier

Render Free Tier web services spin down after 15 minutes of inactivity. To ensure 24/7 automated news ingestion:
- **`RUN_PIPELINE_ON_START=true`**: Automatically fetches new articles whenever the container starts or wakes up.
- **Automated GitHub Action (`.github/workflows/scheduled-ingestion.yml`)**: Runs every 2 hours to ping `https://geomoniter.onrender.com/api/v1/health` and trigger `https://geomoniter.onrender.com/api/v1/admin/pipeline/run` with `x-admin-key: <ADMIN_API_KEY>`, keeping the service active and fetching news on schedule.
- **Alternative (cron-job.org)**: Create a free recurring HTTP request to `https://geomoniter.onrender.com/api/v1/health` every 10 minutes to prevent container sleep.

---

## 3. Frontend Deployment on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard) → Click **Add New…** → **Project**.
2. Import your GitHub repository.
3. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend` ⚠️ *(Crucial)*
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variable**:
   - `VITE_API_URL` = `https://geomoniter.onrender.com/api/v1`
5. Click **Deploy**.

---

## 4. Google Cloud Console OAuth 2.0 Configuration

1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit your **OAuth 2.0 Client ID** (Web Application).
3. Under **Authorized JavaScript origins**, add:
   - `https://geopolitical-moniter.vercel.app`
   - `https://geomoniter.onrender.com`
   - `http://localhost:5173`
   - `http://localhost:3000`
4. Under **Authorized redirect URIs**, add:
   - `https://geomoniter.onrender.com/api/v1/auth/google/callback`
   - `http://localhost:3000/api/v1/auth/google/callback`
5. Click **Save**.

---

## 5. Verification Checklist

- [ ] `GET https://geomoniter.onrender.com/` → `200 OK` (Operational API status).
- [ ] `GET https://geomoniter.onrender.com/api/v1/health` → `200 OK`.
- [ ] `GET https://geomoniter.onrender.com/api/v1/events` → Returns live events.
- [ ] `https://geopolitical-moniter.vercel.app/` → Live news feed loads with zero errors.
- [ ] Google 1-Click Sign-in → Redirects to `accounts.google.com` and creates session.
