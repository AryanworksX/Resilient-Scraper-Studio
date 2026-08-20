"""
Triggers a Bright Data Scraper Studio collector, waits for the result,
and forwards each row into this project's own backend (/api/scrape).

The collector itself is NOT built here. Build it once from your coding
agent's terminal (see ../SCRAPER_STUDIO_GUIDE.md), then set its Collector
ID below via the .env file. This script only runs it and pipes the output
onward — that's the "prompt-to-production pipeline" pattern the hackathon
docs describe.

Usage:
    python run_collector.py "https://example.com/product/aurora-headphones"
"""

import os
import sys
import time
import requests
from dotenv import load_dotenv

load_dotenv()

BRIGHTDATA_API_TOKEN = os.environ.get("BRIGHTDATA_API_TOKEN")
COLLECTOR_ID = os.environ.get("BRIGHTDATA_COLLECTOR_ID")  # looks like c_xxxxxxxxxx
BACKEND_API_URL = os.environ.get("SCRAPER_STUDIO_API_URL", "http://localhost:5000")

TRIGGER_URL = "https://api.brightdata.com/dca/trigger"
DATASET_URL = "https://api.brightdata.com/dca/dataset"

POLL_INTERVAL_S = 5
MAX_POLL_ATTEMPTS = 60  # ~5 minutes


def _require_env():
    missing = [
        name
        for name, val in [
            ("BRIGHTDATA_API_TOKEN", BRIGHTDATA_API_TOKEN),
            ("BRIGHTDATA_COLLECTOR_ID", COLLECTOR_ID),
        ]
        if not val
    ]
    if missing:
        raise RuntimeError(
            f"Missing required env vars: {', '.join(missing)}. "
            f"See scraper/.env.example — you get the Collector ID from "
            f"`bdata scraper create <url> \"<fields>\"` (see SCRAPER_STUDIO_GUIDE.md)."
        )


def trigger(url: str) -> str:
    """Kick off a collection run for one URL. Returns a snapshot/response id."""
    headers = {
        "Authorization": f"Bearer {BRIGHTDATA_API_TOKEN}",
        "Content-Type": "application/json",
    }
    resp = requests.post(
        TRIGGER_URL,
        params={"collector": COLLECTOR_ID},
        headers=headers,
        json=[{"url": url}],
        timeout=30,
    )
    resp.raise_for_status()
    data = resp.json()
    # Bright Data returns a response_id/snapshot handle to poll on.
    return data.get("response_id") or data.get("snapshot_id") or data.get("id")


def poll_for_results(response_id: str) -> list[dict]:
    headers = {"Authorization": f"Bearer {BRIGHTDATA_API_TOKEN}"}
    for attempt in range(MAX_POLL_ATTEMPTS):
        resp = requests.get(
            DATASET_URL,
            params={"id": response_id},
            headers=headers,
            timeout=30,
        )
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list) and len(data) > 0:
                return data
        elif resp.status_code >= 500:
            pass  # transient, keep polling
        else:
            resp.raise_for_status()

        time.sleep(POLL_INTERVAL_S)

    raise TimeoutError(
        f"No results after {MAX_POLL_ATTEMPTS * POLL_INTERVAL_S}s — "
        f"check the collector in the Scraper Studio dashboard."
    )


def to_backend_item(row: dict) -> dict:
    """
    Map whatever fields the collector returns onto the shape backend/db.py
    expects. Adjust the .get() keys below to match the schema you asked
    for when you ran `bdata scraper create`.
    """
    return {
        "title": row.get("title") or row.get("product_name") or row.get("name"),
        "price": float(row.get("price") or 0),
        "stock": row.get("stock") or row.get("availability") or "Unknown",
        "scraped_at": row.get("scraped_at") or time.strftime("%Y-%m-%dT%H:%M:%S"),
    }


def forward_to_backend(item: dict):
    resp = requests.post(f"{BACKEND_API_URL}/api/scrape", json=item, timeout=15)
    resp.raise_for_status()
    return resp.json()


def main():
    _require_env()
    if len(sys.argv) < 2:
        print('Usage: python run_collector.py "<product-url>"')
        sys.exit(1)

    target_url = sys.argv[1]

    print(f"Triggering collector {COLLECTOR_ID} for {target_url} ...")
    response_id = trigger(target_url)
    print(f"Triggered. Polling for results (response_id={response_id}) ...")

    rows = poll_for_results(response_id)
    print(f"Got {len(rows)} row(s). Forwarding to {BACKEND_API_URL}/api/scrape ...")

    for row in rows:
        item = to_backend_item(row)
        result = forward_to_backend(item)
        print(" ->", result)


if __name__ == "__main__":
    main()
