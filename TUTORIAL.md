# Tutorial: Unificando o Backend e Conectando o Frontend

**Autor:** Gemini (Assistente de Programação)  
**Data:** 26 de Novembro de 2025

## 1. Visão Geral

Olá, Pedro! Este tutorial foi criado para documentar o processo de unificação do seu projeto "Pikachu", transformando múltiplos serviços e aplicações em um sistema coeso com um backend Flask centralizado e um frontend React.

O objetivo é claro: **ter todos os dados persistidos em um banco de dados SQLite, gerenciado por uma única API Flask, e consumido pelo seu frontend Next.js de forma organizada.**

Vamos seguir uma arquitetura que você já conhece, semelhante ao **MVC (Model-View-Controller)**, e respeitar a estrutura do seu frontend, onde o `Repository.jsx` atua como uma camada de acesso a dados.

---

## 2. Backend Unificado com Flask

A primeira grande etapa é consolidar toda a lógica de backend em um único servidor Flask. Isso traz vantagens como:
- **Manutenção Simplificada:** Apenas um local para gerenciar dependências, configurações e deploys.
- **Performance:** Evita a sobrecarga de múltiplos servidores rodando simultaneamente.
- **Consistência:** Garante que toda a aplicação siga os mesmos padrões.

### Estrutura MVC no Backend

No nosso contexto de API, podemos adaptar o padrão MVC da seguinte forma:
-   **Model:** As classes Python em `backend/models.py` que, usando SQLAlchemy, definem a estrutura das tabelas do banco de dados (`KanbanItem`, `User`, `Project`, etc.).
-   **View:** Os endpoints da nossa API (as funções com `@api_bp.route(...)`), que são responsáveis por receber as requisições HTTP e retornar respostas em JSON.
-   **Controller:** A lógica de negócio que fica dentro de cada endpoint. Ela "controla" a interação entre a requisição (View) e o banco de dados (Model).

### Passo a Passo para o Backend

#### Passo 2.1: Criar o Modelo `KanbanItem`

O primeiro passo é definir como os dados do seu Kanban serão armazenados. Adicionamos uma nova classe ao arquivo `backend/models.py`.

```python
# Em backend/models.py

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# ... outros modelos como User, Project, etc.

class KanbanItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=True)
    files = db.Column(db.Text, nullable=True) # Armazena uma lista como string JSON
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    updatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'status': self.status,
            'category': self.category,
            'content': self.content,
            'files': self.files,
            'createdAt': self.createdAt.isoformat(),
            'updatedAt': self.updatedAt.isoformat()
        }
```
**Observação:** O Flask, ao ser iniciado com `db.create_all()`, criará automaticamente esta tabela no seu banco de dados `cardapio.db`.

#### Passo 2.2: Criar a API (Endpoints) para o Kanban

Com o modelo definido, precisamos das "portas de entrada" para o frontend acessar esses dados. Usamos um **Blueprint** para manter o código organizado. As rotas foram adicionadas em `backend/controllers/api_routes.py`.

```python
# Em backend/controllers/api_routes.py
from flask import Blueprint, jsonify, request
from backend.models import db, KanbanItem
import json

api_bp = Blueprint('api_bp', __name__)

# ... outras rotas

# --- Rotas para /api/kanban-items ---

@api_bp.route("/kanban-items", methods=["GET"])
def get_kanban_items():
    """Busca todos os itens do Kanban (View)."""
    # Lógica do Controller
    items = KanbanItem.query.all()
    return jsonify([item.to_dict() for item in items])

@api_bp.route("/kanban-items", methods=["POST"])
def create_kanban_item():
    """Cria um novo item (View)."""
    # Lógica do Controller
    data = request.get_json()
    new_item = KanbanItem(**data)
    db.session.add(new_item)
    db.session.commit()
    return jsonify(new_item.to_dict()), 201

@api_bp.route("/kanban-items/<int:item_id>", methods=["PUT"])
def update_kanban_item(item_id):
    """Atualiza um item (View)."""
    # Lógica do Controller
    data = request.get_json()
    item = KanbanItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    
    for key, value in data.items():
        setattr(item, key, value)
    
    db.session.commit()
    return jsonify(item.to_dict())

@api_bp.route("/kanban-items/<int:item_id>", methods=["DELETE"])
def delete_kanban_item(item_id):
    """Deleta um item (View)."""
    # Lógica do Controller
    item = KanbanItem.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    
    db.session.delete(item)
    db.session.commit()
    return jsonify({"success": True})

```
Finalmente, este `api_bp` foi registrado no `backend/app.py` para que as rotas se tornem ativas.

