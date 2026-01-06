---
# BatCaverna Editor:
---

Salve esses dados em:
https://github.com/PedroVic12/Pikachu-Flask-Server/tree/main/batcaverna

Faça edições no [arquivo.MD ][var4] do repositório para atualizar o dashboard da BatCaverna PV 

[var4]: https://github.com/PedroVic12/Pikachu-Flask-Server/blob/main/batcaverna/batcaverna_pv.md

Aqui está o [link][var1] do Shiatsu como váriavel no .MD

[var1]: https://revigorar.reservio.com/

---

DATA ATUAL = 06/01/2025

__Altere as colunas do Kanban:__

**__BACKLOG, __IN_PROGRESS, __TODO, __COMPLETED**

Por default, fica sempre no backlog

---

## Roadmap Cientista de Dados

![alt text - ciencia de dados ONS](image-1.png)

---

# PVRV 2026
- [x] Backup Kanban, Batcaverna, Linux e Win11
- [x] Planejamento e Metas semanal
- [ ] Listagem de projetos atuais por tecnologias do github
- [ ] Organização Emails e Arquivos

---

# ONS PLC 2026 __IN_PROGRESS

Aqui está o [link do Sharepoint][var2] compartilhado

[var2]:https://onsbr.sharepoint.com/:f:/s/soumaisons/IgBdPCjxhJWGRoBDjV76pZApAdwZkzV_avBxKghxoYbQCaI?e=wcX7o3

- [ ] Testes para deploys de programas de automações da PLC
- [ ] Apoio na inserção de dados de restrições de novo Software feito pelo Fábio (06/01/26)
															
Parâmetro	≤	>	COFICIENTES DAS VARIÁVEIS									OBS	RESULTADO TESTE		
Carga SIN	-	95000													
MMGD SECO	3000	0	GIPU	Ger_Fur	Ger_LCB	Ger_AGV	Ger_ILS	Ger_CAP	GPC1	GPC2	INDEPENDENTE				
		Máximo	7500						8000	1260	1				
		Manual	4010						100	3200	1				
			0,917								5069	Noite (F1)	8746,17		
									1	1	-3200	GPC < 3200 (P1a)	100		
									0,5	0,286	-890	GPC > 3200 (P1b)	75,2		
											1901,932	GPC max (P1c)	1901,932		Funções para o Relatório
			0,917	0,000	0,000	0,000	0,000	0,000	1,000	1,000	1.869	F1+P1a	8846,17	1	RSUL ≤ 0,917 x GIPU + 1 x GPC1 + 1 x GPC2 + 1869
			0,917	0,000	0,000	0,000	0,000	0,000	0,500	0,286	4.179	F1+P1b	8821,37	2	RSUL ≤ 0,917 x GIPU + 0,5 x GPC1 + 0,286 x GPC2 + 4179
			0,917	0,000	0,000	0,000	0,000	0,000	0,000	0,000	6.971	F1+P1c	10648,102	3	RSUL ≤ 0,917 x GIPU + 6971
												Limite Final	8821,37	F1+P1b	
															
Parâmetro	≤	>	COFICIENTES DAS VARIÁVEIS									OBS	RESULTADO TESTE		
Carga SIN	-	95000													
MMGD SECO	0	3000	GIPU	Ger_Fur	Ger_LCB	Ger_AGV	Ger_ILS	Ger_CAP	GPC1	GPC2	INDEPENDENTE				
		Máximo	7500						8000	1260	1				
		Manual	2100						100	3100	1				
			1,053								1207	Dia (F1)	3418,3		
											7825	Dia (teto)			
									1	1	-3200	GPC < 3200 (P1a)	0		
									0,5	0,286	-890	GPC > 3200 (P1b)	46,6		
											1901,932	GPC max (P1c)	1901,932		Funções para o Relatório
			1,053	0,000	0,000	0,000	0,000	0,000	1,000	1,000	-1.993	F1+P1a	3418,3	1	RSUL ≤ 1,053 x GIPU + 1 x GPC1 + 1 x GPC2-1993
			1,053	0,000	0,000	0,000	0,000	0,000	0,500	0,286	317	F1+P1b	3464,9	2	RSUL ≤ 1,053 x GIPU + 0,5 x GPC1 + 0,286 x GPC2 + 317
			1,053	0,000	0,000	0,000	0,000	0,000	0,000	0,000	3.109	F1+P1c	5320,232	3	RSUL ≤ 1,053 x GIPU + 3109
			0,000	0,000	0,000	0,000	0,000	0,000	1,000	1,000	4.625	teto+P1a	7825	1	RSUL ≤  + 1 x GPC1 + 1 x GPC2 + 4625
			0,000	0,000	0,000	0,000	0,000	0,000	0,500	0,286	6.935	teto+P1b	7871,6	2	RSUL ≤  + 0,5 x GPC1 + 0,286 x GPC2 + 6935
			0,000	0,000	0,000	0,000	0,000	0,000	0,000	0,000	9.727	teto+P1c	9726,932	3	RSUL ≤  + 9727
												Limite Final	3418,3	F1+P1a	


- [ ] Fazer preeenchimento da base de dados do LPP das ultimas duas tabelas do RSUL da planilha compartilhada
  - Limite
  - Condição
  - Governante
  - Nova função Base
  - Cadastro das: Função menor, maior e máx
  - 
- [ ] Conferir inequação resultante igual na planilha de RSUL


