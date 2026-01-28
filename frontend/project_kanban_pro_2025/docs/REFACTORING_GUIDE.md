# Guia de Refatoração e Arquitetura para o Projeto Kanban Pro

Olá! Este guia foi criado para te ajudar a refatorar o arquivo `app/page.jsx`, que cresceu bastante, e a organizar o projeto de uma forma mais escalável e manutenível. A ideia é seguir padrões modernos de desenvolvimento com React e Next.js.

## 1. O Problema: O "Componente Deus"

Seu `page.jsx` se tornou o que chamamos de "Componente Deus" (God Component). Ele sabe sobre tudo:
- Gerencia o estado de **todas** as telas.
- Contém a lógica de **todas** as telas (`DashboardScreen`, `KanbanScreen`, etc.).
- Renderiza tudo.

Isso torna a manutenção difícil, a leitura complexa e a reutilização de código quase impossível.

## 2. O Objetivo: Separação de Responsabilidades (SOLID)

Vamos aplicar o **Princípio da Responsabilidade Única (SRP)**, a primeira letra do SOLID. Ele diz que cada componente ou módulo deve ter **apenas um motivo para mudar**.

Para isso, usaremos uma arquitetura parecida com **MVC (Model-View-Controller)**, mas adaptada para o frontend moderno:

- **Model (ou Camada de Dados/Serviços):** Lógica de negócio e acesso a dados. Quem busca ou salva informações.
  - *No seu projeto:* `ProjectRepository`, `FileUploaderController`, `DeckStorageController`.
- **View (A Camada de Apresentação):** Seus componentes React. A única responsabilidade deles é exibir dados e emitir eventos (como um clique). Devem ser "burros", ou seja, não devem conter lógica de negócio.
  - *No seu projeto:* `KanbanCard`, `StatCard`, `FileCarousel`.
- **Controller (ou Camada de Controle/Estado):** A cola que une tudo. Gerencia o estado, responde a eventos da View e chama o Model.
  - *No seu projeto:* O componente `App` em `page.jsx` e os hooks como `useProjects`.

## 3. Sugestão de Nova Estrutura de Pastas

Aqui está uma sugestão de como organizar o projeto para refletir essa separação.

```
/
├── app/
│   ├── page.jsx           // Ficará bem menor! Apenas o layout principal e o gerenciamento de estado.
│   └── globals.css
├── components/
│   ├── ui/                // (Já existe) Componentes de UI genéricos (Button, Card, etc.)
│   └── layout/            // Componentes de layout da aplicação
│       ├── Sidebar.jsx
│       └── AppShell.jsx     // O "esqueleto" principal da sua aplicação
├── features/              // <- A MÁGICA ACONTECE AQUI
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── StatCard.jsx
│   │   │   └── CategoryChart.jsx
│   │   └── DashboardScreen.jsx
│   ├── kanban/
│   │   ├── components/
│   │   │   ├── KanbanColumn.jsx
│   │   │   └── ItemEditorModal.jsx
│   │   └── KanbanScreen.jsx
│   ├── fileManager/
│   │   ├── components/
│   │   │   ├── FileCarousel.jsx
│   │   │   └── DeckUploader.jsx
│   │   └── FilesScreen.jsx
│   └── projectsTable/
│       ├── components/
│       │   └── FilterControls.jsx
│       └── TableScreen.jsx
├── hooks/
│   └── useProjects.js     // (Já existe) Perfeito para gerenciar a lógica de estado dos projetos.
├── services/              // <- ANTIGA PASTA 'controllers'
│   ├── projectRepository.js
│   ├── fileStorage.js       // Lógica do localStorage
│   └── deckStorage.js       // Lógica do IndexedDB
└── ... (outros arquivos de configuração)
```

## 4. Passo a Passo para a Refatoração

**Não tente fazer tudo de uma vez!** Comece por uma tela, como a `DashboardScreen`.

**Passo 1: Mova a `DashboardScreen` para seu próprio arquivo**
1.  Crie a pasta `features/dashboard/`.
2.  Crie o arquivo `features/dashboard/DashboardScreen.jsx`.
3.  Recorte todo o código da função `DashboardScreen` de `page.jsx` e cole no novo arquivo.
4.  No topo de `DashboardScreen.jsx`, adicione as importações que ele precisa (`React`, `OlaMundo`, `BarChart3`, etc.).
5.  No final, exporte o componente: `export default DashboardScreen;`.

**Passo 2: Passe os Dados como `props`**
A `DashboardScreen` precisa de dados como `projects` e `getStatusStats`. O `App` (em `page.jsx`) já tem esses dados. Você vai passá-los como "propriedades" (props).

Em `page.jsx`, onde você renderiza a tela:
```jsx
// Em page.jsx, dentro de renderCurrentScreen

case 'dashboard':
  return <DashboardScreen 
            projects={projects} 
            statusStats={getStatusStats()} 
            categoryStats={getCategoryStats()} 
         />;
```
E em `DashboardScreen.jsx`, você recebe essas props:
```jsx
// Em features/dashboard/DashboardScreen.jsx

export default function DashboardScreen({ projects, statusStats, categoryStats }) {
  // O resto do seu código aqui, usando as props diretamente
  // ...
}
```

**Passo 3: Quebre a `DashboardScreen` em Componentes Menores**
1.  Olhe para a `DashboardScreen` e identifique partes reutilizáveis. O card de estatísticas é um ótimo candidato.
2.  Crie a pasta `features/dashboard/components/`.
3.  Crie o arquivo `features/dashboard/components/StatCard.jsx`.
4.  Mova o JSX do card para dentro deste novo componente. Ele receberá `label`, `value`, `Icon`, e `color` como props.

    ```jsx
    // Em StatCard.jsx
    export default function StatCard({ label, value, icon: Icon, color }) {
      return (
        <div className="bg-white rounded-xl p-6 shadow-sm...">
          {/* ... seu JSX aqui ... */}
        </div>
      );
    }
    ```
5.  Agora, na `DashboardScreen`, apenas use este novo componente em um loop:
    ```jsx
    // Em DashboardScreen.jsx
    import StatCard from './components/StatCard.jsx';
    // ...
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map(cardProps => (
        <StatCard key={cardProps.label} {...cardProps} />
      ))}
    </div>
    ```
Pronto! Você aplicou o Princípio da Responsabilidade Única. O `StatCard` só se preocupa em exibir um card, e o `DashboardScreen` só se preocupa com o layout do dashboard.

**Passo 4: Repita o Processo**
- Faça o mesmo para a `KanbanScreen`, `TableScreen`, e `FilesScreen`.
- Mova os "controllers" para a pasta `services/`.
- Continue quebrando os componentes grandes em partes menores e mais gerenciáveis.

## 5. Conclusão

Refatorar pode parecer assustador, mas começar pequeno e seguir esses princípios fará uma diferença enorme. Seu "eu" do futuro (e qualquer outra pessoa que trabalhe no projeto) agradecerá.

**Benefícios Finais:**
- **Código Legível:** É mais fácil entender o que um componente de 50 linhas faz do que um de 1000.
- **Manutenção Simples:** Um bug no card de estatísticas? Você sabe que o problema está no arquivo `StatCard.jsx`, e não perdido em `page.jsx`.
- **Reutilização:** Você pode usar seu `StatCard` em outras telas no futuro, se precisar.
- **Escalabilidade:** Adicionar novas funcionalidades se torna muito mais fácil.

Boa refatoração!