---

## 3. Frontend: Conectando o Kanban à API

Agora, a parte crucial: fazer o frontend buscar e salvar os dados no backend em vez de no `localStorage`. Faremos isso **modificando apenas o `Repository.jsx`**, como você instruiu.

### Passo a Passo para o Frontend

#### Passo 3.1: Modificar `Repository.jsx` para usar a API

A ideia é que o `Repository.jsx` se torne uma camada de abstração para a API. Os outros arquivos do frontend não precisam saber *como* os dados são obtidos (seja de `localStorage` ou de uma API), eles apenas confiam no repositório.

**Arquivo: `frontend/project_kanban_pro_2025/app/Repository.jsx`**

```javascript
import * as XLSX from 'xlsx';
// O storageController não é mais necessário aqui
// import storageController from './StorageController.js';

const API_URL = '/api/kanban-items'; // URL base da nossa API

// ... (constantes CATEGORIES e STATUS_COLUMNS permanecem as mesmas)

class ProjectRepository {
  
  // Modificado: Carrega os projetos da API
  async loadProjects() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Falha ao carregar dados da API');
      let data = await response.json();
      // Converte as datas para o formato correto
      return data.map(p => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
    } catch (error) {
      console.error("Erro no repositório (loadProjects):", error);
      return []; // Retorna um array vazio em caso de erro
    }
  }

  // Modificado: Salva UM projeto (ou atualiza) na API
  // A lógica de salvar todos de uma vez muda
  async saveOrUpdateProject(project) {
    const url = project.id ? `${API_URL}/${project.id}` : API_URL;
    const method = project.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (!response.ok) throw new Error('Falha ao salvar projeto na API');
      return await response.json();
    } catch (error) {
      console.error("Erro no repositório (saveOrUpdateProject):", error);
    }
  }

  // Novo: Deleta um projeto na API
  async deleteProject(projectId) {
     try {
      const response = await fetch(`${API_URL}/${projectId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Falha ao deletar projeto na API');
    } catch (error) {
      console.error("Erro no repositório (deleteProject):", error);
    }
  }

  // Funções de Excel podem ser mantidas, mas cientes de que
  // a importação precisaria ser adaptada para enviar os dados para a API.
  exportToExcel(projects) {
    // ... (lógica existente)
  }

  importFromExcel(file) {
    // ... (lógica existente)
  }
}

