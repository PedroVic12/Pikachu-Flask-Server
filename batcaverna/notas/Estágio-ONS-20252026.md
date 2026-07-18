
# ESTÁGIO ONS - PLC - Junho de 2026

__last updated: 03/06/2026 (quarta)__

---

## Tarefas ONS - Últimas Solicitações

- [x] ENG.ELETRICA-UFF → Kanban Notes  
- [x] Tarefas PLC ONS - Planilha Excel  
- [x] Relatórios projetos Github (notebook)  
- [x] Diagrama SP - Organon 440KV  
- [x] Diagrama SP 440KV PIVISION  
- [x] Diagrama RJ/ES - PIVISION  
- [x] Reunião - PLC (Tese Lucas)  
- [x] Perdas Duplas LTS VBA Editor  
- [x] Atividades Mensal em markdown  
- [x] Automações ONS  
  - Mensal: Configuração de Decks de carga  
  - Mensal: Respostas PLC para SISBAR no Parecer da Área  
  - ETL: LTs, Trafos, MUST e Office files  
  - Qt6: Desktop Moderno + Streamlit para Debug  
- [x] Atividades SP - MUST  
- [x] Programação Python para scripts de suporte para PLC  
- [x] Relatórios e simulações de física para eng. elétrica em Quarto  

---

## O que é o SEP (Sistema Elétrico de Potência)?

O SEP é a infraestrutura elétrica de um país, composta por:

1. **Geração:** Transformação de energia (hídrica, eólica, solar, térmica) em eletricidade.
2. **Transmissão:** Transporte em altíssima tensão por longas distâncias.
3. **Distribuição:** Redução da tensão para entrega segura em casas e indústrias.

### Circuitos CA (Corrente Alternada)
- O SEP opera em CA (60Hz no Brasil).
- Uso de transformadores permite transmissão eficiente em altas tensões.
- Conceitos-chave:
  - **Fasores:** Representação vetorial de tensão e corrente.
  - **Impedância ($Z = R + jX$):** Resistência + Reatância.
  - **Potência Trifásica:** Equilíbrio de cargas.
  - **Potência Ativa ($P$) vs. Reativa ($Q$):** $P$ realiza trabalho, $Q$ mantém campos magnéticos.

### Circuitos CC (Corrente Contínua)
- Usado para modelagem rápida (Fluxo de Carga DC) e linhas HVDC (longas distâncias).
- HVDC: Mais eficiente para grandes distâncias (ex: Itaipu, Belo Monte).

> **Resumo prático:**  
> Ao abrir arquivos do AnaREDE, você está analisando SEP em CA, resolvendo equações de fasores para garantir tensão e fluxo adequados.

---

## Sprint Checklist Atual (15/04/2026) - Tarefas PLC 2026

### ✅ FEITO
- [x] Entendimento claro da etapa atual (vG)
- [x] Notificações do dia consolidadas
- [x] Assuntos separados por tema
- [x] Norte claro das tarefas da semana
- [x] Contexto alinhado com Mensal MAIO/26 (VG) e transição de equipe: Marcos → Quadrimestral, Lucas → Mensal PLC
- [x] VA: Política energética aplicada com Despacho de Cargas na FLOW 9.0 das usinas do SECO
- [x] Sintaxe HVDC ajustada para Organon
- [x] Case Manager com .dut e .dat consolidados para Organon
- [x] vB concluída (mês correto)
- [x] Organização mental do fluxo do Mensal, Kanban, PLC e PVRV
- [x] Documentação das etapas anteriores
- [x] Obsidian + Guia mensal PLC
- [x] Kanban, SCRUM, Reuniões e alinhamento espiritual
- [x] Rotina TDAH com foco espiritual (semana santa 30/03 - 04/04)
- [x] Matemática aplicada, Provas Antigas

