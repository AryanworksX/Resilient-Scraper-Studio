"""
Runs a Bright Data Scraper Studio collector via the official `bdata` CLI,
cleans/filters the results with an LLM (see llm_picker.py), and forwards
each item into this project's own backend (/api/scrape).

The collector itself is NOT built here. Build it once from your own
terminal (see ../SCRAPER_STUDIO_GUIDE.md), then set its Collector ID
below via the .env file. This script runs it and pipes the output
onward — that's the "prompt-to-production pipeline" pattern the
hackathon docs describe.

Why this shells out to `bdata` instead of calling Bright Data's HTTP
API directly: the CLI is Bright Data's own maintained client and
handles auth, polling, retries, and response-format changes for you.
Reimplementing that by hand means tracking their API surface manually,
which is exactly what broke the previous version of this script.

Usage:
    python run_collector.py "https://example.com/product/aurora-headphones"
"""

import json
import os
import shutil
import subprocess
import sys
import time

import requests
from dotenv import load_dotenv

from llm_picker import normalize_and_filter_rows

load_dotenv()

COLLECTOR_ID = os.environ.get("BRIGHTDATA_COLLECTOR_ID")  # looks like c_xxxxxxxxxx
BACKEND_API_URL = os.environ.get("SCRAPER_STUDIO_API_URL", "http://localhost:5000")

# Prefer a globally-installed `bdata`; fall back to `npx @brightdata/cli`
# so this works even if the person only ran the CLI via npx during setup.
if sys.platform == "win32":
    CLI_BIN = shutil.which("bdata.cmd")
else:
    CLI_BIN = shutil.which("bdata")

CLI_CMD = [CLI_BIN] if CLI_BIN else ["npx", "@brightdata/cli"]

RUN_TIMEOUT_S = 300  # 5 minutes - AI Flow collectors can take a while


def _require_env():
    missing = [
        name
        for name, val in [
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

    bdata_available = (
        shutil.which("bdata.cmd") is not None
        if sys.platform == "win32"
        else shutil.which("bdata") is not None
    )

    if not bdata_available and shutil.which("npx") is None:
        raise RuntimeError(
            "Neither `bdata` nor `npx` was found on PATH. Install the CLI with "
            "`npm install -g @brightdata/cli`, or make sure Node/npm is installed "
            "so `npx @brightdata/cli` works."
        )

def _extract_rows(cli_json: dict | list) -> list[dict]:
    """The CLI's output envelope has varied across versions - handle the
    shapes documented/observed so this doesn't silently break on a minor
    version bump. Adjust here first if `bdata` changes its output again."""
    if isinstance(cli_json, list):
        return cli_json
    if isinstance(cli_json, dict):
        for key in ("result", "data", "rows", "preview_result"):
            val = cli_json.get(key)
            if isinstance(val, list):
                return val
    raise ValueError(
        f"Could not find a rows array in CLI output. Got: {json.dumps(cli_json)[:500]}"
    )


def run_collector(url: str) -> list[dict]:
    """Runs the collector against one URL via the official CLI and
    returns the raw rows (before LLM cleanup)."""
    # --pretty is the flag confirmed in the hackathon's own CLI examples for
    # `scraper run`. It still prints valid JSON (just indented), so the
    # json.loads() below works the same either way.
    cmd = CLI_CMD + ["scraper", "run", COLLECTOR_ID, url, "--pretty"]
    print(f"Running: {' '.join(cmd)}")

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=RUN_TIMEOUT_S,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"`bdata scraper run` failed (exit {result.returncode}):\n"
            f"{result.stderr or result.stdout}"
        )

    try:
        cli_json = json.loads(result.stdout)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"Could not parse CLI output as JSON:\n{result.stdout}"
        ) from e

    return _extract_rows(cli_json)


def to_backend_item(row: dict) -> dict:
    """By the time a row reaches here it's already been normalized by
    llm_picker.py onto {title, price, stock} - this just adds the
    timestamp and guards against any field the LLM left out."""
    return {
        "title": row.get("title", "Unknown"),
        "price": float(row.get("price") or 0),
        "stock": row.get("stock") or "Unknown",
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

    print(f"Running collector {COLLECTOR_ID} for {target_url} ...")
    raw_rows = run_collector(target_url)
    print(f"Got {len(raw_rows)} raw row(s) from the collector.")

    print("Sending rows through the LLM picker (filter + normalize) ...")
    clean_rows = normalize_and_filter_rows(raw_rows)
    print(f"{len(clean_rows)} row(s) kept after filtering/normalizing.")

    for row in clean_rows:
        item = to_backend_item(row)
        result = forward_to_backend(item)
        print(" ->", result)


if __name__ == "__main__":
    main()