const projectRepository = new ProjectRepository();
export default projectRepository;
```

#### Passo 3.2: Ajustar o `page.jsx` para a Nova Lógica do Repositório

Como o novo `loadProjects` é assíncrono (pois depende da rede), precisamos ajustar o `useEffect` em `page.jsx` para lidar com isso. As outras chamadas (`addProject`, `updateProject`) precisam ser ajustadas para chamar os novos métodos do repositório.

**Arquivo: `frontend/project_kanban_pro_2025/app/page.jsx` (Ajustes no hook `useProjects`)**

```javascript
const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Ajustado para ser assíncrono
  useEffect(() => {
    const fetchData = async () => {
      const data = await projectRepository.loadProjects();
      setProjects(data);
      setIsLoaded(true);
    };
    fetchData();
  }, []);

  // O useEffect de salvar tudo não é mais necessário aqui,
  // pois cada ação (adicionar, editar) salva individualmente.

  const addProject = async (project) => {
    const newProjectFromApi = await projectRepository.saveOrUpdateProject(project);
    if (newProjectFromApi) {
        // Atualiza o estado local com o objeto que o backend retornou (que agora tem um ID)
        setProjects(prev => [...prev, newProjectFromApi]);
    }
  };

  const updateProject = async (id, updates) => {
    const originalProject = projects.find(p => p.id === id);
    const updatedData = { ...originalProject, ...updates };
    
    await projectRepository.saveOrUpdateProject(updatedData);

    setProjects(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
    ));
  };
  
  const deleteProject = async (id) => {
    await projectRepository.deleteProject(id);
    setProjects(prev => prev.filter(item => item.id !== id));
  };

  // ... (o resto do hook continua igual)
  
  return { projects, addProject, updateProject, deleteProject, ... };
};
```
Com essa abordagem, o `page.jsx` continua a usar o `Repository.jsx`, cumprindo sua regra, mas o `Repository.jsx` agora é um "portão" para a API do backend, tornando seu projeto robusto e escalável.

---

## 4. Análise de Frameworks: Flask vs. FastAPI

Você pediu uma análise sobre Flask e FastAPI. Ambos são excelentes frameworks Python, mas com filosofias diferentes.

### Flask

É o que estamos usando. É um "micro-framework" que te dá liberdade total.

-   **Vantagens:**
    1.  **Flexibilidade:** Não te força a seguir uma estrutura rígida. Ótimo para quem gosta de moldar o projeto do seu jeito (como você, que usa seu próprio padrão MVC).
    2.  **Maturidade:** Existe há muito tempo, com uma vasta quantidade de extensões, tutoriais e uma comunidade gigante.
    3.  **Simplicidade:** Fácil de começar para projetos pequenos e médios.
    4.  **Bom para Tudo:** Lida bem tanto com APIs REST quanto com renderização de HTML (templates Jinja2), tornando-o um canivete suíço.

-   **Desvantagens:**
    1.  **Performance:** Para APIs puras com altíssima carga de requisições, ele pode ser mais lento que alternativas `async`.
    2.  **Sem Validação Nativa:** Você precisa de extensões (como Flask-WTF ou Marshmallow) para validar os dados que chegam nas suas rotas. Não é algo que vem "de fábrica".
    3.  **Suporte `async`:** Embora possível, o suporte a programação assíncrona não é tão nativo e elegante quanto no FastAPI.

### FastAPI

É um framework moderno, construído sobre o padrão `async` do Python para altíssima performance.

-   **Vantagens:**
    1.  **Performance Excepcional:** É um dos frameworks Python mais rápidos, comparável a NodeJS e Go, graças ao seu design assíncrono.
    2.  **Validação de Dados:** Usa Pydantic para declarar a "forma" dos seus dados com tipos Python. Se uma requisição chega com dados errados, o FastAPI a rejeita automaticamente com uma mensagem de erro clara.
    3.  **Documentação Automática:** Gera uma documentação interativa da sua API (Swagger UI e ReDoc) automaticamente a partir do seu código. Isso é incrivelmente útil.
    4.  **Moderno:** Usa todos os recursos mais recentes do Python, como `type hints` (dicas de tipo) e `async/await`.

-   **Desvantagens:**
    1.  **Focado em API:** Embora seja possível renderizar templates, sua força e design são 99% focados na criação de APIs. Para um projeto que mistura muito HTML renderizado no servidor, o Flask pode ser mais direto.
    2.  **Curva de Aprendizado `async`:** Exige uma boa compreensão de programação assíncrona para extrair seu potencial máximo.
    3.  **Ecossistema Menor:** Por ser mais novo, a quantidade de extensões e exemplos ainda é menor que a do Flask.

### Conclusão para o seu Projeto

**Manter o Flask é a decisão correta para o seu caso.** Você já tem uma base de código sólida, e a flexibilidade do Flask se alinha bem com o seu desejo de organizar o projeto no seu próprio estilo MVC. A performance do Flask é mais do que suficiente para a grande maioria das aplicações web.

FastAPI seria uma excelente escolha se, no futuro, você quisesse criar um **novo microserviço** totalmente independente, focado em uma tarefa de alta performance (ex: um websocket para notificações em tempo real). Mas para a unificação do seu sistema atual, o Flask é a ferramenta certa para o trabalho.

---
Pronto! Este tutorial documenta o que fizemos e como fizemos. Se desejar, posso agora aplicar as alterações descritas no **Passo 3** para conectar seu `Repository.jsx` à API.
