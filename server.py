from flask import Flask
from routes import setup_routes
from database.BancoSqlite import BancoSqlite

class FlaskServerApp:
    def __init__(self, db_name):
        self.app = Flask(__name__)
        self.db = BancoSqlite(db_name)
        # Create tables if they don't exist
        self.db.criar_tabelas()

    def run(self, host='0.0.0.0', port=5000):
        # Setup routes with database connection
        setup_routes(self.app, self.db)
        # Run the Flask app
        self.app.run(host=host, port=port, debug=True)

if __name__ == '__main__':
    server = FlaskServerApp(db_name='cardapio.db')
    server.run()
