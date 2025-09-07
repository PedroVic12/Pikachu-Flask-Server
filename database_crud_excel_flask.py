from flask import Flask, request, jsonify, send_file
import pandas as pd
import os
import sqlite3
from datetime import datetime
import uuid
import threading

app = Flask(__name__)

# Configurações
DATA_DIR = "data"
SQL_DIR = "db"
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(SQL_DIR, exist_ok=True)

# Caminhos dos arquivos
PLANO_ATIVIDADES_PATH = os.path.join(DATA_DIR, "PlanoAtividades.xlsx")
SCRUM_PLANNER_PATH = os.path.join(DATA_DIR, "ScrumPlanner.xlsx")
TODO_LIST_PATH = os.path.join(DATA_DIR, "TodoList.xlsx")
SQLITE_PATH = os.path.join(SQL_DIR, "produtividade.db")

# Padrão Singleton para Database
class Database:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance.init_database()
        return cls._instance
    
    def init_database(self):
        """Inicializa arquivos Excel e banco SQLite"""
        # Criar arquivos Excel se não existirem
        self.init_excel_file(PLANO_ATIVIDADES_PATH, [
            "ID", "Prioridade", "Tempo", "Atividade", 
            "Resultado Esperado", "Status"
        ])
        
        self.init_excel_file(SCRUM_PLANNER_PATH, [
            "ID", "Todo", "InProgress", "Concluido", 
            "AgentesAI", "Projetos Parados"
        ])
        
        self.init_excel_file(TODO_LIST_PATH, [
            "ID", "Atividade", "Categoria", "Tempo", 
            "Data", "Status", "NotionLink", "ClickUpLink", "Deleted"
        ])
        
        # Criar banco SQLite e tabelas
        self.init_sqlite()
    
    def init_excel_file(self, path, columns):
        if not os.path.exists(path):
            pd.DataFrame(columns=columns).to_excel(path, index=False)
    
    def init_sqlite(self):
        conn = sqlite3.connect(SQLITE_PATH)
        cursor = conn.cursor()
        
        # Tabela TodoList
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS TodoList (
            ID TEXT PRIMARY KEY,
            Atividade TEXT,
            Categoria TEXT,
            Tempo INTEGER,
            Data TEXT,
            Status TEXT,
            NotionLink TEXT,
            ClickUpLink TEXT,
            Deleted BOOLEAN
        )
        ''')
        
        # Tabela PlanoAtividades
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS PlanoAtividades (
            ID TEXT PRIMARY KEY,
            Prioridade INTEGER,
            Tempo INTEGER,
            Atividade TEXT,
            ResultadoEsperado TEXT,
            Status TEXT
        )
        ''')
        
        # Tabela ScrumPlanner
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS ScrumPlanner (
            ID TEXT PRIMARY KEY,
            Todo BOOLEAN,
            InProgress BOOLEAN,
            Concluido BOOLEAN,
            AgentesAI TEXT,
            ProjetosParados BOOLEAN
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def read_excel(self, path):
        return pd.read_excel(path)
    
    def save_excel(self, df, path):
        df.to_excel(path, index=False)
    
    def save_sql(self, df, table_name):
        conn = sqlite3.connect(SQLITE_PATH)
        df.to_sql(table_name, conn, if_exists='replace', index=False)
        conn.close()
    
    def generate_id(self):
        return str(uuid.uuid4())

# Padrão Strategy para operações CRUD
class CRUDStrategy:
    def create(self, data):
        raise NotImplementedError()
    
    def read(self):
        raise NotImplementedError()
    
    def update(self, item_id, data):
        raise NotImplementedError()
    
    def delete(self, item_id):
        raise NotImplementedError()

# Implementação concreta para TodoList
class TodoCRUDStrategy(CRUDStrategy):
    def __init__(self, db):
        self.db = db
    
    def create(self, data):
        df = self.db.read_excel(TODO_LIST_PATH)
        
        new_row = {
            "ID": self.db.generate_id(),
            "Atividade": data.get("Atividade", ""),
            "Categoria": data.get("Categoria", "Geral"),
            "Tempo": data.get("Tempo", 0),
            "Data": datetime.now().strftime("%Y-%m-%d"),
            "Status": "Pendente",
            "NotionLink": data.get("NotionLink", ""),
            "ClickUpLink": data.get("ClickUpLink", ""),
            "Deleted": False
        }
        
        new_df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        self.db.save_excel(new_df, TODO_LIST_PATH)
        self.db.save_sql(new_df, "TodoList")
        return new_row["ID"]
    
    def read(self):
        df = self.db.read_excel(TODO_LIST_PATH)
        df = df[df['Deleted'] != True]
        return df.fillna('').to_dict(orient='records')
    
    def update(self, item_id, data):
        df = self.db.read_excel(TODO_LIST_PATH)
        
        if item_id not in df['ID'].values:
            return False
        
        idx = df.index[df['ID'] == item_id].tolist()[0]
        
        for key in data:
            if key in df.columns:
                df.at[idx, key] = data[key]
        
        self.db.save_excel(df, TODO_LIST_PATH)
        self.db.save_sql(df, "TodoList")
        return True
    
    def delete(self, item_id):
        df = self.db.read_excel(TODO_LIST_PATH)
        
        if item_id not in df['ID'].values:
            return False
        
        idx = df.index[df['ID'] == item_id].tolist()[0]
        df.at[idx, 'Deleted'] = True
        self.db.save_excel(df, TODO_LIST_PATH)
        self.db.save_sql(df, "TodoList")
        return True
    
    def add_time(self, item_id, minutes):
        df = self.db.read_excel(TODO_LIST_PATH)
        
        if item_id not in df['ID'].values:
            return False
        
        idx = df.index[df['ID'] == item_id].tolist()[0]
        current_time = df.at[idx, 'Tempo'] or 0
        df.at[idx, 'Tempo'] = current_time + minutes
        self.db.save_excel(df, TODO_LIST_PATH)
        self.db.save_sql(df, "TodoList")
        return True

# Implementação concreta para PlanoAtividades
class PlanCRUDStrategy(CRUDStrategy):
    def __init__(self, db):
        self.db = db
    
    def create(self, data):
        df = self.db.read_excel(PLANO_ATIVIDADES_PATH)
        
        new_row = {
            "ID": self.db.generate_id(),
            "Prioridade": data.get("Prioridade", 1),
            "Tempo": data.get("Tempo", 0),
            "Atividade": data.get("Atividade", ""),
            "Resultado Esperado": data.get("Resultado Esperado", ""),
            "Status": "Planejado"
        }
        
        new_df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        self.db.save_excel(new_df, PLANO_ATIVIDADES_PATH)
        self.db.save_sql(new_df, "PlanoAtividades")
        return True
    
    def read(self):
        df = self.db.read_excel(PLANO_ATIVIDADES_PATH)
        return df.fillna('').to_dict(orient='records')
    
    def update(self, item_id, data):
        # Implementação similar ao Todo
        pass
    
    def delete(self, item_id):
        # Implementação similar ao Todo
        pass

# Implementação concreta para ScrumPlanner
class ScrumCRUDStrategy(CRUDStrategy):
    def __init__(self, db):
        self.db = db
    
    def create(self, data):
        # Implementação similar
        pass
    
    def read(self):
        df = self.db.read_excel(SCRUM_PLANNER_PATH)
        return df.fillna('').to_dict(orient='records')
    
    def move(self, item_id, from_col, to_col):
        df = self.db.read_excel(SCRUM_PLANNER_PATH)
        
        if item_id not in df['ID'].values:
            return False
        
        idx = df.index[df['ID'] == item_id].tolist()[0]
        
        if from_col in df.columns and to_col in df.columns:
            df.at[idx, from_col] = False
            df.at[idx, to_col] = True
        
        self.db.save_excel(df, SCRUM_PLANNER_PATH)
        self.db.save_sql(df, "ScrumPlanner")
        return True

# Fábrica de Controllers
class ControllerFactory:
    @staticmethod
    def create_controller(controller_type, db):
        if controller_type == "todo":
            return TodoCRUDStrategy(db)
        elif controller_type == "plan":
            return PlanCRUDStrategy(db)
        elif controller_type == "scrum":
            return ScrumCRUDStrategy(db)
        raise ValueError("Tipo de controller inválido")

# Server (Padrão Facade)
class FlaskServer:
    def __init__(self):
        self.app = Flask(__name__)
        self.db = Database()
        self.setup_controllers()
        self.setup_routes()
    
    def setup_controllers(self):
        self.todo_controller = ControllerFactory.create_controller("todo", self.db)
        self.plan_controller = ControllerFactory.create_controller("plan", self.db)
        self.scrum_controller = ControllerFactory.create_controller("scrum", self.db)
    
    def setup_routes(self):
        # TodoList routes
        @self.app.route('/api/todo', methods=['GET'])
        def get_todo_list():
            tasks = self.todo_controller.read()
            return jsonify(tasks)
        
        @self.app.route('/api/todo', methods=['POST'])
        def add_todo():
            data = request.json
            task_id = self.todo_controller.create(data)
            return jsonify({"success": True, "id": task_id})
        
        # PlanoAtividades routes
        @self.app.route('/api/plano_atividades', methods=['GET'])
        def get_plano_atividades():
            activities = self.plan_controller.read()
            return jsonify(activities)
        
        @self.app.route('/api/plano_atividades', methods=['POST'])
        def add_plano_atividade():
            data = request.json
            success = self.plan_controller.create(data)
            return jsonify({"success": success})
        
        # ScrumPlanner routes
        @self.app.route('/api/scrum_planner', methods=['GET'])
        def get_scrum_planner():
            items = self.scrum_controller.read()
            return jsonify(items)
        
        @self.app.route('/api/scrum_planner/move', methods=['POST'])
        def move_scrum_item():
            data = request.json
            item_id = data["id"]
            from_col = data["from"]
            to_col = data["to"]
            success = self.scrum_controller.move(item_id, from_col, to_col)
            return jsonify({"success": success})
        
        # Export routes
        @self.app.route('/api/export/<file_type>', methods=['GET'])
        def export_data(file_type):
            file_path = {
                'todo': TODO_LIST_PATH,
                'plano': PLANO_ATIVIDADES_PATH,
                'scrum': SCRUM_PLANNER_PATH,
                'sqlite': SQLITE_PATH
            }.get(file_type)
            
            if not file_path or not os.path.exists(file_path):
                return jsonify({"error": "Arquivo não encontrado"}), 404
            
            return send_file(file_path, as_attachment=True)
    
    def run(self, **kwargs):
        self.app.run(**kwargs)

if __name__ == '__main__':
    server = FlaskServer()
    server.run(debug=True, port=5000)