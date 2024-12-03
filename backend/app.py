from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Produto
from controllers.routes import setup_routes
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

setup_routes(app, db.session)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
