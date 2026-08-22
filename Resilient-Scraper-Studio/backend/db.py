import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
_client: Client | None = None

def get_client() -> Client:
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in backend/.env")
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client

def init_db():
    pass

def clear_db():
    get_client().table("items").delete().gte("id", 0).execute()

def save_data(item):
    get_client().table("items").insert({
        "title": item["title"],
        "price": float(item["price"]),
        "stock": item.get("stock", "Unknown"),
        "scraped_at": item.get("scraped_at"),
    }).execute()

def get_all_items():
    res = get_client().table("items").select("*").order("id", desc=True).execute()
    return res.data or []

def get_last_row(title):
    res = (
        get_client()
        .table("items")
        .select("price, stock")
        .eq("title", title)
        .order("id", desc=True)
        .limit(1)
        .execute()
    )
    if not res.data:
        return None
    row = res.data[0]
    return (row["price"], row["stock"])

def process_and_save(item):
    last_row = get_last_row(item["title"])
    status = "no_change"
    if last_row is None:
        status = "new_item"
    else:
        old_price, old_stock = last_row
        if float(item["price"]) < float(old_price):
            status = "price_drop"
        elif old_stock == "Out of Stock" and item["stock"] == "In Stock":
            status = "restock"
    save_data(item)
    return status