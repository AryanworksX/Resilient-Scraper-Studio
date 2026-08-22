import sys
import os

# Ensure the parent backend/ directory is in Python's module lookup path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import app  # noqa: E402, F401