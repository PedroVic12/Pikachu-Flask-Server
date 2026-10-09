# Guia da API Frontend do Tauri para Interação com Backend Rust

Este guia explica como interagir com o seu backend Rust a partir do seu frontend (HTML/JavaScript) em uma aplicação Tauri, traçando paralelos com a forma como você lidaria com chamadas de API em aplicações Node.js (Express) ou Python (Flask).

## Como Usar `tauri dev` para Conectar o Frontend ao Backend

`tauri dev` é o comando principal que você executa no terminal, na raiz do seu projeto Tauri (por exemplo, `/home/pedrov12/Documentos/GitHub/dashboard-website-template/dashboard-must-tauri-app`), para desenvolver sua aplicação.

Quando você executa `tauri dev`, ele realiza várias ações:
1.  **Compila seu Backend Rust:** Ele compila seu código Rust em `src-tauri` em um executável.
2.  **Inicia seu Servidor de Desenvolvimento Frontend:** Se o seu `tauri.conf.json` estiver configurado para usar um servidor de desenvolvimento frontend (por exemplo, Vite, Webpack, etc.), `tauri dev` iniciará esse servidor. Este servidor hospeda seu HTML, CSS e JavaScript.
3.  **Inicia a Janela Tauri:** Ele abre uma janela de desktop que carrega seu frontend. Crucialmente, esta janela de desktop fornece uma ponte segura (IPC - Comunicação Interprocessos) entre seu frontend baseado em web e seu backend Rust.

**Como a Conexão Funciona:**

*   **Frontend (JavaScript):** Seu código JavaScript (por exemplo, em `src/main.js`) usa a função `invoke` do `@tauri-apps/api/tauri` para chamar comandos Rust. Por exemplo: `import { invoke } from '@tauri-apps/api/tauri'; await invoke('meu_comando');`
*   **Backend (Rust):** Suas funções Rust anotadas com `#[tauri::command]` (como `my_command` em `src-tauri/src/main.rs`) são expostas ao frontend através dessa ponte.

Portanto, para conectar seu backend Rust com seu frontend, você só precisa:
1.  **Garantir que seu `src-tauri/src/main.rs` registre seus comandos** (o que já fizemos para `my_command` e `read_markdown_file`).
2.  **Garantir que seu frontend use `invoke`** para chamar esses comandos.
3.  **Executar `tauri dev`** a partir da raiz do seu projeto.

---

## 1. Invocando Comandos Rust a partir do JavaScript

No Tauri, funções anotadas com `#[tauri::command]` no seu backend Rust tornam-se chamáveis a partir do seu JavaScript frontend. Isso é semelhante a definir endpoints de API em Node.js ou Flask, mas em vez de requisições HTTP, o Tauri oferece um mecanismo direto e seguro de IPC (Comunicação Interprocessos).

### Backend Rust (`src-tauri/src/main.rs` ou outros arquivos Rust)

```rust
// Exemplo: Um comando simples que retorna uma saudação
#[tauri::command]
fn greet(name: String) -> String {
    format!("Olá, {}! Você foi cumprimentado do Rust!", name)
}

// Exemplo: Um comando para ler um arquivo Markdown e convertê-lo para HTML
#[tauri::command]
fn read_markdown_file(path: String) -> Result<String, String> {
    use std::fs;
    use std::io::Read;
    use pulldown_cmark::{Parser, html};

    let mut file = fs::File::open(&path)
        .map_err(|e| format!("Falha ao abrir arquivo markdown: {}", e))?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| format!("Falha ao ler arquivo markdown: {}", e))?;

    let parser = Parser::new(&contents);
    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);
    Ok(html_output)
}

// Você precisa registrar seus comandos na função `main`:
fn main() {
    tauri::Builder::default()
        // ... outras configurações ...
        .invoke_handler(tauri::generate_handler![greet, read_markdown_file])
        .run(tauri::generate_context!())
        .expect("erro ao executar a aplicação tauri");
}
```

### Frontend JavaScript (por exemplo, `src/main.js` ou script de uma página específica)

Para chamar esses comandos Rust, você usa a função `invoke` fornecida por `@tauri-apps/api/tauri`.

