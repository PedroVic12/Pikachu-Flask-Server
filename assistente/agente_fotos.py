from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

class GoogleGeminiManager:
    """
    Classe para gerenciar interações com o Google Gemini usando Langchain.
    """
    def __init__(self, api_key, model="gemini-pro"):
        """
        Inicializa o gerenciador com a chave de API e o modelo desejado.

        Args:
            api_key: Sua chave de API do Google Cloud.
            model: O modelo do Google Gemini a ser usado (padrão: "gemini-pro").
        """
        self.api_key = api_key
        self.model = model
        self.llm = ChatGoogleGenerativeAI(model=self.model, google_api_key=self.api_key)

    def generate_text(self, prompt):
        """
        Gera texto usando o modelo Gemini Pro.

        Args:
            prompt: O prompt de texto para o modelo.

        Returns:
            str: A resposta gerada pelo modelo.
        """
        response = self.llm.invoke(prompt)
        return response.text

    def analyze_image(self, image_url):
        """
        Analisa uma imagem usando o modelo Gemini Pro Vision.

        Args:
            image_url: A URL da imagem.

        Returns:
            str: A descrição da imagem gerada pelo modelo.
        """
        message = HumanMessage(
            content=[
                {"type": "text", "text": "What's in this image?"},
                {"type": "image_url", "image_url": image_url},
            ]
        )
        response = self.llm.invoke([message])
        return response.text

# Substitua 'SUA_API_KEY' pela sua chave de API do Google Cloud
api_key = "SUA_API_KEY"  

# Crie uma instância do gerenciador
gemini_manager = GoogleGeminiManager(api_key)

# Exemplo de uso: Gerar texto
texto_gerado = gemini_manager.generate_text("Sing a ballad of LangChain.")
print(f"Texto Gerado:\n{texto_gerado}")

# Exemplo de uso: Analisar imagem
descricao_imagem = gemini_manager.analyze_image("https://picsum.photos/seed/picsum/200/300")
print(f"\nDescrição da Imagem:\n{descricao_imagem}")
