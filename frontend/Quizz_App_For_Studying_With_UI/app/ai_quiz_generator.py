
import google.generativeai as genai
import json
import re

def generate_questions_with_ai(api_key, topic, difficulty, num_questions, commented_answers):
    """
    Gera um quiz usando a API do Google Generative AI.
    """
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')

        commented_text = "com gabarito comentado e resolução passo-a-passo em formato LaTeX" if commented_answers else "sem gabarito comentado."

        prompt = f"""
        Crie um quiz de múltipla escolha sobre o tópico '{topic}' com nível de dificuldade '{difficulty}'.
        O quiz deve ter exatamente {num_questions} perguntas.
        Cada pergunta deve ter exatamente 4 opções de resposta, onde apenas uma é a correta.
        As perguntas e respostas que envolvem matemática devem usar estritamente o formato LaTeX, por exemplo: $\\frac{{1}}{{s}}$.

        Sua resposta deve ser APENAS um objeto JSON válido, sem nenhum texto ou formatação adicional antes ou depois.
        O JSON deve ser uma lista de objetos, onde cada objeto representa uma pergunta e tem a seguinte estrutura:
        {{
            "question": "texto da pergunta em formato string",
            "options": ["opção 1", "opção 2", "opção 3", "opção 4"],
            "correct_answer": "a resposta correta exata que está em 'options'",
            "difficulty": "{difficulty}",
            "solution": "{commented_text}"
        }}
        """

        response = model.generate_content(prompt)
        
        # Limpa a resposta para garantir que é um JSON válido
        # O Gemini pode retornar o JSON dentro de ```json ... ```
        cleaned_response = re.sub(r'^```json\n|\
''$\n', '', response.text.strip())
        
        quiz_data = json.loads(cleaned_response)
        return quiz_data

    except Exception as e:
        print(f"Erro ao gerar quiz com IA: {e}")
        # Retorna uma questão de erro para o usuário
        return [
            {
                "question": "Ocorreu um erro ao gerar o quiz. Verifique sua chave de API e tente novamente.",
                "options": ["OK", "Tentar de novo", "Voltar", "Ajuda"],
                "correct_answer": "OK",
                "difficulty": "médio",
                "solution": f"Detalhes do erro: {str(e)}"
            }
        ]
