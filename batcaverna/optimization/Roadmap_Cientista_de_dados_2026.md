# Roadmap Engenharia de Dados 2026: Como se Tornar Engenheiro de Dados do Zero

- link de referencia: <https://www.youtube.com/watch?v=988E_niIoWs>

## 01) Programação

- Python
  - Variáveis x tipagem x tomada de decisão x loops
  - funções x módulos x classes
  - excepetions
  - manipulação de arquivos txt, csv, excel, word e PDF
  - CRUD em backend

- Git/ Github
  - git commit
  - branch
  - merge

- Linux
  - cd
  - ls
  - cp
  - mv
  - rm
  - cat
  - grep
  - chmod

## 02) SQL

- SELECT WHERE
- GROUP BY ORDER BY JOIN
- UNION

- Query plans
- Otimização
- Tabela PK e FK
- Normalização (Modelagem de dados)

## 03) Banco de Dados + Data Warehouse

- OLTP - Transacional
- postgress x MySQL x SQL Server
- cliente x pedido x produto
- OLAP - Analítico
- Big Query x SnowFlake
- Redshift x Synapse
- Data Warehouse
- Data Lake
- Data Lakehouse

## 04) Programação backend

- APIs
- CRUD completo (Python, C++, Javascript e Lua)
- ETL
- ELT
- API -> Raw -> Transform -> Silver -> GOLD -> Dashboard
- ingestão x validação x dedup
- Incrimental x FULL x CDC
- logs e monitoramento

## 05) Orquestração

- Problema: A -> B -> C -> Dashboard
- quando executar?
- falhas x logs x agendamento
- Airflow com DAG e tarefas
- ADF - Glue Workflows

## 06) Big Data + Spark

- 10MB = Python resolve
- 1 TB = outro problema
- Dataframe transformations
- Actions e lazy evaluation
- partions x shuffle x joins
- caching x Spark SQL x PySpark
- entender a diferença entre shuffle e memória

## 07) Cloud

- Azure x Google Cloud x Amazon
- Dataflow
- DB cost monitoring

## 08) Lake / LakeHouse

- Lake = Arquivos no storage
- Warehouse = SQL analytics
- LakeHouse = storage + table format -> SQL

- Delta x Iceberg x Hudi
- Bronze x Silver x Gold
- partição x schema evolution
- metadados

## 09) Streaming

- Batch: dados acumulados -> processamentos
- Streaming: Eventos -> Resultados
- Kafka: produtor x consumidor
- Spark Structured Streaming
- Flink

## 10) Qualidade x Observalidade

- "O pipeline rodou mas esta errado..."
- 1000_000 linhas viraram 7 linhas
- Logs x metricas x lineage
- null x unique x schema
- Dbt testes
- Alertas
- Checklists dos dados

## 11) Software Engineering

- Clean code
- Desenvolvimento voltado a testes (TDD)
- Design Patters
- SOLID
- Arquitetura e Modulos
- CI/CD - Docker e Documentação
- Code Review
- Segurança
- código -> GIT -> PR
- Tests -> CI/CD
- deploy -> monitoramento

## 12) Projetos
