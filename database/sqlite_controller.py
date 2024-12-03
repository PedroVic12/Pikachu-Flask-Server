import sqlite3 as con


class DatabaseHandler:
    def connect(self):
        raise NotImplementedError

    def create(self, table, data):
        raise NotImplementedError

    def read(self, table, query):
        raise NotImplementedError

    def update(self, table, query, data):
        raise NotImplementedError

    def delete(self, table, query):
        raise NotImplementedError


class SqliteController(DatabaseHandler):
    def __init__(self, db_name):
        self.db_name = db_name
        self.conn = None
        self.cursor = None

    def connect(self):
        self.conn = con.connect(self.db_name)
        self.cursor = self.conn.cursor()

    def create(self, table, data):
        placeholders = ', '.join(['?'] * len(data))
        columns = ', '.join(data.keys())
        sql = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        self.cursor.execute(sql, list(data.values()))
        self.conn.commit()

    def read(self, table, query=None):
        sql = f"SELECT * FROM {table}"
        if query:
            sql += " WHERE " + ' AND '.join([f"{k}='{v}'" for k, v in query.items()])
        self.cursor.execute(sql)
        return self.cursor.fetchall()

    def update(self, table, query, data):
        set_clause = ', '.join([f"{k}='{v}'" for k, v in data.items()])
        where_clause = ' AND '.join([f"{k}='{v}'" for k, v in query.items()])
        sql = f"UPDATE {table} SET {set_clause} WHERE {where_clause}"
        self.cursor.execute(sql)
        self.conn.commit()

    def delete(self, table, query):
        where_clause = ' AND '.join([f"{k}='{v}'" for k, v in query.items()])
        sql = f"DELETE FROM {table} WHERE {where_clause}"
        self.cursor.execute(sql)
        self.conn.commit()

    def close(self):
        if self.conn:
            self.conn.close()


class BancoSqlite:
    def __init__(self, db_name):
        self.db_name = db_name
        self.controller = SqliteController(db_name)

    def criar_tabelas(self):
        self.controller.connect()
        
        sql_clientes = '''
            CREATE TABLE IF NOT EXISTS Cliente (
            ID_Cliente INTEGER PRIMARY KEY AUTOINCREMENT,
            RG VARCHAR (12) NOT NULL,
            Nome_Cliente VARCHAR(30) NOT NULL,
            Sobrenome_Cliente VARCHAR(40),
            Telefone VARCHAR(12),
            Rua VARCHAR(40),
            Numero VARCHAR(5),
            Bairro VARCHAR(25)
            );
        '''
        
        sql_produtos = '''
            CREATE TABLE IF NOT EXISTS Produto (
            ID_Produto INTEGER PRIMARY KEY AUTOINCREMENT,
            Nome_Produto VARCHAR (30) NOT NULL,
            Tipo_Produto VARCHAR (25) NOT NULL,
            Preco DECIMAL(10,2) NOT NULL,
            Qtde_Estoque SMALLINT NOT NULL
            );
        '''

        sql_vendas = '''
            CREATE TABLE IF NOT EXISTS Venda (
            ID_Transacao INTEGER PRIMARY KEY AUTOINCREMENT,
            Nota_Fiscal SMALLINT NOT NULL,
            ID_Cliente INTEGER NOT NULL,
            Data_Compra DATETIME,
            ID_Produto INTEGER NOT NULL,
            Quantidade SMALLINT NOT NULL,
            FOREIGN KEY (ID_Cliente) REFERENCES Cliente(ID_Cliente),
            FOREIGN KEY (ID_Produto) REFERENCES Produto(ID_Produto)
            );
        '''

        try:
            self.controller.cursor.execute(sql_clientes)
            self.controller.cursor.execute(sql_produtos)
            self.controller.cursor.execute(sql_vendas)
            self.controller.conn.commit()
        except con.DatabaseError as erro:
            print("Erro no banco de dados:", erro)
        finally:
            self.controller.close()

    def inserir_dados(self, tabela, dados):
        self.controller.connect()
        try:
            self.controller.create(tabela, dados)
        except con.DatabaseError as erro:
            print("Erro ao inserir dados:", erro)
        finally:
            self.controller.close()

    def consulta_dados(self, tabela, query=None):
        self.controller.connect()
        try:
            resultados = self.controller.read(tabela, query)
            return resultados
        except con.DatabaseError as erro:
            print("Erro na consulta:", erro)
        finally:
            self.controller.close()


