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
```text
├── backend/
│   ├── app.py                # Unified Flask REST API, DCA pipeline, and resolvers
│   ├── requirements.txt      # Production dependencies
│   ├── vercel.json           # Serverless build and routing configuration
│   └── .env.example          # Environment variables template
├── frontend/
│   ├── index.html            # Command Console, modals, and WebGL canvas
│   ├── script.js             # Three.js 3D viewport, GSAP animations, and API client
│   └── style.css             # Glassmorphism/cyberpunk styling system
└── README.md
