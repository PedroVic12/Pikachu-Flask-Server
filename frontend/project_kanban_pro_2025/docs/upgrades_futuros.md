# Guia para Futuros Upgrades: Adicionando Novas Páginas e Componentes

Este guia serve como um passo a passo para ajudá-lo a criar novos componentes React e integrá-los como novas páginas na aplicação, incluindo a adição de um item de menu na barra lateral.

## Visão Geral da Arquitetura

- **`app/page.jsx`**: Este é o arquivo principal que orquestra toda a aplicação. Ele contém:
    - A lógica de estado principal (através do hook `useProjects`).
    - Os componentes da interface, como `Sidebar`, `DashboardScreen`, `KanbanScreen`, etc.
    - A função `renderCurrentScreen` que decide qual "página" (componente) mostrar.
- **`app/Repository.jsx`**: Centraliza as constantes do projeto, como `CATEGORIES` e `STATUS_COLUMNS`.
- **Componentes**: São blocos de construção reutilizáveis da sua UI. Funções que retornam JSX.

---

## Passo a Passo para Adicionar uma Nova Página

Vamos supor que você queira criar uma nova página chamada "Relatórios".

### Passo 1: Criar o Componente da Nova Página

Primeiro, crie seu novo componente. A boa prática é criar um componente funcional que encapsule toda a lógica e a interface da sua nova página.

1.  Você pode criar um novo arquivo, por exemplo, `app/components/ReportsScreen.jsx`, ou adicioná-lo diretamente em `app/page.jsx` se for mais simples. Para melhor organização, vamos criar um novo arquivo.

2.  **Crie o arquivo `app/components/ReportsScreen.jsx`** e adicione o seguinte código base:

    ```jsx
    import React from 'react';

    // Você pode receber props (propriedades) se precisar passar dados, como a lista de projetos.
    const ReportsScreen = ({ projects }) => {
      return (
        <div className="p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Página de Relatórios
            </h1>
            <p className="text-gray-600">
              Aqui você pode construir seus relatórios personalizados.
            </p>
          </div>

          {/* Adicione aqui seus gráficos, tabelas e outros elementos */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Total de Projetos: {projects.length}
            </h3>
            {/* Exemplo de como usar os dados */}
          </div>
        </div>
      );
    };

    export default ReportsScreen;
    ```

### Passo 2: Adicionar a Nova Página ao Menu Lateral

Agora, vamos adicionar um link para sua nova página na barra lateral.

1.  **Abra o arquivo `app/page.jsx`**.

2.  **Encontre o componente `Sidebar`**. Dentro dele, localize a constante `menuItems`.

3.  **Adicione um novo objeto** a essa lista. O `id` deve ser um identificador único, e o `label` é o que aparecerá no menu. Você pode usar um ícone da biblioteca `lucide-react`.

    ```jsx
    // Dentro do componente Sidebar em app/page.jsx

    // Importe um novo ícone, se desejar
    import { ..., PieChart } from 'lucide-react';

    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'kanban', label: 'Kanban', icon: Kanban },
      { id: 'table', label: 'Tabelas', icon: Table },
      { id: 'files', label: 'Arquivos', icon: FileText },
      // Adicione a nova linha abaixo
      { id: 'reports', label: 'Relatórios', icon: PieChart },
    ];
    ```

### Passo 3: Renderizar o Novo Componente

O último passo é dizer à aplicação para mostrar seu novo componente quando o item de menu correspondente for clicado.

1.  **Ainda em `app/page.jsx`**, encontre a função `renderCurrentScreen`.

2.  **Adicione um novo `case`** ao `switch` para o `id` que você definiu no passo anterior (`'reports'`).

3.  **Importe seu novo componente** no topo do arquivo `app/page.jsx`.

    ```jsx
    // No topo de app/page.jsx
    import ReportsScreen from './components/ReportsScreen.jsx'; // Crie este arquivo se ainda não o fez
    ```

4.  **Atualize a função `renderCurrentScreen`**:

    ```jsx
    // Dentro do componente App em app/page.jsx

    const renderCurrentScreen = () => {
      switch (currentScreen) {
        case 'dashboard':
          return <DashboardScreen />;
        case 'kanban':
          return <KanbanScreen />;
        case 'table':
          return <TableScreen />;
        case 'files':
          return <FilesScreen />;
        // Adicione o case para a nova tela
        case 'reports':
          // Passe os projetos como prop se o componente precisar deles
          return <ReportsScreen projects={projects} />;
        default:
          return <DashboardScreen />;
      }
    };
    ```

### Resumo e Boas Práticas

- **Componentização**: Mantenha seus componentes de página focados em uma única responsabilidade. Se uma página se tornar muito complexa, quebre-a em componentes menores.
- **Organização de Arquivos**: Para um projeto maior, considere criar uma pasta `app/screens` ou `app/views` para organizar seus componentes de página, em vez de colocá-los todos em `app/page.jsx`.
- **Props**: Passe dados de "pai para filho" usando props (ex: `<ReportsScreen projects={projects} />`). Isso torna o fluxo de dados claro e previsível.
- **Estado**: Se um componente precisar de seu próprio estado interno (que não afeta o resto da aplicação), use `useState` dentro dele.

Pronto! Seguindo esses passos, você pode expandir sua aplicação com quantas páginas personalizadas desejar, mantendo o código limpo e organizado.
