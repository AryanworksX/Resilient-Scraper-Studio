import os
import re
import csv
import sys
import time
import json
import urllib.parse
import traceback
import requests
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------
# Configuration & Credentials
# ---------------------------------------------------------
BRIGHTDATA_API_KEY = os.getenv("BRIGHTDATA_API_KEY")
BRIGHTDATA_COLLECTOR_ID = os.getenv("BRIGHTDATA_COLLECTOR_ID")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

CSV_FILE_PATH = os.path.join(os.path.dirname(__file__), "scraped_items.csv")
POLL_INTERVAL_S = 3
MAX_WAIT_S = 45

# Telemetry log buffer for hackathon live-feed terminal
telemetry_logs = [
    {"timestamp": time.strftime("%H:%M:%S"), "msg": "Autonomous Self-Healing Scraper Engine Online.", "level": "INFO"}
]

def add_log(msg: str, level: str = "INFO"):
    entry = {"timestamp": time.strftime("%H:%M:%S"), "msg": msg, "level": level}
    telemetry_logs.append(entry)
    if len(telemetry_logs) > 60:
        telemetry_logs.pop(0)
    print(f"[{entry['timestamp']}] [{level}] {msg}")

# ---------------------------------------------------------
# 1. Supabase Persistence & Delta Mutation Engine
# ---------------------------------------------------------
_supabase_client = None

def get_supabase() -> Client | None:
    global _supabase_client
    if _supabase_client is None and SUPABASE_URL and SUPABASE_KEY:
        try:
            _supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            add_log(f"Supabase connection warning: {e}", "WARN")
    return _supabase_client

