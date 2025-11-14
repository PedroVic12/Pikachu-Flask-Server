import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Table, FileText, Kanban, Menu, X, Plus, Search, Download, Upload } from 'lucide-react';
import { KanbanBoard } from './views/KanbanBoard';
import { ProjectDetail } from './views/ProjectDetail';
import { ProjectItem, STATUS_COLUMNS } from './models/Project';
import { projectController } from './controllers/ProjectController';
import { CATEGORIES } from './models/Project';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('kanban');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = projectController.getAllProjects();
    setProjects(allProjects);
  };

  const handleSaveProject = (updatedProject: ProjectItem) => {
    projectController.updateProject(updatedProject.id, updatedProject);
    loadProjects();
  };

  const handleDeleteProject = (id: string) => {
    projectController.deleteProject(id);
    loadProjects();
  };

  const handleCreateProject = (project: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject = projectController.createProject(project);
    loadProjects();
    return newProject;
  };

  const filteredProjects = projectController.searchProjects(
    searchTerm, 
    filterCategory === 'all' ? undefined : filterCategory
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-64 bg-white shadow-lg z-30 transition-transform duration-200 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Kanban Pro</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setCurrentScreen('kanban')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${currentScreen === 'kanban' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Kanban className="w-5 h-5 mr-3" />
                  Quadro Kanban
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentScreen('table')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${currentScreen === 'table' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Table className="w-5 h-5 mr-3" />
                  Visualização em Tabela
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentScreen('reports')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${currentScreen === 'reports' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Relatórios
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categorias</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${filterCategory === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Todas as Categorias
                </button>
              </li>
              {Object.entries(CATEGORIES).map(([key, category]) => (
                <li key={key}>
                  <button
                    onClick={() => setFilterCategory(key)}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md flex items-center ${filterCategory === key ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span className="mr-2">{category.emoji}</span>
                    {category.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-500 hover:text-gray-700 mr-2"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                {currentScreen === 'kanban' && 'Quadro Kanban'}
                {currentScreen === 'table' && 'Visualização em Tabela'}
                {currentScreen === 'reports' && 'Relatórios'}
              </h1>
            </div>
            
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar projetos..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center">
              <button
                onClick={() => {
                  const newProject = {
                    title: 'Novo Projeto',
                    status: 'to do',
                    category: 'ons',
                    content: '# Novo Projeto\n\nDescreva seu projeto aqui...',
                    files: []
                  };
                  const created = handleCreateProject(newProject);
                  setSelectedProject(created);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Novo Projeto
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {currentScreen === 'kanban' && (
            <KanbanBoard 
              onSelectProject={setSelectedProject} 
              searchTerm={searchTerm}
              filterCategory={filterCategory}
            />
          )}
          
          {/* Add other screens (table, reports) as needed */}
          {currentScreen === 'table' && (
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Visualização em Tabela</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atualizado em</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProjects.map((project) => {
                      const category = project.category ? CATEGORIES[project.category as keyof typeof CATEGORIES] : null;
                      const status = STATUS_COLUMNS[project.status as keyof typeof STATUS_COLUMNS];
                      
                      return (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{project.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {project.content?.replace(/[#*`_\[\]]/g, '').substring(0, 50)}...
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {status?.emoji} {status?.title || project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {category && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                                {category.emoji} {category.label}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setSelectedProject(project)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
                                  handleDeleteProject(project.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {currentScreen === 'reports' && (
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Relatórios</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Resumo de Projetos</h3>
                  <p className="text-gray-600">
                    Total de projetos: <span className="font-semibold">{projects.length}</span>
                  </p>
                  <div className="mt-4 space-y-2">
                    {Object.entries(STATUS_COLUMNS).map(([statusKey, status]) => (
                      <div key={statusKey} className="flex justify-between">
                        <span>{status.title}:</span>
                        <span className="font-medium">
                          {projects.filter(p => p.status === statusKey).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Por Categoria</h3>
                  <div className="mt-2 space-y-2">
                    {Object.entries(CATEGORIES).map(([key, category]) => (
                      <div key={key} className="flex justify-between">
                        <span>{category.emoji} {category.label}:</span>
                        <span className="font-medium">
                          {projects.filter(p => p.category === key).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ações Rápidas</h3>
                  <div className="mt-4 space-y-3">
                    <button
                      onClick={() => projectController.exportToExcel()}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar para Excel
                    </button>
                    <button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.xlsx,.xls';
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            try {
                              await projectController.importFromExcel(file);
                              loadProjects();
                              alert('Projetos importados com sucesso!');
                            } catch (error) {
                              alert('Erro ao importar projetos: ' + (error as Error).message);
                            }
                          }
                        };
                        input.click();
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Importar do Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSave={(updatedProject) => {
            handleSaveProject(updatedProject);
            setSelectedProject(updatedProject);
          }}
          onDelete={(id) => {
            handleDeleteProject(id);
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
}

// Add this to your global CSS or a CSS module
const styles = `
  .prose {
    max-width: none;
  }
  .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }
  .prose p {
    margin-top: 1em;
    margin-bottom: 1em;
  }
  .prose ul, .prose ol {
    padding-left: 1.5em;
    margin-top: 1em;
    margin-bottom: 1em;
  }
  .prose li {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  .prose a {
    color: #3b82f6;
    text-decoration: none;
  }
  .prose a:hover {
    text-decoration: underline;
  }
  .prose pre {
    background-color: #f3f4f6;
    border-radius: 0.375rem;
    padding: 1em;
    overflow-x: auto;
  }
  .prose code {
    background-color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }
  .prose pre code {
    background-color: transparent;
    padding: 0;
  }
`;

// Add styles to the document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
