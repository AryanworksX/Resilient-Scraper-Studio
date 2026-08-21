# Scraper Studio Guide

This is the piece the hackathon actually grades. It has two parts:
**(A)** create the collector once, by hand, in your own terminal — this
needs your own Bright Data login, so nobody can do it for you ahead of
time — and **(B)** run it automatically going forward via
`scraper/run_collector.py`, which now shells out to the same `bdata`
CLI instead of guessing at raw API endpoints.

---

## 0. Install and log in (one time)

```bash
# No install needed - npx fetches the latest version each run
npx @brightdata/cli login

# OR install it globally so you can just type `bdata`
npm install -g @brightdata/cli
bdata login
```

This opens a browser tab, you authorize against your Bright Data
account, and the CLI stores your key locally — you never paste a key
in by hand. Get a free account at brightdata.com if you haven't
already (no card required).

Check it worked:

```bash
bdata budget
```

## 1. Create the collector

Pick ONE target product page and describe the fields you want in plain
English:

```bash
bdata scraper create "https://example.com/product/aurora-headphones" \
  "Extract the product title, price, and stock availability from this page"
```

This wraps Bright Data's AI Flow: it builds the extraction, tests it
against your URL, and prints a `collector_id` that looks like
`c_xxxxxxxxxx`. **Copy that ID** — it goes in `scraper/.env` as
`BRIGHTDATA_COLLECTOR_ID`.

> Scraper generation usually takes 5-15 minutes, and up to 25 for a
> complex site. If `scraper create` isn't instant, it's working — don't
> kill the process, just wait.

> Note: this command creates the scraper with a placeholder webhook
> delivery target. You don't need to change that — `run_collector.py`
> pulls results by running the collector directly, not via webhook.

## 2. Test it once by hand

```bash
bdata scraper run c_xxxxxxxxxx "https://example.com/product/aurora-headphones" --json
```

You should get back JSON containing your fields (title/price/stock).
If the fields look wrong or empty, refine the description in step 1
and re-run `scraper create` — better to fix the description now than
after you've wired everything else up.

## 3. Wire it into this project

```bash
cd scraper
cp .env.example .env
# fill in: BRIGHTDATA_COLLECTOR_ID (from step 1)
#          SCRAPER_STUDIO_API_URL  (http://localhost:5000 for local dev)
#          ANTHROPIC_API_KEY       (see step 4 below)
pip install -r requirements.txt

python run_collector.py "https://example.com/product/aurora-headphones"
```

This runs the collector via `bdata` under the hood, sends the raw rows
through the LLM normalizer (`llm_picker.py`, see below), then POSTs
each cleaned item to your backend's `/api/scrape`.

## 4. The LLM smart-picker (filters by category, normalizes fields)

Different target sites return different field names for the same
thing (`price` vs `product_price` vs `cost`), and if you're scraping a
category/listing page you'll often get rows you don't actually want
(accessories mixed in with the product you're tracking, out-of-scope
items, etc). `llm_picker.py` handles both: it sends the raw rows to an
LLM once per run, asks it to keep only rows matching your target
category and to map every kept row onto the exact schema the backend
expects (`title`, `price`, `stock`).

Set in `scraper/.env`:

```bash
ANTHROPIC_API_KEY=your-anthropic-api-key
TARGET_CATEGORY=gaming laptops
```

If you leave `TARGET_CATEGORY` blank, the picker skips filtering and
just normalizes field names — useful if you're already scraping a
single, correctly-scoped product page rather than a listing page.

## 5. Prove self-healing (do this before you submit — it's judged)

Don't wait for the live site to change on its own. Force it:

```bash
# 1. Confirm the collector works against the live page right now
bdata scraper run c_xxxxxxxxxx "https://example.com/product/aurora-headphones" --pretty

# 2. Trigger AI self-healing, describing what broke in plain English
bdata scraper heal c_xxxxxxxxxx "price field returns null - the site changed its layout"
```

Screen record this whole sequence (steps 1-2), including the repaired
output that comes back. That recording is your proof for the
"Reliability and self-healing" judging criterion.

> Note: some versions of the CLI show an approval step (`bdata scraper
> approve`) before the fix is applied — if you see that prompt, just
> confirm it. Run `bdata scraper heal --help` if you're unsure which
> flow your installed version uses.

## Troubleshooting

- **`bdata: command not found`** — use `npx @brightdata/cli <command>`
  instead of installing globally, or check `npm install -g` completed.
- **Collector runs but returns empty fields** — go back to step 1 and
  make your field description more specific (name the exact thing on
  the page, e.g. "the price shown next to the Add to Cart button"
  rather than just "price").
- **`run_collector.py` hangs** — this used to happen when the script
  called raw `/dca/trigger` + `/dca/dataset` endpoints by hand; the
  current version instead shells out to `bdata scraper run`, which is
  the officially maintained path and handles polling/retries for you.