<img width="855" height="592" alt="image" src="https://github.com/user-attachments/assets/8bd6e64b-27b8-498a-84c0-ee51915abf14" />




---

## Atividades SP/RJ e MUST gestão e controle


## Regimes de Operação de Perdas duplas de LTs


## Estudos de SEP e conceitos Básicos:
- [ ] Estudos de montagem de decks intercambios VC de Janeiro de 2026
- [ ] Estudos básicos com pandapower, AnaREDE e Organon


- ONS - IoT Engenheiro de estudos elétricos

- [ ] Flow despacho de cargas
- [ ] Flow Inequações
- [ ] Flow Elos CC
- [ ] 



---

## LEGADO - ENG. ELÉTRICA - UFF, ONS, PIBIC, IoT Smart Grids

## Alinhamento PVRV - Novembro: ONS, UFF, Sáude mental e emocional - Corpo, Mente, Espirito __TODO


# VIDA PESSOAL E ROTINA __IN_PROGRESS

## Corpo, Mente (Treino, Calistenia, Saúde) e Espirito (Alinhamento, Chakras, Meditação)

- [X] Treino de calistenia
- [X] Alongamento diário
- [X] Alimentação 4x/dia

## Espiritualidade

- [X] Alinhamento diário (chakra + salmo + equação do dia)
- [ ] Meditação e leitura bíblica
- [X] Diário de evolução espiritual

## Hábitos, Organização e PLanejamento

- [X] Fechar 10 abas
- [ ] Limpeza semanal do apartamento
- [X] Planejamento seg/sex + Kanban pessoal
- [X] Planejamento de terapia e limpeza de pensamentos
- [X] Terapia
- [X] Alongamento + Calistenia + Rotina de treinos com saúde em boa forma
- [ ] Meditação e alinhamento espiritual
- [X] Treino gym
- [ ] Limpeza no apartametno (seg/sex)
- [X] Lavar a louça e passar pano na casa
- [ ] Limpeza de banheiro de cozinha
- [ ] 4 Refeições por dia (Café da manha, Almoço, Lanche (pré-treino) e Jantar)
- [X] Jogos

  - The Witcher 3
  - Bully - ps3 / GTA 4
  - LOL ou Warzone
  - Jurassic Park Evolution
  - Pokemon GBA ou NDS

# TDAH - Rotina (Saúde, Paz e Equilibrio) __COMPLETED

- [X] Visualização KANBAN e gerar 5 tarefas do dia (MANHA)
- [X] Organização mental e preparação para novo Ciclo JEDI CYBERPUNK com resolução de provas, tutorial de 10 min de programação, modelagem e simulações de eng eletrica junto com automações com N8N
- [ ] Alinhamento Espiritual

  - [X] Segunda - Chakra: Solar
  - [ ] Terça - Chakra: Garganta
  - [ ] Quarta - Chakra: Cardiaco
  - [ ] Quinta: Chakra: 3º Olho
  - [ ] Sexta: Chakra: Root
- [X] You Only Need 5 Hobbies (Money, Study, Mindset, In Shape, Creative)
- [ ] Meditação e estudos com Matemática e Japonês
- [ ] Alongamento matinal - Ombros e Quadril
- [X] Treino de calistenia para karate
- [ ] 2 equações do dia
- [ ] 2 projetos no dia (backend/frontend)
- [ ]


# UFF Engenharia Elétrica 2026.1
- [ ] Análise de contigencias PandaPower SIN 45
- [ ] Potencia Ativa x Reativa
- [ ] Equações P e Q e 7 principais
- [ ] Minicurso CC + Provas atingas circuitos 1 e 2 ordem EDO
- [ ] Estudos de Sistemas Elétricos de Potencia (SEP) (Fundamentos)
  - Potencia Ativa/ Reativa/ Aparente
  - Conceitos básicos de circuitos CA
  - Capacitores / Indxutores
  - Impedância, Indutância
  - Tap de transformadores na região de SP para controle de tensão
  - Equações principais para fluxo de potencia em diagrama unifilar
- [ ] Elementos do Eletromagnetismo
- [ ] Processamento digital de Sinais com Relés digitais e Series temporais de cargas de Substações
- [ ] Fazer prova de sistema de controle I da UFF com algebra linear básica na mão

- Cienstista de Dados

  __Atividades Práticas: ETL com Python, PySpark + SQL + Pandas para machine learning e relatórios automatizados__

Projeto 1 - Pipeline de Exploração de Dados e Operações SQL com Spark SQL
Projeto 2 - Banco de Dados, Machine Learning e Pipeline ETL em Cluster Spark Para Detectar Anomalias em Transações Financeiras
Projeto 3 - Pipeline de Machine Learning em Cluster Spark Para Previsão de Churn - Treinamento e Deploy
 Projeto 4 - Pipeline de Pré-Processamento, Validação Cruzada e Otimização em Machine Learning
Projeto 5 - Otimização de Pipeline ETL e Machine Learning com PySpark
Projeto 6 - Pipeline de Coleta, Transformação e Modelagem Preditiva em Tempo Real com Spark Streaming e TensorFlow
Projeto 7 - Data Lakehouse Time Travel com Apache Spark e Delta Lake
Projeto 8 - Deploy e Inferência de Modelos de Machine Learning com MLflow e Databricks
- [ ] Planejamento de horários de aulas
- [ ] Livros:
