from database.BancoSqlite import BancoSqlite
from api.FlaskServerApp import FlaskServerApp

if __name__ == "__main__":
    # Inicializa o banco de dados e cria as tabelas
    banco = BancoSqlite('./floricultura.db')
    banco.criar_tabelas()

    # Insere alguns dados de exemplo
    banco.inserir_dados('Cliente', "NULL, '265356325', 'Fábio', 'dos Reis', '1156326356', 'Rua do Orfanato', '235', 'Vila Prudente'")
    banco.inserir_dados('Produto', "NULL, 'Orquídea', 'Flor', 55.50, 25")

    print("Dados atualizados!")

    # Inicializa e executa o servidor Flask
    app = FlaskServerApp('floricultura.db')
    app.run()
