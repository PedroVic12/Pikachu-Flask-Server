# pikachu-sever-template

Aplicação Completa: Flask (MVC/API) + React (Vite) + SQLite
Este guia detalha a criação de uma aplicação "Todo List" completa, seguindo as melhores práticas para integrar um backend Python/Flask com um frontend moderno em React/Vite.



   pedrov12  ~/Documentos/GitHub/pikachu-sever-template/api    main   2  23:36:57

❯ mkdir -p src/api src/backend/controllers src/database src/templates src/static/css src/static/js src/static/components && touch src/api/routes.py src/backend/controllers/__init__.py src/database/models.py src/templates/index.html requirements.txt



Visão Geral da Arquitetura

## Backend (Flask):

Servirá como uma API RESTful, retornando dados em formato JSON.

```bash
pip install Flask Flask-SQLAlchemy Flask-Cors
```

Seguirá uma estrutura semelhante ao MVC:

Model: Classes Python (usando SQLAlchemy) que mapeiam as tabelas do banco de dados (Category, Task).

View (API Endpoints): As rotas da nossa API que o React irá consumir (ex: /api/tasks, /api/categories).

Controller (Lógica): A lógica dentro de cada rota que interage com o modelo e retorna os dados.

Utilizará SQLite como banco de dados, que é perfeito para desenvolvimento e pequenas aplicações.

Em produção, servirá os arquivos estáticos gerados pelo Vite (index.html, JS, CSS).

## Frontend (React + Vite):

Uma Single Page Application (SPA) totalmente interativa.

Componentes para cada parte da UI (lista de tarefas, item da tarefa, formulário, timer Pomodoro, gráfico).

Fará chamadas HTTP (usando axios) para a API Flask para buscar e manipular os dados.

Usará a biblioteca recharts para criar o gráfico de pizza.

1) Install

```bash
npm create vite@latest frontend -- --template react
```

```bash
cd frontend
npm install axios recharts lucide-react
```

```bash
npm install -D tailwindcss postcss autoprefixer
```

```bash
npx tailwindcss init -p
```

tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Adicione esta linha
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

1) Dentro da pasta frontend, você roda o comando npm run build.

2) Depois, dentro da pasta backend, você roda o comando python main.py.
Ao fazer isso, o servidor Flask irá iniciar e ele mesmo servirá toda a sua aplicação React já pronta para produção. Você poderá acessar o site completo pelo endereço do Flask (normalmente http://localhost:5000).


Como Rodar a Nova Versão
O processo para rodar a aplicação é o mesmo de antes:

Modo de Desenvolvimento (Recomendado):

Terminal 1 (pasta backend): python main.py
Terminal 2 (pasta frontend): npm run dev
Acesse: http://localhost:5173
Modo de Produção:

Na pasta frontend, rode: npm run build
Na pasta backend, rode: python main.py
Acesse: http://localhost:5000


O App já inclui:

Backend Flask com API e banco de dados SQLite.
Frontend em React com Vite.
CRUD completo para tarefas e categorias.
Timer Pomodoro individual para cada tarefa.
Gráfico de pizza que mostra o tempo gasto por categoria.

