from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from embeddings import get_embedding
from llm import ask_question
from vectorstore import InMemoryVectorStore
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
vector_store = InMemoryVectorStore()

# Optional: preload some context
try:
    initial_docs = ["Paris is the capital of France.", "The Eiffel Tower is in Paris."]
    for doc in initial_docs:
        vector_store.add(doc, get_embedding(doc))
    logger.info("Initial docs loaded successfully")
except Exception as e:
    logger.error(f"Failed to load initial docs: {e}")

class Query(BaseModel):
    question: str

class ContextRequest(BaseModel):
    text: str

@app.post("/ask")
async def ask(query: Query):
    try:
        logger.info(f"Processing question: {query.question}")
        
        # Get embedding for the question
        q_vector = get_embedding(query.question)
        
        # Search for relevant context
        results = vector_store.search(q_vector, top_k=1)
        context, similarity = results[0] if results else ("", 0)
        
        logger.info(f"Found context: {context[:100]}...")
        
        # Get answer from LLM
        answer = ask_question(query.question, context)
        
        return {
            "answer": answer, 
            "context": context, 
            "similarity": float(similarity)
        }
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@app.post("/add_context")
async def add_context(request: ContextRequest):
    try:
        logger.info(f"Adding context: {request.text[:100]}...")
        
        vector = get_embedding(request.text)
        vector_store.add(request.text, vector)
        
        return {"message": "Context added successfully"}
    except Exception as e:
        logger.error(f"Error adding context: {e}")
        raise HTTPException(status_code=500, detail=f"Error adding context: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "vector_store_size": len(vector_store.texts)}

@app.get("/")
async def root():
    return {"message": "RAG Backend API", "endpoints": ["/ask", "/add_context", "/health"]}
    
    