from typing import List
import pandas as pd
from datetime import datetime
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session
from models.service_order import ServiceOrder
import os

class ServiceOrderService:
    def __init__(self, db_session: Session):
        self._session = db_session
        # Create output directory if it doesn't exist
        os.makedirs("output", exist_ok=True)

    def create_service_order(self, order_data: dict) -> ServiceOrder:
        try:
            # Map frontend field names to database field names
            mapped_data = {
                'rebocador': order_data['rebocador'],
                'responsavel': order_data['responsavel'],
                'data_abertura': datetime.strptime(order_data['dataAbertura'], '%d/%m/%Y'),
                'oficina': order_data['oficina'],
                'manutencao': order_data['manutencao'],
                'equipamento': order_data['equipamento'],
                'descricao_falha': order_data['descricaoFalha'],
                'servico_executado': order_data['servicoExecutado'],
                'finalizado': order_data.get('finalizado', False),
                'fora_operacao': order_data.get('foraOperacao', False)
            }

            service_order = ServiceOrder(**mapped_data)
            self._session.add(service_order)
            self._session.commit()
            
            # Generate files after successful database save
            self.generate_excel()
            self.generate_pdf(service_order.id)
            
            return service_order
        except Exception as e:
            self._session.rollback()
            print(f"Error creating service order: {str(e)}")
            raise

    def get_all_service_orders(self) -> List[ServiceOrder]:
        return self._session.query(ServiceOrder).all()

    def generate_excel(self, filename: str = "service_orders.xlsx") -> str:
        orders = self.get_all_service_orders()
        df = pd.DataFrame([{
            'ID': order.id,
            'Rebocador': order.rebocador,
            'Responsável': order.responsavel,
            'Data Abertura': order.data_abertura.strftime('%d/%m/%Y'),
            'Oficina': order.oficina,
            'Manutenção': order.manutencao,
            'Equipamento': order.equipamento,
            'Descrição da Falha': order.descricao_falha,
            'Serviço Executado': order.servico_executado,
            'Finalizado': 'Sim' if order.finalizado else 'Não',
            'Fora de Operação': 'Sim' if order.fora_operacao else 'Não'
        } for order in orders])
        
        excel_path = f"output/{filename}"
        df.to_excel(excel_path, index=False)
        return excel_path

    def generate_pdf(self, order_id: int) -> str:
        order = self._session.query(ServiceOrder).filter_by(id=order_id).first()
        if not order:
            raise ValueError("Service order not found")

        pdf_path = f"output/service_order_{order_id}.pdf"
        self._create_pdf(order, pdf_path)
        return pdf_path

    def _create_pdf(self, order: ServiceOrder, filename: str):
        c = canvas.Canvas(filename)
        y = 800  # Starting y position
        
        # Add header
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, y, f"Ordem de Serviço #{order.id}")
        y -= 30

        # Add order details
        c.setFont("Helvetica", 12)
        details = [
            f"Rebocador: {order.rebocador}",
            f"Responsável: {order.responsavel}",
            f"Data Abertura: {order.data_abertura.strftime('%d/%m/%Y')}",
            f"Oficina: {order.oficina}",
            f"Manutenção: {order.manutencao}",
            f"Equipamento: {order.equipamento}",
            f"Descrição da Falha: {order.descricao_falha}",
            f"Serviço Executado: {order.servico_executado}",
            f"Finalizado: {'Sim' if order.finalizado else 'Não'}",
            f"Fora de Operação: {'Sim' if order.fora_operacao else 'Não'}"
        ]

        for detail in details:
            c.drawString(50, y, detail)
            y -= 20

        c.save()
