export interface FileAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'excel';
  url: string;
  size: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  status: string;
  content?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  files?: FileAttachment[];
}

export interface Column {
  id: string;
  title: string;
  emoji: string;
  items: ProjectItem[];
}

export const CATEGORIES = {
  'ons': { emoji: '📂', label: 'Relatórios Técnicos ONS', color: 'bg-blue-100 text-blue-800' },
  'uff': { emoji: '🧪', label: 'Estudos UFF', color: 'bg-purple-100 text-purple-800' },
  'python': { emoji: '⚙️', label: 'Projetos Python', color: 'bg-green-100 text-green-800' },
  'web': { emoji: '🚀', label: 'MVP de Aplicações Web', color: 'bg-orange-100 text-orange-800' },
  'spiritual': { emoji: '🧘‍♂️', label: 'Alinhamento Espiritual', color: 'bg-pink-100 text-pink-800' }
};

export const STATUS_COLUMNS = {
  'to do': { id: 'todo', title: 'Em Rascunho', emoji: '✏️' },
  'in progress': { id: 'progress', title: 'Em Análise', emoji: '🔍' },
  'projetos parados': { id: 'paused', title: 'Projetos Parados', emoji: '⏸️' },
  'agentes (c3po, jarvis)': { id: 'agents', title: 'Agentes IA', emoji: '🤖' },
  'uff - 2025': { id: 'uff2025', title: 'UFF 2025', emoji: '🎓' }
};

export const INITIAL_DATA: ProjectItem[] = [
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