```javascript
import { invoke } from "@tauri-apps/api/tauri";

// Análogo a chamar um endpoint GET /greet?name=World em Node.js
async function callGreet() {
    try {
        const response = await invoke("greet", { name: "Mundo" });
        console.log("Saudação do Rust:", response); // Saída: "Olá, Mundo! Você foi cumprimentado do Rust!"
    } catch (error) {
        console.error("Erro ao chamar greet:", error);
    }
}

// Exemplo: Chamando a função Rust para ler e converter um arquivo Markdown
async function callReadMarkdown() {
    try {
        const htmlContent = await invoke("read_markdown_file", { path: "caminho/para/seu/arquivo.md" });
        console.log("Conteúdo HTML do Markdown:", htmlContent);
        // Você pode então inserir este HTML em sua página, por exemplo:
        // document.getElementById("markdown-output").innerHTML = htmlContent;
    } catch (error) {
        console.error("Erro ao ler arquivo Markdown:", error);
    }
}

// Chama as funções
callGreet();
callReadMarkdown();
```

---

## 2. Emitindo e Escutando Eventos

O Tauri oferece um sistema de eventos, semelhante a eventos personalizados em Node.js ou Flask (por exemplo, usando WebSockets ou SSE para atualizações em tempo real). Isso permite que seu backend Rust envie informações para o frontend sem que o frontend as solicite explicitamente.

### Backend Rust

```rust
use tauri::Manager; // Necessário para acessar o gerenciador de eventos

// Exemplo: Um comando que emite um evento após algum trabalho (como a conclusão de uma tarefa em segundo plano)
#[tauri::command]
fn start_long_task(app_handle: tauri::AppHandle) {
    // Simula algum trabalho de longa duração
    std::thread::spawn(move || {
        println!("Iniciando tarefa demorada...");
        std::thread::sleep(std::time::Duration::from_secs(3));
        let message = "Tarefa demorada concluída!";
        app_handle.emit_all("task_status", message).unwrap(); // Emite evento para todas as janelas
        println!("Tarefa demorada finalizada e evento emitido!");
    });
}

// Registre `start_long_task` na função `main` junto com outros comandos.
```

### Frontend JavaScript

```javascript
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

// Escuta o evento personalizado do backend Rust
const unlisten = await listen("task_status", (event) => {
    console.log("Evento recebido do Rust:", event.payload); // Saída: "Tarefa demorada concluída!"
});

// Chama o comando Rust para iniciar a tarefa
async function triggerLongTask() {
    await invoke("start_long_task");
    console.log("Tarefa demorada acionada pelo frontend.");
}

triggerLongTask();

// Para parar de escutar o evento mais tarde:
// unlisten();
```

---

## 3. Acessando o Sistema de Arquivos (de Forma Segura)

Ao contrário de Node.js ou Flask, onde você acessa diretamente o sistema de arquivos do servidor, as aplicações Tauri são executadas na máquina do usuário, então o acesso direto e irrestrito ao sistema de arquivos é um risco de segurança. O Tauri fornece APIs seguras para isso, exigindo permissões do usuário.

### Backend Rust

Normalmente, você não exporia operações brutas do sistema de arquivos diretamente como `#[tauri::command]`s sem validação e escopo cuidadosos. Em vez disso, você usaria as APIs ou plugins de sistema de arquivos integrados do Tauri.

Exemplo (conceitual, requer que o módulo/plugin `fs` do Tauri esteja habilitado e configurado em `tauri.conf.json`):

```rust
// Isso geralmente usa tauri::api::fs ou um plugin
// #[tauri::command]
// async fn read_my_document(path: String) -> Result<String, String> {
//     // Lê o arquivo de forma segura, após permissão do usuário via diálogo, se necessário
//     // Isso é mais complexo do que um simples fs::read_to_string
//     // devido ao sandboxing de segurança.
//     Ok(format!("Conteúdo de {}: ...", path))
// }
```

### Frontend JavaScript

Você usaria o módulo `fs` de `@tauri-apps/api` (se habilitado em `tauri.conf.json`).

