# RepoSense AI: Frontend & Backend API Integration Details

## 1. Overview
RepoSense AI is a full-stack application designed to interact with GitHub repositories using natural language. The architecture consists of a React-based frontend (using Vite and Tailwind CSS) and a FastAPI Python backend. The two systems communicate asynchronously via a RESTful API over HTTP.
 
## 2. API Configuration (Frontend)
The frontend encapsulates all backend communication inside a dedicated service file located at `frontend/src/services/api.js`. This centralizes the API logic and makes the codebase easier to maintain.

- **HTTP Client**: Axios is used for making requests.
- **Base URL**: Set to `http://localhost:8000`, which is the default port for FastAPI.

```javascript
import axios from 'axios';
const API_URL = 'http://localhost:8000';
```

## 3. Endpoints & Data Flow

### A. Load Repository (`POST /load-repo`)
- **Frontend Trigger**: Initiated in `App.jsx` when the user submits a GitHub URL. 
- **Data Sent**: `{ "repo_url": "https://github.com/..." }`
- **Backend Action**: The FastAPI server clones the repo, chunks the source code, generates embeddings using an AI model, and stores them in a vector index for semantic search.
- **Response**: Returns a success message and a list of processed files.

### B. Ask Question (`POST /ask`)
- **Frontend Trigger**: Initiated in `ChatInterface.jsx` when the user types a question in the chatbox.
- **Data Sent**: `{ "query": "How is authentication handled?" }`
- **Backend Action**: The backend uses the query to perform a similarity search on the code chunks. It then sends the retrieved context and the question to an LLM to generate an accurate answer based exclusively on the repository's code.
- **Response**: Returns `{ "answer": "..." }`.

### C. Summarize Repository (`GET /summarize`)
- **Frontend Trigger**: Initiated by `SummaryView.jsx` to render an overview of the codebase.
- **Data Sent**: None (GET request).
- **Backend Action**: The backend fetches the first few chunks of the code and requests the LLM to provide a high-level summary of the repository's purpose and functionality.
- **Response**: Returns `{ "summary": "..." }`.

## 4. Cross-Origin Resource Sharing (CORS)
Because the frontend and backend run on different ports (e.g., `5173` for Vite and `8000` for FastAPI), browsers would normally block the API calls due to the Same-Origin Policy.
To resolve this, the FastAPI backend implements CORS middleware in `backend/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows requests from any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
This ensures the frontend can successfully communicate with the backend during local development.

## 5. Security & Error Handling
- **Backend**: Exceptions during processing (e.g., invalid URLs, LLM failures) are caught and returned as HTTP 500 or 400 status codes with descriptive error messages using `HTTPException`.
- **Frontend**: The UI components use `try...catch` blocks to gracefully handle potential API failures, displaying error states to the user rather than crashing the interface.
