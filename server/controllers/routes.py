from flask import jsonify, request, send_file, send_from_directory
from apps.sistema_cadastro_manutencao.backend.app.models.service_order import ServiceOrder
from apps.sistema_cadastro_manutencao.backend.app.services.service_order_service  import ServiceOrderService
import json
import os


def setup_routes(app, session_local):
    # Helper function to get service
    def get_service():
        session = session_local()
        try:
            return ServiceOrderService(session)
        finally:
            session.close()

    # Existing product routes
    @app.route('/produtos', methods=['GET'])
    def listar_produtos():
        produtos = Produto.query.all()
        return jsonify([produto.to_dict() for produto in produtos])

    @app.route('/produtos/<int:id>', methods=['GET'])
    def obter_produto(id):
        produto = Produto.query.get_or_404(id)
        return jsonify(produto.to_dict())

    @app.route('/produtos', methods=['POST'])
    def criar_produto():
        data = request.get_json()
        try:
            novo_produto = Produto.from_dict(data)
            db.session.add(novo_produto)
            db.session.commit()
            return jsonify(novo_produto.to_dict()), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/produtos/<int:id>', methods=['PUT'])
    def atualizar_produto(id):
        produto = Produto.query.get_or_404(id)
        data = request.get_json()
        try:
            for key, value in data.items():
                if key in ['precos', 'ingredientes', 'adicionais']:
                    setattr(produto, key, json.dumps(value))
                else:
                    setattr(produto, key, value)
            db.session.commit()
            return jsonify(produto.to_dict())
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/produtos/<int:id>', methods=['DELETE'])
    def deletar_produto(id):
        produto = Produto.query.get_or_404(id)
        try:
            db.session.delete(produto)
            db.session.commit()
            return '', 204
        except Exception as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/produtos/categoria/<categoria>', methods=['GET'])
    def listar_por_categoria(categoria):
        produtos = Produto.query.filter_by(categoria=categoria).all()
        return jsonify([produto.to_dict() for produto in produtos])

    # Service Order routes
    @app.route('/api/choices', methods=['GET'])
    def get_choices():
        return jsonify({
            "manutencao": MANUTENCAO_CHOICES,
            "oficina": OFICINA_CHOICES,
            "equipamento": EQUIPAMENTO_CHOICES,
            "rebocador": REBOCADOR_CHOICES
        })

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

    @app.route('/api/service-orders', methods=['GET'])
    def get_service_orders():
        try:
            service = get_service()
            orders = service.get_all_service_orders()
            return jsonify([order.to_dict() for order in orders])
        except Exception as e:
            return jsonify({"error": str(e)}), 500

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

    # Serve React App
    @app.route('/sistemaCadastro', methods=['GET'])
    def serve_react_app():
        react_build_path = os.path.join(os.path.dirname(__file__), '../../apps/service-order-system/frontend/build')
        return send_from_directory(react_build_path, 'index.html')

    # Serve static files
    @app.route('/sistemaCadastro/static/<path:filename>')
    def serve_static_files(filename):
        react_build_path = os.path.join(os.path.dirname(__file__), '../../apps/service-order-system/frontend/build/static')
        return send_from_directory(react_build_path, filename)
