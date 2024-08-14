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


def main_sqlite():
    # Inicializa o banco de dados e cria as tabelas
    banco = BancoSqlite('floricultura.db')
    banco.criar_tabelas()

    print("Abrindo banco e criando tabelas!")

    # Insere alguns dados de exemplo
    banco.inserir_dados('Cliente', {
        'ID_Cliente': None, 'RG': '265356325', 'Nome_Cliente': 'Fábio', 'Sobrenome_Cliente': 'dos Reis',
        'Telefone': '1156326356', 'Rua': 'Rua do Orfanato', 'Numero': '235', 'Bairro': 'Vila Prudente'
    })
    banco.inserir_dados('Produto', {
        'ID_Produto': None, 'Nome_Produto': 'Orquídea', 'Tipo_Produto': 'Flor',
        'Preco': 55.50, 'Qtde_Estoque': 25
    })

    print("Dados inseridos!")

    # Realiza consulta de dados
    resultado_clientes = banco.consulta_dados('Cliente')
    resultado_produtos = banco.consulta_dados('Produto')

    print("Clientes:", resultado_clientes)
    print("Produtos:", resultado_produtos)


main_sqlite()
