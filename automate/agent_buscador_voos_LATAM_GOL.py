import os
import asyncio
from dotenv import load_dotenv
from browser_use import Agent, Browser, ChatBrowserUse, BrowserUse

# === Carregar variáveis do arquivo .env ===
load_dotenv()
API_KEY = os.getenv("BROWSER_USE_API_KEY")

API_KEY = "bu_qUl4Rj1HfpO2BQ4hFjFCWZnvrAJprwm8fcShTXkt1gs"

# === Configurações globais ===
TODAY = "2025-10-17"

PERSON = {
    "name": "Pedro Victor Veras",
    "location": "Rio de Janeiro, Brasil",
    "loves": "Explorar novos lugares como Fortaleza, Ceará. Pesquisar passagens LATAM e VOEGOL de 20/12/2025 a 04/01/2026.",
}

# === Inicializar o navegador ===
browser = Browser(use_cloud=True)  # usa navegador remoto (headless e isolado)

# === Definição da tarefa ===
TAREFA = f"""
Você é um assistente de planejamento de viagem.

Encontre passagens aéreas de {PERSON['location']} para Fortaleza (CE),
entre os dias 20/12/2025 e 04/01/2026,
para {PERSON['name']} que ama {PERSON['loves']}.

Liste as 5 melhores opções de voos das companhias LATAM e VOEGOL,
incluindo:
- Preço em R$ (reais)
- Link direto da oferta
- Horário de ida e volta
- Duração do voo
"""

# === Função principal ===
async def main():
    # Inicializa o LLM com acesso ao navegador
    llm = ChatBrowserUse(api_key=API_KEY)

    # Cria o agente e associa o navegador
    agent = Agent(
        task=TAREFA,
        llm=llm,
        browser=browser,
    )

    print("🔍 Executando o agente de busca de voos...")
    result = await agent.run()
    print("\n✅ Resultado:")
    print(result)

# === Executar o agente ===
if __name__ == "__main__":
    asyncio.run(main())