def write_to_csv(item: dict):
    """Guarantees persistence to local CSV matching reference schema."""
    file_exists = os.path.isfile(CSV_FILE_PATH)
    fieldnames = [
        "product_name", "price", "currency", "stock_status", 
        "price_status", "scraped_at", "input_url", "engine_source"
    ]
    with open(CSV_FILE_PATH, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerow({
            "product_name": item.get("title", "Product SKU"),
            "price": item.get("price", 0.0),
            "currency": item.get("currency", "₹"),
            "stock_status": item.get("stock", "In Stock"),
            "price_status": item.get("status", "new_item"),
            "scraped_at": item.get("scraped_at", time.strftime("%Y-%m-%d %H:%M:%S")),
            "input_url": item.get("url", ""),
            "engine_source": item.get("source", "HYBRID_ENGINE")
        })

def save_and_calculate_deltas(item: dict) -> dict:
    """Calculates statistical price trajectory, discount mutations, and historical extremes."""
    sb = get_supabase()
    status = "new_item"
    price_diff = 0.0
    discount_pct = 0.0

    if sb:
        try:
            # Fetch historical records for SKU
            res = sb.table("items").select("price, stock").eq("title", item["title"]).order("id", desc=True).limit(10).execute()
            if res.data and len(res.data) > 0:
                history = res.data
                latest = history[0]
                old_p = float(latest["price"])
                old_s = str(latest["stock"]).lower()
                new_p = float(item["price"])

                if new_p < old_p:
                    status = "price_drop"
                    price_diff = round(old_p - new_p, 2)
                    discount_pct = round((price_diff / old_p) * 100, 1)
                elif new_p > old_p:
                    status = "price_hike"
                elif "out" in old_s and "in" in str(item["stock"]).lower():
                    status = "restock"
                elif "in" in old_s and "out" in str(item["stock"]).lower():
                    status = "out_of_stock_alert"
                else:
                    status = "no_change"

            # Persist snapshot
            sb.table("items").insert({
                "title": item["title"],
                "price": float(item["price"]),
                "stock": item.get("stock", "In Stock"),
                "scraped_at": item.get("scraped_at", time.strftime("%Y-%m-%d %H:%M:%S"))
            }).execute()
        except Exception as e:
            add_log(f"Supabase sync exception: {e}", "WARN")

    item["status"] = status
    item["price_diff"] = price_diff
    item["discount_pct"] = discount_pct
    write_to_csv(item)
    return item

# ---------------------------------------------------------
# 2. Advanced Self-Healing Multi-Layer Resolvers
# ---------------------------------------------------------
def clean_currency_token(raw_curr: str, url: str = "") -> str:
    c = str(raw_curr or "").strip().upper()
    if any(k in c for k in ["INR", "₹", "RS", "RS."]) or any(k in url.lower() for k in [".in", "/in/", "flipkart", "nike.in", "campusshoes", "myntra"]):
        return "₹"
    if any(k in c for k in ["USD", "$"]):
        return "$"
    if any(k in c for k in ["EUR", "€"]):
        return "€"
    if any(k in c for k in ["GBP", "£"]):
        return "£"
    return "₹" if (".in" in url or "/in/" in url) else "$"

def parse_complex_price(val, url: str = "") -> tuple[float, str]:
    if val is None:
        return 0.0, clean_currency_token("", url)

    # If payload is a dictionary or stringified JSON from Bright Data
    if isinstance(val, str) and val.strip().startswith("{"):
        try:
            val = json.loads(val)
        except Exception:
            pass

    if isinstance(val, dict):
        p_val = val.get("value") or val.get("amount") or val.get("price") or val.get("final_price") or 0.0
        c_val = val.get("currency") or val.get("symbol") or ""
        try:
            return float(str(p_val).replace(",", "").strip()), clean_currency_token(c_val, url)
        except ValueError:
            return 0.0, clean_currency_token(c_val, url)

    if isinstance(val, (int, float)):
        return float(val), clean_currency_token("", url)

    # String sanitization: Filter out promo vouchers like 'Save ₹300' / '₹200 Off Coupon'
    s = str(val).strip()
    s_sanitized = re.sub(r"(?:save|off|discount|coupon|cashback|emi)\s*(?:₹|rs\.?|\$)?\s*\d+", "", s, flags=re.I)
    
    # Check anchored currencies
    anchored = re.findall(r"(?:₹|Rs\.?|INR|\$|€|£)\s*([\d,]+(?:\.\d{1,2})?)", s_sanitized, re.I)
    if anchored:
        for m in anchored:
            try:
                num = float(m.replace(",", "").strip())
                if num > 0:
                    return num, clean_currency_token(s, url)
            except ValueError:
                continue

    # Clean numeric regex
    num_matches = re.findall(r"[\d,]+(?:\.\d{1,2})?", s_sanitized)
    for m in num_matches:
        try:
            num = float(m.replace(",", "").strip())
            if num > 20:
                return num, clean_currency_token(s, url)
        except ValueError:
            continue

    return 0.0, clean_currency_token(s, url)

def resolve_layer_direct_api(url: str) -> dict | None:
    """Layer 2: Target Direct API & State Sniffing (Shopify, Realme, WooCommerce)"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
    }

    # Shopify Product API Engine
    if "/products/" in url:
        try:
            json_url = url.split("?")[0].rstrip("/") + ".json"
            resp = requests.get(json_url, headers=headers, timeout=6)
            if resp.status_code == 200:
                p_data = resp.json().get("product", {})
                if p_data and "variants" in p_data and len(p_data["variants"]) > 0:
                    title = p_data.get("title")
                    v = p_data["variants"][0]
                    price = float(v.get("price", 0.0))
                    if price > 0:
                        add_log(f"[AST Engine] Sniffed live Shopify state: {title} -> ₹{price}", "SUCCESS")
                        return {
                            "title": title,
                            "price": price,
                            "currency": clean_currency_token("", url),
                            "stock": "In Stock" if v.get("available", True) else "Out of Stock",
                            "url": url,
                            "source": "SHOPIFY_HYDRATION_ENGINE",
                            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
                        }
        except Exception:
            pass

    # Realme Goods API Engine
    if "realme.com" in url.lower():
        try:
            g_match = re.search(r"/goods/(\d+)", url)
            if g_match:
                goods_id = g_match.group(1)
                api_endpoint = f"https://buy.realme.com/in/api/v1/goods/detail?goods_id={goods_id}"
                resp = requests.get(api_endpoint, headers=headers, timeout=6)
                if resp.status_code == 200:
                    data = resp.json().get("data", {})
                    title = data.get("goods_name") or data.get("name")
                    price = float(data.get("price") or (data.get("skus", [{}])[0].get("price", 0.0)))
                    if title and price > 0:
                        add_log(f"[AST Engine] Sniffed Realme Catalog API: {title} -> ₹{price}", "SUCCESS")
                        return {
                            "title": title.strip(),
                            "price": price,
                            "currency": "₹",
                            "stock": "In Stock" if data.get("stock", 1) > 0 else "Out of Stock",
                            "url": url,
                            "source": "REALME_CATALOG_API",
                            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
                        }
        except Exception:
            pass

    return None

def resolve_layer_dom_hydration(url: str) -> dict:
    """Layer 3 & 4: Deep DOM, JSON-LD schema parsing, and State Hydration Decoders"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
    }

    try:
        resp = requests.get(url, headers=headers, timeout=10)
        html = resp.text

        # Title Extraction
        title = None
        og_t = re.search(r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\'](.*?)["\']', html, re.I) or \
               re.search(r'<title[^>]*>(.*?)</title>', html, re.I)
        if og_t:
            title = re.split(r" - | \| ", og_t.group(1).strip())[0]

        if not title or title.lower() in ["realme store", "store", "product", "goods", "none"]:
            path = urllib.parse.urlparse(url).path
            slug_parts = [p for p in path.split("/") if p and not p.isdigit() and p.lower() not in ["goods", "item", "p", "dp", "products"]]
            title = slug_parts[-1].replace("-", " ").title() if slug_parts else "Tracked SKU"

        price = 0.0
        currency = clean_currency_token("", url)
        stock = "In Stock"

        # Schema.org JSON-LD extraction
        for block in re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.DOTALL | re.I):
            try:
                ld = json.loads(block.strip())
                if isinstance(ld, list):
                    ld = ld[0]
                offers = ld.get("offers") or ld
                if isinstance(offers, list):
                    offers = offers[0]
                raw_p = offers.get("price") or offers.get("lowPrice")
                if raw_p:
                    p_val, _ = parse_complex_price(raw_p, url)
                    if p_val > 0:
                        price = p_val
                        if offers.get("availability") and "outofstock" in str(offers.get("availability")).lower():
                            stock = "Out of Stock"
                        break
            except Exception:
                continue

        # OpenGraph / Meta Tag Extraction
        if price == 0.0:
            og_p = re.search(r'<meta[^>]*property=["\']og:price:amount["\'][^>]*content=["\'](.*?)["\']', html, re.I) or \
                   re.search(r'<meta[^>]*property=["\']product:price:amount["\'][^>]*content=["\'](.*?)["\']', html, re.I)
            if og_p:
                p_val, _ = parse_complex_price(og_p.group(1), url)
                if p_val > 0:
                    price = p_val

        # Regex Fallback
        if price == 0.0:
            price_matches = re.findall(r'(?:₹|Rs\.?|INR|\$)\s*([\d,]+(?:\.\d{1,2})?)', html, re.I)
            for m in price_matches:
                p_val, _ = parse_complex_price(m, url)
                if p_val > 50:
                    price = p_val
                    break

        return {
            "title": title or "Product SKU",
            "price": price,
            "currency": currency,
            "stock": stock,
            "url": url,
            "source": "AST_DOM_HYDRATION_ENGINE",
            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        add_log(f"DOM fallback exception: {e}", "WARN")

    return {
        "title": "Product SKU",
        "price": 0.0,
        "currency": clean_currency_token("", url),
        "stock": "In Stock",
        "url": url,
        "source": "FALLBACK_EMPTY",
        "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

def execute_autonomous_pipeline(url: str) -> dict:
    """Orchestrates Bright Data DCA + Multi-Layer Self-Healing Mesh"""
    # 1. Check Layer 2 Instant State Sniffers first
    fast_item = resolve_layer_direct_api(url)
    if fast_item and fast_item["price"] > 0:
        return fast_item

    # 2. Trigger Bright Data DCA Cloud API
    if BRIGHTDATA_API_KEY and BRIGHTDATA_COLLECTOR_ID:
        try:
            headers = {"Authorization": f"Bearer {BRIGHTDATA_API_KEY}", "Content-Type": "application/json"}
            add_log(f"Queuing Bright Data DCA Collector for: {url}")
            t_resp = requests.post(
                f"https://api.brightdata.com/dca/trigger?collector={BRIGHTDATA_COLLECTOR_ID}&queue_next=1",
                headers=headers,
                json=[{"url": url}],
                timeout=10
            )
            if t_resp.status_code == 200:
                cid = t_resp.json().get("collection_id")
                d_url = f"https://api.brightdata.com/dca/dataset?id={cid}"
                start_time = time.time()
                while time.time() - start_time < MAX_WAIT_S:
                    time.sleep(POLL_INTERVAL_S)
                    d_resp = requests.get(d_url, headers=headers, timeout=10)
                    if d_resp.status_code == 200 and d_resp.text.strip():
                        data = d_resp.json()
                        rows = data if isinstance(data, list) else data.get("result") or data.get("data")
                        if rows and len(rows) > 0:
                            row = rows[0]
                            title = row.get("product_name") or row.get("title") or ""
                            raw_p = row.get("price") or row.get("final_price") or row.get("current_price")
                            p_val, curr = parse_complex_price(raw_p, url)
                            if p_val > 0:
                                add_log(f"Bright Data DCA returned verified record: {title} | {curr}{p_val}", "SUCCESS")
                                return {
                                    "title": title or "Product SKU",
                                    "price": p_val,
                                    "currency": curr,
                                    "stock": row.get("stock_status") or row.get("stock") or "In Stock",
                                    "url": url,
                                    "source": "BRIGHT_DATA_DCA_CLOUD",
                                    "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S")
                                }
        except Exception as e:
            add_log(f"Bright Data DCA anomaly ({e}). Self-healing to Layer 3 AST repair...", "WARN")

    # 3. Layer 3 & 4 DOM Hydration Execution
    add_log(f"Self-healing AST engine dispatched for {url}", "INFO")
    return resolve_layer_dom_hydration(url)

# ---------------------------------------------------------
# 3. REST API Routes
# ---------------------------------------------------------
@app.route("/", methods=["GET"])
def health_status():
    return jsonify({
        "status": "online",
        "service": "Scrape-Verse Self-Healing Scraper Studio Engine",
        "collector_id": BRIGHTDATA_COLLECTOR_ID,
        "brightdata_mode": "ACTIVE_UNIFIED_MESH" if BRIGHTDATA_API_KEY else "LOCAL_HYDRATION_MODE"
    }), 200

@app.route("/api/scrape", methods=["POST"])
def manual_entry():
    try:
        data = request.get_json(silent=True) or {}
        item = {
            "title": str(data.get("title", "Product SKU")).strip(),
            "price": float(data.get("price", 0.0)),
            "currency": str(data.get("currency", "₹")).strip(),
            "stock": str(data.get("stock", "In Stock")).strip(),
            "url": str(data.get("url", "")).strip(),
            "source": "MANUAL_INGESTION",
            "scraped_at": data.get("scraped_at") or time.strftime("%Y-%m-%d %H:%M:%S")
        }
        res_item = save_and_calculate_deltas(item)
        return jsonify({"message": "Snapshot persisted", "data": res_item}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/scrape-url", methods=["POST"])
def trigger_scrape():
    data = request.get_json(silent=True) or {}
    url = data.get("url")
    if not url:
        return jsonify({"error": "Target URL is required"}), 400

    try:
        scraped_item = execute_autonomous_pipeline(url)
        processed_item = save_and_calculate_deltas(scraped_item)
        return jsonify({
            "message": "Telemetry Ingestion Complete",
            "status": processed_item.get("status", "new_item"),
            "item": processed_item
        }), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Extraction Pipeline Error: {str(e)}"}), 500

@app.route("/api/items", methods=["GET"])
def get_items_ledger():
    sb = get_supabase()
    if sb:
        try:
            res = sb.table("items").select("*").order("id", desc=True).execute()
            if res.data and len(res.data) > 0:
                return jsonify({"items": res.data}), 200
        except Exception:
            pass

    csv_items = []
    if os.path.exists(CSV_FILE_PATH):
        with open(CSV_FILE_PATH, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for idx, r in enumerate(reader):
                csv_items.append([
                    idx + 1,
                    r.get("product_name", "Item"),
                    float(r.get("price", 0.0)),
                    r.get("stock_status", "In Stock"),
                    r.get("scraped_at", ""),
                    r.get("currency", "₹")
                ])
    return jsonify({"items": csv_items}), 200

@app.route("/api/telemetry", methods=["GET"])
def get_telemetry_logs():
    return jsonify({"logs": telemetry_logs}), 200

@app.route("/api/download-csv", methods=["GET"])
def download_scraped_csv():
    if os.path.exists(CSV_FILE_PATH):
        return send_file(CSV_FILE_PATH, as_attachment=True, download_name="scraped_items.csv")
    return jsonify({"error": "No CSV records found yet."}), 404

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