### ⏳ TODO / DOING
- [x] Diagrama SP - Organon 440KV  
- [x] Diagrama SP 440KV PIVISION  
- [ ] Diagrama RJ/ES - PIVISION  
- [x] Definir responsáveis e datas (REPLAN, Obras SP, vG)  
- [ ] Acompanhar unificações SIGER (SP x RJ)  
- [x] Obras SP  
- [ ] Indisponibilidades SGI tratadas  
- [ ] REPLAN (25/05)  
- [x] Ordem vG  
- [ ] Confirmar ativo LT 138 kV Guariroba 1 / Votuporanga 2 C1  
- [ ] Estudos SEP com Eng. Elétrica e Matemática avançada  
- [ ] Circuitos digitais e elétricos com Arduino e ESP32  
- [x] Jedi Cyberpunk - Python com Métodos Numéricos  
- [ ] Modelagem de Circuitos Elétricos com Laplace  
- [x] Anotações Terapia  
- [x] Anotações Blog - SEP para leigos  
- [x] Python com Sympy para cálculo de EDO de 1ª e 2ª ordem (RL, RC, RLC)  
- [ ] Colar/importar planilha no Excel ou SharePoint  
- [ ] Criar tarefas no Planner a partir dessas linhas  
- [x] Responder João Marco (urgente)  
- [x] Ajustar estudo conforme feedback  
- [ ] Atualizar controle/checklist mensal  
- [x] Anotar o que ficou para amanhã  

---

## ✅ MODELO DE CHECKLIST DIÁRIO (ONS)

**Checklist ≠ Agenda**  
Checklist → o que fazer  
Agenda → quando fazer

### Passos para montar seu checklist diário

1. **Defina blocos fixos do dia**
   - Rotina fixa
   - Pendências / follow-ups
   - Tarefas técnicas
   - Organização / fechamento / planejamento semanal

2. **Priorize o obrigatório**
   - O que tem prazo hoje ou amanhã?

3. **Quebre tarefas grandes**
   - Exemplo:  
     ❌ “Fazer DOE mensal”  
     ✅  
     - Abrir caso do DOE  
     - Atualizar carga  
     - Rodar fluxo de carga  
     - Verificar convergência  
     - Anotar pontos críticos  

4. **Limite tarefas**
   - 5 a 8 tarefas principais por dia

### Exemplo de checklist diário

#### 🔹 Rotina fixa
- [x] Abrir e-mail, Teams, Github e ferramentas PLC (Os_System.py)
- [x] Conferir mensagens / demandas novas
- [x] Ver Agenda, Planner Mensal PLC, Planner PVRV do dia

#### 🔹 Pendências
- [ ] Responder João Marco (urgente)
- [ ] Ajustar estudo conforme feedback

#### 🔹 Organização / Fechamento
- [ ] Atualizar controle/checklist mensal
- [ ] Anotar o que ficou para amanhã

---

## Referências

[1] http://10.41.114.132:8501/ - http://10.41.114.132:8501/

__(13/04/2026)__

SPRINT ATUAL: [[Tarefas PLC - (Semana 1 - 06_04_2026)]]
# Núcleo e Rodízio de Tarefas

**Duração de cada etapa:**

·         vA - Carga e configuração: 1 dia útil
·         vB + vC - Organon + Intercâmbio: 3 dias úteis
·         vD - Flupot: 1 dia útil
·         vE/F/G - Comparação de caso (SIGER+Ajuste de tensão): 1 dia útil/núcleo (3 dias úteis)
·         vH - Anatem: 1 a 2 dias úteis | Casos PRD: paralelo à etapa do Anatem (pós Anat0)

## FLOW 9.0 - 2026

- Controle de casos SAV
- C_Tabelador
- C_Conf
- C_Auxiliar
- C_Mapa - Mapa do fluxo de potencia do SIN
- C_Tabeladores de fluxos
- R_REDESPACHO
- DBSH
- ELOS CC
- Otimização de Belo Monte
- 
---
## Atividades PLC
- [x] 1) Indicador Caso Mensal x Caso Validação (Álvaro, Marcos e Pedro)
- [x] 2) Planilha SISBAR (Alvaro) e correções de barras ausentes script python (Pedro)
	- [ ] Script python: Correção Barras Ausentes Mensal - Python V3.zip

