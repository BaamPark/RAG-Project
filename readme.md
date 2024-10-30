+---------------------+            +------------------------+
|   User (Browser)    |            |  FastAPI Server         |
|---------------------|            |------------------------|
| Upload PDFs (Resume |--Upload--> |  Parse PDFs (PyPDF2)    |
| and Certificates)   |            |  Generate Embeddings    |
|                     |            |  Store in Pinecone      |
+---------------------+            +------------------------+
                                      |
                                      v
                         +------------------------------+
                         |       Pinecone (Cloud)        |
                         |  Stores embeddings, handles   |
                         |  updates, and provides fast   |
                         |  similarity search            |
                         +------------------------------+

                                      ^
                                      | Query for Similar Data
+---------------------+               |
| LangChain + LLM     |<--------------+
| (OpenAI / HF Model) |   
| Analyzes data,      |
| generates feedback, |
| provides corrections|
+---------------------+

                                      |
                      +--------------------------------+
                      | User retrieves feedback through|
                      |    API response from FastAPI    |
                      +--------------------------------+
