from flask import jsonify, request, send_file, send_from_directory
from apps.sistema_cadastro_manutencao.flask_app_cadastro.service_order import ServiceOrder
from apps.sistema_cadastro_manutencao.flask_app_cadastro.service_order_service import ServiceOrderService
import json
import os
from database.BancoSqlite import BancoSqlite
from database.sqlite_controller import SqliteController

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
    db_service_orders = SqliteController('./database/service_orders.db')
    db_service_orders.connect()
    print("Service Orders database connected successfully!")
except Exception as e:
    print(f"Error connecting to databases: {str(e)}")

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
            service = get_service()
            orders = service.get_all_service_orders()
            return jsonify([order.to_dict() for order in orders])
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
