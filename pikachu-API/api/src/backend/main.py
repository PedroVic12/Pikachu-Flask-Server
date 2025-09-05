import os
from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# --- Configuração ---

# Obter o caminho absoluto para o diretório do backend
basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__,
            static_folder='../frontend/dist', # Pasta dos arquivos estáticos do React
            template_folder='../frontend/dist') # Pasta do index.html do React

# Configuração do CORS para permitir requisições do frontend em desenvolvimento
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Configuração do Banco de Dados SQLite
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Criar pasta 'instance' se não existir
instance_path = os.path.join(basedir, 'instance')
if not os.path.exists(instance_path):
    os.makedirs(instance_path)

db = SQLAlchemy(app)

# --- Modelos do Banco de Dados ---

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    tasks = db.relationship('Task', backref='category', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "name": self.name}

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    pomodoro_time_spent = db.Column(db.Integer, default=0) # Tempo em segundos
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "completed": self.completed,
            "pomodoro_time_spent": self.pomodoro_time_spent,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else "N/A"
        }

# --- Rotas da API ---

# API: Obter todas as categorias
@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([category.to_dict() for category in categories])

# API: Criar uma nova categoria
@app.route('/api/categories', methods=['POST'])
def create_category():
    data = request.get_json()
    if not data or not 'name' in data or not data['name'].strip():
        return jsonify({"error": "Nome da categoria é obrigatório"}), 400
    
    existing_category = Category.query.filter_by(name=data['name']).first()
    if existing_category:
        return jsonify({"error": "Categoria já existe"}), 409

    new_category = Category(name=data['name'])
    db.session.add(new_category)
    db.session.commit()
    return jsonify(new_category.to_dict()), 201

# API: Obter todas as tarefas
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

# API: Criar uma nova tarefa
@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    if not data or not 'title' in data or not 'category_id' in data:
        return jsonify({"error": "Título e ID da categoria são obrigatórios"}), 400
    
    category = Category.query.get(data['category_id'])
    if not category:
        return jsonify({"error": "Categoria não encontrada"}), 404

    new_task = Task(title=data['title'], category_id=data['category_id'])
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

# API: Atualizar uma tarefa (status, tempo pomodoro)
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()

    if 'completed' in data:
        task.completed = data['completed']
    
    if 'pomodoro_time_spent' in data:
        task.pomodoro_time_spent = data['pomodoro_time_spent']

    db.session.commit()
    return jsonify(task.to_dict())

# API: Deletar uma tarefa
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"success": True, "message": "Tarefa deletada"})

# --- Rota para servir o App React ---
# Esta rota serve o index.html principal do React para qualquer rota que não seja da API.
# Isso permite que o React controle a navegação no frontend.
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.template_folder, 'index.html')


# --- Execução ---
if __name__ == '__main__':
    with app.app_context():
        # Cria as tabelas do banco de dados se não existirem
        db.create_all()
        # Cria uma categoria 'Geral' se nenhuma existir
        if not Category.query.first():
            default_category = Category(name='Geral')
            db.session.add(default_category)
            db.session.commit()
            
    app.run(debug=True, port=5000)
