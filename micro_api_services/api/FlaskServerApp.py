from flask import Flask, jsonify, request
from ..database.BancoSqlite import BancoSqlite


class PikachuRoutes:
    def __init__(self,app,db):
        self.app = app
        self.db = db

    def setupRoutes(self):

        @self.app.route("/", methods=["GET"])
        def index():
            return "<h1> Pikachu 2024 rodando! </h1>"


        @self.app.route('/clientes', methods=['GET'])
        def get_clientes():
            query = "SELECT * FROM Cliente"
            resultados = self.db.consulta_dados(query)
            clientes = [
                {
                    'ID_Cliente': cliente[0],
                    'RG': cliente[1],
                    'Nome_Cliente': cliente[2],
                    'Sobrenome_Cliente': cliente[3],
                    'Telefone': cliente[4],
                    'Rua': cliente[5],
                    'Numero': cliente[6],
                    'Bairro': cliente[7],
                }
                for cliente in resultados
            ]
            return jsonify(clientes)

        @self.app.route('/produtos', methods=['GET'])
        def get_produtos():
            query = "SELECT * FROM Produto"
            resultados = self.db.consulta_dados(query)
            produtos = [
                {
                    'ID_Produto': produto[0],
                    'Nome_Produto': produto[1],
                    'Tipo_Produto': produto[2],
                    'Preco': produto[3],
                    'Qtde_Estoque': produto[4],
                }
                for produto in resultados
            ]
            return jsonify(produtos)

        @self.app.route('/vendas', methods=['GET'])
        def get_vendas():
            query = "SELECT * FROM Venda"
            resultados = self.db.consulta_dados(query)
            vendas = [
                {
                    'ID_Transacao': venda[0],
                    'Nota_Fiscal': venda[1],
                    'ID_Cliente': venda[2],
                    'Data_Compra': venda[3],
                    'ID_Produto': venda[4],
                    'Quantidade': venda[5],
                }
                for venda in resultados
            ]
            return jsonify(vendas)

        @self.app.route('/adiciona_cliente', methods=['POST'])
        def adiciona_cliente():
            dados = request.json
            query = f'''
                INSERT INTO Cliente (RG, Nome_Cliente, Sobrenome_Cliente, Telefone, Rua, Numero, Bairro)
                VALUES ('{dados["RG"]}', '{dados["Nome_Cliente"]}', '{dados["Sobrenome_Cliente"]}', 
                '{dados["Telefone"]}', '{dados["Rua"]}', '{dados["Numero"]}', '{dados["Bairro"]}')
            '''
            self.db.inserir_dados("Cliente", query)
            return jsonify({'status': 'Cliente adicionado com sucesso!'}), 201






class FlaskServerApp:
    def __init__(self, db_name):
        self.app = Flask(__name__)
        self.db = BancoSqlite(db_name)

        

    def run(self, host='0.0.0.0', port=5000):
        rotas = PikachuRoutes(self.app,self.db)
        rotas.setupRoutes()

        self.app.run(host=host, port=port)

