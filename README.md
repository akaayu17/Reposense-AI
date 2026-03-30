<h1 align="center">
  <br/>
  🔍 RepoSense AI
  <br/>
</h1>

<p align="center">
  <strong>Understand any GitHub repository through natural language — powered by semantic search and LLMs.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/FAISS-Vector_Search-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Groq-Llama_3.1-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Vite-8+-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

---

## 📖 Overview

**RepoSense AI** is a full-stack AI-powered web application that lets you ask natural language questions about any public GitHub repository. Simply paste a repo URL, and within seconds the system clones, indexes, and makes the entire codebase available for intelligent Q&A and architectural summarization — no setup or authentication required.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔗 **One-Click Repo Ingestion** | Paste any public GitHub URL — the app clones it automatically |
| ⚡ **Semantic Embeddings** | Source files are chunked and embedded using `sentence-transformers` (all-MiniLM-L6-v2) |
| 🗂️ **FAISS Vector Index** | Lightning-fast similarity search across the entire codebase |
| 🤖 **AI Chat Interface** | Ask anything — architecture, logic, bugs, patterns — powered by Groq (Llama 3.1) |
| 📋 **Repo Summary** | Auto-generated architectural overview of the repository on load |
| 🌗 **Light / Dark Theme** | Full theme toggle with persistent preference |
| 🔁 **Hot Reload** | Live updates in development — both frontend (Vite HMR) and backend (uvicorn --reload) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     RepoSense AI                        │
│                                                         │
│   ┌──────────────┐          ┌────────────────────────┐  │
│   │   React UI   │  HTTP    │    FastAPI Backend      │  │
│   │  (Vite DEV)  │ ◄──────► │    :8000               │  │
│   │  :5173       │          │                        │  │
│   └──────────────┘          │  ┌──────────────────┐  │  │
│                             │  │  GitPython Clone  │  │  │
│                             │  └────────┬─────────┘  │  │
│                             │           ▼             │  │
│                             │  ┌──────────────────┐  │  │
│                             │  │ SentenceTransform │  │  │
│                             │  │  (Embeddings)     │  │  │
│                             │  └────────┬─────────┘  │  │
│                             │           ▼             │  │
│                             │  ┌──────────────────┐  │  │
│                             │  │  FAISS Index     │  │  │
│                             │  └────────┬─────────┘  │  │
│                             │           ▼             │  │
│                             │  ┌──────────────────┐  │  │
│                             │  │  Groq LLM API    │  │  │
│                             │  │  (Llama 3.1)     │  │  │
│                             │  └──────────────────┘  │  │
│                             └────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** — High-performance Python web framework
- **[GitPython](https://gitpython.readthedocs.io/)** — Repository cloning and management
- **[sentence-transformers](https://www.sbert.net/)** — Local embedding model (`all-MiniLM-L6-v2`)
- **[FAISS](https://faiss.ai/)** — Facebook AI Similarity Search for vector indexing
- **[Groq API](https://console.groq.com/)** — Ultra-fast LLM inference (Llama 3.1 8B Instant)
- **[NumPy](https://numpy.org/)** — Numerical operations for embedding vectors

### Frontend
- **[React 18](https://react.dev/)** — UI library
- **[Vite](https://vitejs.dev/)** — Next-generation frontend tooling
- **[Framer Motion](https://www.framer.com/motion/)** — Animations and transitions
- **[Lucide React](https://lucide.dev/)** — Icon library
- **[ReactMarkdown](https://github.com/remarkjs/react-markdown)** — Renders AI responses as rich Markdown
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first CSS framework

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | v18 or higher |
| Python | 3.9 or higher |
| pip | Latest |
| Git | Any recent version |

### 1. Clone the Repository

```bash
git clone https://github.com/akaayu17/Reposense-AI.git
cd Reposense-AI
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure your Groq API Key

Get a free API key from [https://console.groq.com/keys](https://console.groq.com/keys), then set it:

```bash
# Windows (PowerShell)
$env:GROQ_API_KEY = "gsk_your_key_here"

# macOS / Linux
export GROQ_API_KEY="gsk_your_key_here"
```

> Alternatively, open `backend/utils.py` and replace `"Enter your api key"` with your actual key directly.

#### Start the Backend Server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs at `http://localhost:8000/docs`.

---

### 3. Frontend Setup

```bash
# In a new terminal, navigate to the frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/load-repo` | Clone and index a GitHub repository |
| `POST` | `/ask` | Ask a natural language question about the loaded repo |
| `GET` | `/summarize` | Generate an AI architectural summary of the repo |

### Example: Load a Repository

```bash
curl -X POST http://localhost:8000/load-repo \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/facebook/react"}'
```

### Example: Ask a Question

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "How does the reconciliation algorithm work?"}'
```

---

## 📁 Project Structure

```
reposense-ai/
├── backend/
│   ├── main.py            # FastAPI app & route definitions
│   ├── utils.py           # Core logic: cloning, embedding, indexing, LLM
│   ├── requirements.txt   # Python dependencies
│   ├── repos/             # Cloned repositories (auto-generated, git-ignored)
│   └── venv/              # Python virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component, theme, routing
│   │   ├── index.css            # Global styles
│   │   ├── components/
│   │   │   ├── ChatInterface.jsx   # AI chat panel
│   │   │   ├── SummaryView.jsx     # Repo summary + file list
│   │   │   └── RepoInput.jsx       # URL input component
│   │   └── services/
│   │       └── api.js              # Axios API service layer
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 💡 Usage Guide

1. **Open the app** at `http://localhost:5173`
2. **Paste a GitHub URL** into the search bar (e.g., `https://github.com/vercel/next.js`)
3. **Click Analyze** — the backend clones, chunks, embeds, and indexes the entire repo
4. **View the Summary** tab for an AI-generated architectural overview
5. **Switch to Chat** and ask anything:
   - *"What does this repo do?"*
   - *"How does authentication work?"*
   - *"Where is the main entry point?"*
   - *"List all API endpoints"*

---

## ⚡ Performance Notes

- Embeddings are generated in **batches of 64** for maximum throughput
- Files larger than **500 KB** are skipped to keep indexing fast
- The FAISS index is capped at **2,000 chunks** to prevent memory issues on very large repos
- The local `all-MiniLM-L6-v2` model requires **no API key** and runs entirely on-device

---

## 🔒 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key for LLM inference |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using React, FastAPI, FAISS, and Groq
</p>
