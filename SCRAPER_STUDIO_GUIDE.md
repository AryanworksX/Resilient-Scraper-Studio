# Wiring Bright Data Scraper Studio into this project

**Correction from an earlier version of this guide:** an earlier draft
pointed at Shivtej's NemoForge project, which connects Puppeteer to Bright
Data's **Scraping Browser**. That's a different, older Bright Data product.
The Scrape-Verse hackathon requires **Scraper Studio** specifically — it's
mandatory ("Every eligible project must use Bright Data Scraper Studio")
and two of the six judging criteria are "Use of Scraper Studio" and
"Reliability & Self-Healing." NemoForge's approach doesn't satisfy either.
This guide replaces that one.

---

## The actual workflow

Scraper Studio isn't a library you import — it's a CLI you run **inside
your coding agent's terminal** (Claude Code, Cursor, or Codex), which
generates a scraper for you from a plain-language description. There's
nothing to code by hand for the scraping part itself.

```
npx -p @brightdata/cli bdata login
npx -p @brightdata/cli bdata scraper create <TARGET_URL> "<fields to extract>"
npx -p @brightdata/cli bdata scraper run <collector_id> <TARGET_URL> --pretty
npx -p @brightdata/cli bdata scraper heal <collector_id> "<what broke>"
```

This part has to be done live, by a person, in a terminal — I can't run it
for you from here since it requires your Bright Data login and generates
code interactively. Here's exactly what to do:

### 1. Get Bright Data credentials
- Sign up at brightdata.com (free, no card).
- In Billing, apply promo code `wemakedevs` (lowercase) for $50 in extra credits.
- Go to Dashboard → Account settings → API key, create one. This is your
  `BRIGHTDATA_API_TOKEN`.

### 2. Build the collector
Open Claude Code (or Cursor/Codex) in this repo and run:

```bash
npx -p @brightdata/cli bdata login
npx -p @brightdata/cli bdata scraper create <product-url> "title, price, stock status"
```

Pick a real product page on a site **not** already in Bright Data's
pre-built library (regional stores, niche marketplaces — check the library
first; using a site it already covers won't score well on "Best Use of
Bright Data"). This step takes 5–15 minutes while the AI Agent writes the
scraper. It reports back a **Collector ID** like `c_mpohus372o5tmid1jk`.

### 3. Test it
```bash
npx -p @brightdata/cli bdata scraper run <collector_id> <product-url> --pretty
```
Confirm the JSON actually has title/price/stock in it.

### 4. Wire it into this repo
Put the Collector ID and your API token into `scraper/.env` (copy from
`scraper/.env.example`). Then:

```bash
cd scraper
pip install -r requirements.txt
python run_collector.py "https://your-target-site.com/some-product"
```

`run_collector.py` triggers the collector via the Collection API
(`POST /dca/trigger`), polls for the result, maps the returned fields onto
what `backend/db.py` expects, and POSTs each row to `/api/scrape`. **Check
the field names in `to_backend_item()`** — they need to match whatever
schema you asked for in step 2 (e.g. if you asked for "title, price, stock
status" the AI Agent might name the field `stock_status` not `stock`).

### 5. Demonstrate self-healing (judged criterion — don't skip this)
Pick a field, edit its selector logic wrong on purpose (or wait for a real
site change), then run:

```bash
npx -p @brightdata/cli bdata scraper heal <collector_id> "the price field is returning null now"
```

Same Collector ID, no redeploy. Screen-record this for the demo video —
it's explicitly called out as something judges look for.

---

## Where this fits with the rest of the repo

```
scraper/    <- triggers the Scraper Studio collector, forwards to backend
backend/    <- Flask + Supabase, receives POST /api/scrape (unchanged)
frontend/   <- React dashboard, reads GET /api/items (unchanged)
```

Nothing about the backend/frontend/Supabase/Vercel setup changes — this
just replaces "what fills `/api/scrape`" with the real thing instead of a
Puppeteer script.

## What NOT to do
- Don't use NemoForge's `stealth.ts`/Puppeteer approach — it's Scraping
  Browser, not Scraper Studio, and won't count toward the mandatory
  requirement.
- Don't pick a target site Bright Data's pre-built library already covers
  (800+ sites) — judges will ask why you didn't just use that.
- Don't commit `scraper/.env`, `backend/.env`, or `frontend/.env` — real
  API tokens go in Vercel's environment variables and your local `.env`
  only, never in the repo or the demo video.
