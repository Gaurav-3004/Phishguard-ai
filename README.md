# PhishGuard AI

**Detect. Understand. Defend.**

An AI-assisted phishing detection, threat analysis, and cybersecurity awareness
platform. Analyze suspicious URLs, emails, and messages; get a deterministic
risk score with a plain-language explanation of *why* something is dangerous;
practice spotting phishing in the interactive simulator; and track your
security posture on a live dashboard.

PhishGuard AI works completely offline, with **zero external dependencies**:
the local rule-based detection engine is the source of truth for every score.
An AI provider (Gemini or OpenAI) can optionally be configured to enrich the
explanation text — if it's unavailable or misconfigured, the app transparently
falls back to the rule-based analysis with no loss of functionality.

---

## Folder structure

```
phishguard-ai/
├── backend/
│   ├── main.py                  # Flask app + all API routes
│   ├── detection_engine.py      # Deterministic rule-based scoring engine
│   ├── ai_service.py            # Optional Gemini/OpenAI integration + validation
│   ├── database.py              # SQLite persistence layer
│   ├── simulator_questions.py   # Phishing simulator question bank
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── pages/                # Landing, Analyze, Results, History,
    │   │                         # Simulator, Dashboard, Learn, About
    │   ├── components/           # Navbar, Footer, ThreatBadge, RiskScoreGauge,
    │   │                         # IndicatorCard, StatCard, ScanningLoader,
    │   │                         # EmptyState, Toast
    │   ├── services/api.ts       # Typed fetch client for the backend API
    │   ├── types/index.ts        # Shared TypeScript types
    │   ├── data/                 # Demo samples + Learn page content
    │   └── utils/                # Security-breakdown chart derivation
    ├── package.json
    └── .env.example
```

---

## Quick start (local development)

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env
python main.py
```

The API starts on `http://localhost:5000`. It works immediately with
`AI_PROVIDER=none` — no API key required.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app starts on `http://localhost:5173`.

Open the app, click **"Try Demo"** on the landing page or Analyze page to see
a full scan end-to-end in under 30 seconds.

---

## Enabling AI-assisted explanations (optional)

By default `AI_PROVIDER=none` and PhishGuard AI runs entirely on the local
rule-based engine — this satisfies every "must work" requirement on its own.

To turn on AI-generated explanations:

1. Get an API key from Google AI Studio (Gemini) or OpenAI.
2. In `backend/.env`, set:
   ```
   AI_PROVIDER=gemini      # or: openai
   AI_API_KEY=your-key-here
   ```
3. Restart the backend.

The AI is only ever given the submitted text — it never fetches or executes
any URL — and its JSON response is strictly validated before use. If the
AI call fails for any reason, results silently fall back to the rule-based
engine and the UI shows "AI explanation unavailable. Showing rule-based
analysis."

---

## API reference

| Method | Endpoint                     | Description                          |
|--------|-------------------------------|---------------------------------------|
| POST   | `/api/analyze/url`            | Analyze a URL                         |
| POST   | `/api/analyze/email`          | Analyze an email (sender/subject/body)|
| POST   | `/api/analyze/message`        | Analyze an SMS/chat message            |
| GET    | `/api/history`                | List recent scans                     |
| GET    | `/api/history/{id}`           | Get one scan report                   |
| DELETE | `/api/history/{id}`           | Delete one scan report                |
| DELETE | `/api/history`                | Clear all history                     |
| GET    | `/api/dashboard`               | Aggregate stats for the dashboard      |
| GET    | `/api/simulator/questions`    | Get simulator scenarios                |
| POST   | `/api/simulator/answer`       | Submit a simulator answer              |
| GET    | `/api/health`                  | Health check + AI configuration status |

All endpoints return JSON and proper HTTP status codes. Malformed or empty
input returns `400` with a human-readable `error` message — never a stack
trace.

---

## Privacy & security notes

- Only a short, non-sensitive **preview** of submitted content is ever stored
  in the database — never full email bodies or message text.
- No passwords, card numbers, government IDs, or auth tokens are collected.
- Submitted URLs are **never automatically opened or executed** — they are
  analyzed purely as text (domain parsing, keyword/pattern matching).
- CORS is restricted to the configured frontend origin, and API requests are
  rate-limited.
- API keys are read from environment variables on the backend only and are
  never exposed to frontend code.

---

## Deployment

This is a standard two-service app (static frontend + Flask API) and deploys
cleanly to most common platforms:

- **Frontend**: `npm run build` produces a static `frontend/dist/` folder you
  can deploy to Vercel, Netlify, Cloudflare Pages, or any static host. Set
  `VITE_API_URL` to your deployed backend URL at build time.
- **Backend**: deploy `backend/` to Render, Railway, Fly.io, or any host that
  runs a Python WSGI app (e.g. behind `gunicorn main:app`). Set `CORS_ORIGIN`
  to your deployed frontend URL, and configure `AI_PROVIDER`/`AI_API_KEY` if
  you want AI-assisted explanations in production.
- **Database**: SQLite is sufficient for the MVP. For a persistent-disk
  requirement on ephemeral-filesystem hosts, mount a persistent volume and
  point `DATABASE_PATH` at it, or swap in Postgres for production scale.

---

## Disclaimer

PhishGuard AI is an educational and defensive security tool. Detection
results are probabilistic and should not replace professional security
investigation.
"# Phishguard-ai" 
