from flask import Blueprint

api_bp = Blueprint("api", __name__)

# Import and register blueprints for each entity
from .user_routes import user_api
from .task_routes import task_api
from .project_routes import project_api

api_bp.register_blueprint(user_api, url_prefix=
'/users')
api_bp.register_blueprint(task_api, url_prefix=
'/tasks')
api_bp.register_blueprint(project_api, url_prefix=
'/projects')
