# Vercel serverless entrypoint.
# Vercel's Python runtime looks for a WSGI `app` object in files under api/.
# We just re-export the real Flask app defined in backend/app.py.
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import app  # noqa: E402,F401
