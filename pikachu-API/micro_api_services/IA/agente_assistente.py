from flask import Flask, request, jsonify
import assemblyai as aai
from crewai import Agent, Task, Crew
from langchain_openai import ChatOpenAI

app = Flask(__name__)

# Configuração do AssemblyAI
aai.settings.api_key = "06516a374639450480e48cbd4035a0c3"
transcriber = aai.Transcriber()

# Configuração do CrewAI
joao_fine_tunning = Agent(
    role='O seu papel é criar diálogos',
    goal='Fazer as melhores perguntas e respostas possíveis',
    backstory="Você é um Secretario, publicitario, rico, Atendentente, Marketing Ditital Google Platforms profissional",
    verbose=False,
    allow_delegation=False,
    max_iter=10,
    llm=ChatOpenAI(model_name="gpt-4", api_key="SUA_API_KEY_OPENAI", temperature=0.1)
)

task1 = Task(
    description="Baseado em um prompt recebido, criar cinco perguntas e respostas diferentes: {prompt}",
    agent=joao_fine_tunning,
    expected_output="""
        Suas 5 respostas precisam ser em português no formato JSON.
        Exemplo de 5 respostas:
        {exemplos}
        {exemplos}
        {exemplos}
        {exemplos}
        {exemplos}
    """
)

crew = Crew(
    agents=[joao_fine_tunning],
    tasks=[task1],
    verbose=2,
)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    data = request.json
    audio_url = data['audio_url']
    
    # Transcrição do áudio usando AssemblyAI
    transcript = transcriber.transcribe(audio_url)
    
    return jsonify({"transcript": transcript.text})

@app.route('/dialogue', methods=['POST'])
def generate_dialogue():
    data = request.json
    prompt = data['prompt']
    exemplos = data['exemplos']
    
    # Geração de diálogo usando CrewAI
    result = crew.kickoff(
        inputs={
            "prompt": prompt,
            "exemplos": exemplos
        }
    )
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
