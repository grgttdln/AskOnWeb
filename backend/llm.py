from openai import OpenAI
from dotenv import load_dotenv
import logging
import os

load_dotenv()

logger = logging.getLogger(__name__)

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_LLM_API_KEY")
)

def ask_question(question: str, context: str = ""):
    try:
        logger.info(f"Asking question: {question[:50]}...")
        logger.info(f"Using context: {context[:100]}...")
        
        messages = [
            {
                "role": "system",
                "content": "/think\nYou are an assistant. Respond in plain text only. Do not use Markdown formatting, bullet points, or special characters. Use only the following pieces of context to answer the question. Don't make up any new information"
            },
            {
                "role": "user",
                "content": f"{question}\nContext: {context}"
            }
        ]
        
        completion = client.chat.completions.create(
            model="nvidia/nvidia-nemotron-nano-9b-v2",
            messages=messages,
            temperature=0.6,
            top_p=0.95,
            max_tokens=4096,
            frequency_penalty=0,
            presence_penalty=0,
            stream=False,
            extra_body={"min_thinking_tokens": 500, "max_thinking_tokens": 2000}
        )

        answer = completion.choices[0].message.content
        
        logger.info(f"Generated answer: {answer[:100]}...")
        return answer.strip()
        
    except Exception as e:
        logger.error(f"Error asking question: {e}")
        raise Exception(f"Failed to get answer: {str(e)}")
