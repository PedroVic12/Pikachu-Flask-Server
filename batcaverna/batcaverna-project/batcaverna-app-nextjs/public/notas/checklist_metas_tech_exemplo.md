Este checklist visa integrar as tecnologias mencionadas (Flask, Pandas, PySide6, NextJS, Tauri, Rust) em projetos práticos de complexidade crescente.

## Fase 1: Backend & Processamento de Dados (Python)

Foco: Flask, Pandas, Modelagem de Dados, API REST.

- [ ] **Projeto 1: API de Análise de Dados (Simples)**
  - _Stack:_ Flask, Pandas.
  - _Objetivo:_ Criar uma rota POST que recebe um arquivo CSV/JSON, processa estatísticas básicas (média, mediana, desvio padrão) com Pandas e retorna um JSON com os resultados.

- [ ] **Projeto 2: Sistema de Gestão de Inventário (CRUD REST)**
  - _Stack:_ Flask, SQLAlchemy (ou outro ORM), SQLite/Postgres.
  - _Objetivo:_ Criar uma API REST completa com autenticação básica. Rotas para criar, ler, atualizar e deletar produtos.
  - _Meta:_ Implementar validação de dados (Pydantic ou Marshmallow).

## Fase 2: Desktop Nativo & GUI (Python)

Foco: PySide6 (Qt for Python).

- [ ] **Projeto 3: Dashboard de Monitoramento de Sistema**
  - _Stack:_ PySide6, psutil.
  - _Objetivo:_ Criar uma janela desktop que mostra uso de CPU, RAM e Disco em tempo real usando gráficos (PyQtGraph ou Matplotlib integrado).

- [ ] **Projeto 4: Cliente Desktop para Inventário**
  - _Stack:_ PySide6, requests.
  - _Objetivo:_ Criar uma interface gráfica que consome a API do _Projeto 2_. O usuário deve poder adicionar e ver produtos através do app desktop.

## Fase 3: Frontend Web Moderno (JavaScript/TypeScript)

Foco: NextJS, React, TailwindCSS.

- [ ] **Projeto 5: Landing Page de Portfólio**
  - _Stack:_ NextJS, TailwindCSS.
  - _Objetivo:_ Site estático simples para listar seus projetos do GitHub (pode consumir a API do GitHub).

- [ ] **Projeto 6: Dashboard Web Analytics**
  - _Stack:_ NextJS, Chart.js (ou Recharts).
  - _Objetivo:_ Consumir a API do _Projeto 1_ ou _Projeto 2_ e exibir os dados em gráficos interativos no navegador.

## Fase 4: O Próximo Nível - Performance & Apps Híbridos (Rust & Tauri)

Foco: Rust básico, Tauri (Unindo o Frontend Web com Backend Nativo).

- [ ] **Projeto 7: "Hello World" em Rust CLI**
  - _Stack:_ Rust (Cargo).
  - _Objetivo:_ Criar uma ferramenta CLI simples em Rust que lê um arquivo de texto e conta as palavras (reimplementação simples do `wc`).

- [ ] **Projeto 8: App de Notas Seguro (Tauri)**
  - _Stack:_ Tauri, Rust (Backend), React/NextJS (Frontend).
  - _Objetivo:_ Um aplicativo desktop onde o frontend (JS) envia notas para o backend (Rust) salvar arquivos criptografados no disco.
  - _Meta:_ Aprender a comunicação IPC (Frontend <-> Backend) no Tauri.

## Fase 5: O Projeto Integrador (Master)

- [ ] **Projeto Final: A Suíte de Produtividade**
  - _Backend Central:_ API Flask com Pandas para relatórios pesados.
  - _App Desktop Leve:_ Tauri App (Rust+React) para uso diário e widgets.
  - _App Admin:_ PySide6 para configurações avançadas do sistema local.

""",

    ),

Secao(

titulo="Modelagem de DB com Python e Sqlite3 com pyspark",

conteudo_md=r"""

Verificar pasta: /home/pedrov12/Documentos/GitHub/Pikachu-Flask-Server/batcaverna/batcaverna-project/scripts

- [ ] Historico de projetos Github
- [ ] Planilhas Tarefas ONS
- [ ] Planilha Corrige SECO - Mensal
- [ ] Deck Builder - PandaPower/AnaREDE com CLI e arquivos .PWF e uso de banco de dados
- [ ] Case Manager Organon
- [ ] 3 bus, 12 bus e IEEE 30 como caso de estudos com decks

""",

    ),

Secao(

titulo="Manutenção de Banco de dados do SIGER x BDT (cadastro de equipamentos elétricos e parametros para PMO)",

id_personalizado="manutencao-siger-bdt",

conteudo_md=r"""

- [ ] Todo dia 10, o programa roda no SIGER que aponta os equipamentos que estão fora da "ponte" (da Planilha Acompanhamento_PONTE_PL.xlsx: Nas Abas: LTs_SIGER_ForaPonte e TRs_SIGER_ForaPonte)
- [x] GERCAD -> JOB -> ID: Data atual -> Job Criado
- [x] Lts: Coluna T: Deve estar na ponte? Usar apenas as linhas que **NÃO** estão na cor vermelho.
- [x] Separar o Norte, Nordeste, Centroeste e Sudeste para as tarefas. Não cadastrar os que são Data Centers
- [x] Busca por LTS dentro do sistema: GERCARD -> Topologia -> "Estado" -> "Nome Curto da Instação" -> Aplicar critério -> Retorna tudo relacionado a Subestação pesquisada.
- [x] Verificar se ja existe a estação no BDT, botão direito -> Novo Equipamento -> LTR
- [x] **Campos obrigatórios de cadastro:** Numero do circuito do planejamento, Nome Estação, Num Barra preferencial, Tipo Rede: (BASICA), Utilização: PAR,
- [x] Ao final do dia, sempre finalizar o Job feito.
