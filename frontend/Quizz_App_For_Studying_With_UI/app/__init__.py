from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "your_super_secret_key"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"

    print("Configuring the Flask application...")
    print("PROJETO QUIZZ APP FOR STUDYING WITH AI")

    db.init_app(app)

    with app.app_context():
        # Importar e registrar as rotas (blueprints)
        from .routes import main as main_blueprint

        app.register_blueprint(main_blueprint)

        # Criar as tabelas do banco de dados se não existirem
        db.create_all()

    return app
