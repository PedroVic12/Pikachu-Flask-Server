from flask import Blueprint, jsonify
from backend.database.BancoSqlite import BancoSqlite
import os

# Define o caminho para o banco de dados da floricultura
# Ele estará em /backend/database/floricultura.db
db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'floricultura.db')
db = BancoSqlite(db_path)

# Cria o Blueprint
floricultura_bp = Blueprint(
    'floricultura_bp', __name__,
    template_folder='templates',
    static_folder='static'
)

@floricultura_bp.route('/clientes', methods=['GET'])
def get_clientes():
    """Retorna todos os clientes da floricultura."""
    try:
        # Garante que as tabelas existam
        db.criar_tabelas()
        query = "SELECT * FROM Cliente"
        resultados = db.consulta_dados(query)
        
        # Converte os resultados para um formato JSON
        colunas = ['ID_Cliente', 'RG', 'Nome_Cliente', 'Sobrenome_Cliente', 'Telefone', 'Rua', 'Numero', 'Bairro']
        clientes = [dict(zip(colunas, cliente)) for cliente in resultados]
        
        return jsonify(clientes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@floricultura_bp.route('/produtos', methods=['GET'])
def get_produtos():
    """Retorna todos os produtos da floricultura."""
    try:
        db.criar_tabelas()
        query = "SELECT * FROM Produto"
        resultados = db.consulta_dados(query)

        colunas = ['ID_Produto', 'Nome_Produto', 'Tipo_Produto', 'Preco', 'Qtde_Estoque']
        produtos = [dict(zip(colunas, produto)) for produto in resultados]

        return jsonify(produtos)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@floricultura_bp.route('/vendas', methods=['GET'])
def get_vendas():
    """Retorna todas as vendas da floricultura."""
    try:
        db.criar_tabelas()
        query = "SELECT * FROM Venda"
        resultados = db.consulta_dados(query)

        colunas = ['ID_Transacao', 'Nota_Fiscal', 'ID_Cliente', 'Data_Compra', 'ID_Produto', 'Quantidade']
        vendas = [dict(zip(colunas, venda)) for venda in resultados]

        return jsonify(vendas)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
