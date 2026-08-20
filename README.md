# Bright Data Scraper Studio

Full-stack price tracker: Flask + Supabase backend, React/Vite frontend.
Structured as a monorepo — deploy each half as its own Vercel project.

```
.
├── backend/     Flask API (Vercel Python serverless)
└── frontend/    React + Vite dashboard (Vercel static)
```

## 1. Set up Supabase

1. Create a project at supabase.com.
2. Open the SQL editor and run `backend/schema.sql`.
3. Copy your Project URL and a key (Service Role key recommended for the
   backend, since it bypasses Row Level Security) from Settings → API.

## 2. Backend — deploy to Vercel

1. On vercel.com, import this repo as a **new project**.
2. Set **Root Directory** to `backend`.
3. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
4. Deploy. Your API will be live at `https://<project>.vercel.app`
   with routes `/`, `/api/items` (GET), `/api/scrape` (POST).

Local dev:
```bash
cd backend
cp .env.example .env   # fill in your Supabase values
pip install -r requirements.txt
python app.py          # runs on http://localhost:5000
```

## 3. Frontend — deploy to Vercel

1. Import this repo again as a **second, separate** Vercel project.
2. Set **Root Directory** to `frontend`.
3. Add environment variable:
   - `VITE_API_URL` = the backend project's URL from step 2
4. Deploy.

Local dev:
```bash
cd frontend
cp .env.example .env.local   # set VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

## 4. Scraper — Bright Data Scraper Studio

This is the piece the hackathon actually grades. See
**`SCRAPER_STUDIO_GUIDE.md`** for the full walkthrough — building the
collector requires a live terminal session with your own Bright Data
login (`bdata scraper create ...`), so it can't be done for you ahead of
time. Once you have a Collector ID, `scraper/run_collector.py` triggers
it and forwards results into `/api/scrape`.

## Notes for the demo

- Only `useProducts()` is wired to live data (`GET /api/items`). The rest
  of the dashboard (scraper health, self-healing timeline, activity feed)
  still runs on mock data in `frontend/src/data/mockData.js` — the backend
  doesn't track that yet. Fine for a demo, just know which parts are real.
- `/api/scrape` expects an **already-scraped item** (`title`, `price`,
  `stock`, `scraped_at`) — `scraper/run_collector.py` is what produces
  that from a real Bright Data Scraper Studio collector. There's no
  "scrape this URL on demand" endpoint yet; the "Add product" button in
  the UI is still a local-only mock for that reason.
- If `VITE_API_URL` is unset or the backend is unreachable, the frontend
  quietly falls back to mock data instead of showing a blank dashboard.
- Judging weighs "Use of Scraper Studio" and "Reliability & Self-Healing"
  equally with everything else — don't skip the `bdata scraper heal` demo
  in `SCRAPER_STUDIO_GUIDE.md` step 5.
