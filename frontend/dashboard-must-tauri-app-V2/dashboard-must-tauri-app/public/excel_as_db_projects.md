# Ideias de Mini-Projetos com Planilhas Excel (.xlsx) como "Banco de Dados" no Tauri

Esta seção apresenta ideias de mini-projetos para aplicações Tauri, onde arquivos `.xlsx` são utilizados como um "banco de dados" simples para persistência de dados. O frontend (com React, por exemplo) interage com o backend Rust para ler e escrever nessas planilhas.

**Nota Importante:** A integração robusta com arquivos `.xlsx` em Rust pode ser complexa devido à inferência de tipos e à manipulação de dados em formatos tabulares. A crate `calamine` é uma opção para leitura, mas pode exigir tratamento cuidadoso. Para operações de escrita, outras crates como `openxlsx` (ou alternativas) podem ser consideradas. Para cenários mais complexos que exigem manipulação transacional e consultas eficientes, um banco de dados mais tradicional como SQLite (integrado via `rusqlite` em Rust) pode ser uma alternativa mais robusta.

## Ideias de Mini-Projetos

1.  ### Gerenciador de Inventário Simples
    *   **Descrição:** Uma aplicação para gerenciar um inventário básico de produtos. Cada linha da planilha representa um produto com colunas para ID, Nome, Quantidade, Preço, etc.
    *   **Funcionalidades:** Adicionar novo produto, editar detalhes de um produto existente, remover produto, listar todos os produtos.

2.  ### Controle de Orçamento Pessoal
    *   **Descrição:** Um aplicativo para registrar despesas e receitas diárias/mensais. A planilha teria colunas como Data, Descrição, Categoria, Tipo (Receita/Despesa), Valor.
    *   **Funcionalidades:** Adicionar nova transação, visualizar extrato por período, calcular saldo total, filtrar por categoria.

3.  ### Lista de Tarefas (To-Do List) Offline
    *   **Descrição:** Uma lista de tarefas simples com a capacidade de adicionar, marcar como concluída e excluir tarefas. A planilha armazenaria o ID da tarefa, Descrição, Status (Pendente/Concluída) e Data Limite.
    *   **Funcionalidades:** Criar nova tarefa, marcar tarefa como concluída, excluir tarefa, filtrar tarefas pendentes/concluídas.

4.  ### Gerenciador de Contatos Básico
    *   **Descrição:** Um frontend para gerenciar uma lista de contatos. Cada contato com Nome, Telefone, Email, Endereço.
    *   **Funcionalidades:** Adicionar novo contato, editar informações de contato, excluir contato, buscar contatos por nome.

## Checklist de Etapas para Implementação (com React no Frontend)

Para cada mini-projeto, as etapas gerais seriam:

### 1. Configuração do Projeto e Dependências

*   [ ] **Tauri `main.rs`:** Certifique-se de que o `main.rs` está configurado com o `tauri::Builder::default().invoke_handler(...)` básico.
*   [ ] **`src-tauri/Cargo.toml`:**
    *   Adicione dependências Rust para leitura/escrita de Excel (ex: `calamine` para leitura, `openxlsx` para escrita) e `serde` / `serde_json` para serialização/desserialização de dados entre Rust e JavaScript.
    *   **Ação:** `cargo add calamine openxlsx serde_json` (ou as crates de sua escolha).
*   [ ] **Frontend React:**
    *   Configure seu projeto React (por exemplo, com Vite) no diretório `src/`.
    *   **Ação:** `npm create vite@latest frontend -- --template react-ts` (se usar TypeScript) ou `react` (se usar JavaScript). Mova o conteúdo para `src/` ou configure o `distDir` no `tauri.conf.json` corretamente.
    *   **Ação:** Instale `@tauri-apps/api`.

### 2. Backend Rust (`src-tauri/src/main.rs`)

*   [ ] **Funções `#[tauri::command]`:**
    *   Implemente comandos para lidar com as operações da planilha:
        *   `read_excel_data(path: String) -> Result<String, String>`:
            *   **Descrição:** Lê todo o conteúdo da planilha (ou de uma aba específica).
            *   **Implementação:** Abre o arquivo `.xlsx` (com `calamine::open_workbook_auto`), itera pelas linhas/células e coleta os dados. Converta os dados coletados (ex: `Vec<Vec<String>>` para cada aba) em uma string JSON usando `serde_json::to_string()`.
            *   **Retorno:** String JSON contendo os dados da planilha.
        *   `write_excel_data(path: String, data_json: String) -> Result<(), String>`:
            *   **Descrição:** Recebe uma string JSON (representando os dados a serem salvos) e os escreve na planilha.
            *   **Implementação:** Desserializa `data_json` para uma estrutura Rust (ex: `Vec<Vec<String>>`). Abre a planilha (com a crate de escrita de Excel), atualiza/sobrescreve os dados e salva.
            *   **Retorno:** `Ok(())` em caso de sucesso, `Err(String)` em caso de falha.
        *   **(Opcional) Funções CRUD mais específicas:**
            *   `add_row(path: String, row_data_json: String) -> Result<(), String>`: Leria a planilha, adicionaria a nova linha e salvaria.
            *   `update_row(path: String, row_id: String, new_data_json: String) -> Result<(), String>`: Encontraria a linha pelo ID, atualizaria e salvaria.
    *   **Tratamento de Erros:** Certifique-se de que todas as operações retornem `Result` e que os erros sejam mapeados para `String` para serem facilmente consumidos pelo frontend.
