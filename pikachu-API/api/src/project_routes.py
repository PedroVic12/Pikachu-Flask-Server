from flask import Blueprint, request, jsonify
from src.backend.controllers import ProjectController

project_api = Blueprint("project_api", __name__)

@project_api.route("/", methods=["GET"])
def get_projects():
    projects = ProjectController.get_all()
    return jsonify(projects)

@project_api.route("/<int:project_id>", methods=["GET"])
def get_project(project_id):
    project = ProjectController.get_by_id(project_id)
    if project:
        return jsonify(project.to_dict())
    return jsonify({"error": "Project not found"}), 404

@project_api.route("/", methods=["POST"])
def create_project():
    data = request.get_json()
    project = ProjectController.create(data)
    return jsonify(project), 201

@project_api.route("/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    data = request.get_json()
    project = ProjectController.update(project_id, data)
    if project:
        return jsonify(project)
    return jsonify({"error": "Project not found"}), 404

@project_api.route("/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    success = ProjectController.delete(project_id)
    if success:
        return jsonify({"message": "Project deleted"})
    return jsonify({"error": "Project not found"}), 404



ao vivo

