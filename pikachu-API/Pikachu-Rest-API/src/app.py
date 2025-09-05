import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db

class PikachuWebServer:
    def __init__(self):
        self.app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
        self.configure_app()
        self.setup_database()
        self.setup_routes()
        
    def configure_app(self):
        """Configura as configurações básicas da aplicação Flask"""
        self.app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'
        self.app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        # Habilita CORS para todas as rotas
        CORS(self.app)
        
    def setup_database(self):
        """Configura e inicializa o banco de dados"""
        db.init_app(self.app)
        with self.app.app_context():
            db.create_all()
    
    def setup_routes(self):
        """Configura todas as rotas da aplicação"""
        # Importa e registra os blueprints
        from src.routes.user import user_bp
        from src.routes.astro import astro_bp
        from src.routes.presentations import presentations_bp
        
        self.app.register_blueprint(user_bp, url_prefix='/api')
        self.app.register_blueprint(astro_bp, url_prefix='/api')
        self.app.register_blueprint(presentations_bp, url_prefix='/api')
        
        # Rota para servir arquivos estáticos
        @self.app.route('/', defaults={'path': ''})
        @self.app.route('/<path:path>')
        def serve(path):
            static_folder_path = self.app.static_folder
            if static_folder_path is None:
                return "Static folder not configured", 404

            if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
                return send_from_directory(static_folder_path, path)
            else:
                index_path = os.path.join(static_folder_path, 'index.html')
                if os.path.exists(index_path):
                    return send_from_directory(static_folder_path, 'index.html')
                else:
                    return "index.html not found", 404
    
    def run(self, host='0.0.0.0', port=5000, debug=True):
        """Executa a aplicação Flask"""
        self.app.run(host=host, port=port, debug=debug)

# Instância global da aplicação
server = PikachuWebServer()

if __name__ == '__main__':
    server.run()

