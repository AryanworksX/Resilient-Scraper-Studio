"""
Uses an LLM to (a) keep only scraped rows that match TARGET_CATEGORY,
and (b) normalize whatever field names the collector returned onto the
exact schema backend/db.py expects: title, price, stock.

Why this exists: different sites return different field names for the
same thing (price / product_price / cost), and a category/listing page
often returns rows you don't want mixed in. Rather than hand-writing an
ever-growing chain of `.get("x") or .get("y")` guesses, one LLM call
per run handles both problems at once, given the raw rows as-is.

Requires ANTHROPIC_API_KEY in scraper/.env. TARGET_CATEGORY is optional —
if unset, every row is kept and only normalization happens.
"""

import json
import os
import re

import requests

# Pick your provider by setting LLM_PROVIDER in .env — "anthropic" or "nvidia".
# Both are free to start: Anthropic gives free trial credits on signup,
# NVIDIA's build.nvidia.com gives an ongoing free tier (rate-limited, no
# card required). Only fill in the API key for the one you're using.
LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "anthropic").strip().lower()

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY")
# Check build.nvidia.com for the current free-tier model list before
# submitting — free models are occasionally swapped/renamed.
NVIDIA_MODEL = os.environ.get("NVIDIA_MODEL", "meta/llama-3.1-8b-instruct")
NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

TARGET_CATEGORY = os.environ.get("TARGET_CATEGORY", "").strip()

# Rows are sent in batches so one bad/huge collector run can't blow past
# the model's context window or produce an unwieldy response.
BATCH_SIZE = 25


def _build_prompt(rows: list[dict]) -> str:
    category_instruction = (
        f'Only KEEP rows that are genuinely about "{TARGET_CATEGORY}". '
        f"Drop anything that's a different product, an accessory, or unrelated."
        if TARGET_CATEGORY
        else "Keep every row - do not filter any out."
    )

    return f"""You are cleaning up raw web-scraped product data.

{category_instruction}

For every row you keep, output an object with EXACTLY these keys:
  - "title": string, the product's name
  - "price": number, just the numeric price (no currency symbols)
  - "stock": string, one of "In Stock", "Out of Stock", or "Unknown"

The raw rows have inconsistent field names depending on the source site.
Map whatever fields exist onto the schema above using your best judgement.

Respond with ONLY a JSON array of the cleaned objects. No prose, no
markdown code fences, no explanation - just the raw JSON array. If no
rows qualify, respond with an empty array: []

Raw rows:
{json.dumps(rows, indent=2)}
"""


def _extract_json_array(text: str) -> list[dict]:
    """The model is asked for raw JSON, but strip code fences defensively
    in case it wraps the response anyway."""
    cleaned = text.strip()
    cleaned = re.sub(r"^```(json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    return json.loads(cleaned)


def _call_anthropic(rows: list[dict]) -> list[dict]:
    if not ANTHROPIC_API_KEY:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set (see scraper/.env.example), but "
            "LLM_PROVIDER=anthropic. Either set the key or switch LLM_PROVIDER=nvidia."
        )

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    payload = {
        "model": ANTHROPIC_MODEL,
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": _build_prompt(rows)}],
    }

    resp = requests.post(ANTHROPIC_URL, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    text_blocks = [b["text"] for b in data.get("content", []) if b.get("type") == "text"]
    raw_text = "\n".join(text_blocks)

    try:
        return _extract_json_array(raw_text)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"LLM did not return valid JSON. Raw response was:\n{raw_text}"
        ) from e


def _call_nvidia(rows: list[dict]) -> list[dict]:
    if not NVIDIA_API_KEY:
        raise RuntimeError(
            "NVIDIA_API_KEY is not set (see scraper/.env.example), but "
            "LLM_PROVIDER=nvidia. Get a free key at build.nvidia.com, or "
            "switch LLM_PROVIDER=anthropic."
        )

    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json",
    }
    # NVIDIA's NIM endpoints are OpenAI-compatible - same chat/completions
    # shape as OpenAI's API, just pointed at NVIDIA's servers.
    payload = {
        "model": NVIDIA_MODEL,
        "messages": [{"role": "user", "content": _build_prompt(rows)}],
        "max_tokens": 4096,
        "temperature": 0.2,
    }

    resp = requests.post(NVIDIA_URL, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    raw_text = data["choices"][0]["message"]["content"]

    try:
        return _extract_json_array(raw_text)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"LLM did not return valid JSON. Raw response was:\n{raw_text}"
        ) from e


def _call_llm(rows: list[dict]) -> list[dict]:
    if LLM_PROVIDER == "nvidia":
        return _call_nvidia(rows)
    if LLM_PROVIDER == "anthropic":
        return _call_anthropic(rows)
    raise ValueError(
        f'Unknown LLM_PROVIDER "{LLM_PROVIDER}" - use "anthropic" or "nvidia".'
    )


def normalize_and_filter_rows(rows: list[dict]) -> list[dict]:
    """Main entry point. Batches rows, calls Claude per batch, and
    returns the combined, cleaned, filtered list ready for
    to_backend_item() -> forward_to_backend()."""
    if not rows:
        return []

    cleaned: list[dict] = []
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        cleaned.extend(_call_llm(batch))

    return cleaned


if __name__ == "__main__":
    # Quick manual test: python llm_picker.py
    sample_rows = [
        {"product_name": "Aurora Headphones", "cost": "49.99", "availability": "in stock"},
        {"name": "Phone Case - Clear", "price": "9.99", "stock_status": "In Stock"},
        {"title": "Gaming Laptop RTX", "price_usd": 1299.0, "in_stock": True},
    ]
    print("LLM_PROVIDER =", LLM_PROVIDER)
    print("TARGET_CATEGORY =", TARGET_CATEGORY or "(none - keeping everything)")
    result = normalize_and_filter_rows(sample_rows)
    print(json.dumps(result, indent=2))