def initialize_database():
    controller = SqliteController('./database/floricultura.db')
    controller.connect()
    
    # Create tables
    controller.cursor.execute('''
        CREATE TABLE IF NOT EXISTS Cliente (
            ID_Cliente INTEGER PRIMARY KEY AUTOINCREMENT,
            RG VARCHAR (12) NOT NULL,
            Nome_Cliente VARCHAR(30) NOT NULL,
            Sobrenome_Cliente VARCHAR(40),
            Telefone VARCHAR(12),
            Rua VARCHAR(40),
            Numero VARCHAR(5),
            Bairro VARCHAR(25)
        )
    ''')

    controller.cursor.execute('''
        CREATE TABLE IF NOT EXISTS Produto (
            ID_Produto INTEGER PRIMARY KEY AUTOINCREMENT,
            Nome_Produto VARCHAR (30) NOT NULL,
            Tipo_Produto VARCHAR (25) NOT NULL,
            Preco DECIMAL(10,2) NOT NULL,
            Qtde_Estoque SMALLINT NOT NULL
        )
    ''')

    controller.cursor.execute('''
        CREATE TABLE IF NOT EXISTS Venda (
            ID_Transacao INTEGER PRIMARY KEY AUTOINCREMENT,
            Nota_Fiscal SMALLINT NOT NULL,
            ID_Cliente INTEGER NOT NULL,
            Data_Compra DATETIME,
            ID_Produto INTEGER NOT NULL,
            Quantidade SMALLINT NOT NULL,
            FOREIGN KEY (ID_Cliente) REFERENCES Cliente(ID_Cliente),
            FOREIGN KEY (ID_Produto) REFERENCES Produto(ID_Produto)
        )
    ''')

    # Insert test data
    test_data = {
        'Cliente': [
            (1, '265356325', 'Fábio', 'dos Reis', '1156326356', 'Rua do Orfanato', '235', 'Vila Prudente'),
            (2, '987654321', 'Maria', 'Silva', '1198765432', 'Av Principal', '100', 'Centro'),
            (3, '123456789', 'João', 'Santos', '1187654321', 'Rua das Flores', '50', 'Jardim')
        ],
        'Produto': [
            (1, 'Orquídea', 'Flor', 55.50, 25),
            (2, 'Rosa Vermelha', 'Flor', 15.00, 100),
            (3, 'Vaso Decorado', 'Decoração', 45.00, 30)
        ],
        'Venda': [
            (1, 1001, 1, '2024-01-15', 1, 2),
            (2, 1002, 2, '2024-01-16', 2, 5),
            (3, 1003, 3, '2024-01-17', 3, 1)
        ]
    }

    for table, data in test_data.items():
        # Clear existing data
        controller.cursor.execute(f'DELETE FROM {table}')
        
        # Insert new test data
        if table == 'Cliente':
            controller.cursor.executemany(
                'INSERT INTO Cliente VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                data
            )
        elif table == 'Produto':
            controller.cursor.executemany(
                'INSERT INTO Produto VALUES (?, ?, ?, ?, ?)',
                data
            )
        elif table == 'Venda':
            controller.cursor.executemany(
                'INSERT INTO Venda VALUES (?, ?, ?, ?, ?, ?)',
                data
            )

    controller.conn.commit()
    print("Database initialized with test data!")


def create_cardapio_tables():
    controller = SqliteController('./database/cardapio.db')
    controller.connect()

    # Create Items table if not exists
    controller.cursor.execute('''
        CREATE TABLE IF NOT EXISTS Items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT
        )
    ''')
    controller.conn.commit()
    controller.conn.close()


def populate_cardapio_items():
    controller = SqliteController('./database/cardapio.db')
    controller.connect()

    # Insert test data into Items table
    test_items = [
        (1, 'Pizza Margherita', 'Classic pizza with tomatoes and mozzarella', 12.99, 'Pizza'),
        (2, 'Caesar Salad', 'Fresh salad with Caesar dressing', 8.99, 'Salad'),
        (3, 'Chocolate Cake', 'Rich chocolate cake', 6.50, 'Dessert')
    ]

    # Clear existing data
    controller.cursor.execute('DELETE FROM Items')
    
    # Insert new test data
    controller.cursor.executemany(
        'INSERT INTO Items VALUES (?, ?, ?, ?, ?)',
        test_items
    )

    controller.conn.commit()
    controller.conn.close()


def create_service_orders_tables():
    controller = SqliteController('./database/service_orders.db')
    controller.connect()

    # Create ServiceOrders table if not exists
    controller.cursor.execute('''
        CREATE TABLE IF NOT EXISTS ServiceOrders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rebocador TEXT NOT NULL,
            responsavel TEXT NOT NULL,
            dataAbertura TEXT NOT NULL,
            oficina TEXT NOT NULL,
            manutencao TEXT NOT NULL,
            equipamento TEXT NOT NULL,
            descricaoFalha TEXT NOT NULL,
            servicoExecutado TEXT
        )
    ''')
    controller.conn.commit()
    controller.conn.close()


def populate_service_orders():
    controller = SqliteController('./database/service_orders.db')
    controller.connect()

    # Insert test data into ServiceOrders table
    test_orders = [
        (1, 'Rebocador A', 'João Silva', '2024-01-20', 'Oficina 1', 'Manutenção Preventiva', 'Equipamento X', 'Falha no motor', 'Troca de óleo'),
        (2, 'Rebocador B', 'Maria Oliveira', '2024-01-21', 'Oficina 2', 'Reparo', 'Equipamento Y', 'Falha elétrica', 'Substituição de fusível'),
        (3, 'Rebocador C', 'Carlos Souza', '2024-01-22', 'Oficina 3', 'Inspeção', 'Equipamento Z', 'Verificação de segurança', 'Ajuste de parafusos')
    ]

    # Clear existing data
    controller.cursor.execute('DELETE FROM ServiceOrders')
    
    # Insert new test data
    controller.cursor.executemany(
        'INSERT INTO ServiceOrders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        test_orders
    )

    controller.conn.commit()
    controller.conn.close()


if __name__ == "__main__":
    create_cardapio_tables()
    create_service_orders_tables()
    populate_cardapio_items()
    populate_service_orders()
