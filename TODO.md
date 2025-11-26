# ✅ Checklist de Unificação do Projeto Pikachu

Olá, Pedro! Este é o seu plano de tarefas, em formato de checklist, para unificar todos os módulos do projeto sob um único backend (`main.py`) e um único frontend (`project_kanban_pro_2025`).

Siga estes passos com calma. Cada etapa é desenhada para ser um bloco de construção para a próxima.

---

### Fase 1: Centralização e Limpeza do Backend

O objetivo desta fase é definir o `main.py` como o coração do backend e organizar a estrutura de pastas para refletir isso.

-   [ ] **1.1: Mover o `main.py` para a pasta `backend`**:
    -   Mova o arquivo `main.py` da raiz do projeto para a pasta `/backend`. Isso consolidará todo o código Python do servidor em um único lugar.
    -   Renomeie o arquivo `/backend/main.py` para `/backend/app.py` para seguir um padrão mais comum em projetos Flask.

-   [ ] **1.2: Unificar Dependências**:
    -   Revise todos os arquivos `requirements.txt` dos subprojetos (`pikachu-API`, `astro-system`, etc.).
    -   Copie todas as dependências (Flask, pandas, openpyxl, crewai, etc.) para o arquivo `/backend/requirements.txt`.
    -   Delete os outros arquivos `requirements.txt` para evitar confusão.

-   [ ] **1.3: Arquivar Servidores Antigos**:
    -   Delete os arquivos de servidor que não serão mais usados, como `server/app.py`, `pikachu_server_sqlite.py`, e os vários `main.py` e `app.py` dentro de `/pikachu-API`.
    -   **Objetivo:** Ao final desta etapa, o único servidor a ser executado no projeto será o `/backend/app.py`.

---

### Fase 2: Integração do Kanban com o Backend (`main.py`)

Agora, vamos fazer seu frontend do Kanban (`project_kanban_pro_2025`) usar o `main.py` para persistir dados, mantendo a sua arquitetura com `Repository.jsx`.

-   [ ] **2.1: Adicionar o `KanbanStrategy` no Backend**:
    -   Abra o arquivo `/backend/app.py` (o antigo `main.py`).
    -   Crie uma nova classe `KanbanCRUDStrategy(CRUDStrategy)`, similar à `TodoCRUDStrategy`.
    -   Implemente os métodos `create`, `read`, `update` e `delete` para que eles leiam e salvem os dados em um novo arquivo `Kanban.xlsx` e em uma nova tabela `Kanban` no SQLite.

-   [ ] **2.2: Adicionar as Rotas da API do Kanban**:
    -   Dentro da classe `FlaskServer` no seu `/backend/app.py`, adicione as rotas para o Kanban:
        -   `GET /api/kanban`: Deve chamar o método `read` do `KanbanCRUDStrategy`.
        -   `POST /api/kanban`: Deve chamar o método `create`.
        -   `PUT /api/kanban/<item_id>`: Deve chamar o método `update`.
        -   `DELETE /api/kanban/<item_id>`: Deve chamar o método `delete`.

-   [ ] **2.3: Modificar o `Repository.jsx` do Frontend**:
    -   Edite o arquivo `/frontend/project_kanban_pro_2025/app/Repository.jsx`.
    -   Altere o método `loadProjects` para fazer uma chamada `fetch` para a nova rota `GET /api/kanban`.
    -   Altere o método `saveProjects` para fazer uma chamada `POST /api/kanban` (ou crie métodos mais granulares como `updateProjectInApi`, se preferir, e chame-os dentro do hook `useProjects`).
    -   **Importante:** O `page.jsx` não precisa mudar, pois ele continuará chamando os métodos do `Repository.jsx`, como você pediu.

---

### Fase 3: Integração dos Outros Microserviços

Vamos trazer as funcionalidades dos outros projetos para dentro do `main.py` como `Strategies` ou `Blueprints`.

-   [ ] **3.1: Integrar a API "Astro"**:
    -   Copie a lógica das rotas do arquivo `/pikachu-API/astro-system/src/routes/astro.py`.
    -   Crie um novo Blueprint, `/backend/controllers/astro_routes.py`.
    -   Cole a lógica das rotas lá.
    -   No `/backend/app.py`, registre este novo blueprint com o prefixo `/api/astro`.

-   [ ] **3.2: Integrar a API de Gestão de Projetos**:
    -   Esta é a API do `raichu_web_server.py` que gerencia `Users`, `Tasks` e `Projects`.
    -   Para cada um (User, Task, Project), crie uma nova `Strategy` correspondente no `/backend/app.py`.
    -   Adicione as tabelas `User`, `Task` e `Project` ao método `init_sqlite` no `/backend/app.py`.
    -   Adicione as rotas CRUD (`/api/users`, `/api/tasks`, `/api/projects`) na classe `FlaskServer`, cada uma usando sua respectiva `Strategy`.

---

### Fase 4: Documentação e Finalização

Com tudo unificado, o passo final é documentar e facilitar o uso.

-   [ ] **4.1: Atualizar o `README.md` Principal**:
    -   Revise o `README.md` da raiz do projeto para garantir que ele reflete a nova estrutura final, com o `/backend/app.py` como único servidor.
    -   Atualize as instruções de "Como Executar".

-   [ ] **4.2: Criar o `Dockerfile`**:
    -   Crie um `Dockerfile` na raiz do projeto.
    -   Use um *multi-stage build*:
        1.  Um estágio `node` para compilar o frontend Next.js (`npm run build`).
        2.  Um estágio final `python` que copia o backend e o frontend compilado, instala as dependências Python e usa `gunicorn` para executar o `/backend/app.py`.

-   [ ] **4.3: Documentar o Padrão de Desenvolvimento**:
    -   Adicione uma seção ao `README.md` explicando como um novo desenvolvedor pode adicionar uma nova funcionalidade seguindo o padrão que criamos (criar a `Strategy`, adicionar a rota na `FlaskServer`, etc.).

---

Use esta checklist para guiar seus próximos passos. Quando você se sentir pronto para continuar, podemos começar pelo item que você escolher.
