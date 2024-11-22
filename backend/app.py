from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Produto
import os


"""
# Project Name

## Setup
npm install   # Frontend
pip install   # Backend

## API Routes
GET /api/resource
POST /api/resource
PUT /api/resource/:id
DELETE /api/resource/:id

## Main Features
Feature 1
Feature 2

## Deploy
bash
npm run build
python manage.py deploy
"""


app = Flask(__name__)
CORS(app)

# Configuração do SQLite
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'cardapio.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Criar todas as tabelas
with app.app_context():
    db.create_all()

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
