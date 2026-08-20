import sqlite3

def init_db():

 conn=sqlite3.connect("database.db")
 cursor=conn.cursor()

 cursor.execute("""

    CREATE TABLE IF NOT EXISTS items(

      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      price REAL,
      stock TEXT,
      scraped_at TEXT
      );
        """)
 conn.commit()
 conn.close()

def clear_db():
  
  conn = sqlite3.connect("database.db")
  cursor = conn.cursor()
  cursor.execute("DELETE FROM items;")
  conn.commit()
  conn.close()

def save_data(items):
  conn=sqlite3.connect("database.db")
  cursor=conn.cursor()

  cursor.execute("""
 
   INSERT INTO items(title,price,stock,scraped_at)
    VALUES(?,?,?,?);"""
   , (items['title'], items['price'], items['stock'], items['scraped_at']))

  conn.commit()
  conn.close()

def get_all_items():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM items;")
    rows = cursor.fetchall()  
    conn.close()
    return rows

def get_last_row(title):
    conn=sqlite3.connect("database.db")
    cursor=conn.cursor()

    cursor.execute("""
        
      SELECT price,stock FROM items
      WHERE title =?
      ORDER BY id DESC 
      LIMIT 1;
""",  (title,))

    last_row = cursor.fetchone()  
    conn.close()
    return last_row

def process_and_save(items):
   
   last_row = get_last_row(items['title'])
   status = "no change"

   if last_row is None:
        status = "new_item"

   else:
      old_price, old_stock = last_row

      if items['price']<old_price:
         status = "price_drop"

      elif old_stock == "Out of Stock" and items['stock'] == "In Stock":
         status = "restock"

   save_data(items)
   return status     

 # --- EVERYTHING BELOW THIS LINE ONLY RUNS DURING TESTING
 
if __name__ == "__main__":
  init_db()
  clear_db()

  # Test 1: Brand new item
  item1 = {
      "title": "Gaming Monitor",
      "price": 300.0,
      "stock": "In Stock",
      "scraped_at": "2026-08-18 15:00:00",
  }
  print("Run 1 (Expected: new_item):", process_and_save(item1))

  # Test 2: Price drop
  item2 = {
      "title": "Gaming Monitor",
      "price": 250.0,
      "stock": "In Stock",
      "scraped_at": "2026-08-18 15:05:00",
  }
  print("Run 2 (Expected: price_drop):", process_and_save(item2))

  # Test 3: No change
  item3 = {
      "title": "Gaming Monitor",
      "price": 250.0,
      "stock": "In Stock",
      "scraped_at": "2026-08-18 15:10:00",
  }
  print("Run 3 (Expected: no change):", process_and_save(item3))
