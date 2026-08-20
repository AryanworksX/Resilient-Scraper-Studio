import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

_client: Client | None = None


def get_client() -> Client:
    """Lazily create the Supabase client so import doesn't crash
    if env vars aren't set yet (e.g. during local linting)."""
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_KEY must be set (see .env.example)"
            )
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client


def init_db():
    """No-op for Supabase: the 'items' table is created once via the
    SQL in backend/schema.sql (run it in the Supabase SQL editor).
    Kept as a function so app.py doesn't need to change its import."""
    pass


def clear_db():
    get_client().table("items").delete().gte("id", 0).execute()


def save_data(item):
    get_client().table("items").insert({
        "title": item["title"],
        "price": item["price"],
        "stock": item["stock"],
        "scraped_at": item["scraped_at"],
    }).execute()


def get_all_items():
    res = get_client().table("items").select("*").order("id", desc=True).execute()
    return res.data


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
        if item["price"] < old_price:
            status = "price_drop"
        elif old_stock == "Out of Stock" and item["stock"] == "In Stock":
            status = "restock"

    save_data(item)
    return status


# --- EVERYTHING BELOW THIS LINE ONLY RUNS DURING LOCAL TESTING ---
if __name__ == "__main__":
    clear_db()

    item1 = {
        "title": "Gaming Monitor",
        "price": 300.0,
        "stock": "In Stock",
        "scraped_at": "2026-08-18 15:00:00",
    }
    print("Run 1 (Expected: new_item):", process_and_save(item1))

    item2 = {
        "title": "Gaming Monitor",
        "price": 250.0,
        "stock": "In Stock",
        "scraped_at": "2026-08-18 15:05:00",
    }
    print("Run 2 (Expected: price_drop):", process_and_save(item2))

    item3 = {
        "title": "Gaming Monitor",
        "price": 250.0,
        "stock": "In Stock",
        "scraped_at": "2026-08-18 15:10:00",
    }
    print("Run 3 (Expected: no_change):", process_and_save(item3))