```javascript
import { readTextFile, BaseDirectory } from "@tauri-apps/api/fs";

async function readFile() {
    try {
        // Lê um arquivo do diretório de documentos do usuário (requer permissão)
        const contents = await readTextFile("meu-documento.txt", { dir: BaseDirectory.Document });
        console.log("Conteúdo do arquivo:", contents);
    } catch (error) {
        console.error("Erro ao ler arquivo:", error);
    }
}

readFile();
```

---

## Checklist para Conectar Frontend ao Backend Rust (Analogias Node.js/Flask/Python)

Aqui está um checklist para tarefas comuns e como elas se mapeiam para o Tauri, com analogias aos conceitos de Node.js (Express) ou Python (Flask):

-   [x] **Definindo Lógica de Backend (Endpoints de API):**
    -   **Node.js/Flask/Python:** Crie rotas (`app.get('/api/data', ...)`, `@app.route('/api/data')`).
    -   **Tauri Rust:** Use `#[tauri::command]` em funções Rust.
        -   **Ação:** Anote suas funções Rust com `#[tauri::command]`.
        -   **Ação:** Registre essas funções em `tauri::Builder::invoke_handler!`.

-   [x] **Chamando Lógica de Backend do Frontend (Fazendo Requisições de API):**
    -   **Node.js/Flask/Python:** Use `fetch('/api/data')` ou `requests.get('/api/data')`.
    -   **Tauri JavaScript:** Use `import { invoke } from "@tauri-apps/api/tauri";` e `await invoke("nome_comando", { arg1: valor1 });`.
        -   **Ação:** Importe `invoke`.
        -   **Ação:** Chame `invoke` com o nome do comando e os argumentos como um objeto JavaScript.

-   [x] **Passando Dados para o Backend (Corpo da Requisição/Parâmetros de Consulta):**
    -   **Node.js/Flask/Python:** Passe dados no corpo de `fetch` (POST/PUT) ou `requests` (dados JSON/form) ou em parâmetros de consulta (GET).
    -   **Tauri Rust/JS:** Passe argumentos como um objeto JavaScript para `invoke`. Os parâmetros da função Rust mapeiam diretamente para estes.
        -   **Ação:** Certifique-se de que os parâmetros da função Rust correspondam às chaves no objeto JavaScript passado para `invoke`. Tipos Rust (por exemplo, `String`, `u32`, `bool`, `serde_json::Value`) devem corresponder aos tipos JSON esperados.

-   [x] **Recebendo Dados do Backend (Resposta da API):**
    -   **Node.js/Flask/Python:** `response.json()`, `response.text()`, `response.json()` (Python `requests`).
    -   **Tauri JavaScript:** A chamada `invoke` retorna diretamente o valor de retorno da função Rust. Se o Rust retornar `Result<T, E>`, `invoke` resolve com `T` ou rejeita com `E`. Para dados complexos, o Rust pode retornar `String` (JSON) que o JS então `JSON.parse()`.
        -   **Ação:** Defina os tipos de retorno da função Rust.
        -   **Ação:** Lide com tipos `Result` em Rust (para tratamento de erros).
        -   **Ação:** Use `JSON.parse()` em JavaScript se o Rust retornar JSON como uma `String`.

-   [x] **Lidando com Operações Assíncronas:**
    -   **Node.js/Flask/Python:** `async`/`await`, Promises (JS), `async def`/`await` (Python).
    -   **Tauri Rust/JS:** `invoke` retorna uma Promise, então use `async`/`await` em JavaScript. Comandos Rust também podem ser `async`.
        -   **Ação:** Use `async`/`await` no seu frontend JavaScript para chamadas `invoke`.

-   [x] **Backend Enviando Dados para o Frontend (WebSockets/SSE):**
    -   **Node.js/Flask/Python:** Implemente WebSockets (Socket.IO) ou Server-Sent Events.
    -   **Tauri Rust/JS:** Use o sistema de eventos do Tauri. Backend `app_handle.emit_all("nome_evento", payload).unwrap();`, Frontend `listen("nome_evento", (event) => ...)`.
        -   **Ação:** Em Rust, obtenha `AppHandle` e use `emit_all`.
        -   **Ação:** Em JavaScript, `import { listen } from "@tauri-apps/api/event";` e chame `listen`.

