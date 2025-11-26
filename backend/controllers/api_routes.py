from flask import Blueprint, jsonify, request
from backend.models import db, User, Task, Project, KanbanItem
import requests
import json

# Cria o Blueprint principal para a API
api_bp = Blueprint('api_bp', __name__)

# --- Lógica do Controller (simplificada aqui para auto-contenção) ---

class ApiController:
    @staticmethod
    def get_all(model):
        return [item.to_dict() for item in model.query.all()]

    @staticmethod
    def get_by_id(model, item_id):
        return model.query.get(item_id)

    @staticmethod
    def create(model, data):
        item = model(**data)
        db.session.add(item)
        db.session.commit()
        return item

    @staticmethod
    def update(model, item_id, data):
        item = model.query.get(item_id)
        if item:
            for key, value in data.items():
                setattr(item, key, value)
            db.session.commit()
        return item

    @staticmethod
    def delete(model, item_id):
        item = model.query.get(item_id)
        if item:
            db.session.delete(item)
            db.session.commit()
            return True
        return False

# --- Rotas para /api/users ---
@api_bp.route("/users", methods=["GET"])
def get_users():
    return jsonify(ApiController.get_all(User))

@api_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = ApiController.get_by_id(User, user_id)
    return jsonify(user.to_dict()) if user else (jsonify({"error": "User not found"}), 404)

@api_bp.route("/users", methods=["POST"])
def create_user():
    user = ApiController.create(User, request.get_json())
    return jsonify(user.to_dict()), 201

# --- Rotas para /api/tasks ---
@api_bp.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(ApiController.get_all(Task))

@api_bp.route("/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id):
    task = ApiController.get_by_id(Task, task_id)
    return jsonify(task.to_dict()) if task else (jsonify({"error": "Task not found"}), 404)

@api_bp.route("/tasks", methods=["POST"])
def create_task():
    task = ApiController.create(Task, request.get_json())
    return jsonify(task.to_dict()), 201

# --- Rotas para /api/projects ---
@api_bp.route("/projects", methods=["GET"])
def get_projects():
    return jsonify(ApiController.get_all(Project))

@api_bp.route("/projects/<int:project_id>", methods=["GET"])
def get_project(project_id):
    project = ApiController.get_by_id(Project, project_id)
    return jsonify(project.to_dict()) if project else (jsonify({"error": "Project not found"}), 404)

@api_bp.route("/projects", methods=["POST"])
def create_project():
    project = ApiController.create(Project, request.get_json())
    return jsonify(project.to_dict()), 201

# --- Rotas do Astro System ---

NASA_API_KEY = "DEMO_KEY" # Usando a chave de demonstração

@api_bp.route('/astro/nasa/apod', methods=['GET'])
def get_nasa_apod():
    """Obtém a Foto Astronômica do Dia da NASA"""
    try:
        url = f"https://api.nasa.gov/planetary/apod?api_key={NASA_API_KEY}"
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/astro/pokemon/<pokemon_name>', methods=['GET'])
def get_pokemon(pokemon_name):
    """Obtém informações de um Pokémon específico"""
    try:
        url = f"https://pokeapi.co/api/v2/pokemon/{pokemon_name.lower()}"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        simplified_data = { "id": data["id"], "name": data["name"], "height": data["height"], "weight": data["weight"], "types": [t["type"]["name"] for t in data["types"]], "sprite": data["sprites"]["front_default"] }
        return jsonify(simplified_data)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Pokémon não encontrado"}), 404

# --- Rotas para /api/kanban-items ---

@api_bp.route("/kanban-items", methods=["GET"])
def get_kanban_items():
    """Retorna todos os itens do Kanban."""
    return jsonify(ApiController.get_all(KanbanItem))

@api_bp.route("/kanban-items", methods=["POST"])
def create_kanban_item():
    """Cria um novo item no Kanban."""
    data = request.get_json()
    # Garante que 'files' seja uma string JSON
    if 'files' in data and isinstance(data['files'], list):
        data['files'] = json.dumps(data['files'])
    item = ApiController.create(KanbanItem, data)
    return jsonify(item.to_dict()), 201

@api_bp.route("/kanban-items/<int:item_id>", methods=["PUT"])
def update_kanban_item(item_id):
    """Atualiza um item do Kanban."""
    data = request.get_json()
    # Garante que 'files' seja uma string JSON
    if 'files' in data and isinstance(data['files'], list):
        data['files'] = json.dumps(data['files'])
    item = ApiController.update(KanbanItem, item_id, data)
    return jsonify(item.to_dict()) if item else (jsonify({"error": "Item not found"}), 404)

@api_bp.route("/kanban-items/<int:item_id>", methods=["DELETE"])
def delete_kanban_item(item_id):
    """Deleta um item do Kanban."""
    success = ApiController.delete(KanbanItem, item_id)
    return jsonify({"success": success}) if success else (jsonify({"error": "Item not found"}), 404)