- [x] 3. Gestão de Montagem: 
  - [x] a.	Compilar decks de carga e de configuração do SECO (vB); (Marcos)
    - [x] Carga e Configuração do SECO; (Marcos)

 - [x] 4. vB, vC e vD; (Álvaro, Marcos e Pedro)
    1. Despacho Térmicas, Geração II-C e UFV; (Álvaro)
    - [x] 2. Política Energética; (Marcos/Pedro)
    1. Caso 1 - (Álvaro)
- [ ] 5. vG; (Álvaro, Marcos e Pedro)
    1. Ajustes (todos os decks recebidos e feitos após a etapa inicial da configuração) - (Marcos)
    2. Obras Novas (Alvaro)
    3. SIGER; SIN (Álvaro) e Distribuição (Marcos)
    4. SGI - (Alvaro)
    5. Conferência de Carga - (Marcos)
    6. Ajustes Finais - Casos 1, 2 e 4  - (Álvaro) e Casos 3 e 5 - (Marcos e Pedro)
    
6. Deck Distribuição Sul (Marcos)

7. Atualizar Documento de Apoio (Alvaro)

8. Anat0/Anatem - Casos 1, 2 e 4  - (Marcos e Pedro) e Casos 3 e 5 - (Álvaro)

---
# Atividades Mensal PLC (MAIO 2026)
---

- [x] Tarefas de Organização de Pastas, Casos e Arquivos do Mensal usando as ferramentas PLC
- [x] VA (Configuração de Cargas)
- [x] VB (Organon)
- [x] VC (Intercambio)
- [x] VD (FluPot)
- [ ] VE/VF/ __VG(SECO)__  (Conferencia de carga)
- [ ] VH (AnaTEM)
- [ ] VI, VJ, VK (Emissão de Casos) 


---

**Divisão de patamares entre núcleos:**

·         _**Núcleo 1:** Patamar pesada, vG, ANATEM;_ __(ATUAL)__
·         **Núcleo 2:** Patamar leve, vE, Emissão;
·         **Núcleo 3:** Patamar média, vF, PRD.

**Patamares atuais:**

1 - Máxima Noturna (Pesada)
2 - Máxima Diurna (Média)
3 - Mínima Noturna (Leve)
4 - Máxima Diurna de Sábado (Média)
5 - Máxima Diurna de Domingo (Leve)

Extras (de julho a dezembro):

6 - Máxima Diurna RSE (Média)
7 - Mínima Noturna RSE (Leve)

---

**Atividades Fixas:** 

1. Núcleo SECO: 
    1. Alinhar versões de programa que serão utilizadas no ciclo 
    2. Confecção dos decks da política energética 
    3. Montagem do caso de Roraima  (previsão de integração ao SIN)

---

# Cronograma

- [x] 1. Indicador Caso Mensal x Caso Validação (Álvaro, Marcos e Pedro)
- [x] 1. Planilha SISBAR (Marcos)
- [x] 1. Gestão de Montagem: 
    1. Compilar decks de carga e de configuração do SECO (vB); (Álvaro)
        1. Carga e Configuração do SECO; (Álvaro)
        2. Cronograma de indisp. e restrições; (Álvaro)
- [x] 2. vB, vC e vD; (Álvaro, Marcos e Pedro)
  - [x]   1. Despacho Térmicas, Geração II-C e UFV; (Álvaro)
  - [x]   1. Política Energética; (Marcos e Pedro)
    - [ ] 1. Caso 1, 2  - (Pedro) (Despacho na FLOW da politica energetica Pesada e Média)

- [ ] VB - Organon
	- [ ] VB: Organização de pastas .dat e .dut
	- [ ] Ferramenta de montagem
	- [ ] Case manager no Organon


3. vG; (Álvaro, Marcos e Pedro)
    1. Ajustes (todos os decks recebidos e feitos após a etapa inicial da configuração) - (Marcos)
    2. Obras Novas (Alvaro)
    3. SIGER; SIN (Álvaro) e Distribuição (Marcos)
    4. SGI - (Alvaro)
    5. Conferência de Carga - (Marcos)
    6. Ajustes Finais - Casos 1, 2 e 4  - (Álvaro) e Casos 3 e 5 - (Marcos e Pedro)
4. Deck Distribuição Sul (Marcos)
5. Atualizar Documento de Apoio (Alvaro)
6. Anat0/Anatem - Casos 1, 2 e 4  - (Marcos e Pedro) e Casos 3 e 5 - (Álvaro)

