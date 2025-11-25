# Kanban Pro 2025

Bem-vindo ao Kanban Pro 2025, uma ferramenta moderna e intuitiva para gerenciamento de projetos e tarefas, inspirada nas metodologias Kanban e Scrum.

![Kanban Pro 2025 Screenshot](https://via.placeholder.com/800x450.png?text=Kanban+Pro+2025+Interface)

## 🚀 Sobre o Projeto

O Kanban Pro 2025 foi criado para oferecer uma solução visual e flexível para organizar suas ideias, projetos e tarefas diárias. Seja você um estudante, desenvolvedor, ou gerente de projetos, esta ferramenta o ajudará a manter o foco, acompanhar o progresso e aumentar sua produtividade.

A aplicação é totalmente client-side, utilizando o Local Storage do seu navegador para persistir os dados, garantindo privacidade e velocidade.

### ✨ Funcionalidades

- **Dashboard Geral**: Tenha uma visão panorâmica do status de todos os seus projetos, com estatísticas sobre categorias e progresso.
- **Quadro Kanban**: Organize suas tarefas em colunas personalizáveis (Rascunho, Em Análise, Parados, etc.) e mova os cartões com um simples arrastar e soltar.
- **Visualização em Tabela**: Para quem prefere uma abordagem mais tradicional, veja, filtre e ordene todos os seus itens em uma tabela detalhada.
- **Editor Markdown**: Cada tarefa possui um editor de conteúdo completo com suporte a Markdown, permitindo que você adicione descrições ricas, listas de verificação e links.
- **Categorias Personalizadas**: Classifique suas tarefas em categorias como "Estudos UFF", "Projetos Python", "Relatórios ONS", etc., para uma melhor organização.
- **Importação e Exportação**: Faça backup de seus dados para um arquivo Excel (`.xlsx`) ou importe projetos de uma planilha existente.
- **Sincronização Local**: Salve suas alterações no Local Storage do navegador a qualquer momento.
- **Gerenciador de Arquivos**: Faça upload e associe arquivos (PDFs, Imagens, Planilhas) aos seus projetos (funcionalidade em desenvolvimento).

## 🛠️ Como Usar

Esta é uma aplicação Next.js. Para executá-la localmente, siga os passos abaixo.

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd project_kanban_pro_2025
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```
    ou
    ```bash
    yarn install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    ou
    ```bash
    yarn dev
    ```

4.  Abra seu navegador e acesse [http://localhost:3000](http://localhost:3000).

### Utilizando as Funcionalidades

- **Navegação**: Use o menu lateral para alternar entre o Dashboard, o quadro Kanban e a Tabela de projetos.
- **Criar uma Tarefa**: No quadro Kanban, clique no botão `+` na coluna desejada. Um novo item será criado e o editor será aberto.
- **Editar uma Tarefa**: Clique em qualquer cartão no quadro Kanban ou no botão "Editar" na tabela para abrir o modal de edição.
- **Mover uma Tarefa**: No quadro Kanban, clique e arraste um cartão de uma coluna para outra para atualizar seu status.
- **Backup e Restauração**: Use os botões "Backup Excel" e "Importar Excel" no menu lateral para salvar ou carregar seus dados.

##  методологии Kanban e Scrum com o Kanban Pro 2025

O Kanban Pro 2025 é flexível o suficiente para se adaptar a diferentes fluxos de trabalho, incluindo os populares Kanban e Scrum.

### Kanban

O método Kanban é sobre visualizar seu trabalho, limitar o trabalho em andamento (Work in Progress - WIP) e maximizar a eficiência.

1.  **Visualize o Fluxo**: As colunas no quadro Kanban (`Em Rascunho`, `Em Análise`, etc.) representam as etapas do seu fluxo de trabalho. Você pode adaptar o significado delas para o seu processo.
2.  **Limite o WIP**: Embora a ferramenta não imponha um limite rígido, uma boa prática é tentar não ter muitas tarefas na coluna "Em Análise" ao mesmo tempo. Isso ajuda a focar na conclusão antes de iniciar novas tarefas.
3.  **Gerencie o Fluxo**: O objetivo é mover as tarefas da esquerda para a direita o mais suavemente possível. Use o Dashboard para identificar gargalos (por exemplo, muitos itens parados).

### Scrum

O Scrum é um framework mais estruturado, baseado em Sprints (ciclos de trabalho curtos).

1.  **Product Backlog**: A coluna "Em Rascunho" pode servir como seu *Product Backlog*, onde você lança todas as ideias e tarefas.
2.  **Sprint Planning**: Antes de iniciar um Sprint (por exemplo, uma semana de trabalho), mova as tarefas que você planeja concluir do "Product Backlog" para a coluna "Em Análise" (ou crie uma coluna "Sprint Backlog").
3.  **Daily Stand-up**: Diariamente, revise o quadro Kanban para discutir o que foi feito, o que será feito e quaisquer impedimentos.
4.  **Conclusão**: Ao final do Sprint, mova as tarefas concluídas para uma coluna "Concluído" (você pode renomear a coluna "Agentes IA" ou outra para este fim).

## 🔮 Planejamento Futuro: Sincronização com GitHub

Um dos objetivos mais empolgantes para o futuro do Kanban Pro 2025 é a **sincronização de tarefas com arquivos Markdown (`.md`) de um repositório no GitHub**.

### Como vai funcionar?

A ideia é permitir que você vincule um cartão específico do Kanban a um arquivo `.md` em um de seus repositórios.

1.  **Autenticação**: Você poderá se autenticar com sua conta do GitHub.
2.  **Vinculando um Cartão**: Em um cartão do Kanban, haverá uma opção para "Sincronizar com GitHub". Você poderá então escolher um repositório e um arquivo `.md` existente ou criar um novo.
3.  **Sincronização Bidirecional**:
    -   Alterações feitas no conteúdo do cartão no Kanban Pro 2025 serão "commitadas" no arquivo `.md` correspondente no GitHub.
    -   Alterações feitas diretamente no arquivo `.md` no GitHub serão puxadas e refletidas no conteúdo do cartão no Kanban Pro 2025.

Isso permitirá que você mantenha seu planejamento e documentação perfeitamente alinhados, combinando a gestão visual do Kanban com o poder do versionamento do Git.

---

Feito com ❤️ por Pedro.
