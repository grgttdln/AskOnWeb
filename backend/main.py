from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import List
import os

# RAG utilities
from embeddings import get_embedding
from vectorstore import InMemoryVectorStore
from llm import ask_question

load_dotenv()

app = FastAPI()


class AskRequest(BaseModel):
    question: str
    context: str | None = ""


class AskResponse(BaseModel):
    answer: str


def _chunk_text(text: str, max_chars: int = 1000) -> List[str]:
    if not text:
        return []
    # Prefer paragraph boundaries, then fall back to fixed-size chunks
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks: List[str] = []
    for para in paragraphs:
        if len(para) <= max_chars:
            chunks.append(para)
        else:
            # further split long paragraphs into sentence-ish chunks
            sentences = [s.strip() for s in para.replace("\n", " ").split(".") if s.strip()]
            current = ""
            for s in sentences:
                candidate = (current + (". " if current else "") + s).strip()
                if len(candidate) > max_chars and current:
                    chunks.append(current)
                    current = s
                else:
                    current = candidate
            if current:
                chunks.append(current)
    # final guard: hard-wrap any remaining oversize chunks
    wrapped: List[str] = []
    for c in chunks:
        if len(c) <= max_chars:
            wrapped.append(c)
        else:
            for i in range(0, len(c), max_chars):
                wrapped.append(c[i:i + max_chars])
    return wrapped


def _build_vector_store(chunks: List[str]) -> InMemoryVectorStore:
    store = InMemoryVectorStore()
    for chunk in chunks:
        vector = get_embedding(chunk)
        store.add(chunk, vector)
    return store


def _retrieve_context(store: InMemoryVectorStore, question: str, top_k: int = 3) -> str:
    q_vec = get_embedding(question)
    results = store.search(q_vec, top_k=top_k)
    retrieved = [text for text, _score in results]
    return "\n\n".join(retrieved)


@app.post("/ask", response_model=AskResponse)
async def ask(body: AskRequest):
    try:
        # 1) Build an ephemeral vector store from provided context
        chunks = _chunk_text(body.context or "")
        store = _build_vector_store(chunks) if chunks else None

        # 2) Retrieve relevant snippets
        retrieved_context = _retrieve_context(store, body.question, top_k=3) if store else ""

        # 3) Ask the LLM using only retrieved context
        prompt_context = retrieved_context or ""
        answer = ask_question(question=body.question, context=prompt_context).strip()
        return {"answer": answer}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate answer")