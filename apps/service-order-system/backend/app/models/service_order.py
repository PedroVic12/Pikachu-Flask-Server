from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

@dataclass
class ServiceOrder(Base):
    __tablename__ = 'service_orders'

    id = Column(Integer, primary_key=True)
    rebocador = Column(String(100), nullable=False)
    responsavel = Column(String(100), nullable=False)
    data_abertura = Column(DateTime, default=datetime.utcnow)
    oficina = Column(String(100), nullable=False)
    manutencao = Column(String(100), nullable=False)
    equipamento = Column(String(100), nullable=False)
    descricao_falha = Column(String(500), nullable=False)
    servico_executado = Column(String(500), nullable=False)
    finalizado = Column(Boolean, default=False)
    fora_operacao = Column(Boolean, default=False)

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'rebocador': self.rebocador,
            'responsavel': self.responsavel,
            'data_abertura': self.data_abertura.isoformat() if self.data_abertura else None,
            'oficina': self.oficina,
            'manutencao': self.manutencao,
            'equipamento': self.equipamento,
            'descricao_falha': self.descricao_falha,
            'servico_executado': self.servico_executado,
            'finalizado': self.finalizado,
            'fora_operacao': self.fora_operacao
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ServiceOrder':
        return cls(**data)
