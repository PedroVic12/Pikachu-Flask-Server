#!/bin/bash

# Script para criar estrutura de projeto Flask + API REST + Frontend Bootstrap
PROJECT_NAME="flask_api_project"
ZIP_NAME="flask_project.zip"

echo "Criando projeto Flask API REST..."

# Criar estrutura de pastas
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

mkdir -p app/controllers
mkdir -p app/models
mkdir -p app/services
mkdir -p app/static/css
mkdir -p app/static/js
mkdir -p app/templates
mkdir -p app/utils
mkdir -p scripts

# Criar main.py corrigido
cat > main.py << 'EOF'
from flask import Flask, request, jsonify, render_template
from app.controllers.example_controller import ExampleController
from app.models.example_model import ExampleModel
import os
from pathlib import Path

app = Flask(__name__)

# Configurar caminho absoluto para templates
BASE_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = BASE_DIR / "app" / "templates"
app.template_folder = str(TEMPLATES_DIR)

# Configurações
app.config['SECRET_KEY'] = 'sua-chave-secreta-aqui'

# Inicializar controladores
example_controller = ExampleController()

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/api/examples', methods=['GET'])
def get_examples():
    """API: Buscar todos os exemplos"""
    return example_controller.get_all()

@app.route('/api/examples/<int:id>', methods=['GET'])
def get_example(id):
    """API: Buscar exemplo por ID"""
    return example_controller.get_by_id(id)

@app.route('/api/examples', methods=['POST'])
def create_example():
    """API: Criar novo exemplo"""
    data = request.get_json()
    return example_controller.create(data)

@app.route('/api/examples/<int:id>', methods=['PUT'])
def update_example(id):
    """API: Atualizar exemplo"""
    data = request.get_json()
    return example_controller.update(id, data)

