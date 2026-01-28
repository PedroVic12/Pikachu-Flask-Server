
# Sistema Controle e Gestão - PLC - ONS 2025
---

# Levantamento de requisitos do Software de Controle e Gestão MUST e Atividades SP (Dashboard)

#### Requisitos Funcionais (RF)
- [x] **RF01**: A aplicação deve ter uma janela principal com um menu lateral e uma área de conteúdo principal com um Layoubt Dashboard como App Template no Pyside6.
- [x] **RF02**: A navegação principal para abrir diferentes módulos (ferramentas) deve estar claramente disponível em cada Pagina como Iframe Separado por tabs e conectado ao menu lateral
- [x] **RF03**: O usuário deve poder abrir múltiplos módulos em abas, podendo alternar entre eles.
- [x] **RF04**: O usuário deve poder fechar as abas que não está mais usando.
- [x] **RF05**: A aplicação deve fornecer acesso rápido a uma lista de links externos, que devem abrir no navegador padrão do usuário com uma AppBar com Textbutton
- [x] **RF06**: O usuário deve poder customizar a aparência da aplicação, incluindo:
    - Mudar o tema entre claro (Light) e escuro (Dark).
    - Mudar a família da fonte da aplicação.
    - Mudar o tamanho da fonte da aplicação.
- [x] **RF07**: As customizações de aparência devem ser salvas e persistir entre as sessões da aplicação.
- [x] **RF08**: O menu lateral deve ser "responsivo", mostrando controles contextuais que são relevantes para a aba atualmente ativa.

#### Requisitos Não-Funcionais (RNF)
- **RNF01**: O código-fonte deve ser organizado e modular MVC, separando a lógica da interface.
- **RNF03**: A aplicação deve usar o framework PySide6 e seguir as boas práticas de desenvolvimento em Python.





## Refatoração e nova arquitetura
- [x] MVC Arquitetura
- [x] App Template com menu lateral responsivo de navegação e tabs para cara Iframe (paginas) em arquivos separados
- [x] HTML to .PDF relatorio automatizado
- [ ] Dashboard atividades SP / Dashboard Must / Relatórios (gráficos) / Palkia Extractor GUI / Deck Builder da solicitação de MUST
- [ ] main.py compilado com .ui (futuramente) e usando pyinstaller
- [ ] Criação do Executavel com Instalador para abrir o app "pesado" depois de compilar para Windows

- Cada Tab é uma funcionalidade diferente (Palkia GUI, Junta Deck, Organiza Arquivos, MUST Dashboard, Controle e Gestão Fora Ponta com OBS, Deck Builder (com pyautogui simulando no AnaREDE com diagrama do SIN), Gerar Relatorio com análise de contigencia ) 







## Critérios de funcionamento - Novembro

- Deck Builder para Análise de contigencias MUST
- Scrapy toda segunda e sexta dados do Sharepoint
- Modeladem de dados e integração com Dashboard SP com análise de dados (excel com localstorage)
- Palkia GUI - MUST ETL
- Perdas duplas - ETL

- Refatoração Análise de contigencias de Invervenção no SEP com agendamento ótimo (PandaPower + DEAP) com Lancher.py refatorado 

- [x] ETL de arquivos PDF e Excel com pandas e PowerQuery
- [x] Controle e gestão de Banco de dados de informações de MUST de atividades SP
- [x] Aprovação com ou sem Ressalvas para criar deck de analise no anaRede e abrir com Pyautogui

- [ ] Entender a modelagem do banco de dados do SQL Server e filtrar apenas para area SP

- [ ] Atividades SP em banco Access atualizado com excel de atividades SP

- [ ] Automação em Pyautogui para abrir o SIN atualizado ja na barra ou linha de análise no AnaREDE
- [ ] Criação de relatorios docx template dá analise a partir do excel de controle

- [ ] Iniciar com deploy do app com dashbaord em HTML e Pyside6 com ferramentas e usando mvc com QT-Designer com arquivos  .ui e .py
--- 



---

## Database
- [x] Microsfit Access Configurado - python + Power Query com Scrapy em SQL SERVER ONS
- [x] Sqlite3 - python
- [x] Excel + LocalStorage em HTML 
- [ ] Supabase (Series Temporais)

## Backend
- [ ] Alterar o run.py para ajustar os intervalos de páginas e alterar apenas o Arquivo Palkia para manutenção

- [ ] Uso da planilha Excel (atividades SP) de Controle de MUST compartilhado no SharePoint para alimentar a ferramenta Desktop

## Frontend
- [x] QUAIS PONTOS SERÃO ANALISADOS, QUANTO O AGENTE ESTÁ PEDINDO, 	QUEM É O ID PROBLEMA ,	QUEM É O ID SOLUÇÃO
- [x] Ajustar componentes react para usar no astro futuramente
- [x] Análise por empresa
- [ ] DEVERÁ TRAZER TODAS ESTATÍSTICAS PARA CADA UM DOS ANOS das tabelas MUST
- [ ] PONTOS APROVADOS OU RESSALVAS OU LIMITADOS DE CADA EMPRESA
- [ ] QUANTIDADE DE SOLICITAÇÕES APROVADAS POR EMPRESA OU PONTOS
- [x] Coluna aprovado - SIM ou NAO
- [x] Container de historico das análises
- [ ] Refatoração do código de arquivo unico .py para um projeto MVC usando QT - Designer
- [ ] Deck Builder caso analisado com o MUST solicitado
- [ ] Template de Word (docx) para criação do relatorio final em .PDF
- [ ] Ajustar componentes react para usar no astro/nextsjs futuramente
- [ ] DEVERÁ TRAZER TODAS ESTATÍSTICAS PARA CADA UM DOS ANOS das tabelas MUST
- [ ] PONTOS APROVADOS OU RESSALVAS OU LIMITADOS DE CADA EMPRESA
- [ ] QUANTIDADE DE SOLICITAÇÕES APROVADAS POR EMPRESA OU PONTOS
- [ ] Coluna aprovado - SIM ou NAO
- [ ] Container de Tabela histórico das análises
---




