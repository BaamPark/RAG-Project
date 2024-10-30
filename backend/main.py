from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain import hub
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import os
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore

load_dotenv()
app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'],
)


def upsert_pinecone_index(file_path: str, namespace: str=""):
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small") #dimension=1536
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = "ragcv"
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=1536,
            metric="cosine",
            spec=ServerlessSpec(
                cloud='aws', 
                region=os.getenv("PINECONE_REGION")
            ) 
        )

    loader = PyPDFLoader(file_path)
    documents = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunked_documents = text_splitter.split_documents(documents)

    vector_store = PineconeVectorStore.from_documents(
        documents=chunked_documents, 
        embedding=embeddings, 
        index_name=index_name, 
        namespace=namespace
    )


def create_rag_pipeline(namespace=""):
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small") #dimension=1536
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

    index_name = "ragcv"
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=1536,
            metric="cosine",
            spec=ServerlessSpec(
                cloud='aws', 
                region=os.getenv("PINECONE_REGION")
            ) 
        )
    vector_store = PineconeVectorStore(index_name=index_name, embedding=embeddings, namespace=namespace)

    retriever = vector_store.as_retriever()

    llm = ChatOpenAI(
        openai_api_key=os.environ.get('OPENAI_API_KEY'),
        model_name='gpt-4o-mini',
        temperature=0.0
    )

    # Pull the prompt from the hub
    prompt = hub.pull("rlm/rag-prompt")

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    # Build the RAG chain
    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return chain


@app.post("/upload-pdf/")
async def upload_pdf(file: UploadFile = File(...), namespace: str = ""):
    try:
        file_path = f"./data/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())

        upsert_pinecone_index(file_path=file_path, namespace=namespace)
        return {"message": "PDF uploaded successfully and RAG pipeline created."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")



@app.get("/query/")
async def query_rag(question: str, namespace: str = ""):
    try:
        rag_chain = create_rag_pipeline(namespace=namespace)
        response = rag_chain.invoke(question)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

# Run the server using: uvicorn main:app --reload
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", port=8000, reload=True)
