import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from src.models.user import db
from src.routes.user import user_bp
from src.routes.astro import astro_bp

PikachuWebServer = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
PikachuWebServer.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

PikachuWebServer.register_blueprint(user_bp, url_prefix='/api')
PikachuWebServer.register_blueprint(astro_bp, url_prefix='/api')

# uncomment if you need to use database
PikachuWebServer.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
PikachuWebServer.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(PikachuWebServer)
with PikachuWebServer.app_context():
    db.create_all()

@PikachuWebServer.route('/', defaults={'path': ''})
@PikachuWebServer.route('/<path:path>')
def serve(path):
    static_folder_path = PikachuWebServer.static_folder
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


if __name__ == '__main__':
    PikachuWebServer.run(host='0.0.0.0', port=5000, debug=True)
