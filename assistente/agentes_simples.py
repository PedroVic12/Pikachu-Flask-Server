import os
import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
def send_message(prompt, sistema = "", json_format = False):

    api_key = os.getenv("OPENAI_API_KEY")  # Get the API key from the environment
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    formato = "text"
    if json_format:
        formato = "json_object"

    mensagem = []
    if sistema != "":
        mensagem.append({"role": "system", "content": sistema})
    mensagem.append({"role": "user", "content": prompt})

    data = {
        "model": "gpt-4o-mini",  # Ensure to specify the correct model
        "messages": mensagem,
        "max_tokens": 16_384,  # You can adjust this as needed
        "response_format": { "type": formato },
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        response_json = response.json()
        if json_format:
            return json.loads(response_json['choices'][0]['message']['content'])
        return response_json['choices'][0]['message']['content']
    else:
        print(f"Error: {response.status_code}, {response.text}")
        return None
formato_json = True
sistema = """Seu nome é Felipa.
Caso você receba uma mensagem pedindo por algum código, responda tipo 1.
Nos outros casos responda tipo 0.

Formato da resposta deve ser um JSON conforme o modelo:
{ "tipo" : 1 }
"""
mensagem = "Bom dia, qual seu nome?"
mensagem = "Você poderia gerar um código em python para imprimir 'ola mundo'?"
mensagem = "Você poderia gerar um código em python para imprimir de 0 a 100?"
mensagem = "gere o jogo da cobrinha em python."

# Example usage:
response = send_message(mensagem, sistema, formato_json)
print(response)

if response['tipo'] == 0:
    formato_json = False
    sistema = """Seu nome é Assistente Mil Grau"""
    response = send_message(mensagem, sistema, formato_json)
    print(response)

elif response['tipo'] == 1:
    sistema = """gere um código em python e responda no formato JSON
    Exemplo:
    {"code": "import ..."}
    """
    response = send_message(mensagem, sistema, formato_json)

    print(response['code'])

    def save_and_execute_python_code(code_string, filename='script.py'):
        # Salvar o código no arquivo especificado
        with open(filename, 'w', encoding="utf-8") as file:
            file.write(code_string)

        print("### RODANDO ###")

        # Executar o arquivo
        os.system(f'python {filename}')

        print("### RODOU ###")

    save_and_execute_python_code(response['code'])