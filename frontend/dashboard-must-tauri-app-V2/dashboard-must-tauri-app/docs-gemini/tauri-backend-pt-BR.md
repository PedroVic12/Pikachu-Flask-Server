# Guia Básico: Backend Rust no Tauri

Este guia explica o básico de como criar e chamar funções do backend Rust (chamadas de "Comandos") a partir do seu frontend JavaScript em uma aplicação Tauri.

## 1. O que é um Comando Tauri?

Um "Comando" é uma função Rust que você expõe ao seu frontend. Você pode passar argumentos para ela a partir do JS e retornar valores de volta para o JS. Isso permite que você execute código nativo, acesse o sistema de arquivos, realize tarefas pesadas, e muito mais, tudo a partir de uma chamada de função no seu frontend.

## 2. Criando um Comando no Rust

Para criar um comando, você precisa de uma função Rust normal e anotá-la com o atributo `#[tauri::command]`.

Abra o arquivo `src-tauri/src/main.rs`.

Adicione uma função simples como esta antes da sua função `main`:

```rust
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Olá, {}! Você foi saudado pelo Rust!", name)
}
```

- `#[tauri::command]`: Transforma a função `greet` em um comando que o Tauri pode expor.
- A função pode receber argumentos (como `name: &str`) e retornar valores (como a `String`).

## 3. Registrando o Comando

Depois de criar o comando, você precisa dizer ao Tauri para reconhecê-lo. Isso é feito no `main.rs`, dentro da sua função `main`.

Encontre a linha que começa com `tauri::Builder::default()`. Você precisará adicionar uma chamada a `.invoke_handler()`:

```rust
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet]) // <--- ADICIONE ESTA LINHA
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- `tauri::generate_handler![]`: Esta macro pega uma lista dos seus comandos e cria um "manipulador de invocação" para eles.

## 4. Chamando o Comando no JavaScript

Agora que o backend está pronto, você pode chamar o comando `greet` do seu frontend. O Tauri injeta automaticamente um conjunto de APIs no objeto `window` da sua aplicação.

A função principal para chamar comandos é `window.__TAURI__.tauri.invoke`.

```javascript
const { invoke } = window.__TAURI__.tauri;

// Chamar o comando 'greet'. O nome é o mesmo da função Rust.
invoke('greet', { name: 'Dashboard' })
  .then((response) => {
    console.log(response); // Irá imprimir: "Olá, Dashboard! Você foi saudado pelo Rust!"
    // Agora você pode usar essa resposta para atualizar sua UI
  })
  .catch((error) => {
    console.error(error);
  });
```

- `invoke`: É uma função assíncrona que retorna uma `Promise`.
- O primeiro argumento é o nome do comando em "snake_case" (o mesmo nome da função Rust).
- O segundo argumento é um objeto onde as chaves são os nomes dos parâmetros da sua função Rust.

Este é o fluxo básico! Você pode criar comandos mais complexos que retornam `structs` (que são convertidos em objetos JSON), manipulam o estado da aplicação e muito mais.
