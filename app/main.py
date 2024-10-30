from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain import hub
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Initialize FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'],
)
# Initialize LangChain components
llm = ChatOpenAI(model="gpt-3.5-turbo-0125")

# Global variable to store the RAG pipeline
rag_chain = None  # This will hold the RAG chain after PDF upload


# Define the pipeline creation function
def create_rag_pipeline(file_path: str):
    loader = PyPDFLoader(file_path)
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)

    # Create vector store
    vectorstore = Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())
    retriever = vectorstore.as_retriever()

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
async def upload_pdf(file: UploadFile = File(...)):
    global rag_chain  # Use the global variable to store the chain
    try:
        # Save the uploaded PDF
        file_path = f"./data/{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Create the RAG pipeline and store it globally
        rag_chain = create_rag_pipeline(file_path)
        return {"message": "PDF uploaded successfully and RAG pipeline created."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


@app.get("/query/")
async def query_rag(question: str):
    global rag_chain
    try:
        if rag_chain is None:
            raise HTTPException(status_code=400, detail="No PDF uploaded. Please upload a PDF first.")

        # Invoke the RAG chain with the user's question
        response = rag_chain.invoke(question)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

# Run the server using: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=8000, reload=True)
