import os
import asyncio
from dotenv import load_dotenv
from browser_use import Agent, Browser, ChatBrowserUse, BrowserProfile

# === Carregar variáveis de ambiente ===
load_dotenv()
API_KEY = os.getenv("API_KEY")

#API_KEY = "bu_qUl4Rj1HfpO2BQ4hFjFCWZnvrAJprwm8fcShTXkt1gs"


# Sites importantes:

# https://github.com/browser-use/web-ui

# https://cloud.browser-use.com/billing

browser_profile = BrowserProfile(
    headless=False,  # Mostra o navegador na tela
    minimum_wait_page_load_time=1.0,
    wait_between_actions=0.5,
)


# === Dados do Pedro Victor ===
PERSON = {
    "name": "Pedro Victor Veras",
    "location": "Rio de Janeiro, Brasil",
    "destination": "Fortaleza, Ceará, Brasil",
    "dates": {
        "departure": "18/12/2025",
        "return": "04/01/2026"
    },
    "goal": "viajar no fim do ano para curtir, relaxar e explorar o Nordeste. E passar o Natal em Fámilia e se possivel aluguel de Hotel em Fortaleza na virada do ano perto do mar. Eu já comprei a passagem de ida para o dia 18/12/2025 e preciso da volta no dia 03/01/2026 ou 04/01/2026 para o Rio de Janeiro. Entao eu preciso planejar o fim de ano em fortaleza buscando AirBin por apenas 2 noites em fortaleza perto da praia considerada menos violenta para festa de ano Novo.",
}

# === Data de hoje ===
TODAY = "2025-10-22"


DINHEIRO_LIMITE = "R$ 2500"



# === Construindo prompt da tarefa ===
TAREFA = f"""
Você é um assistente de planejamento de viagens do mestre Pedro Victor Veras.

➡️ Dados da viagem:
- Origem: {PERSON['location']}
- Destino: {PERSON['destination']}
- Ida: {PERSON['dates']['departure']} (já comprado) por R$ 687,00 Reais (análise Sniper Dos preços)
- Volta: {PERSON['dates']['return']}
- Data de hoje: {TODAY}

🎯 Objetivo:
Encontrar os **melhores voos** de ida e volta para o Pedro Victor, que ama explorar o Nordeste e quer voar com **LATAM** e **VOEGOL**.

🧭 Instruções:
1. Acesse os sites oficiais da LATAM e GOL (https://www.voegol.com.br/ e https://www.latamairlines.com/br/pt), respectivamente).
2. Pesquise os voos entre {PERSON['location']} e {PERSON['destination']}.
3. Liste os **5 melhores resultados** (menor preço ou menor tempo de voo).
4. Retorne em formato limpo:
   - Companhia aérea
   - Horário de ida e volta
   - Preço em R$
   - Link direto da página do voo
5. Faça uma análise com base no dinheiro disponível para a viagem {DINHEIRO_LIMITE} e trace planos.
   
   
depois faça um dataframe com pandas com os resultados encontrados.

e exporte esse dataframe para um arquivo csv chamado 'voos_encontrados.csv' e com coluna data em series temporais de data como "12/03/2025" e separado por categoria da empresa.

e  para acompanhamento min, média e max do preco da viagem durante a semanal ou mensal separado por tabs.
"""


# atualize um simlples html consumindo esses dados em excel mostrando os resultados encontrados em cards com tailwindcss

# === Execução principal ===
async def main(cloud = True):
    # Criar navegador na nuvem (usa cloud browser automaticamente)
    browser = Browser(use_cloud=cloud, headless=False)

    # Inicializar modelo de navegação com LLM nativo do BrowserUse
    llm = ChatBrowserUse()

    # Criar agente de viagem
    agent = Agent(
        task=TAREFA,
        llm=llm,
        browser=browser,
    )

    # Executar tarefa
    print("🚀 Buscando voos para Fortaleza no fim do ano...\n")
    result = await agent.run()

    print("\n✅ Resultado final:\n")
    print(result)

# === Ponto de entrada ===
if __name__ == "__main__":
    asyncio.run(main(
        cloud=False,
    ))

