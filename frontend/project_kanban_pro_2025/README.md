# Frontend Principal (Next.js) - Kanban Pro 2025

Este é o frontend principal e a interface de usuário para o **Projeto Pikachu**. É uma Single-Page Application (SPA) moderna, construída com **React** e **Next.js**, e estilizada com **Tailwind CSS**.

## Visão Geral

Esta aplicação é responsável por toda a experiência do usuário. Ela consome a API RESTful exposta pelo [backend unificado](../backend/README.md) para buscar, exibir e manipular dados.

### Funcionalidades Implementadas

-   **Dashboard Central (`/dashboard`):** Um portal que serve como ponto de entrada para todas as funcionalidades da plataforma.
-   **Quadro Kanban:** Uma interface interativa de arrastar e soltar para gerenciamento de tarefas, com os dados persistidos no banco de dados central.
-   **Visualizadores de Dados:** Telas para exibir dados de outros módulos do backend (como o CRM da Floricultura e a Gestão de Projetos).
-   **Camada de Repositório:** A comunicação com o backend é abstraída através de uma camada de repositório (`src/app/Repository.jsx`), que centraliza a lógica de `fetch` da API.

## Como Executar

A partir da raiz do projeto (`Pikachu-Flask-Server`), siga os passos:

```bash
# 1. Navegue para esta pasta
cd frontend/project_kanban_pro_2025

# 2. Instale as dependências
npm install

# 3. Execute o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

**Importante:** Para que a aplicação funcione corretamente, o [servidor backend](../backend/README.md) precisa estar em execução, pois o frontend depende da sua API para obter os dados.