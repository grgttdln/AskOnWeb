import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    """Test the health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print("Health check response:", response.json())
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_add_context():
    """Test adding context"""
    try:
        data = {"text": "The Louvre is in Paris."}
        response = requests.post(f"{BASE_URL}/add_context", json=data)
        print("Add context response:", response.json())
        return response.status_code == 200
    except Exception as e:
        print(f"Add context failed: {e}")
        return False

def test_ask_question():
    """Test asking a question"""
    try:
        data = {"question": "Where is the Eiffel Tower?"}
        response = requests.post(f"{BASE_URL}/ask", json=data)
        
        if response.status_code == 200:
            result = response.json()
            print("Ask response:", json.dumps(result, indent=2))
            return True
        else:
            print(f"Ask failed with status {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"Ask question failed: {e}")
        return False

def main():
    print("Testing RAG Backend API...")
    print("=" * 50)
    
    # Test health endpoint
    print("\n1. Testing health endpoint...")
    if not test_health():
        print("❌ Health check failed. Make sure the server is running!")
        return
    
    # Test adding context
    print("\n2. Testing add context...")
    if not test_add_context():
        print("❌ Add context failed!")
        return
    
    # Test asking question
    print("\n3. Testing ask question...")
    if not test_ask_question():
        print("❌ Ask question failed!")
        return
    
    print("\n✅ All tests passed!")

if __name__ == "__main__":
    main()