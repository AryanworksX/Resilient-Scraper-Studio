"""
Runs a Bright Data Scraper Studio collector via the official `bdata` CLI.

This module can be used in two ways:

1. From the command line:
       python run_collector.py "https://example.com/product"

2. From the Flask backend:
       from run_collector import scrape_product
       rows = scrape_product(url)

The scraper itself is responsible for:
    URL -> Bright Data -> raw rows -> LLM normalization -> clean rows

It does NOT send data directly to Flask or the database.
The Flask backend is responsible for handling and storing the final data.
"""

import json
import os
import shutil
import subprocess
import sys
import time

from dotenv import load_dotenv

from llm_picker import normalize_and_filter_rows


load_dotenv()


COLLECTOR_ID = os.environ.get("BRIGHTDATA_COLLECTOR_ID")


# Windows needs bdata.cmd.
# Linux/macOS normally use bdata.
if sys.platform == "win32":
    CLI_BIN = shutil.which("bdata.cmd")
else:
    CLI_BIN = shutil.which("bdata")


CLI_CMD = [CLI_BIN] if CLI_BIN else ["npx", "@brightdata/cli"]


# Bright Data AI Flow collectors can take some time.
RUN_TIMEOUT_S = 300


def _require_env():
    """Validate the environment before attempting a scrape."""

    if not COLLECTOR_ID:
        raise RuntimeError(
            "BRIGHTDATA_COLLECTOR_ID is not set. "
            "Add it to scraper/.env."
        )

    bdata_available = (
        shutil.which("bdata.cmd") is not None
        if sys.platform == "win32"
        else shutil.which("bdata") is not None
    )

    npx_available = shutil.which("npx") is not None

    if not bdata_available and not npx_available:
        raise RuntimeError(
            "Neither bdata nor npx was found on PATH. "
            "Install the Bright Data CLI with "
            "`npm install -g @brightdata/cli`, "
            "or make sure Node.js/npm is installed."
        )


def _extract_rows(cli_json: dict | list) -> list[dict]:
    """
    Extract the rows array from the CLI response.

    Bright Data CLI output can use different envelopes depending
    on the CLI/version, so we support the known response shapes.
    """

    if isinstance(cli_json, list):
        return cli_json

    if isinstance(cli_json, dict):
        for key in ("result", "data", "rows", "preview_result"):
            value = cli_json.get(key)

            if isinstance(value, list):
                return value

    raise ValueError(
        "Could not find a rows array in CLI output. "
        f"Received: {json.dumps(cli_json)[:500]}"
    )


def run_collector(url: str) -> list[dict]:
    """
    Run the Bright Data collector against one URL.

    Returns:
        Raw rows returned by Bright Data.
    """

    _require_env()

    if not url or not isinstance(url, str):
        raise ValueError("A valid URL is required.")

    url = url.strip()

    if not url.startswith(("http://", "https://")):
        raise ValueError(
            "URL must start with http:// or https://"
        )

    command = CLI_CMD + [
        "scraper",
        "run",
        COLLECTOR_ID,
        url,
        "--pretty",
    ]

    print(f"Running: {' '.join(command)}")

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=RUN_TIMEOUT_S,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(
            f"Bright Data scraper timed out after "
            f"{RUN_TIMEOUT_S} seconds."
        ) from exc

    if result.returncode != 0:
        error_output = result.stderr or result.stdout

        raise RuntimeError(
            "`bdata scraper run` failed "
            f"(exit {result.returncode}):\n"
            f"{error_output}"
        )

    try:
        cli_json = json.loads(result.stdout)

    except json.JSONDecodeError as exc:
        raise ValueError(
            "Could not parse Bright Data CLI output as JSON:\n"
            f"{result.stdout}"
        ) from exc

    return _extract_rows(cli_json)


def to_backend_item(row: dict) -> dict:
    """
    Convert an LLM-normalized row into the format expected
    by the Flask backend/database.
    """

    return {
        "title": row.get("title", "Unknown"),
        "price": float(row.get("price") or 0),
        "stock": row.get("stock") or "Unknown",
        "scraped_at": row.get("scraped_at")
        or time.strftime("%Y-%m-%dT%H:%M:%S"),
    }


def scrape_product(url: str) -> list[dict]:
    """
    Complete scraping pipeline.

    URL
      ↓
    Bright Data
      ↓
    Raw rows
      ↓
    LLM filtering/normalization
      ↓
    Backend-ready rows

    This function DOES NOT send anything to Flask.

    It simply returns the cleaned data so that Flask can decide
    what to do with it.
    """

    print(f"Starting scrape for: {url}")

    raw_rows = run_collector(url)

    print(
        f"Bright Data returned "
        f"{len(raw_rows)} raw row(s)."
    )

    print(
        "Sending rows through the LLM picker "
        "(filter + normalize)..."
    )

    clean_rows = normalize_and_filter_rows(raw_rows)

    print(
        f"{len(clean_rows)} row(s) kept "
        "after filtering/normalizing."
    )

    backend_rows = [
        to_backend_item(row)
        for row in clean_rows
    ]

    return backend_rows


def main():
    """
    Command-line entry point.

    This keeps local/manual testing working.
    """

    if len(sys.argv) < 2:
        print(
            'Usage: python run_collector.py "<product-url>"'
        )
        sys.exit(1)

    target_url = sys.argv[1]

    try:
        rows = scrape_product(target_url)

        print("\nFinal cleaned result:")
        print(json.dumps(rows, indent=2, ensure_ascii=False))

    except Exception as exc:
        print(
            f"\nScraping failed:\n{exc}",
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    main()