*   [ ] **Registro de Comandos:** Adicione todas as novas funções `#[tauri::command]` ao `tauri::generate_handler!`.

### 3. Frontend React (`src/App.tsx` ou componentes)

*   [ ] **Estrutura da UI:**
    *   Crie componentes React para exibir os dados (ex: tabela), formulários para adicionar/editar, botões para salvar/carregar.
    *   **Ação:** Use `useState` para gerenciar o estado dos dados da planilha no frontend.
*   [ ] **Interação com Backend:**
    *   Importe `invoke` do `@tauri-apps/api/tauri`.
    *   **Ação:** Use `useEffect` para carregar dados da planilha ao iniciar o componente.
    *   **Ação:** Implemente funções assíncronas (`async/await`) que chamam os comandos Rust (`invoke("read_excel_data", { path: "caminho/do/arquivo.xlsx" })`).
    *   **Ação:** Use `JSON.parse()` no resultado do `read_excel_data` e `JSON.stringify()` para enviar dados para `write_excel_data`.
    *   **Ação:** Lide com os erros retornados pelos comandos Rust.

### 4. Configuração do Tauri (`src-tauri/tauri.conf.json`)

*   [ ] **Permissões do Sistema de Arquivos:**
    *   Na seção `tauri > allowlist > fs`, conceda as permissões necessárias para ler e escrever arquivos. Seja o mais restritivo possível.
    *   **Exemplo:**
        ```json
        "allowlist": {
          "all": false,
          "fs": {
            "all": false,
            "readFile": true,
            "writeFile": true,
            "readDir": true,
            "createDir": true,
            "removeFile": true,
            "scope": ["$APPCONFIG/*", "$DOCUMENT/*"] // Limitar o acesso a diretórios específicos
          },
          "path": {
            "all": true // Necessário para resolver caminhos como $DOCUMENT
          }
        }
        ```
*   [ ] **Diretório Frontend:** Certifique-se de que `build > distDir` aponte corretamente para a pasta de build do seu aplicativo React (ex: `../dist`).
*   [ ] **Comandos de Build/Dev:** Configure `build > beforeDevCommand` e `build > beforeBuildCommand` para iniciar o servidor de desenvolvimento e construir seu aplicativo React, respectivamente.

### 5. Execução e Teste

*   [ ] **Desenvolvimento:** Execute `npm run tauri dev` (ou `yarn tauri dev`) na raiz do seu projeto Tauri. Isso iniciará seu aplicativo React e o empacotará no Tauri.
*   [ ] **Build para Produção:** Execute `npm run tauri build` para criar um executável da sua aplicação.

---

## Integrando React no Frontend do Tauri v2 (com Rust como Motor)

Você está correto! A ideia é exatamente essa: usar React para construir seu frontend, com `index.html` servindo como o ponto de entrada, enquanto o Rust atua como o motor robusto de backend.

1.  **O `index.html` como Ponto de Entrada:**
    *   No Tauri, o `index.html` (ou o arquivo configurado como `frontendDist` em `tauri.conf.json`) é o que o WebView do Tauri carrega primeiro.
    *   Seu aplicativo React é, na verdade, um conjunto de arquivos HTML, CSS e JavaScript estáticos. O `index.html` é o "invólucro" que carrega seu bundle JavaScript principal (geralmente `main.js` ou `index.js`).

2.  **Desenvolvimento com React (Ex: Vite):**
    *   Durante o desenvolvimento (`tauri dev`), o Tauri não carrega o `index.html` diretamente da sua pasta de build. Em vez disso, ele inicia o servidor de desenvolvimento do seu framework React (ex: Vite na porta 5173). O `tauri.conf.json` aponta para `devUrl: "http://localhost:5173"`.
    *   Isso permite que você aproveite recursos como Hot Module Replacement (HMR) e feedback instantâneo no desenvolvimento do React.

3.  **Build de Produção com React:**
    *   Quando você constrói seu aplicativo React para produção (ex: `npm run build`), ele gera uma pasta (geralmente `dist` ou `build`) contendo todos os arquivos estáticos otimizados: `index.html`, `bundle.js`, `style.css`, etc.
    *   O `tauri.conf.json` aponta para esta pasta via `distDir: "../dist"`.

4.  **Rust como o "Motor":**
    *   Mesmo com o React fornecendo a interface de usuário no WebView, o Rust permanece o "motor" da aplicação desktop.
    *   **Acesso Nativo:** Qualquer interação com o sistema operacional (arquivos, notificações, bandeja do sistema, etc.) é roteada de forma segura do JavaScript (via `invoke`) para o seu backend Rust.
    *   **Lógica de Negócio:** Cálculos complexos, manipulação de dados, interações com bancos de dados reais (SQLite, PostgreSQL, etc.) são implementados em Rust para performance e segurança.
    *   **Confiabilidade e Performance:** O Rust garante que as operações críticas sejam executadas de forma eficiente e sem falhas de memória, fornecendo a base sólida para a sua aplicação.

Em resumo, o React cuida de "como a aplicação se parece e interage visualmente", enquanto o Rust cuida de "o que a aplicação faz no nível do sistema operacional e como os dados são processados de forma eficiente e segura". Eles trabalham em conjunto através da ponte IPC do Tauri.
