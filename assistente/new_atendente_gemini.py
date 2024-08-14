
#pip install -U langchain-google-genai

#export GOOGLE_API_KEY=your-api-key

import os

#genai.configure(api_key=os.environ["API_KEY"])


from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import google.generativeai as genai

class GeminiModelManager:
    """Gerencia os modelos Gemini Pro e Gemini 1.5 Flash."""
    
    def __init__(self, api_key):
        """Inicializa o gerenciador com a chave de API."""
        self.api_key = api_key
        genai.configure(api_key=self.api_key)
        self.vision_model = None
        self.text_model = None
        self.prompt = None
    
    def carregar_modelo_visao(self):
        """Carrega o modelo Gemini Pro Vision."""
        self.vision_model = ChatGoogleGenerativeAI(model="gemini-pro-vision", google_api_key=self.api_key)
        print("Modelo Gemini Pro Vision carregado.")
    
    def carregar_modelo_texto(self):
        """Carrega o modelo Gemini 1.5 Flash."""
        self.text_model = genai.GenerativeModel('gemini-1.5-flash')
        print("Modelo Gemini 1.5 Flash carregado.")

    def definir_prompt(self, prompt):
        """Define o prompt a ser usado."""
        self.prompt = prompt
        print(f"Prompt definido: {self.prompt}")

    def executar_tarefa(self):
        """Executa a tarefa com base no modelo carregado e no prompt."""
        if self.vision_model and self.prompt:
            message = HumanMessage(
                content=[
                    {"type": "text", "text": self.prompt},
                    {"type": "image_url", "image_url": "https://picsum.photos/seed/picsum/200/300"},
                ]
            )
            response = self.vision_model.invoke([message])
            print("Resposta do Modelo de Visão:", response.text)
        elif self.text_model and self.prompt:
            response = self.text_model.generate_content(self.prompt)
            print("Resposta do Modelo de Texto:", response.text)
        else:
            print("Erro: Carregue um modelo e defina um prompt antes de executar a tarefa.")

# Substitua 'SUA_API_KEY' pela sua chave de API do Google Cloud
api_key = "AIzaSyDdlYV9sOWpkSAGX8DhlNCCeHdRoZksPp0"
new_key = "AIzaSyDAPQnsTQxOL5HJ0zpjdYZKxbQ-ekmi3S0"
c3po_key = "AIzaSyDVufkW23RIvdiTrUY3_ql67cnyVTMMIq8"

try:
    # Criar um gerenciador de modelos Gemini
    gerenciador = GeminiModelManager(c3po_key)

    # Carregar os modelos
    gerenciador.carregar_modelo_texto()
    gerenciador.carregar_modelo_visao()

    # Definir o prompt
    gerenciador.definir_prompt("Sing a ballad of LangChain.")

    # Executar a tarefa
    gerenciador.executar_tarefa()

    # Mudar o prompt e executar a tarefa com o outro modelo
    gerenciador.definir_prompt("Write a story about a magic backpack.")
    gerenciador.executar_tarefa()


except:
    print("erro google")