from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.service_order import Base, ServiceOrder
from services.service_order_service import ServiceOrderService
from constants import (
    MANUTENCAO_CHOICES,
    OFICINA_CHOICES,
    EQUIPAMENTO_CHOICES,
    REBOCADOR_CHOICES
)
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

class DatabaseInitializer:
    def __init__(self, engine, session_maker):
        self.engine = engine
        self.SessionLocal = session_maker

    def initialize_database(self):
        # Create database directory if it doesn't exist
        os.makedirs("database", exist_ok=True)
        os.makedirs("output", exist_ok=True)
        
        # Create tables
        Base.metadata.create_all(self.engine)
        
        # Add sample data
        session = self.SessionLocal()
        try:
            # Check if we already have data
            if session.query(ServiceOrder).first() is None:
                self.create_sample_data(session)
            session.commit()
        except Exception as e:
            print(f"Error initializing database: {e}")
            session.rollback()
        finally:
            session.close()

    def create_sample_data(self, session):
        sample_orders = [
            {
                "rebocador": "RB-01",
                "responsavel": "João Silva",
                "data_abertura": datetime.now(),
                "oficina": "MECÂNICA",
                "manutencao": "PREVENTIVA",
                "equipamento": "MOTOR",
                "descricao_falha": "Manutenção preventiva do motor principal",
                "servico_executado": "Troca de óleo e filtros",
                "finalizado": True,
                "fora_operacao": False
            }
        ]

        for order_data in sample_orders:
            order = ServiceOrder(**order_data)
            session.add(order)

# Database setup
DATABASE_URL = "sqlite:///database/service_orders.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def get_service():
    session = SessionLocal()
    try:
        return ServiceOrderService(session)
    finally:
        session.close()

@app.route("/api/choices", methods=["GET"])
def get_choices():
    return jsonify({
        "manutencao": MANUTENCAO_CHOICES,
        "oficina": OFICINA_CHOICES,
        "equipamento": EQUIPAMENTO_CHOICES,
        "rebocador": REBOCADOR_CHOICES
    })

@app.route("/api/service-orders", methods=["POST"])
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

@app.route("/api/service-orders", methods=["GET"])
def get_service_orders():
    try:
        service = get_service()
        orders = service.get_all_service_orders()
        return jsonify([order.to_dict() for order in orders])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/service-orders/excel", methods=["GET"])
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

@app.route("/api/service-orders/<int:order_id>/pdf", methods=["GET"])
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

if __name__ == "__main__":
    # Initialize database
    initializer = DatabaseInitializer(engine, SessionLocal)
    initializer.initialize_database()
    
    # Run the Flask app
    app.run(debug=True)
