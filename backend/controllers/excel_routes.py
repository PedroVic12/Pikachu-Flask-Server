from flask import Blueprint, jsonify, request, current_app
import pandas as pd
import os
import json

excel_bp = Blueprint('excel_bp', __name__)

# Define o caminho para o arquivo Excel que servirá como nosso "banco de dados"
# Usamos current_app.root_path para garantir que o caminho seja relativo à pasta do app
def get_excel_path():
    return os.path.join(current_app.root_path, 'database', 'kanban_data.xlsx')

@excel_bp.route('/load', methods=['GET'])
def load_data():
    """
    Carrega os dados do arquivo Excel e os retorna como JSON.
    Se o arquivo não existir, retorna uma lista vazia.
    """
    excel_path = get_excel_path()
    if not os.path.exists(excel_path):
        return jsonify([]) # Retorna vazio se o arquivo não existe

    try:
        df = pd.read_excel(excel_path)
        # Converte o DataFrame para JSON, tratando datas e valores nulos
        return jsonify(json.loads(df.to_json(orient='records', date_format='iso')))
    except Exception as e:
        return jsonify({"error": f"Erro ao ler o arquivo Excel: {str(e)}"}), 500

@excel_bp.route('/save', methods=['POST'])
def save_data():
    """
    Recebe dados em JSON do frontend e os salva no arquivo Excel,
    sobrescrevendo o conteúdo anterior (lógica de sincronização).
    """
    excel_path = get_excel_path()
    data = request.get_json()

    if not isinstance(data, list):
        return jsonify({"error": "O corpo da requisição deve ser uma lista de objetos"}), 400

    try:
        df = pd.DataFrame(data)

        # Garante que o diretório do banco de dados exista
        os.makedirs(os.path.dirname(excel_path), exist_ok=True)
        
        # Salva o DataFrame no arquivo Excel
        df.to_excel(excel_path, index=False)
        
        return jsonify({"success": True, "message": f"Dados sincronizados com sucesso em {excel_path}"})
    except Exception as e:
        return jsonify({"error": f"Erro ao salvar o arquivo Excel: {str(e)}"}), 500
