from flask import Blueprint, request, jsonify
from src.backend.controllers import TaskController

task_api = Blueprint("task_api", __name__)

@task_api.route("/", methods=["GET"])
def get_tasks():
    tasks = TaskController.get_all()
    return jsonify(tasks)

@task_api.route("/<int:task_id>", methods=["GET"])
def get_task(task_id):
    task = TaskController.get_by_id(task_id)
    if task:
        return jsonify(task.to_dict())
    return jsonify({"error": "Task not found"}), 404

@task_api.route("/", methods=["POST"])
def create_task():
    data = request.get_json()
    task = TaskController.create(data)
    return jsonify(task), 201

@task_api.route("/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()
    task = TaskController.update(task_id, data)
    if task:
        return jsonify(task)
    return jsonify({"error": "Task not found"}), 404

@task_api.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    success = TaskController.delete(task_id)
    if success:
        return jsonify({"message": "Task deleted"})
    return jsonify({"error": "Task not found"}), 404



ao vivo

