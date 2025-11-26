from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from models import db, Produto
from controllers.routes import setup_routes
from backend.controllers.floricultura_routes import floricultura_bp
from backend.controllers.api_routes import api_bp
from backend.controllers.ia_routes import ia_bp
import os
import json


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


app = Flask(__name__, static_folder='static')
CORS(app)

# Configuração do SQLite
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'cardapio.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Criar todas as tabelas
with app.app_context():
    db.create_all()

# Registra os Blueprints da API
setup_routes(app, db.session)
app.register_blueprint(floricultura_bp, url_prefix='/floricultura')
app.register_blueprint(api_bp, url_prefix='/api')
app.register_blueprint(ia_bp, url_prefix='/api/ia')

# Rota para servir o Frontend Next.js
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_next_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Aponta para o index.html dentro da estrutura do Next.js
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
