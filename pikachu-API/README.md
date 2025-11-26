# [ARQUIVADO] Módulo Pikachu-API

**Atenção: O conteúdo deste diretório foi migrado e unificado no backend central do projeto, localizado na pasta `/backend`.**

Este diretório continha múltiplos serviços e APIs Flask independentes, incluindo:
- `raichu_web_server.py`: Uma API RESTful para CRUD de Usuários, Tarefas e Projetos.
- `astro-system`: Um microserviço que se conectava a APIs externas (NASA, Pokémon, etc.).

Toda a lógica de negócios, modelos de dados e rotas contidos aqui foram refatorados e integrados como **Blueprints** no servidor principal em `/backend/app.py`.

Este diretório é mantido apenas para **referência histórica e consulta**. O código aqui não é mais utilizado pela aplicação principal e não deve ser executado de forma independente no contexto do projeto unificado.

Para mais detalhes sobre a nova arquitetura, consulte o [README.md principal do projeto](../README.md).