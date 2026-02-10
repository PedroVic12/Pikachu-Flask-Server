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

- 📋 [Tarefas ONS PLC](#tarefas-ons-plc-2026-02)
- 🔧 [Manutenção SIGER x BDT](#manutencao-siger-bdt)
- 🧩 [Estudos de SEP (ONS + Programação)](#estudos-sep-ons-programacao)
- 🧾 [Lista de TAREFAS Pendentes](#lista-tarefas-pendentes)

### 🎯 **DESENVOLVIMENTO PESSOAL**

- 📚 [Sessão de ESTUDOS](#sessao-estudos)
- 🚀 [PVRV 2026](#pvrv-2026-planilha-horarios)

### 📅 **PLANEJAMENTO SEMANAL**

- 🎯 [Objetivos da Semana](#objetivos-semana)
- 📋 [Checklist Diário](#checklist-diario)

### 🔧 **OUTRAS SEÇÕES**

- 📊 [Roadmap Cientista de Dados](#roadmap-cientista-dados)
- ⚡ [Conceitos Fundamentais de Eng. Elétrica](#sessao-estudos)

---
<a id="roadmap-cientista-dados"></a>

## 🎓 Roadmap Cientista de Dados

![alt text - ciencia de dados ONS](image-1.png)

---
<a id="tarefas-ons-plc-2026-02"></a>

# 📋 Tarefas ONS PLC 2026 - Fevereiro __IN_PROGRESS

---

- [ ] Cadastro de dados BDT Seco E NE
- [ ] Correções do SISBAR com procv do Mensal de Janeiro e colocar nas abas faltantes para o Mensal de Fevereiroc com justificativa de aparecer na área
- [ ] Correções e bug fix no VBA para perdas Duplas Lts + 3 gráficos

- [ ] Estudos de conceitos básicos de CC/CA
- [ ] Estudos de conceitos básicos de SEP para ONS PLC
- [ ] Estudos sobre diagramas fasoriais em eng. elétrica

- [ ]  Acompanhar como foi feito o relatorio do controle mensal de Fevereiro e Janeiro com Word compartilhado para consulta
  - [ ] Flow caso 10 Controle mensal com intercambio VC

- [x] Deck Builder AnaREDE
  - [ ] Script inicial AnaRede com CLI com decks e .sav padrões de montagem de quadro mensal

- [ ] Algoritimo Big O para complexibilidade de casos de FLuxo de potencia para auxiliar na montagem de decks

- [ ] AnaRede Deck Builder = Anarede, EditCepel, PandaPower, CLI e ajuda na montagem de casos com algoritimo Big O para nivel de complexibildiade de operação da Rede
- [ ]

---
<a id="manutencao-siger-bdt"></a>

# Manutenção de Banco de dados do SIGER x BDT

### (cadastro de equipamentos elétricos e parametros para PMO)

---

- [ ] Todo dia 10, o programa roda no SIGER que aponta os equipamentos que estão fora da "ponte" (da Planilha Acompanhamento_PONTE_PL.xlsx: Nas Abas: LTs_SIGER_ForaPonte e TRs_SIGER_ForaPonte)
- [x] GERCAD -> JOB -> ID: Data atual -> Job Criado
- [x] Lts: Coluna T: Deve estar na ponte? Usar apenas as linhas que **NÃO** estão na cor vermelho.
- [x] Separar o Norte, Nordeste, Centroeste e Sudeste para as tarefas. Não cadastrar os que são Data Centers
- [x] Busca por LTS dentro do sistema: GERCARD -> Topologia -> "Estado" -> "Nome Curto da Instação" -> Aplicar critério -> Retorna tudo relacionado a Subestação pesquisada.
- [x] Verificar se ja existe a estação no BDT, botão direito -> Novo Equipamento -> LTR
- [x] **Campos obrigatórios de cadastro:** Numero do circuito do planejamento, Nome Estação, Num Barra preferencial, Tipo Rede: (BASICA), Utilização: PAR,
- [x] Ao final do dia, sempre finalizar o Job feito.

---

<a id="pvrv-2026-planilha-horarios"></a>

# PVRV 2026 - Planilha de horarios (atualizar no website) __IN_PROGRESS

---

- [ ] Kanban, Scrum, Planejamento e metas (Segunda e sexta)
- [x] Organização de arquivos .MD
- [x] Organização projetos Github
- [ ] Organização de Word e Excel usados para a semana no ONS
- [ ] Pyside6 x Tauri x NextJS projetos

- [ ] Planejamento financeiro (Financial APP)
  - [x] Dezembro
  - [x] Janeiro
  - [ ] Fevereiro
  - [ ] Março

- [x] Planilhas Horarios
- [ ] usper + Tunnel Newtork + React UI para proxys e rest api em go e express
- [ ] Get/POST Google Sheets tabela de checklist de ProjectHub Empresas
- [ ] HTML templates para Gohan Treinamentos Refatorado com SOLID, MVC e framework CSS components

<a id="lista-tarefas-pendentes"></a>

## Sprint atual (09/02/2026) PVRV __IN_PROGRESS

- [ ] Estudos de neurociencia sobre Neuroplasticidade (Boson Treinamentos) + Cartoes de enfretamento TCC para pagina do KanbanPro 2026
- [x] Backup Kanban, Batcaverna, Linux e Win11
- [ ] Planejamento e Metas semanal (Refatorar a tela do Tarefas PLC e outros sites tudo no mesmo NextJS)
- [x] Listagem de projetos atuais por tecnologias do github
- [ ] Engenheiro de Software Pleno - Legado PVRV: Py, JS, C++, Dart e Rust. Anotações para perspectiva de carreira com 28 anos em site que ajuda a priorizar os projetos.
- [ ] Juntar todos sites estaticos em HTML que tenho num unico projeto NextJS com rotas e MVC (Gohan Treinamentos, Legado PVRV, Pomodoro)

---
<a id="estudos-sep-ons-programacao"></a>

# Estudos de SEP para ONS e programação __IN_PROGRESS

## Sesão de ESTUDOS (Matemática, programação e Eng. Elétrica) __TODO

- [ ] Atividade ML de IEEEDs e principais modelo de AI de Supevisionado x Não Supervisionado (Com Rótulos x Sem Rótulos)
- [ ] Eletromagnetismo: Resolver 3 exercícios de Lei de Gauss/Coulomb.
- [ ] Sinais e Sistemas: Revisar Transformada de Laplace (básico).

- [ ] Análise de contigencias com SN 45 com pandapower + Deckbuiler para o AnaREDE
- [ ] Matriz Ybus em Python para SEP
- [ ] Matriz admtancia + Geração x Transmissão e Distrbuição SIN pelo ONS
- [ ] Mincurso CC + arduino + python
  - [ ] <https://www.falstad.com/circuit/circuitjs.html>
  - [ ] Regra de Crammer
  - [ ] EDO sistemas 1 e 2 ordem com RLC e RC plots e respostas da EDO
- [ ] Metodos númericos em Matlab para engenharia usando Python

- [ ] Solver ML/DL para cada X,Y de conjunto de dado
- [ ] Python com Sympy para calculo de EDO de 1 e 2 ordem para Circuitos CC (RL,RC e RLC)
- [ ] Atividade IEEEDs = Esp32 + Senoides de corrente em series temporais para modelos de IA (como entrada de dados)
- [ ] Aulas Sinais/cricuitos CC/CA e Eng. Controle + SEP Fundamentals + Metodos numericos com Python

---

<a id="sessao-estudos"></a>

## ⚡ Conceitos Elétricos (Dúvidas/Insights)

- [ ] CC vs CA: Em CC, a indutância é um curto e a capacitância é um aberto no regime permanente. Em CA, eles geram impedância ($j\omega L$ e $1/j\omega C$).

**Dúvida para tirar com engenheiros: Como o ONS modela a carga dependente da tensão ($P = P_0(V/V_0)^\alpha$)?**

---

# 🦇 Batcaverna PV - Centro de Comando 2026

<a id="objetivos-semana"></a>

# 🎯 Objetivos da Semana (Main Quests)

⚡ Trabalho (ONS) - Engenharia de Dados & Sistemas

- [ ] Python & DB: Otimizar scripts de consulta (SQLAlchemy/Pandas) para grandes volumes de dados.

- [ ] Simulação SEP: Rodar casos de fluxo de potência (Anarede/Organon) e entender os warnings.

- [ ] Fundamentos Elétricos: Revisar conceitos de Potência Ativa (P) x Reativa (Q) em CA e Leis de Kirchhoff em CC.

Meta: Conseguir explicar o comportamento da tensão na barra quando a carga reativa aumenta.

<a id="checklist-diario"></a>

# 📅 Checklist Diário

Segunda-feira (27/01) - Setup & SEP

- [x] 08:00 - ONS (Home): Organizar backlog da semana.

- [ ]  10:00 - ONS (Dev): Estudo de script Python para automação de banco de dados.

- [ ] 14:00 - Foco Técnico: Leitura sobre Load Flow (Fluxo de Carga).

Terça-feira (28/01) - O Dia Longo

- [ ] 06:25 - ONS (Presencial): Acompanhar operação em tempo real (se possível).

- [ ] 19:00 - Revisão leve de CC (Circuitos de Corrente Contínua).

Quarta-feira (29/01) - Engenharia Pura

- [ ] 06:25 - ONS (Presencial).

- [ ]  10:00 - Simulação: Tentar rodar um caso base e analisar os logs.

- [ ]  15:00 - Estudos UFF (Biblioteca ou Casa).

Sexta-feira (31/01) - Review & Code

- [ ] 08:00 - ONS (Home): Documentar o que foi aprendido sobre SEP na semana.

- [ ]  14:00 - Dev Time: Projeto Pessoal ou aprofundamento em SQL.

---
