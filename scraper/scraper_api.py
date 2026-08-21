import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from run_collector import run_collector
from llm_picker import normalize_and_filter_rows


app = Flask(__name__)
CORS(app)


@app.get("/")
def health():
    return jsonify({
        "status": "ok",
        "service": "resilient-scraper"
    }), 200


@app.post("/scrape")
def scrape():
    data = request.get_json(silent=True) or {}
    url = data.get("url")

    if not url or not isinstance(url, str):
        return jsonify({
            "success": False,
            "error": "A valid URL is required."
        }), 400

    url = url.strip()

    if not url.startswith(("http://", "https://")):
        return jsonify({
            "success": False,
            "error": "URL must start with http:// or https://"
        }), 400

    try:
        raw_rows = run_collector(url)

        clean_rows = normalize_and_filter_rows(raw_rows)

        return jsonify({
            "success": True,
            "url": url,
            "rows": clean_rows
        }), 200

    except Exception as exc:
        app.logger.exception("Scraping failed")

        return jsonify({
            "success": False,
            "url": url,
            "error": str(exc)
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    app.run(host="0.0.0.0", port=port)