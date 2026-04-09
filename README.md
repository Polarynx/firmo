Firmo
Firmo is a full-stack academic source finder and citation generator. Enter any claim, essay, or research topic and Firmo queries 14 academic databases (2B+ papers) simultaneously, evaluates evidence using Mistral LLM, and generates properly formatted citations.
🔗 Live: firmo-delta.vercel.app

How It Works

User submits a claim, essay, or topic through the React frontend
FastAPI backend fans out parallel queries across 14 academic database APIs
Results are deduplicated, ranked, and enriched with metadata (journal, citation count, database source)
Mistral LLM evaluates the claim against returned evidence — generating a confidence score (0–100%), synthesis verdict, and optional counterarguments
Frontend renders interactive source cards with one-click citation generation, summarization, and deep-dive analysis


Features
Search Modes

Single Claim — paste a factual statement and get papers that support or challenge it
Essay Check — extracts up to 8 factual claims from pasted text with color-coded confidence bars
Topic Explorer — search by keyword or topic area with AI-generated research landscape overviews

Source Analysis

AI confidence scoring (0–100%) per claim
Debatable mode — toggle between supporting and opposing sources for contested claims
Stress Test — generates the strongest academic counterargument + opposing papers
Evidence synthesis — AI verdict across up to 12 sources at once
Summarize — one-sentence plain-English summary of any abstract
Dig Deep — 3–4 sentence analysis of what a paper studied and how it relates to your claim
Ask Sources — free-form questions answered based on what the found papers actually say
Find More Sources — 5 alternative search queries, no duplicates with existing results

Citations

APA, MLA, Chicago — full reference + in-text format
One-click copy to clipboard

UX

Dark / light mode with system preference detection
Related claims and related topics chips for exploration
Save papers with original claim context (browser storage)
Search history — last 20 searches, re-runnable with one click
Share via URL — copy a direct link to any search result
Database filter chips — filter results by source with live count per database
Source badge on every paper card showing database origin, journal, and citation count
Guided 16-step walkthrough tutorial with pro tips
IP-based rate limiting: 50 searches/user/day


Databases (14)
DatabaseEstimated PapersSemantic Scholar200M+OpenAlex250M+BASE300M+CrossRef150M+Europe PMC45M+PubMed35M+DOAJ20M+arXiv2.4M+Zenodo3M+ERIC2M+HAL1.5M+INSPIRE-HEP1.5M+PLOS300K+fatcat900M+
Total: ~2 billion+ academic papers searchable simultaneously

Project Structure
firmo/
├── backend/              # FastAPI Python backend
│   ├── main.py
│   └── requirements.txt
└── frontend/             # React + Vite + Tailwind frontend
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   └── components/
    │       ├── SearchBar.jsx
    │       ├── SourceCard.jsx
    │       └── ThemeToggle.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js

Running Locally
Backend
bashcd backend
python -m venv .venv
source .venv/bin/activate   # macOS/Linux
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn main:app --reload
API available at http://localhost:8000 · Interactive docs at http://localhost:8000/docs
Frontend
bashcd frontend
npm install
npm run dev
App opens at http://localhost:5173. API calls proxy to localhost:8000 via Vite.

API Reference
POST /api/search
json{ "claim": "Social media is linked to increased anxiety in teenagers" }
Returns a list of papers with title, authors, year, abstract, url, doi, source_db.
POST /api/cite
json{
  "title": "...",
  "authors": ["Jane Doe", "John Smith"],
  "year": 2023,
  "doi": "10.1234/example",
  "url": "https://...",
  "style": "apa"
}
Returns { "citation": "...", "intext": "...", "style": "apa" }.

Deployment

Frontend: Vercel (auto-deploy via GitHub CI/CD)
Backend: Render
9 REST API endpoints
Sub-2s response time (warm)
~300 searches/month on free tier


Version History
VersionNameHighlightsv1.3Extended SourcesExpanded to 14 databases, source badges, database filter chipsv1.2Topic ExplorerTopic search mode, research landscape overviews, changelog viewerv1.1Guidance16-step guided tutorial with pro tips, startup fixv1.0FoundationClaim search, essay checker, stress test, citations, debatable mode, evidence synthesis

Tech Stack
Frontend: React, Vite, Tailwind CSS
Backend: FastAPI, Python
LLM: Mistral AI
Deployment: Vercel + Render