---
# Atalhos de cada etapa:

1) [[1.1) VA - SEMENTE]]
2) [[1.2) VA - Politica Energética]]
3) [[1.3) VA - FLOW 9.0 - Redespacho politica energetica]]
4) [[VB - Organon]]
5) VC - Intercambios
6) VD - FlutPlot
7) VE/VF/VG - Conferencia de Carga

---

## Etapas: VE/VF/VG - Conferencia de Carga

- [ ] 01- SIGER DIST

- [ ] 02- SIGER SIN

- [ ] 03- Decks da pasta obras novas

04- Decks da pasta de ajustes 

05- Pasta da carga - decks Alteração de Carga **(não recebemos esse mês)**

06- Pasta da carga - decks Conferência de Carga 

07- Deck SGI

08- Ajustar swing, pois desligamos o BP1 600 kV Ibiúna / Foz do Iguaçu 50Hz devido ao SGI

09- Ajustar tensão e sobrecarga de reativo

10- Ajustar circulação de reativo

11- Ajustar tensão trechos: entre SINOP--MT138 e PNAITA-MT138; B.PEIX-MT138, CANARA-MT138 e SANTAN-PA138

12- Verificar tabela "Conferências" da aba "C_Controle_de_Casos" na flow (shunts não manobráveis, síncrono fictício, filtragem mínima, etc do SECO)


---


![[Pasted image 20260422170442.png]]

## 🧭 Gestão Pessoal e Organização (Rotina PLC / ONS)

- [x] Atualizar Kanban semanal (mensal + estudos + código) __TODO
- [x] Registrar o que foi feito no Mensal __ONS

---



---

## ⚡STATUS Mensal ONS – (PLC)

- [x] Abril
- [x] Maio
- [x] Junho

### Cronograma de Tarefas 

- [x] Tarefas de Organização de Pastas, Casos e Arquivos do Mensal usando as ferramentas PLC
- [x] VA (Configuração de Cargas)
- [ ] VB (Organon)
- [ ] VC (Intercambio)
- [ ] VD (FluPot)
- [ ] VE(SECO)/VF/VG (Conferencia de carga)
- [ ] VH (AnaTEM)
- [ ] VI, VJ, VK (Emissão de Casos)


---

## 🔌 Engenharia Elétrica - Sistema elétricos de potencias

- [ ] Revisar conceitos de:
  - [ ] Barra swing e Fator de potência __TODO
  - [ ] Sintaxe HVDC (bipolos / BtB) no Organon
  - [ ] perdas duplas LTS do SIN __TODO
- [ ] Estudar SEP usando casos reais do Mensal (PWF) __TODO

---

## 🌌 Projetos Github Pessoais

- [x] SEP interativo para Leigos (tensões, fluxos, swing)
- [x] Projeto Astronomia + Engenharia (visual tipo NASA / Artemis) __IDEIA
- [x] Blog técnico (.md / Quarto) explicando SEP e Mensal __IDEIA

---



---

## ⚡ Tarefas ONS PLC

---
<a id="tarefas-ons-plc"></a>
### Diagrama SP - Organon

- [ ] Dashboard SECO - SP (ETL + MUST)
- [x] Automação banco de dados (Python)
- [x] Script de análise de fluxo de potência

### Automações e Scripts

- [x]  VBA Perdas duplas Lts:  __TODO
  - [ ] Obter da aba "Modificações" da planilha os motivos da revisão e colocar na tabela de revisão do word na pág correta (pág 3).
  - [ ]  3 principais gráficos do VBA Perdas duplas LTs em Excel
  - [ ] Pandas + Plotly + Julia para analise de dados e escolher os 3 gráficos de Perdas Duplas LTs e usar os gráficos no excel interno

- [x] Validação do Script de automação de Lts e Trafos de equipamentos de SP com o PowerBI a equipe do SUL fez
  - [x] ETL PDF - Palkia Scrapper em Python
  - [ ] ETL PDF - MUST Dashboard + Access Database

- [ ] Algoritimo Big O para complexibilidade de casos de FLuxo de potencia para auxiliar na montagem de decks
- [ ] Programação + Engenharia de dados com Python e Banco de dados com Pacote Office __TODO

