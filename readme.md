# Full-stack RAG Project

<!-- import image from img/diagram.png -->
![Image description](img/diagram.png)
This project is a full-stack interface for a Retrieval-Augmented Generation (RAG) system. Users enter a namespace, upload PDFs, and ask questions to interact with a backend powered by FastAPI and Pinecone.

## Next plans
- Implement database where userID, password, and namespace are stored
- Implement authentication
- Implement metadata filtering

## Application idea
- preprocess the documents so it fits in LLM context window
- upsert HP_notes_doc_1 and comment_doc_1 on Pinecone
- In RAG pipeline, query f"Find a context from {HP_notes_doc_1} upon {comment}"


## Technology stack
- LLM
    - OpenAI
    - Langchain
    - Pinecone
- Backend
    - FastAPI
- Frontend
    - Next.js


## Instructions for docker users:
- Get your openAI API, Pinecone API, and Langchain API keys
- Write .env file and locate it in backend directory
- Run the below command
- Once you run the below command, you can remove build flag
```bash
docker-compose up --build
```

## Instructions for non-docker users:
- Get your openAI API, Pinecone API, and Langchain API keys
- Write .env file and locate it in backend directory
- Install next.js 14 and install frontend dependencies
- Install python requirements `backend/requirements.txt`
- write .env file under backend folder
- run run.sh

## Frontend dependencies
```bash
npx create-next-app@14.2.16
npx shadcn@latest init
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
```

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

## Note
- Use next.js 14.2.16
- The latest Next.js 15 conflicts with other axios and shadcn dependencies. You can't dockerize with Next.js 15.
- when install next.js, don't use eslint. 