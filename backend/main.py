from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils import *

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RepoRequest(BaseModel):
    repo_url: str

class QueryRequest(BaseModel):
    query: str

chunks = []
index = None
embeddings = None
processed_files = []

@app.post("/load-repo")
def load_repo(req: RepoRequest):
    global chunks, index, embeddings, processed_files
    try:
        path = clone_repo(req.repo_url)
        files, file_names = load_files(path)
        chunks = chunk_code(files)
        index, embeddings = build_index(chunks)
        processed_files = file_names
        return {"message": "Repository processed successfully!", "files": processed_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
def ask_question(req: QueryRequest):
    global chunks, index, embeddings
    if not chunks or index is None:
        raise HTTPException(status_code=400, detail="No repository loaded. Please load a repository first.")
    
    try:
        results = search(req.query, chunks, index, embeddings)
        context = "\n\n".join(results)
        answer = generate_answer(req.query, context)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/summarize")
def summarize_repo():
    global chunks, index, embeddings
    if not chunks:
        raise HTTPException(status_code=400, detail="No repository loaded. Please load a repository first.")
    
    try:
        # Generate summary using a subset of chunks (first 10 chunks to avoid token limits)
        context = "\n\n".join(chunks[:10])
        summary = generate_summary(context)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
