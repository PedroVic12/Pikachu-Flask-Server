# ⚡ Pikachu Project - Plataforma Web Unificada

Bem-vindo ao Projeto Pikachu, uma plataforma web completa e centralizada que integra diversas funcionalidades em um único sistema coeso. O projeto foi arquitetado para ser modular, escalável e de fácil manutenção.


# Flask - Pikachu Web Server 

## Backend

- [x] Flask Server Pikachu com Blueprint e rotas dinamicas
- [ ] Banco de dados integrado ao servidor
- [ ] Copilot C3PO tools
- [ ] Programação Segunda e Sexta com relatorio completo de projetos do github com estimativa de tempo de codificacao em cada projeto 

## Frontend

- [x] Astro System - NASA and publics API calls
- [x] Quizz App with AI - https://pikachu-quizz-app-ai.onrender.com/quiz
- [x] Batcaverna HTML website
- [x] Kanban Pro - SCRUM, XP e notas de estagiário e desenvolvedores
- [x] Os Init System  

---


## ✅ Checklist de Módulos do Projeto

Esta é uma lista dos principais componentes que foram ou estão sendo unificados nesta plataforma.

-   [x] **Backend Unificado (Flask):** Servidor central que orquestra todos os serviços.
-   [x] **Frontend Principal (Next.js):** Interface principal do usuário para o Kanban e outros módulos.
-   [x] **Banco de Dados (SQLite):** Banco de dados único para toda a aplicação, gerenciado com SQLAlchemy.
-   [x] **Módulo: Kanban API:** API completa para gerenciar os cartões do quadro Kanban.
-   [x] **Módulo: API de Projetos/Tarefas/Usuários:** CRUD completo para gestão de projetos.
-   [x] **Módulo: API da Floricultura:** Lógica de negócios e dados para o serviço de floricultura.
-   [x] **Módulo: Astro API:** Serviço que se conecta a APIs externas (NASA, Pokémon, etc.).
-   [ ] **Módulo: Agente de IA (`agente_assistente`):** Serviço com `crewai` e `assemblyai` para IA generativa.
-   [ ] **Containerização (Docker):** Orquestração de todo o sistema para fácil deploy.

## 🏗️ Arquitetura

O sistema é construído sobre uma arquitetura moderna que separa o frontend do backend:

-   **Backend Centralizado (Flask):** Um único e robusto servidor em Python, construído com o micro-framework Flask. Ele gerencia toda a lógica de negócios, a comunicação com o banco de dados e expõe uma API RESTful para o frontend.
    -   **Localização:** `/backend`
    -   **Banco de Dados:** SQLite (`cardapio.db`)
    -   **Padrão de Módulos:** Usa [Flask Blueprints](https://flask.palletsprojects.com/en/2.3.x/blueprints/) para organizar as funcionalidades em módulos independentes (ex: Floricultura, Gestão de Projetos, API do Kanban, etc.).

-   **Frontend Principal (Next.js):** Uma Single-Page Application (SPA) moderna e reativa, construída com React e Next.js. É responsável por toda a interface do usuário, consumindo os dados fornecidos pela API do backend.
    -   **Localização:** `/frontend/project_kanban_pro_2025`
    -   **Features:** Dashboard principal, Quadro Kanban, Tabelas de dados, e mais.

-   **Tutorial de Arquitetura:** Para um passo a passo detalhado de como a arquitetura foi unificada, consulte o [TUTORIAL.md](./TUTORIAL.md).

---

## 🚀 Como Executar o Projeto

Para rodar a aplicação completa, você precisará de dois terminais: um para o backend e um para o frontend.

### 1. Executando o Backend (Flask)

O servidor Flask é o cérebro da aplicação.

```bash
# 1. Navegue até a pasta do backend
cd backend

# 2. (Opcional, recomendado) Crie e ative um ambiente virtual
python3 -m venv venv
source venv/bin/activate  # No Linux/macOS
# venv\Scripts\activate    # No Windows

# 3. Instale as dependências Python
pip install -r requirements.txt 
# Nota: pode ser necessário instalar weasyprint e suas dependências
# para a função de gerar PDF, consulte a documentação oficial.

# 4. Execute o servidor
python3 app.py
```

O backend estará rodando em `http://127.0.0.1:5000`.

### 2. Executando o Frontend (Next.js)

A interface do usuário com a qual você irá interagir.

```bash
# 1. Em um NOVO terminal, navegue até a pasta do frontend
cd frontend/project_kanban_pro_2025

# 2. Instale as dependências do Node.js
npm install

# 3. Execute o servidor de desenvolvimento
npm run dev
```

A aplicação estará acessível em `http://localhost:3000`. Acesse `/dashboard` para ver o portal principal.

---

## 🌟 Módulos e Funcionalidades

O backend unificado atualmente serve as seguintes funcionalidades via API:

-   **/api/cardapio**: CRUD para produtos do cardápio.
-   **/api/floricultura**: Rotas para clientes, produtos e vendas da floricultura.
-   **/api/kanban-items**: CRUD completo para os cartões do quadro Kanban.
-   **/api/users, /api/tasks, /api/projects**: CRUD para gestão de projetos.
-   **/api/astro**: API proxy para serviços externos como NASA e PokeAPI.

Obrigado por usar o Projeto Pikachu!
