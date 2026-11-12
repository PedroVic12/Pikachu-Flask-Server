import google.generativeai as genai
import os

# Configure the Gemini API
GOOGLE_API_KEY = "AIzaSyDAPQnsTQxOL5HJ0zpjdYZKxbQ-ekmi3S0"
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-pro')

class Agent:
    def __init__(self, role, goal, backstory):
        self.role = role
        self.goal = goal
        self.backstory = backstory
    
    def execute(self, task, attempts, tema):
        results = []
        for i in range(attempts):
            prompt = f"Role: {self.role}\nGoal: {self.goal}\nBackstory: {self.backstory}\nTask: {task.description.format(tema=tema)}\nExpected Output: {task.expected_output}\nAttempt: {i+1}/{attempts}"
            response = model.generate_content(prompt)
            results.append(response.text)
        
        # Consolidate results
        consolidated_prompt = f"Based on the following {attempts} attempts, provide a final consolidated response:\n\n" + "\n\n".join(results)
        final_response = model.generate_content(consolidated_prompt)
        return final_response.text

    def gerar_markdown(self, content):
        # Formatting content for markdown
        formatted_content = content.replace("\\n", "\n\n")  # Two line breaks for paragraphs
        
        try:
            # Create markdown file
            with open('documento.md', 'w', encoding='utf-8') as f:
                f.write(formatted_content)
            print("Relatório gerado em 'documento.md'.")
        except Exception as e:
            print(f"\nErro ao criar o arquivo: {e}")

class Task:
    def __init__(self, description, agent, expected_output, attempts):
        self.description = description
        self.agent = agent
        self.expected_output = expected_output
        self.attempts = attempts

    

class Crew:
    def __init__(self, agents, tasks):
        self.agents = agents
        self.tasks = tasks
    
    def kickoff(self, inputs):
        results = []
        for task in self.tasks:
            result = task.agent.execute(task, task.attempts, inputs['tema'])
            #print("Resultado: ", result)
            results.append(result)
        return results

# Define agents
buscador = Agent(
    role="Pesquisador",
    goal="Pesquisar informações relevantes sobre o assunto",
    backstory="Você é um pesquisador experiente e está sempre em busca de informações relevantes."
)

redator = Agent(
    role="Redator",
    goal="Escrever um artigo informativo sobre o assunto",
    backstory="Você é um redator experiente e está sempre buscando escrita limpa e facil de entendimento."
)

# Define tasks
pesquisa = Task(
    description="Pesquisar sobre {tema} com as fontes mais recentes e confiáveis",
    agent=buscador,
    expected_output="Um relatório  com parágrafos contendo Introdução, Desenvolvimento, e Conclusão",
    attempts=2
)

escrita = Task(
    description="Escrever um artigo em formato markdown sobre {tema} com base na pesquisa realizada",
    agent=redator,
    expected_output="Arquivo markdown bem escrito e objetivo de forma didática",
    attempts=2
)

# Create the crew
equipe = Crew(
    agents=[buscador, redator],
    tasks=[pesquisa, escrita]
)

# Define the theme
tema = "Empresas de delivery em campo grande RJ "
entradas = {"tema": tema}

# Execute tasks
results = equipe.kickoff(inputs=entradas)

# Display results and generate markdown
print("\n\nResultados das Tarefas da Equipe:")
for i, result in enumerate(results):
    print(result)
    print("\n---\n")
    if i == 1:  # Generate markdown for the second task (writing task)
        redator.gerar_markdown(result)