-   [ ] **Interação com Banco de Dados:**
    -   **Node.js/Flask/Python:** Use ORMs (Sequelize, SQLAlchemy) ou drivers brutos (pg, mysql2, psycopg2).
    -   **Tauri Rust:** Use crates de banco de dados Rust (por exemplo, `sqlx`, `diesel`, `rusqlite`). Suas funções `#[tauri::command]` encapsularão a lógica do banco de dados.
        -   **Ação:** Escolha um crate de banco de dados Rust.
        -   **Ação:** Implemente a lógica do banco de dados dentro das funções `#[tauri::command]`.
        -   **Ação:** Certifique-se de que as conexões do banco de dados sejam gerenciadas corretamente (por exemplo, pools de conexão).

-   [ ] **Autenticação/Autorização:**
    -   **Node.js/Flask/Python:** Sessões, JWT, OAuth.
    -   **Tauri Rust:** Implemente lógica personalizada dentro das funções `#[tauri::command]` para validar usuários/tokens, gerenciar o estado do usuário de forma segura (por exemplo, usando plugins de armazenamento seguro) ou integrar-se a provedores OAuth externos.
        -   **Ação:** Defina a estratégia de autenticação.
        -   **Ação:** Implemente comandos de login/logout.
        -   **Ação:** Securely store user credentials/tokens.

-   [ ] **Acesso ao Sistema de Arquivos (Servidor vs. Cliente):**
    -   **Node.js/Flask/Python:** `fs.readFile`, `os.path.join`. Acesso total ao servidor.
    -   **Tauri Rust/JS:** Use `@tauri-apps/api/fs` em JavaScript (para acesso controlado pelo usuário) ou crates Rust especializados/plugins Tauri para operações de arquivo específicas do backend *dentro do ambiente em sandbox*. Requer configuração cuidadosa em `tauri.conf.json` e permissão do usuário.
        -   **Ação:** Defina as capacidades necessárias do sistema de arquivos em `tauri.conf.json`.
        -   **Ação:** Use `readTextFile`, `writeTextFile` de `@tauri-apps/api/fs` no frontend.
        -   **Ação:** Crie comandos Rust para operações específicas e validadas do sistema de arquivos, se realmente necessário.

-   [ ] **Variáveis de Ambiente:**
    -   **Node.js/Flask/Python:** `process.env`, `os.environ`.
    -   **Tauri Rust:** Pode acessar variáveis de ambiente do sistema (`std::env::var`). Para o frontend, considere passar um subconjunto via `invoke` ou usar a configuração do Tauri.
        -   **Ação:** Acesse `std::env::var` em Rust.
        -   **Ação:** Decida se e como expor variáveis de ambiente necessárias ao frontend.

---

## Ideias de Projetos em Rust (Backend e Estudos de SEO)

Aqui estão algumas ideias de projetos em Rust, com foco em desenvolvimento de backend ou estudos de SEO, que podem complementar seu trabalho com Python e JavaScript:

### Rust como Motor para Backend (Complementando Python/JavaScript)

1.  **Microsserviço de Processamento de Imagens de Alta Performance:**
    *   **Ideia:** Crie um serviço Rust que receba imagens (via API REST ou gRPC), realize transformações complexas (redimensionamento, filtros, otimização) e retorne a imagem processada. Python/Node.js podem atuar como a camada de orquestração e API Gateway, passando as requisições para o Rust.
    *   **Benefício:** Rust oferece segurança de memória e velocidade para operações intensivas em CPU, superando Python/Node.js nessas tarefas.
    *   **Crates Relevantes:** `image`, `rayon` (para paralelização).

2.  **Motor de Busca/Indexação de Documentos:**
    *   **Ideia:** Desenvolva um backend Rust para indexar grandes coleções de documentos (Markdown, TXT, PDF) e fornecer uma API de busca rápida e eficiente. Seu frontend JS ou um script Python pode interagir com esta API para realizar consultas.
    *   **Benefício:** Rust é ideal para processamento de texto e estruturas de dados otimizadas, como índices invertidos.
    *   **Crates Relevantes:** `tantivy` (motor de busca), `rayon`, `walkdir`.

