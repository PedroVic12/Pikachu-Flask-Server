# Guia de Uso: Kanban Pro 2025 - Organização com Kanban e Scrum

Olá, Pedro! Este guia vai te ajudar a usar o **Kanban Pro 2025** para organizar suas tarefas e sprints de forma eficiente, combinando o poder do Kanban para visualização e do Scrum para um trabalho focado e iterativo.

## 1. Conceitos Fundamentais (Kanban + Scrum)

Seu sistema foi pensado para uma abordagem híbrida:

-   **Kanban**: Focado em visualizar seu fluxo de trabalho, mover tarefas entre estágios e limitar o trabalho em progresso. O quadro Kanban é a tela principal.
-   **Scrum**: Focado em ciclos de trabalho com tempo definido, chamados "Sprints". A coluna **"SPRINT Atual"** é o coração do seu sprint.

## 2. Organizando seu Quadro Kanban

O quadro é dividido em colunas que representam o status de cada tarefa.

-   **`✏️ Lista de Tarefas` (To Do)**: Este é o seu **Backlog**. Todas as novas ideias, tarefas e projetos devem ser criados aqui. É a sua fonte de trabalho para sprints futuros.

-   **`🔍 SPRINT Atual` (In Progress)**: Aqui ficam as tarefas que você se comprometeu a fazer no sprint atual (por exemplo, nesta semana). O objetivo é mover as tarefas daqui para uma coluna de "concluído" ao final do sprint.

-   **`⏸️ Projetos Parados`**: Projetos ou tarefas que não são prioridade no momento, mas que você não quer esquecer.

-   **Colunas de Projeto/Contexto**: Colunas como `🔌 ONS PLC`, `🎓 UFF 2025`, `💻 Programação Github` funcionam como um arquivo ou um local para agrupar tarefas de um mesmo contexto. Você pode usá-las como colunas de **"Concluído"** para tarefas específicas daquele projeto. Por exemplo, ao terminar uma tarefa da ONS, mova-a de "SPRINT Atual" para "ONS PLC".

-   **`🤖 Agentes IA`**: Esta coluna é especial e funciona como uma coluna **"Done" (Concluído)** principal, especialmente para projetos de IA. O Dashboard considera os itens aqui como "Finalizados" para calcular suas métricas de progresso.

## 3. Como Rodar seus Sprints

Um sprint é um ciclo de trabalho (ex: uma semana) onde você foca em um conjunto de tarefas.

### Passo 1: Planejamento do Sprint (Sprint Planning)

1.  **Revise a `Lista de Tarefas`**: Olhe tudo o que precisa ser feito.
2.  **Defina a Meta do Sprint**: O que você quer alcançar nesta semana? (Ex: "Finalizar o protótipo da API", "Entregar o capítulo 2 do artigo").
3.  **Selecione as Tarefas**: Arraste os cartões da `Lista de Tarefas` para a coluna `SPRINT Atual`. Seja realista sobre o que você consegue fazer no tempo do sprint.

### Passo 2: Durante o Sprint

-   **Foco Total**: Trabalhe exclusivamente nas tarefas que estão em `SPRINT Atual`.
-   **Detalhe as Tarefas**: Abra um cartão e use o editor de Markdown para detalhar o que precisa ser feito. **Use checklists** para quebrar a tarefa em passos menores:
    ```markdown
    - [ ] Fazer a pesquisa inicial
    - [ ] Escrever o rascunho
    - [x] Revisar com o orientador (concluído)
    ```
    O sistema mostrará uma barra de progresso no cartão conforme você marca os itens!

### Passo 3: Fim do Sprint (Sprint Review)

1.  **Revise o Trabalho**: Olhe para os cartões em `SPRINT Atual`. O que foi concluído?
2.  **Mova os Cartões Concluídos**:
    -   Se uma tarefa de um projeto específico foi finalizada, mova-a para a coluna daquele projeto (ex: `ONS PLC`).
    -   Se for uma tarefa geral ou de IA, mova-a para `Agentes IA`.
3.  **Tarefas não Finalizadas**: Se uma tarefa não foi concluída, você tem duas opções:
    -   Deixá-la em `SPRINT Atual` para o próximo sprint (se ainda for prioridade máxima).
    -   Mover de volta para a `Lista de Tarefas` para ser repriorizada no futuro.

## 4. Usando as Categorias para Organizar

As categorias (`Estudos UFF`, `Projetos Python`, etc.) são perfeitas para agrupar tarefas por área ou projeto.

-   **Ao criar ou editar uma tarefa**, sempre atribua a categoria correta. Isso te ajuda a manter a organização visual com os emojis e cores.
-   **Use a tela de `Tabelas`**: Na tela de tabelas, você pode **filtrar por categoria**. Isso é extremamente útil para ver todas as tarefas de um projeto específico, independentemente do status em que elas estão.

## 5. Dicas Extras

-   **Dashboard é seu amigo**: Comece o dia olhando o Dashboard para ter uma visão geral do seu progresso.
-   **Sincronize com Frequência**: Lembre-se de clicar em **`Sincronizar`** para salvar suas alterações no Local Storage do navegador.
-   **Backup é Vida**: Use a função **`Backup Excel`** regularmente para não perder seu trabalho. Você pode restaurá-lo com `Importar Excel`.

Seguindo este guia, você transformará seu Kanban em uma poderosa ferramenta de produtividade. Bom trabalho!
