from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings, GoogleVectorStore
from langchain_core.messages import HumanMessage
from langchain.text_splitter import CharacterTextSplitter
from langchain.document_loaders import DirectoryLoader

class GoogleGenerativeAIManager:
    def __init__(self, api_key):
        self.api_key = api_key
        self.llm_vision = ChatGoogleGenerativeAI(model="gemini-pro-vision", api_key=self.api_key)
        self.llm_text = ChatGoogleGenerativeAI(model="gemini-pro", api_key=self.api_key)
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", api_key=self.api_key)
        self.corpus_store = None

    def invoke_llm_vision(self, image_url):
        message = HumanMessage(
            content=[
                {"type": "text", "text": "What's in this image?"},
                {"type": "image_url", "image_url": image_url},
            ]
        )
        response = self.llm_vision.invoke([message])
        print("Vision Response:", response)
        return response

    def invoke_llm_text(self, text):
        response = self.llm_text.invoke(text)
        print("Text Response:", response)
        return response

    def embed_text(self, text):
        embedding = self.embeddings.embed_query(text)
        print("Embedding:", embedding)
        return embedding

    def create_document_store(self, corpus_name, display_name):
        self.corpus_store = GoogleVectorStore.create_corpus(display_name=corpus_name)
        document_store = GoogleVectorStore.create_document(
            corpus_id=self.corpus_store.corpus_id, display_name=display_name
        )
        return document_store

    def add_documents_to_store(self, document_store, path):
        text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
        documents = DirectoryLoader(path=path).load()
        split_docs = text_splitter.split_documents(documents)
        document_store.add_documents(split_docs)

    def query_corpus(self, query):
        aqa = self.corpus_store.as_aqa()
        response = aqa.invoke(query)
        print("Query Response:", {
            "answer": response.answer,
            "attributed_passages": response.attributed_passages,
            "answerable_probability": response.answerable_probability
        })
        return {
            "answer": response.answer,
            "attributed_passages": response.attributed_passages,
            "answerable_probability": response.answerable_probability
        }

    def execute_copywriter_task(self, task_description):
        # Aqui, você pode adicionar lógica para executar uma tarefa com CopyWriter
        result = self.invoke_llm_text(task_description)
        print("CopyWriter Task Result:", result)
        return result


# Substitua pela sua API Key
GOOGLE_API_KEY = "AIzaSyDV_TzW4k3dqapFmDLha2jh9BARbeUIWos"  

# Crie uma instância do gerenciador
google_ai_manager = GoogleGenerativeAIManager(api_key=GOOGLE_API_KEY)

# Exemplo de uso
if __name__ == "__main__":
    try:
        # Exemplo de uso do LLM Vision
        vision_response = google_ai_manager.invoke_llm_vision("https://picsum.photos/seed/picsum/200/300")
    except:
        print("Erro Google Vision")
    
    # Exemplo de uso do LLM Text
    text_response = google_ai_manager.invoke_llm_text("Sing a ballad of LangChain.")

    # Exemplo de uso do LLM Text com invoke
    msg_response = google_ai_manager.invoke_llm_text("What are some of the pros and cons of Python as a programming language?") 

    # Exemplo de Embeddings
    embedding = google_ai_manager.embed_text("hello, world!")
    
    # Criação de um Document Store e Adição de Documentos
    document_store = google_ai_manager.create_document_store(corpus_name="My Corpus", display_name="My Document")
    google_ai_manager.add_documents_to_store(document_store, path="data/")
    
    # Consulta ao Corpus
    query_response = google_ai_manager.query_corpus("What is the meaning of life?")
    
    # Tarefa de CopyWriter
    copywriter_result = google_ai_manager.execute_copywriter_task("Create an article about AI and its applications.")