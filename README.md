# AskOnWeb

AskOnWeb is a powerful Chrome extension that transforms your web browsing experience by allowing you to ask questions about any text you encounter on the web. Using retrieval-augmented generation (RAG) with large language models, it helps you understand, analyze, and get insights from web content in real-time.

## What is AskOnWeb?

AskOnWeb is an intelligent browser extension that combines text selection, context management, and retrieval-augmented generation to help you better understand web content. Whether you're reading articles, research papers, or any web page, AskOnWeb lets you highlight text and ask questions to get instant, contextual answers.

## Key Features

### 🎯 **Smart Text Selection**

- Highlight any text on any webpage to instantly interact with it
- Contextual popup appears when you select text, offering quick actions
- Seamless integration with your browsing experience

### 🤖 **Retrieval-Augmented Generation (RAG)**

- Ask questions about selected text and get intelligent responses
- Uses semantic search to retrieve the most relevant text chunks before generating responses
- Responses are based only on the content you've selected, ensuring relevance and reducing hallucinations

### 📚 **Context Management**

- Build context by adding multiple text selections
- Maintain conversation history across sessions
- Organize your questions and answers for better understanding

### 🎨 **Multiple Interface Options**

- **Popup Interface**: Quick access through the extension popup
- **Side Panel**: Dedicated workspace for longer conversations
- **In-Page Selection**: Direct interaction with highlighted text

### 🔄 **Real-Time Processing**

- Instant text processing and question answering
- Background processing for smooth user experience
- Automatic semantic search and relevance scoring using vector embeddings

## How It Works

1. **Select Text**: Highlight any text on any webpage
2. **Choose Action**: Use the popup to either ask a question or add to context
3. **Get Answers**: Receive RAG-powered responses based on your selected content
4. **Build Context**: Add more text selections to create richer conversations
5. **Manage History**: Access your previous questions and answers anytime

### Highlight Test

<img width="3553" height="1965" alt="image" src="https://github.com/user-attachments/assets/bf87b468-1cb5-456b-9b3f-ccb2be00b9f4" />

### Ask Questions

<img width="3548" height="1930" alt="image" src="https://github.com/user-attachments/assets/76ae263b-9fad-47ba-a17c-e7ae1b1f1c6c" />
<img width="3562" height="1860" alt="image" src="https://github.com/user-attachments/assets/8b07ac9e-fc36-419a-a9a2-e2d0d3d92754" />

## Technical Architecture

- **Frontend**: Built with Svelte 5 and Vite for a modern, responsive UI
- **Backend**: FastAPI server with RAG (Retrieval-Augmented Generation) capabilities
- **Language Model**: NVIDIA Nemotron Nano 9B for text generation
- **Embedding Model**: NVIDIA Llama 3.2 Nemoretriever 300M for semantic embeddings
- **Vector Storage**: In-memory vector store using NumPy for fast similarity search
- **Chrome Extension**: Native browser integration with content scripts and background workers

## License

This project is licensed under the MIT License - see the LICENSE file for details.
