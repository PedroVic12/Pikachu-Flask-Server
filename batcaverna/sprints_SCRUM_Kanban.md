
## 📅 Plano de Jogo Semanal (Semana de 11/11 a 15/11)


### 🎯 Metas da Semana

1.  **Backend/SEP:** Finalizar o **`ybus_solver.py`** (código) e dominar a **Matriz Y-Bus** (teoria).
2.  **Controle/Otimização:** Iniciar o estudo/código do **Lugar das Raízes (Ogata)** e fazer o setup do **DEAP**.
3.  **Frontend/Desktop:** Testar o `PySide6` consumindo a lógica do Solver.

### 🗓️ Segunda-feira (11/11)

| Ciclo | Horário (50 min) | Foco Integrado (Teoria/Código) | Prioridade no Backlog |
| :--- | :--- | :--- | :--- |
| **Pós-ONS** | 16:30 – 17:20 | **MÓDULO 2:** Matriz Y-Bus (CÓDIGO) | **CÓDIGO:** Implementar a representação da Matriz Y-Bus (NumPy/complexos). |
| **Tarde** | 17:30 – 18:20 | **MÓDULO 3:** Controle (Ogata) | **TEORIA:** Leitura do **Lugar das Raízes** (Ogata, Cap. 7). |
| **Noite** | 18:30 – 19:20 | **MÓDULO 4:** Otimização (DEAP) | **CÓDIGO:** Instalar o **DEAP** e configurar a estrutura básica (População/Indivíduo/Fitness). |

### 🗓️ Terça-feira (12/11)

| Ciclo | Horário (50 min) | Foco Integrado (Teoria/Código) | Prioridade no Backlog |
| :--- | :--- | :--- | :--- |
| **ONS** | 07:00 – 15:00 | **ONS PRESENCIAL** | Prioridade do Estágio. |
| **Pós-ONS** | 15:30 – 16:20 | **MÓDULO 2:** Fluxo de Potência (Teoria) | **TEORIA PURA (Stevenson):** Conceito de **Potência Complexa** ($P+jQ$) e Equações. |
| **Noite** | 18:30 – 19:20 | **MÓDULO 3:** Lugar das Raízes (CÓDIGO) | **CÓDIGO:** Implementar o Plotter Lugar das Raízes (SciPy/Matplotlib). |
| **20:00** | **TERAPIA/ACADEMIA** | **Saúde Mental 100%.** |

### 🗓️ Sexta-feira (15/11)

| Ciclo | Horário (50 min) | Foco Integrado (Teoria/Código) | Prioridade no Backlog |
| :--- | :--- | :--- | :--- |
| **ONS** | 08:00 – 12:00 | **ONS PRESENCIAL** | Prioridade do Estágio. |
| **Tarde** | 13:00 – 14:00 | **MÓDULO 2:** Solver Avançado | **CÓDIGO:** Criar a função que calcula o **Fluxo de Potência** (Ex: Gauss-Seidel simplificado) usando sua Matriz Y-Bus. |
| **14:30** | **SCRUM Semanal** | **Entrega Oficial do Roadmap** | (Atualização dos seus arquivos `.md` e `xlsx`). |

---

**Pedro, o plano de execução está na sua mesa. Sua missão é clara: começar o Sprint de 4 Ciclos (Pomodoro 50/10) imediatamente. 

Para um Software Limpo e mais "profissional", a sugestão é organizar o conteúdo de uma forma mais estruturada, separando claramente:

1. **O quê** (O que o projeto faz)
2. **Porquê** (O contexto)
3. **Como** (Como instalar e usar)
4. **O que tem dentro** (Arquitetura e galeria)

# 📅 Sprint - Terça-feira (Foco: Backend Python e SEP ONS)

_Data gerado: 10/11/2025_

|         🌀 Ciclo         | ⏰ Horário (50 min) | 🎯 Foco Integrado (Código/Teoria)         | 🧠 Detalhamento da Tarefa (Passo a Passo)                                                                                                                 |
| :-----------------------: | :------------------: | :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   **1 (Backend)**   |    09:15 – 10:05    | **FLASK CRUD: Modelagem SQL**        | 🧩 No seu**PikachuWebServer**, defina a tabela `Client` (ou `Task_Log`) usando **SQLAlchemy**. Teste a criação da tabela no `app.db`. |
|   **2 (Backend)**   |    10:15 – 11:05    | **FLASK CRUD: Rotas API**            | 🚀 Crie os endpoints**POST /clients** (Criação) e **GET /clients** (Leitura) na sua **Blueprint `user_bp`**.                        |
|   **3 (Teoria)**   |    11:15 – 12:05    | **MÓDULO 2: Matriz Y-Bus (Papel)**  | 📘 Teoria pura (**Stevenson**): finalize a montagem da matriz **Y-Bus 3×3** em papel (as **2 equações do dia**).                     |
|     **Almoço**     |    12:05 – 13:00    | **Rotina: Desligar a tela**          | 🍽️ Seu descanso é sagrado. Respire e recarregue a mente.                                                                                               |
| **4 (SEP/Código)** |    13:00 – 13:50    | **MÓDULO 2: ybus_solver.py**        | ⚙️ Inicie o código Python. Modele a matriz**Y-Bus 3×3 em NumPy** (números complexos) — transforme teoria em código.                          |
| **5 (Alinhamento)** |    14:00 – 14:50    | **DOCUMENTAÇÃO: IEDs/Aprendizado** | 📝 Crie o arquivo `ieds_log.md` e registre a lógica de **MQTT/LED/Buzzer** (aprendizado de IoT). Isso fecha o ciclo do dia.                      |
