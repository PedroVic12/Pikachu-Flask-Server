from flask import Blueprint, request, jsonify
from src.backend.controllers import UserController

user_api = Blueprint("user_api", __name__)

@user_api.route("/", methods=["GET"])
def get_users():
    users = UserController.get_all()
    return jsonify(users)

@user_api.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = UserController.get_by_id(user_id)
    if user:
        return jsonify(user.to_dict())
    return jsonify({"error": "User not found"}), 404

@user_api.route("/", methods=["POST"])
def create_user():
    data = request.get_json()
    user = UserController.create(data)
    return jsonify(user), 201

@user_api.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    user = UserController.update(user_id, data)
    if user:
        return jsonify(user)
    return jsonify({"error": "User not found"}), 404

@user_api.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    success = UserController.delete(user_id)
    if success:
        return jsonify({"message": "User deleted"})
    return jsonify({"error": "User not found"}), 404



ao vivo

