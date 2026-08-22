import os
import sys
import time
import traceback
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

import db

app = Flask(__name__)
CORS(app)  # Allow frontend cross-origin requests

# Read credentials strictly from Environment Variables
BRIGHTDATA_API_KEY = os.getenv("BRIGHTDATA_API_KEY")
COLLECTOR_ID = os.getenv("BRIGHTDATA_COLLECTOR_ID")

# Fail-safe startup check to ensure .env is properly configured
if not BRIGHTDATA_API_KEY:
    print("⚠️ WARNING: 'BRIGHTDATA_API_KEY' is missing from .env")
if not COLLECTOR_ID:
    print("⚠️ WARNING: 'BRIGHTDATA_COLLECTOR_ID' is missing from .env")

db.init_db()


def scrape_brightdata_cloud(url: str):
    """Calls Bright Data Cloud API using credentials loaded from environment variables."""
    if not BRIGHTDATA_API_KEY or not COLLECTOR_ID:
        raise RuntimeError("Missing BRIGHTDATA_API_KEY or BRIGHTDATA_COLLECTOR_ID in backend .env file.")

    headers = {
        "Authorization": f"Bearer {BRIGHTDATA_API_KEY}",
        "Content-Type": "application/json"
    }

    print(f"🚀 Triggering Bright Data for URL: {url}")
    trigger_resp = requests.post(
        f"https://api.brightdata.com/dca/trigger?collector={COLLECTOR_ID}&queue_next=1",
        headers=headers,
        json=[{"url": url}],
        timeout=25
    )

    if trigger_resp.status_code == 401:
        raise RuntimeError("Bright Data API Key is invalid or expired. Check BRIGHTDATA_API_KEY in .env.")

    trigger_resp.raise_for_status()
    collection_id = trigger_resp.json().get("collection_id")
    print(f"☁️ Cloud Job ID: {collection_id}. Waiting for dataset...")

    dataset_url = f"https://api.brightdata.com/dca/dataset?id={collection_id}"
    
    # Poll dataset for up to 180 seconds
    for _ in range(36):
        time.sleep(5)
        resp = requests.get(dataset_url, headers=headers, timeout=20)
        if resp.status_code == 200 and resp.text.strip():
            try:
                data = resp.json()
                if isinstance(data, list) and len(data) > 0:
                    return data
                if isinstance(data, dict):
                    for k in ("result", "data", "rows"):
                        if isinstance(data.get(k), list) and len(data.get(k)) > 0:
                            return data.get(k)
            except Exception:
                pass
        print(".", end="", flush=True)

    raise TimeoutError("Bright Data extraction timed out in cloud.")


def normalize_item(raw: dict) -> dict:
    import re
    title = raw.get("title") or raw.get("name") or raw.get("product_title") or "Realme Device"
    raw_price = raw.get("price") or raw.get("product_price") or raw.get("final_price") or 0.0
    stock = raw.get("stock") or raw.get("availability") or "In Stock"

    # Clean numeric price to float
    match = re.search(r"[\d,.]+", str(raw_price))
    clean_price = float(match.group(0).replace(",", "")) if match else 0.0

    return {
        "title": str(title).strip(),
        "price": clean_price,
        "stock": "In Stock" if "in stock" in str(stock).lower() else "Out of Stock",
        "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }


@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "active", "service": "Resilient Scraper Studio API"}), 200


@app.route("/api/scrape", methods=["POST"])
def receive_scraped_item():
    """Manual Add Route"""
    try:
        data = request.get_json(silent=True) or {}
        if not data.get("title") or data.get("price") is None:
            return jsonify({"error": "Missing title or price"}), 400

        item = {
            "title": str(data.get("title")).strip(),
            "price": float(data.get("price", 0.0)),
            "stock": str(data.get("stock", "In Stock")).strip(),
            "scraped_at": data.get("scraped_at") or time.strftime("%Y-%m-%d %H:%M:%S")
        }

        status = db.process_and_save(item)
        return jsonify({"message": "Saved successfully", "status": status, "data": item}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/scrape-url", methods=["POST"])
def trigger_scrape_by_url():
    """URL Add Route (Triggers Bright Data Cloud API)"""
    data = request.get_json(silent=True) or {}
    url = data.get("url")
    if not url:
        return jsonify({"error": "URL parameter is required"}), 400

    try:
        rows = scrape_brightdata_cloud(url)
        if not rows:
            return jsonify({"error": "No records found from scraper"}), 422

        saved_items = []
        for r in rows:
            normalized = normalize_item(r)
            status = db.process_and_save(normalized)
            saved_items.append({"status": status, "item": normalized})

        return jsonify({
            "message": "Scrape completed successfully",
            "count": len(saved_items),
            "results": saved_items
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Scraper error: {str(e)}"}), 500


@app.route("/api/items", methods=["GET"])
def fetch_history():
    try:
        items = db.get_all_items()
        return jsonify({"items": items}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)