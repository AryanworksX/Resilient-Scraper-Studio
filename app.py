from flask import Flask, jsonify, request
from file1 import get_all_items, init_db, process_and_save

app = Flask(__name__)
init_db()

@app.route("/", methods=["GET"])
def home():
  return jsonify({"status": "active", "message": "Price Tracker API"}), 200

@app.route("/api/scrape", methods=["POST"])
def receive_scraped_item():
  
  data = request.get_json()
  status = process_and_save(data)

  return jsonify({
      "message": "Item processed successfully",
      "status": status,
      "received": data,
  }), 200

@app.route("/api/items", methods=["GET"])
def fetch_history():
  items = get_all_items()
  return jsonify({"items": items}), 200

if __name__ == "__main__":
  app.run(debug=True, port=5000)