from flask import jsonify, request, send_file, send_from_directory
from apps.sistema_cadastro_manutencao.flask_app_cadastro.service_order import ServiceOrder
from apps.sistema_cadastro_manutencao.flask_app_cadastro.service_order_service import ServiceOrderService
import json
import os
from database.BancoSqlite import BancoSqlite
from database.sqlite_controller import SqliteController
import requests

# Initialize database connections
try:
    # Floricultura database
    db_floricultura = BancoSqlite('./database/floricultura.db')
    db_floricultura.conecta()
    db_floricultura.criar_tabelas()
    print("Floricultura database connected successfully!")

    # Cardapio database
    db_cardapio = SqliteController('./database/cardapio.db')
    db_cardapio.connect()
    print("Cardapio database connected successfully!")

    # Service Orders database
    db_service_orders = BancoSqlite('./database/service_orders.db')
    db_service_orders.conecta()
    print("Service Orders database connected successfully!")

    # Google Planilhas database
    db_planilhas = BancoSqlite('./database/planilhas.db')
    db_planilhas.conecta()
    db_planilhas.criar_tabelas()
    print("Google Planilhas database connected successfully!")
except Exception as e:
    print(f"Error connecting to databases: {str(e)}")

class GooglePlanilhasController:
    def __init__(self, db):
        self.db = db
        self.google_script_url = 'https://script.googleusercontent.com/macros/echo?user_content_key=_SbuJavmd8GVa5YuIJlezZ4QYaN-GcR7bgY_QIDNm6t5r_EcUDnEaVTWfiApWREAEGOZGmcz5OoxM69_vBbD9zd8yalm620Jm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnAOQyAu3J0pgt2VCGulS5w8imbI838rlwibGFXE33fHTu2oJiqw6U5ivl46C-t8zfz_w-5UDalqjAlt85is3_lIFYLQzr2ZuXtz9Jw9Md8uu&lib=MpFR3aDjpNEEl3D_WuvT0p5ryw3v7gu6W'

    def get_data(self):
        # Fetch data from Google Sheets
        response = requests.get(self.google_script_url)

        # Check if the response is JSON
        try:
            data = response.json()
        except ValueError:
            # Log non-JSON response for debugging
            print("Non-JSON response received:")
            print(response.text)
            return jsonify({'error': 'Failed to fetch data from Google Sheets'}), 500

        #print("### DATA ###")
        #print(data)

        # Sync with local database (optional)
        for entry in data:
            # Assuming a table named 'Planilhas' exists
            self.db.cursor.execute('''
                INSERT OR IGNORE INTO Planilhas (PROJETOS, PRAZOS, PRECOS, TECNOLOGIAS, LIVE_DEMO)
                VALUES (?, ?, ?, ?, ?)
            ''', (entry['PROJETOS'], entry['PRAZOS'], entry['PRECOS'], entry['TECNOLOGIAS'], entry['LIVE DEMO']))
        self.db.conn.commit()

        return jsonify(data)

    def post_data(self):
        # Get data from request
        data = request.json

        # Add data to Google Sheets
        response = requests.post(self.google_script_url, json=data)
        result = response.json()

        print("### RESULTADO ###")
        #print(result)

        # Sync with local database
        self.db.cursor.execute('''
            INSERT INTO Planilhas (PROJETOS, PRAZOS, PRECOS, TECNOLOGIAS, LIVE_DEMO)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['PROJETOS'], data['PRAZOS'], data['PRECOS'], data['TECNOLOGIAS'], data['LIVE DEMO']))
        self.db.conn.commit()

        return jsonify(result)


def setup_routes(app, session_local):
    # Helper function to get service
    def get_service():
        session = session_local()
        try:
            return ServiceOrderService(session)
        finally:
            session.close()

    # Index route
    @app.route("/", methods=["GET"])
    def index():
        return "<h1>Pikachu 2024 rodando!</h1>"

    # Floricultura routes
    @app.route('/clientes', methods=['GET'])
    def get_clientes():
        try:
            query = "SELECT * FROM Cliente"
            resultados = db_floricultura.consulta_dados(query)
            if resultados is None:
                return jsonify({"error": "No clients found"}), 404
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
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/produtos', methods=['GET'])
    def get_produtos():
        try:
            query = "SELECT * FROM Produto"
            resultados = db_floricultura.consulta_dados(query)
            if resultados is None:
                return jsonify({"error": "No products found"}), 404
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
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/vendas', methods=['GET'])
    def get_vendas():
        try:
            query = "SELECT * FROM Venda"
            resultados = db_floricultura.consulta_dados(query)
            if resultados is None:
                return jsonify({"error": "No sales found"}), 404
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
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # Cardapio routes
    @app.route('/cardapio', methods=['GET'])
    def get_cardapio():
        try:
            # Create a new connection for each request
            db_cardapio = SqliteController('./database/cardapio.db')
            db_cardapio.connect()
            
            items = db_cardapio.read('Items')
            if not items:
                return jsonify({"error": "No menu items found"}), 404
            menu_items = [
                {
                    'id': item[0],
                    'name': item[1],
                    'description': item[2],
                    'price': item[3],
                    'category': item[4]
                }
                for item in items
            ]
            return jsonify(menu_items)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # Service Order routes
    @app.route('/api/service-orders', methods=['GET'])
    def get_service_orders():
        try:
            # Correct usage of BancoSqlite
            db_service_orders = BancoSqlite('./database/service_orders.db')
            db_service_orders.conecta()

            # Assuming there's a table named ServiceOrders
            orders = db_service_orders.consulta_dados('ServiceOrders')
            if not orders:
                return jsonify({"error": "No service orders found"}), 404

            service_orders = [
                {
                    'id': order[0],
                    'rebocador': order[1],
                    'responsavel': order[2],
                    'dataAbertura': order[3],
                    'oficina': order[4],
                    'manutencao': order[5],
                    'equipamento': order[6],
                    'descricaoFalha': order[7],
                    'servicoExecutado': order[8]
                }
                for order in orders
            ]
            return jsonify(service_orders)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/service-orders', methods=['POST'])
    def create_service_order():
        try:
            data = request.json
            if not data:
                return jsonify({"error": "No data provided"}), 400

            required_fields = ['rebocador', 'responsavel', 'dataAbertura', 'oficina', 
                             'manutencao', 'equipamento', 'descricaoFalha', 'servicoExecutado']
            
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

            service = get_service()
            order = service.create_service_order(data)
            
            return jsonify({
                "message": "Ordem de serviço criada com sucesso!",
                "order": order.to_dict(),
                "pdf_url": f"/api/service-orders/{order.id}/pdf",
                "excel_url": "/api/service-orders/excel"
            }), 201
        except Exception as e:
            print(f"Error creating service order: {str(e)}")
            return jsonify({"error": str(e)}), 400

    # Google Planilhas routes
    planilhas_controller = GooglePlanilhasController(db_planilhas)

    @app.route('/api/planilhas', methods=['GET'])
    def get_planilhas():
        return planilhas_controller.get_data()

    @app.route('/api/planilhas', methods=['POST'])
    def post_planilhas():
        return planilhas_controller.post_data()

    # File download routes
    @app.route('/api/service-orders/excel', methods=['GET'])
    def download_excel():
        try:
            service = get_service()
            excel_path = service.generate_excel()
            return send_file(
                excel_path,
                mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                as_attachment=True,
                download_name="service_orders.xlsx"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/api/service-orders/<int:order_id>/pdf', methods=['GET'])
    def download_pdf(order_id):
        try:
            service = get_service()
            pdf_path = service.generate_pdf(order_id)
            return send_file(
                pdf_path,
                mimetype="application/pdf",
                as_attachment=True,
                download_name=f"service_order_{order_id}.pdf"
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # React App routes
    @app.route('/sistemaCadastro', methods=['GET'])
    def serve_react_app():
        try:
            react_build_path = os.path.join(os.path.dirname(__file__), 'apps/service-order-system/frontend/build')
            if not os.path.exists(react_build_path):
                return jsonify({"error": "React build not found"}), 404
            return send_from_directory(react_build_path, 'index.html')
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/sistemaCadastro/<path:path>')
    def serve_react_static(path):
        try:
            react_build_path = os.path.join(os.path.dirname(__file__), 'apps/service-order-system/frontend/build')
            return send_from_directory(react_build_path, path)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
