# Resilient Scraper Studio

An autonomous price-tracking platform: Bright Data AI Flow builds and self-heals the scrapers, a Python pipeline normalizes the data into a consistent schema, and Supabase stores it with real-time updates to the dashboard.

---

## ⚡ Overview

Resilient Scraper Studio solves a common problem with web scrapers: they break the moment a target site changes its layout. Instead of hand-written selectors that need constant maintenance, it uses Bright Data AI Collectors to build and automatically repair extraction logic when a site's HTML changes.

Every scraped record flows through a Python normalization step into Supabase, which keeps an ongoing history of price changes, restocks, and catalog updates over time.

---

## 🛠️ Architecture & Tech Stack

* **AI Flow Scraper Engine:** Bright Data Cloud DCA API / Web Unlocker Proxy Mesh
* **Backend REST API:** Python (Flask), Flask-CORS, Python-dotenv
* **Database & Persistence:** Supabase (PostgreSQL)
* **Frontend Dashboard:** Semantic HTML5, CSS3 Glassmorphism/Claymorphism, Chart.js, Three.js

---

## 📂 Repository Structure

```text
Resilient-Scraper-Studio/
├── backend/
│   ├── api/
│   │   └── index.py            # Vercel serverless entry point
│   ├── app.py                  # Flask REST API endpoints[cite: 1]
│   ├── db.py                   # Supabase client & delta tagging logic[cite: 1]
│   ├── schema.sql              # Supabase PostgreSQL database schema[cite: 1]
│   ├── requirements.txt        # Python backend dependencies[cite: 1]
│   ├── vercel.json             # Deployment routing configuration[cite: 1]
│   └── .env.example            # Backend environment variables template[cite: 1]
├── scraper/
│   ├── run_collector.py        # Standalone scraper runner & cloud poller[cite: 1]
│   ├── requirements.txt        # Scraper runner dependencies[cite: 1]
│   └── .env.example            # Scraper environment variables template[cite: 1]
├── frontend/
│   ├── index.html              # Telemetry dashboard & self-healing lab[cite: 1]
│   ├── style.css               # Cyber-glassmorphism & neumorphic styles[cite: 1]
│   └── script.js               # Frontend data engine, WebGL, & Chart.js[cite: 1]
├── .gitignore                  # Global secrets and environment ignores[cite: 1]
└── README.md
