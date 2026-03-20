import os
import git
import faiss
import numpy as np
from openai import OpenAI
from groq import Groq

client = Groq(api_key="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")

def clone_repo(repo_url):
    repo_name = repo_url.split("/")[-1]
    path = f"./repos/{repo_name}"

    if not os.path.exists(path):
        git.Repo.clone_from(repo_url, path)

    return path

def load_files(repo_path):
    code_data = []

    for root, _, files in os.walk(repo_path):
        for file in files:
            if file.endswith((".py", ".js", ".java", ".cpp")):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        code_data.append(f.read())
                except:
                    continue
    return code_data

def chunk_code(data, chunk_size=500):
    chunks = []
    for text in data:
        for i in range(0, len(text), chunk_size):
            chunks.append(text[i:i+chunk_size])
    return chunks

def get_embedding(text):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def build_index(chunks):
    embeddings = [get_embedding(chunk) for chunk in chunks]
    dim = len(embeddings[0])

    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype("float32"))

    return index, embeddings

def search(query, chunks, index, embeddings, k=3):
    query_vec = np.array([get_embedding(query)]).astype("float32")
    distances, indices = index.search(query_vec, k)

    results = [chunks[i] for i in indices[0]]
    return results


def generate_answer(query, context):
    prompt = f"""
You are a code assistant.

Context:
{context}

Question:
{query}

Answer clearly:
"""

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content
