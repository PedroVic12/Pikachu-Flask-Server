from flask import Blueprint, request, jsonify
import os

# A lógica do crewai e assemblyai seria colocada aqui.
# Por enquanto, vamos simular a resposta para garantir que a rota funcione.
# As chaves de API e a inicialização dos agentes (joao_fine_tunning) deveriam
# ser gerenciadas de forma segura e eficiente, possivelmente na inicialização do app.

ia_bp = Blueprint('ia_bp', __name__)

@ia_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    # Simulação da funcionalidade
    data = request.json
    if 'audio_url' not in data:
        return jsonify({"error": "audio_url não fornecido"}), 400
    
    audio_url = data['audio_url']
    print(f"Recebido pedido para transcrever: {audio_url}")
    
    # Em uma implementação real, a chamada para `transcriber.transcribe(audio_url)` iria aqui.
    simulated_transcript = "Este é um texto simulado da transcrição do seu áudio."
    
    return jsonify({"transcript": simulated_transcript})

@ia_bp.route('/dialogue', methods=['POST'])
def generate_dialogue():
    # Simulação da funcionalidade
    data = request.json
    if 'prompt' not in data:
        return jsonify({"error": "prompt não fornecido"}), 400
        
    prompt = data['prompt']
    print(f"Recebido prompt para gerar diálogo: {prompt}")

    # Em uma implementação real, a chamada para `crew.kickoff()` iria aqui.
    simulated_result = {
        "pergunta_1": "Esta é a primeira pergunta gerada pela IA.",
        "resposta_1": "Esta é a primeira resposta gerada pela IA.",
        "pergunta_2": "Esta é a segunda pergunta gerada pela IA.",
        "resposta_2": "Esta é a segunda resposta gerada pela IA.",
    }
    
    return jsonify(simulated_result)
