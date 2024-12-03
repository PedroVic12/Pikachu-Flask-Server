import sqlite3 as con

class BancoSqlite:
    def __init__(self, db_name):
        self.db_name = db_name
    
    def conecta(self):
        return con.connect(self.db_name)

    def criar_tabelas(self):
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
            conexao = self.conecta()
            cursor = conexao.cursor()

            cursor.execute(sql_clientes)
            cursor.execute(sql_produtos)
            cursor.execute(sql_vendas)

            conexao.commit()
        except con.DatabaseError as erro:
            print("Erro no banco de dados:", erro)
        finally:
            if conexao:
                conexao.close()

    def inserir_dados(self, tabela, valores):
        try:
            conexao = self.conecta()
            cursor = conexao.cursor()
            cursor.execute(f"INSERT INTO {tabela} VALUES ({valores})")
            conexao.commit()
        except con.DatabaseError as erro:
            print("Erro ao inserir dados:", erro)
        finally:
            if conexao:
                conexao.close()

    def consulta_dados(self, query):
        try:
            conexao = self.conecta()
            cursor = conexao.cursor()
            cursor.execute(query)
            resultados = cursor.fetchall()
            return resultados
        except con.DatabaseError as erro:
            print("Erro na consulta:", erro)
        finally:
            if conexao:
                conexao.close()


def main_sqlite():
        # Inicializa o banco de dados e cria as tabelas
    banco = BancoSqlite('./floricultura.db')
    banco.conecta()

    print("Abrindo banco!")

    banco.criar_tabelas()

    # Insere alguns dados de exemplo
    banco.inserir_dados('Cliente', "NULL, '265356325', 'Fábio', 'dos Reis', '1156326356', 'Rua do Orfanato', '235', 'Vila Prudente'")
    banco.inserir_dados('Produto', "NULL, 'Orquídea', 'Flor', 55.50, 25")
    banco.inserir_dados('Cliente', "NULL, '265356325', 'Pedro', 'Victor', '1156326356', 'Rua Raimundo Martins', '235', 'Carire CE' ")


    print("Dados inseridos!")


#main_sqlite()