## Atividades  PV - 05/05/2026

- [x] Estudos circuitos Digitais UFF __TODO

- [ ] Atividades Mensal: PLC

  - [x] VA: Script Montagem de casos Mensal - Python

  - [x] VA: Script Correção de barras ausentes SISBAR - Python

  - [x] VA: Ter em mãos: Casos SEMENTE + Decks de Configuração + Decks de carga

  - [x] VB: Redespacho de Cargas de Usinas - FLOW

  - [x] VB: Aguardar a política energetica **- Caso 02: Média**

  - [ ] VB: Sintaxe Organon HVDC adapatada nos decks

  - [ ] VB: Preparar e pegar os arquivos do Case Manager

  - [ ] VB: Gravar VB após OPF do Organon

  - [ ] VC: Iniciar intercâmbios

  

- [x] Conferir Status do Diagrama Organon SP - 440kv

- [ ] Conferir Script de Perdas duplas LTs

- [ ] Conferir todas as interfaces do Qt6 com bootstrap com Python e fazer CRUD completo com Access, Sqlite3 e Excel com NextJS + Tailwind e Flask com React usando MUI3.

- [x] Conferir scripts python para Montagem e Barras Ausentes do Mensal PLC ONS

- [x] Estudos Circuitos CA, Trifasicos, SEP para blog

  
- [ ] Aulas Sinais/cricuitos CC/CA e Eng. Controle + SEP Fundamentals + Metodos numericos com Python

  
- [ ] Mincurso CC (SADIKU) + ENEM + Arduino + Python - Youtube

  
  - [ ] <https://www.falstad.com/circuit/circuitjs.html>

  - [ ] Regra de Crammer

  - [ ] EDO sistemas 1 e 2 ordem com RLC e RC plots e respostas da EDO

  
- [ ] Analisar e priorizar Tecnologias + Stacks + tipo de desenvolvimento de Projetos Github 2024, 2025, 2026


- [x] Planejamento + Cronograma -> Montagem Mensal ONS 2026

- [ ] Roteiro Blog -> Astro PV (Batcaverna com pasta Jedi-Cyberpunk) + SEP para Leigos (NexTJS mobile first -> ONS + UFF + Estudos CC x CA para SEP) [[ONS/ONS-PV-PLC-2026/roteiro_blog_2026|roteiro_blog_2026]]
## Tarefas ONS - Ultimas solicitações - Abril (22-04-2026)

---

- [x] Kanban + Lista de tarefas + Tarefas PLC Dashboard

- [x] Diagrama SP 440KV  __TODO
  - [x] barras fictícias(REDUZIDA), barras de 138KV intermediária (SIMPLIFICADA)
  - [x] Transformador trifásico em paralelo como AnaRede
  - [x] Bipolo de barras com trafos trifasicos em paralelo
  - [x] geradores simplificados sem trafos na barra correspondente
  - [x] ângulos de 90° e redução de GAPS
  - [x] potência ativa e reativa de cada linha corretamente
  - [x] Terminais 500KV, 138KV __TODO
  - [x] Desenhos no diagrama ate barra de Santo Angelo SP


---

## ONS – Acesso e ambiente técnico 18/03/2026

---

- [x]  1.a) Acessar Fotólica
- [x]  1.b) Acessar RDO alternativo
- [x]  1.c) Acessar Reger Online

- [x]  2.a) Abrir Despacho Histórico_v5.1.xlsm
- [x]  2.b) Abrir Consultar_SGI 3.5.xlsm

- [x]  3.a) Testar ANAREDE 12.1.0
- [x]  3.b) Testar FLUPOT 7.13.1
- [ ]  4.a) Testar SGI‑OP
- [x]  4.b) Testar RDO <http://10.41.114.132:8501/>

---

## Atividades MUST e Acompanhamento Atividades RJ/SP e SECO

---

