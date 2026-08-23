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



🚀 Quickstart GuidePrerequisitesPython 3.10+Supabase AccountBright Data Account (Collector ID & API Token)Backend SetupNavigate to the backend directory:Bashcd backend
Create and activate a virtual environment:  Bash# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
Install dependencies:  Bashpip install -r requirements.txt
Configure environment variables:Create a .env file in backend/:  Code snippetSUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
SUPABASE_KEY=your-supabase-key
BRIGHTDATA_API_KEY=your-brightdata-api-key
BRIGHTDATA_COLLECTOR_ID=your-brightdata-collector-id
PORT=5000
Start the backend server:Bashpython app.py
Health check endpoint: http://127.0.0.1:5000/Frontend SetupNavigate to the frontend directory:Bashcd frontend
Start a local development server:Bashpython -m http.server 3000
Access the console:Open http://localhost:3000 in your browser.🌐 Production DeploymentBackend on VercelSet the Root Directory to backend.Add your environment variables in Vercel (SUPABASE_URL, SUPABASE_KEY, BRIGHTDATA_API_KEY, BRIGHTDATA_COLLECTOR_ID).Deploy. The generated endpoint will serve all /api/* routes.Frontend on NetlifySet the Publish Directory to frontend.Update the API_BASE variable at the top of frontend/script.js to match your live Vercel backend URL.Deploy.📡 API ReferenceMethodEndpointDescriptionGET/Service health status and active scraping modePOST/api/scrape-urlRuns autonomous extraction on a target URL and persists delta statePOST/api/scrapeManually ingests a structured price/stock snapshotGET/api/itemsRetrieves full monitored product fleet telemetryPOST/api/items/deletePermanently deletes a SKU and its snapshot historyGET/api/download-csvGenerates and downloads the current dataset as a CSV
