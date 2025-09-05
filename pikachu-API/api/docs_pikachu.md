# Documentação do Projeto Pikachu-Flask-Server/pikachu-API

Este documento descreve a estrutura e a funcionalidade do projeto Flask localizado em `pikachu-API/api/src/`, com foco na aplicação principal `raichu_web_server.py`. O projeto segue um padrão de arquitetura limpa, separando as responsabilidades em camadas distintas.

## 1. Estrutura do Diretório `src/`

O diretório `src/` é o coração da aplicação e está organizado da seguinte forma:

```
src/
├── api/
│   └── routes.py
├── backend/
│   ├── controllers/
│   │   ├── __init__.py
│   │   ├── project_controller.py
│   │   ├── task_controller.py
│   │   └── user_controller.py
│   └── main.py
├── database/
│   └── models.py
├── routes/
│   ├── router.py
│   ├── task_routes.py
│   ├── user_routes.py
│   └── project_routes.py
├── static/
│   ├── components/
│   ├── css/
│   └── js/
└── templates/
    ├── components/
    ├── crud/
    │   ├── projects/
    │   ├── tasks/
    │   └── users/
    ├── dashboards/
    ├── errors/
    └── index.html
```

## 2. Módulos Detalhados

### 2.1. `src/api/routes.py`

-   **Função:** Este arquivo atua como o ponto central para o registro de todos os blueprints da API da aplicação `raichu_web_server.py`. Ele importa blueprints de rotas específicas (usuários, tarefas, projetos) e os registra sob o prefixo `/api`.
-   **Componentes Chave:**
    -   `api_bp`: O blueprint principal da API.
    -   Importações e registro de `user_api`, `task_api`, `project_api` de `src/routes/`.
-   **Observação:** Existe uma duplicação de funcionalidade com `src/routes/router.py`. O `src/api/routes.py` é o arquivo que está sendo utilizado pela aplicação `raichu_web_server.py`. Recomenda-se remover `src/routes/router.py` para evitar confusão.

### 2.2. `src/backend/controllers/`

-   **Função Geral:** Este diretório contém a lógica de negócios da aplicação. Os controllers são responsáveis por processar as requisições, interagir com os modelos do banco de dados e retornar os dados apropriados.
-   `__init__.py`: Um arquivo vazio que marca o diretório como um pacote Python.
-   `project_controller.py`, `task_controller.py`, `user_controller.py`:
    -   **Função:** Cada um desses arquivos define uma classe (ex: `ProjectController`) que encapsula os métodos estáticos para operações CRUD (Create, Read, Update, Delete) para suas respectivas entidades (Projeto, Tarefa, Usuário). Eles interagem diretamente com os modelos definidos em `src/database/models.py`.
    -   **Componentes Chave:** Classes `ProjectController`, `TaskController`, `UserController` com métodos como `get_all()`, `get_by_id()`, `create()`, `update()`, `delete()`.

### 2.3. `src/backend/main.py`

-   **Função:** Este arquivo parece ser uma **aplicação Flask separada e independente** dentro do diretório `src/backend`. Ele possui sua própria configuração de aplicação Flask, instância SQLAlchemy, modelos (`Category`, `Task`) e rotas de API para gerenciamento de categorias e tarefas. Além disso, ele está configurado para servir um frontend React.
-   **Observação:** Esta aplicação opera de forma autônoma e não está diretamente integrada ao fluxo principal do `raichu_web_server.py`, que utiliza os modelos de `src/database/models.py` e os controllers de `src/backend/controllers/`. Se a funcionalidade de `src/backend/main.py` precisar ser incorporada ao `raichu_web_server.py`, seria necessário um esforço de migração e refatoração para adaptar seus modelos e lógica à arquitetura existente.

### 2.4. `src/database/models.py`

-   **Função:** Este arquivo define os modelos ORM (Object-Relational Mapping) usando Flask-SQLAlchemy para as entidades centrais da aplicação `raichu_web_server.py`. Cada classe de modelo representa uma tabela no banco de dados.
-   **Componentes Chave:**
    -   `db`: A instância do SQLAlchemy, usada para definir os modelos.
    -   `User`, `Task`, `Project`: Classes de modelo que representam as tabelas de usuários, tarefas e projetos, respectivamente. Cada modelo inclui definições de colunas e um método `to_dict()` para serialização.

