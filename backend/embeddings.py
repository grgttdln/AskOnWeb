from openai import OpenAI
import logging
from dotenv import load_dotenv
import os

load_dotenv()

logger = logging.getLogger(__name__)

client = OpenAI(
    api_key=os.getenv("NVIDIA_API_KEY"),
    base_url="https://integrate.api.nvidia.com/v1"
)

def get_embedding(text: str):
    try:
        logger.info(f"Getting embedding for text: {text[:50]}...")
        
        response = client.embeddings.create(
            input=[text],
            model="nvidia/llama-3.2-nemoretriever-300m-embed-v1",
            encoding_format="float",
            extra_body={"input_type": "query", "truncate": "NONE"}
        )
        
        embedding = response.data[0].embedding
        logger.info(f"Successfully got embedding of length: {len(embedding)}")
        return embedding
        
    except Exception as e:
        logger.error(f"Error getting embedding: {e}")
        raise Exception(f"Failed to get embedding: {str(e)}")
