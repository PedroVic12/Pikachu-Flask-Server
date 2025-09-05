from flask import Flask
from routes import setup_routes
from database.BancoSqlite import BancoSqlite
from database.sqlite_controller import SqliteController, initialize_database, create_cardapio_tables, create_service_orders_tables, populate_cardapio_items, populate_service_orders


# https://github.com/PedroVic12/Pikachu-Flask-Server/blob/main/server.py

class FlaskServerApp:
    def __init__(self, db_name):
        self.app = Flask(__name__)
        # Initialize all databases
        print("Initializing databases...")
        initialize_database()  # Initialize floricultura.db
        create_cardapio_tables()  # Initialize cardapio.db
        populate_cardapio_items()
        create_service_orders_tables()  # Initialize service_orders.db
        populate_service_orders()
        
        self.db = BancoSqlite(db_name)
        # Create tables if they don't exist
        self.db.criar_tabelas()
        print("All databases initialized successfully!")

    def run(self, host='0.0.0.0', port=5000):
        # Setup routes with database connection
        setup_routes(self.app, self.db)
        # Run the Flask app
        self.app.run(host=host, port=port, debug=True)

if __name__ == "__main__":
    server = FlaskServerApp(db_name='./database/floricultura.db')
    server.run()