# Resilient Scraper Studio

An autonomous, prompt-to-production web scraping and price telemetry platform powered by Bright Data AI Flow, deterministic Python schema standardizers, and Supabase real-time persistence.

---

## ⚡ Overview

Traditional web scrapers break whenever target sites mutate their CSS selectors or DOM layout. **Resilient Scraper Studio** eliminates brittle selector maintenance by leveraging Bright Data AI Collectors and autonomous self-repair heuristics.

Extracted records stream directly through a deterministic Python normalizer into Supabase, maintaining an ongoing history of price shifts, stock recoveries, and catalog updates.

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