@app.route('/api/examples/<int:id>', methods=['DELETE'])
def delete_example(id):
    """API: Deletar exemplo"""
    return example_controller.delete(id)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de health check"""
    return jsonify({"status": "healthy", "message": "API está funcionando"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
EOF

# Criar cli.py (mantido igual)
cat > cli.py << 'EOF'
#!/usr/bin/env python3
import argparse
import os
import sys
from pathlib import Path

def create_controller(name):
    """Cria um novo controller"""
    controller_name = f"{name.lower()}_controller.py"
    controller_path = f"app/controllers/{controller_name}"
    
    if os.path.exists(controller_path):
        print(f"Controller {controller_name} já existe!")
        return False
    
    content = f'''from flask import jsonify
from app.models.{name.lower()}_model import {name.capitalize()}Model

class {name.capitalize()}Controller:
    def __init__(self):
        self.model = {name.capitalize()}Model()

    def get_all(self):
        try:
            data = self.model.find_all()
            return jsonify({{"success": True, "data": data, "count": len(data)}})
        except Exception as e:
            return jsonify({{"success": False, "error": str(e)}}), 500

    def get_by_id(self, id):
        try:
            item = self.model.find_by_id(id)
            if item:
                return jsonify({{"success": True, "data": item}})
            return jsonify({{"success": False, "error": "Item não encontrado"}}), 404
        except Exception as e:
            return jsonify({{"success": False, "error": str(e)}}), 500

    def create(self, data):
        try:
            # Validar dados aqui
            new_id = self.model.create(data)
            return jsonify({{"success": True, "id": new_id, "message": "Item criado com sucesso"}}), 201
        except Exception as e:
            return jsonify({{"success": False, "error": str(e)}}), 500

    def update(self, id, data):
        try:
            updated = self.model.update(id, data)
            if updated:
                return jsonify({{"success": True, "message": "Item atualizado com sucesso"}})
            return jsonify({{"success": False, "error": "Item não encontrado"}}), 404
        except Exception as e:
            return jsonify({{"success": False, "error": str(e)}}), 500

    def delete(self, id):
        try:
            deleted = self.model.delete(id)
            if deleted:
                return jsonify({{"success": True, "message": "Item deletado com sucesso"}})
            return jsonify({{"success": False, "error": "Item não encontrado"}}), 404
        except Exception as e:
            return jsonify({{"success": False, "error": str(e)}}), 500
'''
    
    with open(controller_path, 'w') as f:
        f.write(content)
    
    print(f"Controller criado: {controller_path}")
    return True

def create_model(name):
    """Cria um novo model"""
    model_name = f"{name.lower()}_model.py"
    model_path = f"app/models/{model_name}"
    
    if os.path.exists(model_path):
        print(f"Model {model_name} já existe!")
        return False
    
    content = f'''import sqlite3
from pathlib import Path

class {name.capitalize()}Model:
    def __init__(self):
        self.db_path = "database.db"
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS {name.lower()}s (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

    def find_all(self):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM {name.lower()}s")
        rows = cursor.fetchall()
        conn.close()
        
        # Converter para lista de dicionários
        columns = ['id', 'name', 'description', 'created_at', 'updated_at']
        return [dict(zip(columns, row)) for row in rows]

    def find_by_id(self, id):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM {name.lower()}s WHERE id = ?", (id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            columns = ['id', 'name', 'description', 'created_at', 'updated_at']
            return dict(zip(columns, row))
        return None

    def create(self, data):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            f"INSERT INTO {name.lower()}s (name, description) VALUES (?, ?)",
            (data.get('name'), data.get('description'))
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return new_id

    def update(self, id, data):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            f"UPDATE {name.lower()}s SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (data.get('name'), data.get('description'), id)
        )
        affected = cursor.rowcount
        conn.commit()
        conn.close()
        return affected > 0

    def delete(self, id):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(f"DELETE FROM {name.lower()}s WHERE id = ?", (id,))
        affected = cursor.rowcount
        conn.commit()
        conn.close()
        return affected > 0
'''
    
    with open(model_path, 'w') as f:
        f.write(content)
    
    print(f"Model criado: {model_path}")
    return True

def main():
    parser = argparse.ArgumentParser(description="CLI para gerenciar projeto Flask")
    subparsers = parser.add_subparsers(dest='command', help='Comandos disponíveis')

    # Comando para criar controller
    parser_controller = subparsers.add_parser('create-controller', help='Criar um novo controller')
    parser_controller.add_argument('name', help='Nome do controller (ex: user, product)')

    # Comando para criar model
    parser_model = subparsers.add_parser('create-model', help='Criar um novo model')
    parser_model.add_argument('name', help='Nome do model (ex: user, product)')

    args = parser.parse_args()

    if args.command == 'create-controller':
        create_controller(args.name)
    elif args.command == 'create-model':
        create_model(args.name)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
EOF

# Criar controller exemplo (mantido igual)
cat > app/controllers/example_controller.py << 'EOF'
from flask import jsonify
from app.models.example_model import ExampleModel

class ExampleController:
    def __init__(self):
        self.model = ExampleModel()

    def get_all(self):
        try:
            data = self.model.find_all()
            return jsonify({"success": True, "data": data, "count": len(data)})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    def get_by_id(self, id):
        try:
            item = self.model.find_by_id(id)
            if item:
                return jsonify({"success": True, "data": item})
            return jsonify({"success": False, "error": "Item não encontrado"}), 404
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    def create(self, data):
        try:
            # Validar dados aqui
            if not data.get('name'):
                return jsonify({"success": False, "error": "Nome é obrigatório"}), 400
            
            new_id = self.model.create(data)
            return jsonify({"success": True, "id": new_id, "message": "Item criado com sucesso"}), 201
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    def update(self, id, data):
        try:
            updated = self.model.update(id, data)
            if updated:
                return jsonify({"success": True, "message": "Item atualizado com sucesso"})
            return jsonify({"success": False, "error": "Item não encontrado"}), 404
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    def delete(self, id):
        try:
            deleted = self.model.delete(id)
            if deleted:
                return jsonify({"success": True, "message": "Item deletado com sucesso"})
            return jsonify({"success": False, "error": "Item não encontrado"}), 404
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500
EOF

# Criar model exemplo (mantido igual)
cat > app/models/example_model.py << 'EOF'
import sqlite3
from pathlib import Path

class ExampleModel:
    def __init__(self):
        self.db_path = "database.db"
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS examples (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

    def find_all(self):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM examples")
        rows = cursor.fetchall()
        conn.close()
        
        # Converter para lista de dicionários
        columns = ['id', 'name', 'description', 'created_at', 'updated_at']
        return [dict(zip(columns, row)) for row in rows]

    def find_by_id(self, id):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM examples WHERE id = ?", (id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            columns = ['id', 'name', 'description', 'created_at', 'updated_at']
            return dict(zip(columns, row))
        return None

    def create(self, data):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO examples (name, description) VALUES (?, ?)",
            (data.get('name'), data.get('description'))
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return new_id

    def update(self, id, data):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE examples SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (data.get('name'), data.get('description'), id)
        )
        affected = cursor.rowcount
        conn.commit()
        conn.close()
        return affected > 0

    def delete(self, id):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM examples WHERE id = ?", (id,))
        affected = cursor.rowcount
        conn.commit()
        conn.close()
        return affected > 0
EOF

# Criar index.html com Bootstrap (mantido igual)
cat > app/templates/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flask API Dashboard</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .card-hover:hover {
            transform: translateY(-5px);
            transition: transform 0.3s ease;
        }
        .api-status {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
        }
        .status-healthy {
            background-color: #28a745;
        }
        .status-unhealthy {
            background-color: #dc3545;
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="#">
                <i class="fas fa-server me-2"></i>Flask PIKACHU  API Server - by Pedro Victor Veras
            </a>
        </div>
    </nav>

    <div class="container mt-4">
        <div class="row">
            <div class="col-md-8">
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-list me-2"></i>Gerenciar Exemplos
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-3">
                            <button class="btn btn-success" onclick="loadExamples()">
                                <i class="fas fa-sync me-1"></i>Carregar
                            </button>
                            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createModal">
                                <i class="fas fa-plus me-1"></i>Novo
                            </button>
                        </div>
                        
                        <div id="examplesList" class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nome</th>
                                        <th>Descrição</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="examplesTableBody">
                                    <tr>
                                        <td colspan="4" class="text-center text-muted">
                                            Clique em "Carregar" para ver os dados
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-4">
                <div class="card mb-4 card-hover">
                    <div class="card-header bg-success text-white">
                        <h6 class="mb-0">
                            <i class="fas fa-heartbeat me-2"></i>Status da API
                        </h6>
                    </div>
                    <div class="card-body">
                        <div id="apiStatus">
                            <span class="api-status status-unhealthy"></span>
                            <span>Verificando...</span>
                        </div>
                    </div>
                </div>

                <div class="card mb-4 card-hover">
                    <div class="card-header bg-info text-white">
                        <h6 class="mb-0">
                            <i class="fas fa-info-circle me-2"></i>Informações
                        </h6>
                    </div>
                    <div class="card-body">
                        <p><strong>Endpoints disponíveis:</strong></p>
                        <ul class="list-unstyled">
                            <li><code>GET /api/examples</code></li>
                            <li><code>POST /api/examples</code></li>
                            <li><code>GET /api/examples/&lt;id&gt;</code></li>
                            <li><code>PUT /api/examples/&lt;id&gt;</code></li>
                            <li><code>DELETE /api/examples/&lt;id&gt;</code></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para criar exemplo -->
    <div class="modal fade" id="createModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Criar Novo Exemplo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="createForm">
                        <div class="mb-3">
                            <label for="name" class="form-label">Nome *</label>
                            <input type="text" class="form-control" id="name" required>
                        </div>
                        <div class="mb-3">
                            <label for="description" class="form-label">Descrição</label>
                            <textarea class="form-control" id="description" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="createExample()">Criar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // Verificar status da API
        async function checkApiStatus() {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                
                const statusElement = document.getElementById('apiStatus');
                if (data.status === 'healthy') {
                    statusElement.innerHTML = '<span class="api-status status-healthy"></span> API Online e Funcionando';
                } else {
                    statusElement.innerHTML = '<span class="api-status status-unhealthy"></span> API Offline';
                }
            } catch (error) {
                document.getElementById('apiStatus').innerHTML = 
                    '<span class="api-status status-unhealthy"></span> Erro ao conectar com API';
            }
        }

        // Carregar exemplos
        async function loadExamples() {
            try {
                const response = await fetch('/api/examples');
                const data = await response.json();
                
                const tbody = document.getElementById('examplesTableBody');
                if (data.success && data.data.length > 0) {
                    tbody.innerHTML = data.data.map(item => `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.name}</td>
                            <td>${item.description || '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-warning me-1" onclick="editExample(${item.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteExample(${item.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum exemplo encontrado</td></tr>';
                }
            } catch (error) {
                alert('Erro ao carregar exemplos: ' + error.message);
            }
        }

        // Criar exemplo
        async function createExample() {
            const name = document.getElementById('name').value;
            const description = document.getElementById('description').value;
            
            if (!name) {
                alert('Nome é obrigatório!');
                return;
            }

            try {
                const response = await fetch('/api/examples', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, description })
                });
                
                const data = await response.json();
                if (data.success) {
                    alert('Exemplo criado com sucesso!');
                    document.getElementById('createForm').reset();
                    bootstrap.Modal.getInstance(document.getElementById('createModal')).hide();
                    loadExamples();
                } else {
                    alert('Erro: ' + data.error);
                }
            } catch (error) {
                alert('Erro ao criar exemplo: ' + error.message);
            }
        }

        // Deletar exemplo
        async function deleteExample(id) {
            if (!confirm('Tem certeza que deseja deletar este exemplo?')) {
                return;
            }

            try {
                const response = await fetch(`/api/examples/${id}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                if (data.success) {
                    alert('Exemplo deletado com sucesso!');
                    loadExamples();
                } else {
                    alert('Erro: ' + data.error);
                }
            } catch (error) {
                alert('Erro ao deletar exemplo: ' + error.message);
            }
        }

        // Inicializar
        document.addEventListener('DOMContentLoaded', function() {
            checkApiStatus();
            // Verificar status a cada 30 segundos
            setInterval(checkApiStatus, 30000);
        });
    </script>
</body>
</html>
EOF

# Criar requirements.txt
cat > requirements.txt << 'EOF'
Flask==2.3.3
Werkzeug==2.3.7
Jinja2==3.1.2
EOF

# Criar install.sh
cat > install.sh << 'EOF'
#!/bin/bash
echo "Instalando dependências do projeto..."
pip install -r requirements.txt
echo "✅ Dependências instaladas com sucesso!"
EOF

# Criar run_dev.sh
cat > run_dev.sh << 'EOF'
#!/bin/bash
echo "Iniciando servidor de desenvolvimento..."
python main.py
EOF

echo "Projeto concluido!"
