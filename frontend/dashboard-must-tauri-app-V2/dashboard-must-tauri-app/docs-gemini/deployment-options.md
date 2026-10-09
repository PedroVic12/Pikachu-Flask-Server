# Guia de Deploy: Tauri (.exe) vs. Vercel (Web)

Este guia explica as duas principais formas de "publicar" seu projeto e quando usar cada uma.

## Opção 1: Criar um Executável Nativo (Recomendado para Tauri)

Este é o propósito principal do Tauri: empacotar seu frontend e seu backend Rust em um único arquivo executável que roda como um aplicativo de desktop nativo.

-   **O que ele gera?**
    -   No Windows: Um arquivo `.exe` e um instalador `.msi`.
    -   No macOS: Um arquivo `.app`.
    -   No Linux: Um arquivo `.deb` e um `.AppImage`.
-   **Como fazer?**
    Execute o comando no seu terminal:
    ```bash
    cargo tauri build
    ```
-   **Vantagens:**
    -   **Performance:** Acesso direto ao backend Rust, sem a latência de uma rede.
    -   **Funcionalidades Nativas:** Acesso total ao sistema de arquivos, notificações do sistema, e outras APIs do sistema operacional que só o Rust pode acessar.
    -   **Offline-first:** O aplicativo funciona sem conexão com a internet.
    -   **Distribuição Fácil:** Você pode enviar o executável ou o instalador diretamente para seus usuários.
-   **Quando usar?**
    Sempre que você quiser um **aplicativo de desktop**. Se seu projeto depende de funcionalidades do backend Rust (como ler arquivos locais, performance, etc.), este é o único caminho.

## Opção 2: Publicar o Frontend na Web (Vercel, Netlify, etc.)

É possível pegar apenas a parte do frontend do seu projeto (seu `index.html` e os scripts) e publicá-la como um site estático.

-   **O que ele gera?**
    -   Um site público acessível por uma URL (ex: `meu-dashboard.vercel.app`).
-   **Como fazer?**
    1.  Você precisaria de uma conta em um serviço como [Vercel](https://vercel.com/) ou [Netlify](https://www.netlify.com/).
    2.  Configure o serviço para usar seu repositório Git.
    3.  Defina o "build command" como vazio (ou um comando que prepare os arquivos) e o "output directory" como a pasta `src` (ou para onde seus arquivos HTML/JS estão).
-   **Vantagens:**
    -   **Acesso Universal:** Qualquer pessoa com um navegador pode acessar a aplicação.
    -   **Não requer instalação:** Usuários não precisam baixar ou instalar nada.
-   **Desvantagens Críticas:**
    -   **SEM BACKEND RUST:** O backend em Rust **não é publicado** na Vercel. Todas as chamadas `invoke` para o Rust irão falhar.
    -   **Funcionalidade Limitada:** O aplicativo só terá as funcionalidades que rodam 100% no navegador (no seu caso, a maior parte da UI continuaria funcionando porque os dados estão no `localStorage`, mas a chamada ao `greet` que fizemos, por exemplo, não funcionaria).

## Conclusão

| Método             | Ideal para                                                               | Backend Rust |
| ------------------ | ------------------------------------------------------------------------ | ------------ |
| **`cargo tauri build`** | **Aplicações de Desktop** completas, offline e com acesso ao sistema. | **Sim**      |
| **Vercel/Web**     | **Demos da UI**, sites de apresentação, ou versões "light" da aplicação. | **Não**      |

**Recomendação:** Use `cargo tauri build` para criar o `.exe` e distribuir sua aplicação como um programa de desktop completo. Use a Vercel apenas se você quiser ter uma versão de "demonstração" da interface que não precise das funcionalidades do backend.
