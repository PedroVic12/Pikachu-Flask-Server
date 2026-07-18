
---
# Projetos Desktop PLC ONS 2025
---

## Palkia (PDF, Word, Excel)
- [x] Plugin Notepad++ (deploy e falta colocar o plugin publico)
- [x] MUST ETL Desktop Dashboard
- [x] Dashboard atividades SP
- [x] Relatorios automatizados com excel e PDF com Python
- [x] VBA - Perdas duplas (OFFICE, Excel e PDF)
- [x] Script de correção de barras ausentes SECO mensal
- [x] ETL Equipamentos LTs e Trafos de PDF da área SP

---

## Programa que faz o tabelamento automático dos equipamentos da área SP por arquivos PDF (17/03/2026):

- [x] 0) Verificar Palkia ETL e Perdas Duplas ETL com desktop em Pyside6 para extração de PDF e tabelas automatizadas com testes automatizadas e versão em .exe

- Resumo dos seus Templates (Links):
- [x] main.py (BulbassaurQT6-ETL): Este é o seu ponto de entrada da UI. Ele inicializa o aplicativo PySide6, carrega as telas e serve como o "maestro" da interface gráfica. Ele já deve ter a lógica de chamar processos em segundo plano para não travar a tela.

- [x] run.py (ScrapperPDF): Este é o seu motor de extração (Backend). É a rotina pura de Python que vai na pasta, abre o PDF, faz o scraping (atualmente com sua lógica, que agora vamos turbinar com Camelot/Tabula) e devolve os dados.

- [x] create_qt6_mvc_app.sh: Este é um script Bash fantástico de scaffolding (criação de esqueleto). Ele gera automaticamente as pastas do seu projeto separando responsabilidades: models, views, controllers.

- [x] ETL Lts e Trafos da região de SECO

- [x] Streamlit + Script file para rodar a automação

- [x] 1) Tabelar limites da área SP: __TODO
  - [x] a) Verificar se os limites diurnos são iguais ao noturno
  - [x] b) Montar um padrão de extração de:
		i) Linhas
		ii) Transformadores
  - [x] c) Fazer um exemplo de cada e me mostrar
 
  - [x] Verificação e levantamento de requisitos dos arquivos PDF __TODO
https://www.ons.org.br/%2FMPO%2FDocumento%20Normativo%2F2.%20Cadastros%20de%20Informa%C3%A7%C3%B5es%20Operacionais%20-%20SM%205.11%2F2.2.%20Cadastros%20de%20Informa%C3%A7%C3%B5es%20Operacionais%20de%20Limites%20de%20Equipamentos%2F2.2.2.%20Regi%C3%A3o%20Sudeste%2FCD-CT.SE.5SE.02_Rev.62.pdf
 
https://www.ons.org.br/%2FMPO%2FDocumento%20Normativo%2F2.%20Cadastros%20de%20Informa%C3%A7%C3%B5es%20Operacionais%20-%20SM%205.11%2F2.2.%20Cadastros%20de%20Informa%C3%A7%C3%B5es%20Operacionais%20de%20Limites%20de%20Equipamentos%2F2.2.2.%20Regi%C3%A3o%20Sudeste%2FCD-CT.SE.5SE.02_Rev.62.pdf
 
https://www.ons.org.br/%2FMPO%2FDocumento%20Normativo%2F2.%20Cadastros%20de%20Informa%C3%A7%C3%B5es%20Operacionais%20-%20SM%205.11%2F2.2.%20Cadastros%20de%20Informa%C3%A7%C3%B5es%20Operacionais%20de%20Limites%20de%20Equipamentos%2F2.2.2.%20Regi%C3%A3o%20Sudeste%2FCD-CT.SE.5SE.02_Rev.62.pdf


## Estudos e Automações RPA com Python

- [ ] N8N = Relatorios automatizados por email e Whatsapp
- [ ] Aulas Sinais/cricuitos CC/CA e Eng. Controle + SEP Fundamentals + Metodos numericos com Python
- [ ] Despacho Historico e Configuração de cargas - Planejamento Mensal e Semanal - Flow + AnaREDE, AnaTEM e Organon
- [ ] **Estudos SEP com base fundamental para CA**
- [ ] Teoria de controle de engenharia moderno
- [ ] Proteção de SEP e monitoramento area SP
- [ ] Processamento de imagens de satélites com Python
- [x] Bots e RPA com Python
- [x] Estudos de IA, ML, DL, Chatbots, N8N, AI agentes frameworks (Agno/Langchain)
- [x] Grondon Chabtot, Jarvis Chatbot, Lumina Aurora Chatbot


## Desktop Developer (Pyside6 e Tauri V2)

- [x] Dashboard Ativididades SP/SECO - MUST e Tarefas PLC ONS (Tauri V2)
- [x] ETL MUST para Access Database + Sqlite3 (Palkia GUI)
- [x] Perdas Duplas ETL - Qt6
- [x] MUST ETL - Access DB + Sqlite 3 com Dashboard WEB SP e SECO
- [x] Deck Builder Script CLI AnaRede, Organon e EditCepel  - QT6

1) FullStack - Python e Javascript

- Flask backend + NextJS frontend:
  - Template 1:
    - https://github.com/neupanic/nextjs-flask-video
  - Template 2:
    - https://www.youtube.com/watch?v=njNXTM6L0wc
    - https://github.com/FrancescoXX/fullstack-flask-app
    - 

2) Projetos Github checklist

3) Projetos Desktop/aplicativos hibridos

- Referencias:

ETL - Pyspark, PowerQuery(excel), Pandas:
https://www.databricks.com/br/glossary/pyspark
https://github.com/datalab-to/chandra

---
# Kanban/SCRUM/Alinhamento PVRV:
---

https://docs.google.com/spreadsheets/u/1/d/1qVkJT6b7wZa2guilgZI4YjjRSnyNySByHAedCvRj4uo/edit?gid=1851182818#gid=1851182818
https://github.com/PedroVic12/Pikachu-Flask-Server/blob/main/batcaverna/batcaverna_pv.md
https://kanban-pro-pikachu-restapi.vercel.app/

CRUD - Todo List with Sqlite3 - Javascript and NextJS:
https://javascript.plainenglish.io/crud-with-next13-sqlite-1b104d9156c

Pyside6 Tutorials:
https://www.youtube.com/watch?v=6yeYZqr2b0c&list=PLfQ7GQSrl0_ung_Wt0PpgOICqA8k6dr3i

Pyside6 - Web:
https://doc.qt.io/qtforpython-6/PySide6/QtWebEngineWidgets/QWebEngineView.html#PySide6.QtWebEngineWidgets.QWebEngineView

QT Designer:
https://www.youtube.com/watch?v=uzqDnB44qf4


