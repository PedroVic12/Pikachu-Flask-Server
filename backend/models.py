from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Produto(db.Model):
    __tablename__ = 'produtos'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    precos = db.Column(db.String(500), nullable=False)  # Stored as JSON string
    ingredientes = db.Column(db.String(500), nullable=False)  # Stored as JSON string
    descricao = db.Column(db.Text)
    categoria = db.Column(db.String(50), nullable=False)
    adicionais = db.Column(db.String(500))  # Stored as JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'precos': json.loads(self.precos),
            'ingredientes': json.loads(self.ingredientes),
            'descricao': self.descricao,
            'categoria': self.categoria,
            'adicionais': json.loads(self.adicionais) if self.adicionais else [],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @staticmethod
    def from_dict(data):
        return Produto(
            nome=data['nome'],
            precos=json.dumps(data['precos']),
            ingredientes=json.dumps(data['ingredientes']),
            descricao=data.get('descricao', ''),
            categoria=data['categoria'],
            adicionais=json.dumps(data.get('adicionais', []))
        )