### 2.5. `src/routes/`

-   **Função Geral:** Este diretório contém os blueprints do Flask que definem as rotas da API para diferentes entidades. Cada blueprint agrupa um conjunto de rotas relacionadas.
-   `router.py`:
    -   **Função:** Este arquivo é uma **duplicação** de `src/api/routes.py`. Ele define um blueprint `api_bp` e registra os mesmos blueprints de rotas (`user_api`, `task_api`, `project_api`).
    -   **Observação:** Recomenda-se remover este arquivo para evitar redundância e confusão, pois `src/api/routes.py` é o arquivo ativo.
-   `project_routes.py`, `task_routes.py`, `user_routes.py`:
    -   **Função:** Cada um desses arquivos define um `Blueprint` específico (ex: `project_api`) e as rotas HTTP (GET, POST, PUT, DELETE) para operações CRUD em suas respectivas entidades. Eles chamam os métodos apropriados dos controllers em `src/backend/controllers/` para executar a lógica de negócios.
    -   **Componentes Chave:** Instâncias `Blueprint` (ex: `project_api`), decoradores de rota (`@blueprint.route`), e chamadas para métodos de controller.
    -   **Observação:** Existe um arquivo `src/project_routes.py` no diretório raiz de `src/`. O arquivo correto e utilizado pela aplicação é `src/routes/project_routes.py`.

### 2.6. `src/static/`

-   **Função:** Este diretório é usado para servir arquivos estáticos para o frontend da aplicação.
-   **Subdiretórios:**
    -   `components/`: Pode conter componentes reutilizáveis de frontend.
    -   `css/`: Contém arquivos de estilo CSS.
    -   `js/`: Contém arquivos JavaScript.

### 2.7. `src/templates/`

-   **Função:** Este diretório armazena todos os templates HTML da aplicação, que são renderizados usando o motor de templates Jinja2 do Flask.
-   `index.html`: A página inicial ou de entrada da aplicação.
-   `components/`: Contém templates HTML para componentes de UI reutilizáveis, organizados por frameworks (ex: `bootstrap_components.html`).
-   `crud/`: Contém templates para as operações CRUD (Create, Read, Update, Delete) de diferentes entidades, organizados por pasta (ex: `projects/`, `tasks/`, `users/`). Cada pasta contém `create.html`, `detail.html`, `edit.html`, `list.html`.
-   `dashboards/`: Contém templates para diferentes layouts de dashboard, organizados por frameworks CSS (ex: `bootstrap_dashboard.html`).
-   `errors/`: Contém templates para páginas de erro, como `404.html` (Não Encontrado) e `500.html` (Erro Interno do Servidor).

## 3. Visão Geral da Arquitetura Limpa

O projeto `raichu_web_server.py` adere a um padrão de arquitetura limpa, promovendo a separação de preocupações e a manutenibilidade do código:

-   **Modelos (`src/database/models.py`):** Representam a camada de dados, definindo a estrutura das entidades e sua interação com o banco de dados.
-   **Controllers (`src/backend/controllers/`):** Contêm a lógica de negócios da aplicação. Eles orquestram as operações, manipulando os dados dos modelos e aplicando as regras de negócio.
-   **Rotas (`src/routes/` e `src/api/routes.py`):** Definem os endpoints da API e mapeiam as requisições HTTP para os métodos apropriados nos controllers. Esta é a camada de interface com o cliente.
-   **Views/Templates (`src/templates/`):** Representam a camada de apresentação, responsável por renderizar a interface do usuário com base nos dados fornecidos pelos controllers.

## 4. Como Executar a Aplicação Principal (`raichu_web_server.py`)

Para executar a aplicação principal `raichu_web_server.py`:

1.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```
2.  **Execute o servidor:**
    ```bash
    python raichu_web_server.py
    ```

A aplicação estará disponível em `http://127.0.0.1:5000` (ou na porta configurada).
