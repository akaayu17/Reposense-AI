import os
import git
import faiss
import numpy as np
import shutil
from openai import OpenAI

# Free local embedding model (no API key required)
from sentence_transformers import SentenceTransformer
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Groq for fast AI chat inference (Llama 3)
groq_client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY", "Enter your api key"),
    base_url="https://api.groq.com/openai/v1"
)

def clone_repo(repo_url):
    repo_name = repo_url.split("/")[-1]
    if repo_name.endswith(".git"):
        repo_name = repo_name[:-4]
    
    path = f"./repos/{repo_name}"

    if os.path.exists(path):
        import subprocess, shutil
        try:
            # If the clone has more than just the .git folder, assume it's valid code!
            if len(os.listdir(path)) > 1:
                return path
        except Exception:
            pass
        
        # Force delete corrupted/empty clone to retry
        if os.name == 'nt':
            subprocess.run(f'rmdir /s /q "{os.path.normpath(path)}"', shell=True)
        else:
            shutil.rmtree(path, ignore_errors=True)
            
    git.Repo.clone_from(repo_url, path)

    return path

def load_files(repo_path):
    code_data = []
    file_names = []

    for root, _, files in os.walk(repo_path):
        # skip .git directory
        if ".git" in root:
            continue
            
        for file in files:
            valid_exts = (".py", ".js", ".java", ".cpp", ".ts", ".jsx", ".tsx", ".md", ".json", ".html", ".css", ".ipynb", ".go", ".rs", ".txt")
            if file.endswith(valid_exts):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        rel_path = os.path.relpath(file_path, repo_path)
                        content = f.read()
                        # Add filename prefix context
                        code_data.append(f"// File: {rel_path}\n{content}")
                        file_names.append(rel_path)
                except Exception:
                    continue
    return code_data, file_names

def chunk_code(data, chunk_size=1000, overlap=200):
    chunks = []
    for text in data:
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunks.append(text[start:end])
            start += chunk_size - overlap
    return chunks

def get_embedding(text):
    return embedder.encode(text).tolist()

def build_index(chunks):
    if not chunks:
        # Prevent crash if repo is empty
        return None, None
        
    embeddings = [get_embedding(chunk) for chunk in chunks]
    dim = len(embeddings[0])

    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype("float32"))

    return index, embeddings

def search(query, chunks, index, embeddings, k=3):
    if not chunks or index is None:
        return []
    
    query_vec = np.array([get_embedding(query)]).astype("float32")
    distances, indices = index.search(query_vec, min(k, len(chunks)))

    results = [chunks[i] for i in indices[0]]
    return results

def generate_answer(query, context):
    prompt = f"""
You are a code assistant expert in navigating and understanding codebases.

Context:
{context}

Question:
{query}

Answer the question clearly and concisely based on the context. If the context doesn't contain the answer, say so. Produce code examples using markdown when appropriate.
"""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant", # Groq model
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content

def generate_summary(context):
    prompt = f"""
You are an expert software engineer.
Based on the following code excerpts from a GitHub repository, provide a high-level summary of what the repository does, its key technologies, and its overall architecture.
Keep it insightful but concise.

Context:
{context}

Summary:
"""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant", # Groq model
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content
