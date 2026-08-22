import os
import re
import sys
import time
import requests
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# --- Read Strictly from Environment Variables ---
API_KEY = os.getenv("BRIGHTDATA_API_KEY")
COLLECTOR_ID = os.getenv("BRIGHTDATA_COLLECTOR_ID")
BACKEND_API_URL = os.getenv("SCRAPER_STUDIO_API_URL", "http://127.0.0.1:5000")

DEFAULT_PRODUCT_URL = "https://buy.realme.com/in/goods/766"
POLL_INTERVAL_S = 5
MAX_WAIT_S = 300


def check_env_credentials():
    """Validates that necessary API tokens are present before triggering requests."""
    missing = []
    if not API_KEY:
        missing.append("BRIGHTDATA_API_KEY")
    if not COLLECTOR_ID:
        missing.append("BRIGHTDATA_COLLECTOR_ID")
    
    if missing:
        raise RuntimeError(f"Missing required environment variable(s) in .env: {', '.join(missing)}")


def _extract_rows(api_json) -> list[dict]:
    if isinstance(api_json, list):
        return api_json
    if isinstance(api_json, dict):
        for key in ("result", "data", "rows", "preview_result"):
            val = api_json.get(key)
            if isinstance(val, list) and len(val) > 0:
                return val
            if isinstance(val, dict):
                return [val]
    return []


def parse_numeric_price(val) -> float:
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    match = re.search(r"[\d,.]+", str(val))
    if match:
        clean_str = match.group(0).replace(",", "")
        try:
            return float(clean_str)
        except ValueError:
            return 0.0
    return 0.0


def to_backend_item(row: dict) -> dict:
    raw_title = row.get("title") or row.get("name") or row.get("product_title") or "Realme Device"
    raw_price = row.get("price") or row.get("product_price") or row.get("final_price") or 0.0
    raw_stock = row.get("stock") or row.get("availability") or "In Stock"

    stock_str = str(raw_stock).strip()
    if any(k in stock_str.lower() for k in ["in stock", "available", "buy now", "true", "instock"]):
        normalized_stock = "In Stock"
    elif any(k in stock_str.lower() for k in ["out of stock", "sold out", "unavailable", "false"]):
        normalized_stock = "Out of Stock"
    else:
        normalized_stock = stock_str

    return {
        "title": str(raw_title).strip(),
        "price": parse_numeric_price(raw_price),
        "stock": normalized_stock,
        "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }


def run_collector_via_api(url: str) -> list[dict]:
    check_env_credentials()
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    print(f"🚀 Triggering Bright Data Cloud API for: {url}")
    trigger_resp = requests.post(
        f"https://api.brightdata.com/dca/trigger?collector={COLLECTOR_ID}&queue_next=1",
        headers=headers,
        json=[{"url": url}],
        timeout=25
    )
    
    if trigger_resp.status_code == 401:
        raise RuntimeError("Authentication failed: Invalid Bright Data API Key. Check BRIGHTDATA_API_KEY in .env.")
        
    trigger_resp.raise_for_status()
    collection_id = trigger_resp.json().get("collection_id")
    print(f"☁️ Job queued in cloud! Collection ID: {collection_id}")
    print("⏳ Polling Bright Data for results (typically 20-60s)", end="", flush=True)
    
    dataset_url = f"https://api.brightdata.com/dca/dataset?id={collection_id}"
    start_time = time.time()
    
    while time.time() - start_time < MAX_WAIT_S:
        time.sleep(POLL_INTERVAL_S)
        resp = requests.get(dataset_url, headers=headers, timeout=20)
        
        # When dataset is ready, it returns HTTP 200 and a populated JSON response
        if resp.status_code == 200 and resp.text.strip():
            try:
                data = resp.json()
                rows = _extract_rows(data)
                if rows:
                    print("\n✅ Extraction complete!")
                    return rows
            except ValueError:
                pass
                
        print(".", end="", flush=True)
        
    raise TimeoutError("\n❌ Scraping job timed out in cloud.")


def forward_to_backend(item: dict):
    resp = requests.post(f"{BACKEND_API_URL}/api/scrape", json=item, timeout=15)
    resp.raise_for_status()
    return resp.json()


def main():
    target_url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PRODUCT_URL
    
    print(f"\n--- ⚡ Resilient Price Radar (Environment Key Mode) ---")
    print(f"Target URL   : {target_url}")
    print(f"Backend API  : {BACKEND_API_URL}")
    print(f"Collector ID : {COLLECTOR_ID}")
    print(f"-------------------------------------------------------\n")
    
    try:
        rows = run_collector_via_api(target_url)
        print(f"\nSending {len(rows)} record(s) to Flask backend...")
        
        for row in rows:
            item = to_backend_item(row)
            res = forward_to_backend(item)
            print(f" -> [{res.get('status', 'synced')}]: {item['title']} | Price: ₹{item['price']} | Stock: {item['stock']}")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == "__main__":
    main()