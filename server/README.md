# Backend Unificado (Flask)

Este diretório contém o código-fonte do servidor backend centralizado do Projeto Pikachu. Ele é construído com Flask e organizado de forma modular para facilitar a adição de novas funcionalidades.

## Arquitetura Interna

O servidor segue uma arquitetura baseada no padrão **MVC (Model-View-Controller)** e utiliza **Blueprints** para separar as responsabilidades.

-   **`app.py`**: É o ponto de entrada da aplicação. Suas responsabilidades são:
    -   Configurar a aplicação Flask.
    -   Inicializar o banco de dados com SQLAlchemy (`db.create_all()`).
    -   Registrar todos os Blueprints (módulos) da aplicação.

-   **`models.py`**: Corresponde à camada **Model**. Define a estrutura de todas as tabelas do banco de dados usando classes Python e SQLAlchemy ORM. Todas as entidades de dados do projeto (Users, Projects, KanbanItems, etc.) estão aqui.

-   **/controllers/**: Este diretório contém os módulos da aplicação (Blueprints). Cada arquivo `_routes.py` define um conjunto de rotas (a camada **View**) e a lógica de negócio associada (a camada **Controller**).
    -   **`api_routes.py`**: Contém as rotas principais de CRUD para `Users`, `Tasks`, `Projects`, e também as rotas do `astro-system`.
    -   **`floricultura_routes.py`**: Módulo dedicado às regras de negócio da floricultura.
    -   **`routes.py`**: Módulo original para o `cardapio`.

## Como Executar

A partir da raiz do projeto (`Pikachu-Flask-Server`), siga os passos:

```bash
# 1. Navegue para esta pasta
cd backend

# 2. Instale as dependências
pip install -r requirements.txt

# 3. Execute o servidor
python3 app.py
```

O servidor iniciará em `http://127.0.0.1:5000` e estará pronto para receber requisições do frontend.