- [ ] Estudo VSC e LCC em redes HVDC
- [ ] Micro e Minigeração Distribuída (MGD)
- [ ] QUAIS PONTOS SERÃO ANALISADOS, QUANTO O AGENTE ESTÁ PEDINDO,  QUEM É O ID PROBLEMA , QUEM É O ID SOLUÇÃO
- [ ] Ajustar caminho relativo dentro do repositorio sem caminho Global do banco de dados
- [x] Deck Builder com Plugin do Organon - Testes de casos de uso SEP 16 barras, SEP 5 Barras, IEEE 14 e SIN 45

  - Fundamentação teorica: Barra Swing, Reator Shunt e Transformador em fase
  - Fluxo de potencia x Curto Circuito
  - Despacho de Cargas

- [ ] incluir no banco de dados de MUST a relação ponto de MUST x barras/circuitos do Fluxo de potência
- [x] "régua" para inclusão de LTs e Trafos via script do Organon
- [x] MUST Controle e Gestão - Desktop Software
- [ ] Simulações de SEP básicos do SIN (RJ/SP) no AnaREDE e Organon
- [ ] Análise de Contingências com PandaPower, AnaREDE e Organon (SEMANAL) -> Resultados em dashboard ou PDF

<a id="tarefas-ons-plc-2026-02"></a>

---

## Conceitos Importantes de SEP

1) Equipamentos de proteção:

- Capacitores, Reatores e Indutores
- Fluxo de potencia com cargas Ativas e Reativas
- Linhas de trasmissão, barramentos, transformadores
- Controle de geradores nas linhas
- Potencia Ativa / Reativa / Aparente
- Indutancia e Reatancia
- Geradores

1) Relatórios em .txt com fluxo de potencia e tensões nas barras

- Violações até com 1,035 pu
- Fluxo te pontencia com Geração e perdas nas linhas

1) 4 Equações de Maxwell
2) Sistemas de EDO de 1 e 2 ordem com funcao de transferencia em diagrama em blocos

## 🧠 ANÁLISE DE PLANEJAMENTO PARA ONS

- P define o fluxo energético contratado e físico
- Q afeta tensões e estabilidade – crucial para despacho seguro
- S limita capacidade térmica de equipamentos
- O fator de potência (cosφ) deve ser próximo de 1, sob pena de multas

## 🌐 Exemplos práticos

1) Estimar onde instalar bancos de capacitores ou reatores
2) Analisar fluxo entre regiões com base em P/Q
3) Planejar reforços de linhas com base em sobrecarga de S
4) Usar perfis diários/históricos de P/Q para prever instabilidades

## 💰 VALOR DISSO PARA O MERCADO

- Simulação e relatório de potências com análise técnica: R$ 2.000–5.000
- Estudo de compensação reativa ou fator de potência: R$ 3.000–10.000
- Projeto completo com visualizações interativas e recomendações: R$ 8.000+

---

<a id="estudos-sep-ons-programacao"></a>

# Estudos de SEP para ONS e programação __TODO

## Sesão de ESTUDOS (Matemática, programação e Eng. Elétrica)

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
  
- [ ] Metodos númericos em Matlab para engenharia usando Python (pelo livro de moetodos numericos)

- [ ] Solver ML/DL para cada X,Y de conjunto de dado
- [ ] Python com Sympy para calculo de EDO de 1 e 2 ordem para Circuitos CC (RL,RC e RLC)
- [ ] Atividade IEEEDs = Esp32 + Senoides de corrente em series temporais para modelos de IA (como entrada de dados)
- [ ] Aulas Sinais/cricuitos CC/CA e Eng. Controle + SEP Fundamentals + Metodos numericos com Python

---

<a id="sessao-estudos"></a>

# ⚡ Conceitos Elétricos (Dúvidas/Insights) __TODO

- [ ] CC vs CA: Em CC, a indutância é um curto e a capacitância é um aberto no regime permanente. Em CA, eles geram impedância ($j\omega L$ e $1/j\omega C$).

__Dúvida para tirar com engenheiros: Como o ONS modela a carga dependente da tensão ($P = P_0(V/V_0)^\alpha$)?__

---



## SEP para Leigos: Divulgação de material informativo de geração, transmissão e distribuição com analogias de conceitos fundamentais como circuitos cc e CA, assim como Sinais e Sistemas e fundamentos de SEP com pandapower e Organon com montagem de decks