# RAG Project Frontend

This project is a frontend interface for a Retrieval-Augmented Generation (RAG) system. Users enter a namespace, upload PDFs, and ask questions to interact with a backend powered by FastAPI and Pinecone.

## Backend
- FastAPI
- Pinecone (Vector database)
- LangChain for RAG pipeline

## Frontend
- Next.js (App Router)
- Shadcn/ui

## Instructions:
- write .env file under backend folder
- run run.sh

## .env template
```env
OPENAI_API_KEY= your_openai_api_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=your_langchain_api_key
LANGCHAIN_PROJECT=project_name
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_REGION=your_pinecone_region
PINECONE_CLOUD=your_pinecone_cloud
```