3.  **Validação e Normalização de Dados em Tempo Real:**
    *   **Ideia:** Implemente um serviço Rust que valide e normalize dados de entrada (por exemplo, de formulários frontend ou uploads de arquivos) em tempo real, aplicando regras complexas de negócios de forma muito eficiente. Seu frontend JS pode chamar este serviço antes de enviar dados para um backend persistente em Python.
    *   **Benefício:** Garante a integridade dos dados com alta performance, mesmo sob carga.
    *   **Crates Relevantes:** `regex`, `chrono`, `serde`.

4.  **Backend de WebSockets para Aplicações em Tempo Real:**
    *   **Ideia:** Construa um servidor WebSocket em Rust para lidar com comunicação em tempo real, como chats, painéis de controle ao vivo ou jogos simples. O frontend JS se conecta diretamente a este servidor.
    *   **Benefício:** Rust é conhecido por sua concorrência eficiente e baixo uso de recursos, ideal para manter muitas conexões simultâneas.
    *   **Crates Relevantes:** `tokio`, `warp` ou `axum` (frameworks web), `tungstenite` (WebSockets).

5.  **Extensões de Performance para Aplicações Python (FFI/PyO3):**
    *   **Ideia:** Identifique gargalos de performance em suas bibliotecas Python existentes. Reimplemente essas partes críticas em Rust e exponha-as ao Python usando FFI (Foreign Function Interface) através de `PyO3`.
    *   **Benefício:** Melhora a performance de bibliotecas Python sem reescrever todo o projeto em Rust.
    *   **Crates Relevantes:** `pyo3`.

### Rust para Estudos e Ferramentas de SEO

1.  **Rastreador de Links Quebrados (Crawler):**
    *   **Ideia:** Desenvolva um crawler web de alta performance em Rust que navega por um site, identifica links internos e externos, e verifica o status HTTP de cada um para encontrar links quebrados. Os resultados podem ser exportados para um formato consumível por Python ou exibidos em um frontend JS.
    *   **Benefício:** Rapidez e eficiência para rastrear grandes sites.
    *   **Crates Relevantes:** `reqwest` (HTTP), `url`, `html5ever` ou `scraper` (parsing HTML), `rayon`.

2.  **Analisador de Conteúdo e Palavras-Chave:**
    *   **Ideia:** Crie uma ferramenta Rust que analise o conteúdo de uma página web, extraindo palavras-chave, frases e calculando a densidade de palavras-chave. Pode-se comparar o conteúdo com concorrentes ou com as melhores práticas de SEO.
    *   **Benefício:** Processamento rápido de texto e análise estatística.
    *   **Crates Relevantes:** `regex`, `hashbrown` (para contagem de frequência eficiente), `serde_json`.

3.  **Gerador de Sitemap XML e RSS Dinâmico:**
    *   **Ideia:** Implemente um serviço Rust que, a partir de dados de um banco de dados ou outra fonte, gere sitemaps XML e feeds RSS otimizados e atualizados dinamicamente.
    *   **Benefício:** Garante que os motores de busca sempre tenham a informação mais recente do seu site, com alta performance na geração.
    *   **Crates Relevantes:** `quick_xml`, `chrono`.

4.  **Monitor de Performance Web (Lighthouse/Core Web Vitals):**
    *   **Ideia:** Embora o Rust não interaja diretamente com um navegador para simular usuários como o Lighthouse, você pode construir ferramentas que coletam métricas de performance cruas (TTFB, tempo de carregamento de recursos, etc.) de forma eficiente.
    *   **Benefício:** Ferramentas de diagnóstico rápidas e personalizáveis para performance web.
    *   **Crates Relevantes:** `reqwest`, `url`, `tokio`.

5.  **Analisador de Logs de Servidor Web para SEO:**
    *   **Ideia:** Crie uma aplicação Rust que leia e analise grandes arquivos de log de servidores web (Apache, Nginx). Identifique padrões de rastreamento de bots, erros 404/500, páginas mais visitadas e outros insights relevantes para SEO.
    *   **Benefício:** Processamento extremamente rápido de logs massivos.
    *   **Crates Relevantes:** `regex`, `rayon`, `csv` (se logs forem em formato CSV).

Essas ideias demonstram como o Rust pode ser usado para construir componentes de alta performance e eficiência, que podem ser integrados e complementados por suas aplicações em Python e JavaScript, seja diretamente via Tauri, chamadas de API ou módulos FFI.