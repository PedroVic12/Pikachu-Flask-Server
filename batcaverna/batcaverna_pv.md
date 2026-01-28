
---
# 🦇 BatCaverna PV - Centro de Comando 2026
---

**📅 DATA ATUAL:** 27/01/2026  
**🔗 Repositório:** [GitHub Repository][var4]  
**📋 Shiatsu Link:** [Agendamento Shiatsu][var1]  
**📊 Kanban Columns:** `__BACKLOG` | `__IN_PROGRESS` | `__TODO` | `__COMPLETED`  
**🎯 Default Status:** Backlog

[var4]: https://github.com/PedroVic12/Pikachu-Flask-Server/blob/main/batcaverna/batcaverna_pv.md
[var1]: https://revigorar.reservio.com/

---
## 📑 ÍNDICE RÁPIDO

### ⚡ **TRABALHO - ONS PLC 2026**
- 📋 [Tarefas ONS PLC](#tarefas-ons-plc-2026-jan)
- 🔧 [Manutenção SIGER x BDT](#manutencao-siger-bdt)
- 🚀 [PVRV 2026](#pvrv-2026-planilha-horarios)
- 🧩 [Estudos de SEP (ONS + Programação)](#estudos-sep-ons-programacao)
- 🧾 [Lista de TAREFAS Pendentes](#lista-tarefas-pendentes)

### 🎯 **DESENVOLVIMENTO PESSOAL**
- 🧠 [TDAH - Rotina](#tdah-rotina)
- 🙏 [Alinhamento Espiritual](#alinhamento-espiritual)
- 📚 [Sessão de ESTUDOS](#sessao-estudos)

### 📅 **PLANEJAMENTO SEMANAL**
- 🎯 [Objetivos da Semana](#objetivos-semana)
- 📋 [Checklist Diário](#checklist-diario)

### 🔧 **OUTRAS SEÇÕES**
- 📊 [Roadmap Cientista de Dados](#roadmap-cientista-dados)
- ⚡ [Conceitos Elétricos](#conceitos-eletricos)
---
## 🎓 Roadmap Cientista de Dados
![alt text - ciencia de dados ONS](image-1.png)
---
# ⚡ TRABALHO - ONS PLC 2026
## 📋 Tarefas ONS PLC 2026 - Janeiro __IN_PROGRESS
---


- [ ] Sistema de arquivos de decks com label conectado ao OneDrive
- [ ] Estudos de Decks do AnaRede com diagrama e .SAV automatizados
- [x] *Falta ainda corrigir por listas da planilha no word*  |  Correções e Bugs fix do VBA de perdas duplas

---
## Manutenção de Banco de dados do SIGER x BDT 
(cadastro de equipamentos elétricos e parametros para PMO)
---

- [ ] Todo dia 10, o programa roda no SIGER que aponta os equipamentos que estão fora da "ponte" (da Planilha Acompanhamento_PONTE_PL.xlsx: Nas Abas: LTs_SIGER_ForaPonte e TRs_SIGER_ForaPonte)
- [x] GERCAD -> JOB -> ID: Data atual -> Job Criado
- [x] Lts: Coluna T: Deve estar na ponte? Usar apenas as linhas que __NÃO__ estão na cor vermelho.
- [x] Separar o Norte, Nordeste, Centroeste e Sudeste para as tarefas. Não cadastrar os que são Data Centers
- [x] Busca por LTS dentro do sistema: GERCARD -> Topologia -> "Estado" -> "Nome Curto da Instação" -> Aplicar critério -> Retorna tudo relacionado a Subestação pesquisada.
- [x] Verificar se ja existe a estação no BDT, botão direito -> Novo Equipamento -> LTR 
- [x] __Campos obrigatórios de cadastro:__ Numero do circuito do planejamento, Nome Estação, Num Barra preferencial, Tipo Rede: (BASICA), Utilização: PAR, 

- [x] Ao final do dia, sempre finalizar o Job feito.


---




---
# PVRV 2026 - Planilha de horarios (atualizar) __IN_PROGRESS
---

- [x] Backup Kanban, Batcaverna, Linux e Win11
- [ ] Planejamento e Metas semanal (Refatorar a tela do Tarefas PLC e outros sites tudo no mesmo NextJS)
- [x] Listagem de projetos atuais por tecnologias do github
- [ ] Engenheiro de Software Pleno - Legado PVRV: Py, JS, C++, Dart e Rust. Anotações para perspectiva de carreira com 28 anos em site que ajuda a priorizar os projetos.
- [ ] Planejamento financeiro (Financial APP)
    - [x] Dezembro
    - [ ] Janeiro
    - [ ] Fevereiro
- [ ] Planilhas Horarios
- [ ] usper + Tunnel Newtork + React UI para proxys e rest api em go e express
- [ ] AnaRede Deck Builder = Anarede, EditCepel, PandaPower, CLI e ajuda na montagem de casos com algoritimo Big O para nivel de complexibildiade de operação da Rede
- [ ] Cadastro de dados BDT Seco E NE
- [ ] Get/POST Google Sheets tabela de checklist de ProjectHub Empresas
- [ ] HTML templates para Gohan Treinamentos Refatorado com SOLID, MVC e framework CSS components



## Sprint Atual Semanal 21/01/26 __TODO
- [x] Modelagem banco de dados BDT e MUST (feito teste nas Lts no SECO -> ESTREI-MG500 (ok) e N.EXTR-MG500 (ainda falta...) )
- [x] Debug VBA perdas duplas
  - [x] Verificar o código V6 e corrigir alguns bugs de formatação
  - [ ] Verificar aba de Modificações ná pag correta como lista de itens nó código VBA

- [ ]  Acompanhar como foi feito o relatorio do controle mensal de Fevereiro
- [x] Estudo de Arquitetura de projeto Flask com frontend project template (dashboard atividades SP MUST)

- [ ] Script inicial AnaRede com CLI com decks e .sav padrões de montagem de quadro mensal
- [ ] Algoritimo Big O para complexibilidade de casos de FLuxo de potencia para auxiliar na montagem de decks
- [ ] Deck Builder AnaREDE
- [ ] Flow caso 10 Controle mensal com intercambio VC
- [ ] Templates HTML dentro do NextJS
- [ ] Projetos python com arquitetura backend em Rust
- [ ] Projetos template Pyside6 com Docs automatizados com pytest e com deploy em .exe com menos de 150MB
- [ ] IA para negócios, Análise de dados e Programacao com Matematica para IOT 

     
# Estudos de SEP para ONS e programação __IN_PROGRESS

## Sprint atual (27/01/2026) PVRV __IN_PROGRESS
- [ ] Word compartilhado com ajustes da montagem Mensal e Quadrimensal
- [ ] Debug final V6 de VBA de perdas duplas
- [ ] Estudos backend com GO e proxy de tunnel com interface web
- [ ] Juntar todos sites estaticos em HTML que tenho num unico projeto NextJS com rotas e MVC (Gohan Treinamentos, Legado PVRV, Pomodoro)
- [ ] Estudos de conceitos básicos de CC/CA
- [ ] Estudos de conceitos básicos de SEP para ONS PLC
- [ ] Estudos sobre diagramas fasoriais em eng. elétrica
- [x] estudos sobre rede básica x rede de simulação do ONS
- [x] Correção do bug no Raichu/Rayquaza Server para o Kyogre delivey App e deixar ele como SAAS de renda extra (https://docker-raichu.onrender.com/docs)
- [ ] Controle  e Gestão Atividades SP + MUST --> Excel To Website and (.PDF + Access)to QT 6 Desktop Deck Builder Organon



     


# Lista de TAREFAS Pendentes __TODO

- [ ] Pyside6 com modelagem de dados (Sqlite3 + Microsoft Access) + Análise de Contigencias + Controle Atividades SP
- [ ] Automação Outlook + Teamsde satélites com Python
- [x] AJUSTAR PAINEL DE BATCAVERNA COM KANBANPRO e Blogpedrov12

  - [x] O que são algoriitmos de AG e como usar isso na Eng. Elétrica para agendamento otimo de SEP (video yt)
    - [ ] https://alexandremundim.medium.com/algoritmo-gen%C3%A9tico-na-pr%C3%A1tica-com-python-e24d2b1254d8
    - [x] SIN45 app template with Lancher refatorado

  - [ ] O que são MQQT
    - [ ] https://www.sympla.com.br/play/introducao-ao-protocolo-mqtt/1914654

- [ ] Treino de calistenia e calistenia app

- [ ] Chatbot Groundon, Lumina Aurora (Gemini) + Jarvis (GPT) + Copilot (copilot/cursor) with updates
- [ ] Corpo x Mente x Espirito -> Jobs, Coding, Studying, Creative, In Shape

- [ ] Teoria de controle de engenharia moderno
- [ ] Proteção de SEP e monitoramento area SP
- [ ] Processamento de imagens de satélites com Python
- [x] Bots e RPA com Python
- [x] Estudos de IA, ML, DL, Chatbots, N8N, AI agentes frameworks (Agno/Langchain)
- [ ] Grondon Chabtot, Jarvis Chatbot, Lumina Aurora Chatbot

 + N8N = Relatorios automatizados por email e Whatsapp
- [ ] Aulas Sinais/cricuitos CC/CA e Eng. Controle + SEP Fundamentals + Metodos numericos com Python
- [ ] Despacho de cargas - Planejamento Mensal e Semanal - Flow + AnaREDE, AnaTEM e Organon
- [ ] **Estudos SEP com base fundamental para CA**
- [ ] Teoria de controle de engenharia moderno
- [ ] Proteção de SEP e monitoramento area SP
- [ ] Processamento de imagens de satélites com Python
- [x] AJUSTAR PAINEL DE BATCAVERNA COM KANBANPRO e Blogpedrov12

  - [x] O que são algoriitmos de AG e como usar isso na Eng. Elétrica para agendamento otimo de SEP (video yt)
    - [ ] https://alexandremundim.medium.com/algoritmo-gen%C3%A9tico-na-pr%C3%A1tica-com-python-e24d2b1254d8
    - [x] SIN45 app template with Lancher refatorado

  - [ ] O que são MQQT
    - [ ] https://www.sympla.com.br/play/introducao-ao-protocolo-mqtt/1914654

- [ ] Treino de calistenia e calistenia app

- [ ] Chatbot Groundon, Lumina Aurora (Gemini) + Jarvis (GPT) + Copilot (copilot/cursor) with updates
- [ ] Corpo x Mente x Espirito -> Jobs, Coding, Studying, Creative, In Shape

- [ ] Teoria de controle de engenharia moderno
- [ ] Proteção de SEP e monitoramento area SP
- [ ] Processamento de imagens de satélites com Python
- [x] Bots e RPA com Python
- [x] Estudos de IA, ML, DL, Chatbots, N8N, AI agentes frameworks (Agno/Langchain)
- [ ] Grondon Chabtot, Jarvis Chatbot, Lumina Aurora Chatbot




---
🦇 Batcaverna PV - Centro de Comando (27/01 - 01/02)
---

# 🎯 Objetivos da Semana (Main Quests)

⚡ Trabalho (ONS) - Engenharia de Dados & Sistemas

- [ ] Python & DB: Otimizar scripts de consulta (SQLAlchemy/Pandas) para grandes volumes de dados.

- [ ] Simulação SEP: Rodar casos de fluxo de potência (Anarede/Organon) e entender os warnings.

- [ ] Fundamentos Elétricos: Revisar conceitos de Potência Ativa (P) x Reativa (Q) em CA e Leis de Kirchhoff em CC.

Meta: Conseguir explicar o comportamento da tensão na barra quando a carga reativa aumenta.


# 📅 Checklist Diário

Segunda-feira (27/01) - Setup & SEP

- [x] 08:00 - ONS (Home): Organizar backlog da semana.

- [ ]  10:00 - ONS (Dev): Estudo de script Python para automação de banco de dados.

- [ ] 14:00 - Foco Técnico: Leitura sobre Load Flow (Fluxo de Carga).


Terça-feira (28/01) - O Dia Longo

- [ ] 06:25 - ONS (Presencial): Acompanhar operação em tempo real (se possível).

- [ ]  09:15 - ⚠️ Aula Eletromag vs. Estágio (Definir estratégia).

- [ ] 19:00 - Revisão leve de CC (Circuitos de Corrente Contínua).

Quarta-feira (29/01) - Engenharia Pura

- [ ] 06:25 - ONS (Presencial).

- [ ]  10:00 - Simulação: Tentar rodar um caso base e analisar os logs.

- [ ]  15:00 - Estudos UFF (Biblioteca ou Casa).

Quinta-feira (30/01) - Karatê Day

- [ ] 08:00 - ONS (Home): Python - Tratamento de exceções nos scripts.

- [ ] 14:00 - UFF: Lista de exercícios Eletromag.

- [ ] 19:00 - Karatê: Foco total, zero pensamento em trabalho.

Sexta-feira (31/01) - Review & Code

- [ ] 08:00 - ONS (Home): Documentar o que foi aprendido sobre SEP na semana.

- [ ]  14:00 - Dev Time: Projeto Pessoal ou aprofundamento em SQL.

- [ ]  18:00 - Checkpoint Semanal: O que funcionou? O que atrasou?

---
# TDAH - Rotina  __IN_PROGRESS
---

- [x] Planejamento Seg/Sexta
- [x] Visualização KANBAN e gerar 5 tarefas do dia (MANHA) e com 3 metas principais do dia (Eat the frog, Estudos e Criativo)
- [x] Organização mental e preparação para novo Ciclo JEDI CYBERPUNK com resolução de provas, tutorial de 10 min de programação, modelagem e simulações de eng eletrica junto com automações com N8N

# Alinhamento Espiritual
- [x] Terapia: Terça-feira 16:30 .
- [x] Treino de calistenia para karate

- [x] You Only Need 5 Hobbies (Money, Study, Mindset, In Shape, Creative)

  - [ ] Segunda - Chakra: Solar
  - [ ] Terça - Chakra: Garganta
  - [ ] Quarta - Chakra: Cardiaco
  - [ ] Quinta: Chakra: 3º Olho
  - [ ] Sexta: Chakra: Root

- [ ] Leitura matinal da bíblia e livros dos espirtos de Alan Kardec
- [ ] Meditação e estudos com Matemática e Japonês
- [ ] Alongamento matinal - Ombros e Quadril
- [ ] 2 equações do dia
- [ ] 2 projetos no dia (backend/frontend)
- [ ] Dom do espirito Santo do dia
- [ ] Frase de poder
      
- [ ] Jogos: Sessão de The Witcher 3 ou LoL (Sábado/Domingo).



---


# Sesão de ESTUDOS (Matemática, programação e Eng. Elétrica) __TODO
- [ ] Atividade ML de IEEEDs e principais modelo de AI de Supevisionado x Não Supervisionado (Com Rótulos x Sem Rótulos)
- [ ] Eletromagnetismo: Resolver 3 exercícios de Lei de Gauss/Coulomb.
- [ ] Sinais e Sistemas: Revisar Transformada de Laplace (básico).
      
- [ ] Análise de contigencias com SN 45 com pandapower + Deckbuiler para o AnaREDE
- [ ] Matriz Ybus em Python para SEP
- [ ] Matriz admtancia + Geração x Transmissão e Distrbuição SIN pelo ONS
- [ ] Mincurso CC + arduino + python
  - [ ] https://www.falstad.com/circuit/circuitjs.html
  - [ ] Regra de Crammer
  - [ ] EDO sistemas 1 e 2 ordem com RLC e RC plots e respostas da EDO
- [ ] Metodos númericos em Matlab para engenharia usando Python
        
- [ ] Solver ML/DL para cada X,Y de conjunto de dado
- [ ] Python com Sympy para calculo de EDO de 1 e 2 ordem para Circuitos CC (RL,RC e RLC)
- [ ] Atividade IEEEDs = Esp32 + Senoides de corrente em series temporais para modelos de IA (como entrada de dados)
- [ ] Aulas Sinais/cricuitos CC/CA e Eng. Controle + SEP Fundamentals + Metodos numericos com Python

---

## ⚡ Conceitos Elétricos (Dúvidas/Insights)

CC vs CA: Em CC, a indutância é um curto e a capacitância é um aberto no regime permanente. Em CA, eles geram impedância ($j\omega L$ e $1/j\omega C$).

Dúvida para tirar com engenheiros: Como o ONS modela a carga dependente da tensão ($P = P_0(V/V_0)^\alpha$)?

---








