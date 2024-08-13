import os
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools import DuckDuckGoSearchRun

# Obtendo a chave de API do ambiente
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

key = "AIzaSyDdlYV9sOWpkSAGX8DhlNCCeHdRoZksPp0"

class ResearchCrew:
    """
    Classe para gerenciar uma equipe de pesquisa com agentes de IA.
    """
    def __init__(self, api_key):
        self.api_key = api_key
        self.llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=self.api_key)
        self.search_tool = DuckDuckGoSearchRun()
        self.researcher = self.criar_agente_pesquisador()
        self.writer = self.criar_agente_escritor()

    def criar_agente_pesquisador(self):
        """
        Cria um agente pesquisador com as habilidades de pesquisa.
        """
        return Agent(
            role="Analista de Pesquisa Sênior",
            goal="Descobrir desenvolvimentos de ponta em IA e ciência de dados",
            backstory="""Você trabalha em um think tank de tecnologia líder.
            Sua experiência está em identificar tendências emergentes.
            Você tem um talento especial para dissecar dados complexos e apresentar insights acionáveis.""",
            verbose=True,
            allow_delegation=False,
            tools=[self.search_tool],
            llm=self.llm,
        )

    def criar_agente_escritor(self):
        """
        Cria um agente escritor com habilidades de escrita.
        """
        return Agent(
            role="Estrategista de Conteúdo de Tecnologia",
            goal="Criar conteúdo atraente sobre avanços tecnológicos",
            backstory="""Você é um Estrategista de Conteúdo renomado, conhecido por seus artigos perspicazes e envolventes.
            Você transforma conceitos complexos em narrativas convincentes.""",
            verbose=True,
            llm=self.llm,
            allow_delegation=True,
        )

    def executar_pesquisa(self, descricao_tarefa_pesquisa, descricao_tarefa_escrita):
        """
        Executa uma pesquisa e gera um relatório e um post de blog.
        """
        task1 = Task(
            description=descricao_tarefa_pesquisa,
            expected_output="Relatório de análise completo em marcadores",
            llm=self.llm,
            agent=self.researcher,
        )

        task2 = Task(
            description=descricao_tarefa_escrita,
            expected_output="Post de blog completo com pelo menos 4 parágrafos",
            agent=self.writer,
        )

        try:
            crew = Crew(
                agents=[self.researcher, self.writer],
                tasks=[task1, task2],
                verbose=2,
            )

            print(crew)

            result = crew.kickoff()
            print("######################")
            print(result)
            return result
        except OSError as e:
            print("Erro na tripulação ",e)
if __name__ == "__main__":
    crew_manager = ResearchCrew(api_key=GOOGLE_API_KEY)

    tarefa_pesquisa = """Realize uma análise abrangente dos últimos avanços em IA em 2024.
    Identifique as principais tendências, tecnologias inovadoras e potenciais impactos na indústria."""
    tarefa_escrita = """Usando os insights fornecidos, desenvolva um post de blog envolvente que destaque os avanços mais significativos da IA.
    Sua postagem deve ser informativa, mas acessível, atendendo a um público que entende de tecnologia.
    Faça com que soe legal, evite palavras complexas para que não pareça ter sido escrito por IA."""

    resultado = crew_manager.executar_pesquisa(tarefa_pesquisa, tarefa_escrita)