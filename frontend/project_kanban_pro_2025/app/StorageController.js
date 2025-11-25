import { ProjectItem } from './types.js';

const INITIAL_DATA = [
  {
    id: '868d3j5vf',
    title: 'Minicurso Circuitos Eletricos CC',
    status: 'to do',
    category: 'uff',
    content: '# Minicurso Circuitos Elétricos CC\n\n## Objetivos\n- Fundamentos de circuitos CC\n- Análise nodal e de malhas\n- Teoremas de circuitos\n\n## Cronograma\n- [ ] Preparar material teórico\n- [ ] Criar exercícios práticos\n- [ ] Desenvolver simulações',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    files: []
  },
  {
    id: '868d3j6h0',
    title: '3 Landing Pages Templates (Google Analytics, SEO, Maps, parallax, AstroJS, treejs, boltnew)',
    status: 'projetos parados',
    category: 'web',
    content: '# Landing Pages Templates\n\n## Tecnologias\n- AstroJS\n- Three.js\n- Google Analytics\n- SEO otimizado\n\n## Features\n- Parallax scrolling\n- Mapas integrados\n- Animações 3D\n- Performance otimizada',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12'),
    files: []
  },
  {
    id: '868d3j6p1',
    title: '3 Modelos de IA (ML) - Dashboard Template Streamlit',
    status: 'agentes (c3po, jarvis)',
    category: 'python',
    content: '# Dashboard IA com Streamlit\n\n## Modelos\n1. Previsão de vendas\n2. Análise de sentimentos\n3. Classificação de imagens\n\n## Stack\n- Python\n- Streamlit\n- Scikit-learn\n- Pandas\n- Plotly',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-14'),
    files: []
  }
];

class StorageController {
  static STORAGE_KEY = 'kanban-projects';

  loadProjects() {
    if (typeof window === 'undefined') {
      return INITIAL_DATA;
    }

    const savedData = localStorage.getItem(StorageController.STORAGE_KEY);
    if (!savedData) {
      return INITIAL_DATA;
    }

    try {
      const parsed = JSON.parse(savedData);
      return parsed.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      }));
    } catch {
      return INITIAL_DATA;
    }
  }

  saveProjects(projects) {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(StorageController.STORAGE_KEY, JSON.stringify(projects));
  }
}

const storageController = new StorageController();
export default storageController;