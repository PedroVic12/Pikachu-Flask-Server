'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LayoutDashboard, Table, FileText, Kanban, Menu, X, Plus, Edit3, Save, Eye, EyeOff, Trash2, GripVertical, Upload, Download, FolderSync as Sync, BarChart3, TrendingUp, Users, Clock, Search, Filter, MoreVertical, FileImage, FileSpreadsheet, File as FilePdf, Database } from 'lucide-react';
import ApiDataScreen from './api-data/page.jsx';
import OlaMundo from './OlaMundo.jsx';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


// logica de negocios

import projectRepository, {
  CATEGORIES,
  STATUS_COLUMNS
} from './Repository.jsx'; 






// Removed imports for ProjectItem, CategoryKey, StatusKey from types.js

// ========== HELPERS ========== 
const calculateProgress = (content) => { // Removed type annotations
  if (!content) {
    return { total: 0, completed: 0, percentage: 0 };
  }

  const checklistRegex = /- \[( |x)\]/g;
  const completedRegex = /- \[x\]/g;

  const total = (content.match(checklistRegex) || []).length;
  const completed = (content.match(completedRegex) || []).length;

  if (total === 0) {
    return { total: 0, completed: 0, percentage: 0 };
  }

  const percentage = Math.round((completed / total) * 100);
  return { total, completed, percentage };
};

// ========== HOOKS ========== 
const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setProjects(projectRepository.loadProjects());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      projectRepository.saveProjects(projects);
    }
  }, [projects, isLoaded]);

  const addProject = (project) => {
    setProjects(prev => [...prev, project]);
  };

  const updateProject = (id, updates) => {
    setProjects(prev => prev.map(item =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date() }
        : item
    ));
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(item => item.id !== id));
  };

  const moveProject = (projectId, newStatus) => {
    updateProject(projectId, { status: newStatus });
  };

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    moveProject,
    setProjects
  };
};

// ========== COMPONENTS ========== 
// Removed interface SidebarProps
const Sidebar = ({ 
  currentScreen,
  onScreenChange,
  onExport,
  onImport,
  onSync,
  isOpen,
  onClose
}) => { // Removed React.FC<SidebarProps>
  const fileInputRef = useRef(null); // Removed type annotation

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => { // Removed type annotation
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      event.target.value = ''; // Reset input
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban', icon: Kanban },
    { id: 'table', label: 'Tabelas', icon: Table },
    { id: 'files', label: 'Arquivos', icon: FileText },
    { id: 'api-data', label: 'API', icon: Database }
  ];

  const actionItems = [
    { id: 'export', label: 'Backup Excel', icon: Download, onClick: onExport },
    { id: 'import', label: 'Importar Excel', icon: Upload, onClick: handleImportClick },
    { id: 'sync', label: 'Sincronizar', icon: Sync, onClick: onSync, color: 'text-green-700 hover:bg-green-50' }
  ];

  return (
    <>
    <div className= {`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`
}>
  <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200" >
    <h1 className="text-xl font-bold text-gray-900" > Kanban Pro </h1>
      < button
onClick = { onClose }
className = "lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
  >
  <X size={ 20 } />
    </button>
    </div>

    < nav className = "mt-8 px-4" > 
      <div className="space-y-2" > 
      {
        menuItems.map(({ id, label, icon: Icon }) => (
          <button
                key= { id }
                onClick = {() => { onScreenChange(id); onClose(); }}
className = {`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${currentScreen === id
  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
  : 'text-gray-700 hover:bg-gray-100'
  }`}
              >
  <Icon size={ 20 } className = "mr-3" />
    { label }
    </button>
            ))
}
</div>

  < div className = "mt-8 pt-8 border-t border-gray-200" > 
    <div className="space-y-2" > 
    {
      actionItems.map(({ id, label, icon: Icon, onClick, color }) => (
        <button
                  key= { id }
                  onClick = { onClick }
                  className = {`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${color || 'text-gray-700 hover:bg-gray-100'}
          }`}
      >
      <Icon size={ 20 } className = "mr-3" />
        { label }
        </button>
              ))
}
</div>
  </div>
  </nav>

  < input
ref = { fileInputRef }
type = "file"
accept = ".xlsx,.xls"
onChange = { handleFileChange }
className = "hidden"
  />
  </div>

{/* Overlay for mobile */ }
{
  isOpen && (
    <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
  onClick = { onClose }
    />
      )
}
</>
  );
};

// Removed interface ProjectCardProps
const ProjectCard = ({ project, onEdit, onDragStart }) => { // Removed React.FC<ProjectCardProps> and type annotations
  const categoryInfo = CATEGORIES[project.category] || CATEGORIES.ons; // Removed CategoryKey cast
  const { total, completed, percentage } = calculateProgress(project.content);
  const [bgColor] = categoryInfo.color.split(' ');

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, project)}
      onClick={() => onEdit(project)}
      className={`${bgColor} rounded-lg p-3 cursor-pointer hover:brightness-95 transition-all duration-200 hover:shadow-md border-gray-100 group`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
          <span>{categoryInfo.emoji} </span>
        </div>
        <GripVertical
          size={14}
          className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
        />
      </div>

      <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2">
        {project.title}
      </h3>

      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
        {(project.content || '').replace(/[#*`]/g, '').substring(0, 80)}...
      </p>

      {total > 0 && (
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-gray-500">Progresso</span>
            <span className="text-xs font-bold text-gray-600">{completed}/{total}</span>
          </div>
          <div className="w-full bg-gray-200/70 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        <span>{project.updatedAt.toLocaleDateString('pt-BR')}</span>
        <Edit3 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

// Removed interface KanbanColumnProps
const KanbanColumn = ({ 
  status,
  projects,
  onProjectEdit,
  onProjectCreate,
  onDragOver,
  onDrop,
  onDragStart
}) => { // Removed React.FC<KanbanColumnProps> and type annotations
  const columnInfo = STATUS_COLUMNS[status];

  return (
    <div
      className= "bg-white rounded-xl shadow-sm border border-gray-200 p-4 min-w-80 md:min-w-0"
  onDragOver = { onDragOver }
  onDrop = {(e) => onDrop(e, status)}
    >
  <div className="flex items-center justify-between mb-4" >
    <div className="flex items-center gap-2" >
      <span className="text-xl" > { columnInfo.emoji } </span>
        < h2 className = "font-semibold text-gray-900 text-sm" > { columnInfo.title } </h2>
          < span className = "bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full" >
            { projects.length }
            </span>
            </div>
            < button
onClick = {() => onProjectCreate(status)}
className = "p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
  >
  <Plus size={ 16 } />
    </button>
    </div>

    < div className = "space-y-3" > 
    {
      projects.map((project) => (
        <ProjectCard
            key= { project.id }
            project = { project }
            onEdit = { onProjectEdit }
            onDragStart = { onDragStart }
        />
        ))
    }
      </div>
      </div>
  );
};

// Removed interface ItemEditorProps
const ItemEditor = ({ 
  item,
  isOpen,
  onSave,
  onDelete,
  onClose
}) => { // Removed React.FC<ItemEditorProps> and type annotations
  const [editContent, setEditContent] = useState(item?.content || '');
  const [editTitle, setEditTitle] = useState(item?.title || '');
  const [editCategory, setEditCategory] = useState(item?.category || 'ons'); // Removed type annotation and CategoryKey cast
  const [showPreview, setShowPreview] = useState(true);

  // Update state when item changes
  useEffect(() => {
    if (item) {
      setEditContent(item.content || '');
      setEditTitle(item.title);
      setEditCategory(item.category || 'ons'); // Removed type annotation and CategoryKey cast
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;

    onSave({
      title: editTitle,
      content: editContent,
      category: editCategory
    });
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className= "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" >
    <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col" >
      {/* Modal Header */ }
      < div className = "flex items-center justify-between p-4 lg:p-6 border-b border-gray-200" >
        <div className="flex items-center gap-4" >
          <h2 className="text-xl font-semibold text-gray-900" > Editar Item </h2>
            < button
  onClick = {() => setShowPreview(!showPreview)}
className = "flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200 transition-colors"
  >
  { showPreview?<EyeOff size = { 16 } /> : <Eye size={ 16 } />}
{ showPreview ? 'Ocultar Preview' : 'Mostrar Preview' }
</button>
  </div>

  < div className = "flex items-center gap-2" >
    <button
              onClick={ () => onDelete(item.id) }
className = "flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
  >
  <Trash2 size={ 16 } />
    < span className = "hidden sm:inline" > Excluir </span>
      </button>
      < button
onClick = { handleSave }
className = "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
  >
  <Save size={ 16 } />
    < span className = "hidden sm:inline" > Salvar </span>
      </button>
      < button
onClick = { onClose }
className = "p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
  >
  <X size={ 20 } />
    </button>
    </div>
    </div>

{/* Modal Content */ }
<div className="flex-1 p-4 lg:p-6 overflow-hidden" >
  {/* Title and Category */ }
  < div className = "flex flex-col sm:flex-row gap-4 mb-4" >
    <input
              type="text"
value = { editTitle }
onChange = {(e) => setEditTitle(e.target.value)}
className = "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
placeholder = "Título do item..."
  />
  <select
              value={ editCategory }
onChange = {(e) => setEditCategory(e.target.value)} // Removed CategoryKey cast
className = "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
{
  Object.entries(CATEGORIES).map(([key, value]) => (
    <option key= { key } value = { key } >
    { value.emoji } { value.label }
  </option>
  ))
}
  </select>
  </div>

{/* Editor and Preview */ }
<div className={ `grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-4 h-full` }>
  {/* Editor */ }
  < div className = "flex flex-col" >
    <div className="flex items-center justify-between mb-2" >
      <h3 className="text-sm font-medium text-gray-700" > Editor </h3>
        < span className = "text-xs text-gray-500" > Markdown suportado </span>
          </div>
          < textarea
value = { editContent }
onChange = {(e) => setEditContent(e.target.value)}
className = "flex-1 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
placeholder = "Escreva seu conteúdo em Markdown..."
  />
  </div>

{/* Preview */ }
{
  showPreview && (
    <div className="flex flex-col" >
      <div className="flex items-center mb-2" >
        <h3 className="text-sm font-medium text-gray-700" > Preview </h3>
          </div>
          < div className = "flex-1 p-4 border border-gray-200 rounded-md bg-gray-50 overflow-y-auto" >
            <div className="prose prose-sm max-w-none" >
              <ReactMarkdown remarkPlugins={ [remarkGfm] }>
                { editContent || 'Nada para mostrar...' }
</ReactMarkdown>
  </div>
  </div>
  </div>
            )
}
</div>
  </div>
  </div>
  </div>
  );
};

// Color mapping for consistent styling
const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    button: 'bg-orange-600 hover:bg-orange-700'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    button: 'bg-purple-600 hover:bg-purple-700'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700'
  }
};

// ========== MAIN APP COMPONENT ========== 
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Removed type annotation
  const [draggedItem, setDraggedItem] = useState(null); // Removed type annotation
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // Removed type annotation

  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    moveProject,
    setProjects
  } = useProjects();

  // Event Handlers
  const handleExport = () => {
    projectRepository.exportToExcel(projects);
  };

  const handleImport = async (file) => { // Removed type annotation
    try {
      const importedProjects = await projectRepository.importFromExcel(file);
      setProjects(importedProjects);
      alert('Dados importados com sucesso!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao importar arquivo');
    }
  };

  const handleSync = () => {
    projectRepository.saveProjects(projects);
    alert('Dados sincronizados!');
  };

  const handleDragStart = (e, item) => { // Removed type annotations
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => { // Removed type annotation
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => { // Removed type annotations
    e.preventDefault();
    if (draggedItem) {
      moveProject(draggedItem.id, newStatus);
      setDraggedItem(null);
    }
  };

  const openItemEditor = (item) => { // Removed type annotation
    setEditingItem(item);
  };

  const handleSaveItem = (updates) => { // Removed type annotation
    if (editingItem) {
      updateProject(editingItem.id, updates);
    }
  };

  const handleDeleteItem = (itemId) => { // Removed type annotation
    deleteProject(itemId);
    setEditingItem(null);
  };

  const createNewItem = (status) => { // Removed type annotation
    const newItem = {
      id: Date.now().toString(),
      title: 'Novo Item',
      status,
      category: 'ons',
      content: '# Novo Item\n\nDescreva aqui o conteúdo...', 
      createdAt: new Date(),
      updatedAt: new Date(),
      files: []
    };

    addProject(newItem);
    openItemEditor(newItem);
  };

  // Utility Functions
  const getProjectsByStatus = (status) => { // Removed type annotation
    return projects.filter(item => item.status === status);
  };

  const getFilteredProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.content || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    return filtered;
  };

  const getStatusStats = () => {
    return Object.keys(STATUS_COLUMNS).reduce((acc, status) => {
      acc[status] = projects.filter(item => item.status === status).length;
      return acc;
    }, {}); // Removed type annotation
  };

  const getCategoryStats = () => {
    return Object.keys(CATEGORIES).reduce((acc, category) => {
      acc[category] = projects.filter(item => item.category === category).length;
      return acc;
    }, {}); // Removed type annotation
  };

  // Screen Components
  const DashboardScreen = () => {
    const statusStats = getStatusStats();
    const categoryStats = getCategoryStats();
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'agentes (c3po, jarvis)').length;
    const progressRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    const statCards = [
      {
        label: 'Total de Projetos',
        value: totalProjects,
        icon: BarChart3,
        color: 'blue'
      },
      {
        label: 'Em Progresso',
        value: statusStats['in progress'] || 0,
        icon: Clock,
        color: 'orange'
      },
      {
        label: 'Finalizados',
        value: completedProjects,
        icon: TrendingUp,
        color: 'green'
      },
      {
        label: 'Taxa de Conclusão',
        value: `${progressRate.toFixed(1)}%`,
        icon: Users,
        color: 'purple'
      }
    ];

    const categoryDataForChart = Object.keys(categoryStats).map((key, index) => ({
      name: CATEGORIES[key]?.label || key,
      value: categoryStats[key],
      fill: `hsl(var(--chart-${index + 1}))`
    }));

    const getTimeSeriesData = () => {
        if (!projects || projects.length === 0) return [];

        const statusCountsByDate = projects.reduce((acc, project) => {
            const date = new Date(project.updatedAt).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = {};
                Object.keys(STATUS_COLUMNS).forEach(status => {
                    acc[date][STATUS_COLUMNS[status].title] = 0;
                });
            }
            const statusTitle = STATUS_COLUMNS[project.status]?.title;
            if(statusTitle) {
                acc[date][statusTitle] = (acc[date][statusTitle] || 0) + 1;
            }
            return acc;
        }, {});

        const chartData = Object.keys(statusCountsByDate).map(date => ({
            date,
            ...statusCountsByDate[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        return chartData;
    }
    
    const timeSeriesData = getTimeSeriesData();

    return (
      <div className="p-4 lg:p-6" >
        {/* Exemplo de como usar a nova tela */}
        <div className="mb-8">
          <OlaMundo />
        </div>

        <div className="mb-6" >
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2" > Dashboard </h1>
          <p className="text-gray-600" > Visão geral dos seus projetos e atividades </p>
        </div>

    {/* Stats Cards */ }
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" >
    {
      statCards.map(({ label, value, icon: Icon, color }) => (
        <div key= { label } className = "bg-white rounded-xl p-6 shadow-sm border border-gray-200" >
        <div className="flex items-center justify-between" >
      <div>
      <p className="text-sm font-medium text-gray-600" > { label } </p>
      < p className = "text-2xl font-bold text-gray-900" > { value } </p>
      </div>
      < div className = {`p-3 ${colorClasses[color].bg} rounded-lg`} >
      <Icon className={ `h-6 w-6 ${colorClasses[color].text}` } />
        </div>
        </div>
        </div>
          ))
}
</div>

{/* Charts */ }
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" >
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Categoria</h3>
    <div className="flex-1 -mx-4">
    <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={categoryDataForChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {categoryDataForChart.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>

  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200" >
    <h3 className="text-lg font-semibold text-gray-900 mb-4" > Status dos Projetos </h3>
      < div className = "space-y-3" >
      {
        Object.entries(STATUS_COLUMNS).map(([status, info]) => (
          <div key= { status } className = "flex items-center justify-between" >
          <div className="flex items-center" >
        <span className="text-lg mr-2" > { info.emoji } </span>
        < span className = "text-sm text-gray-600" > { info.title } </span>
        </div>
        < div className = "flex items-center" >
        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3" >
        <div
                        className="bg-blue-600 h-2 rounded-full"
                        style = {{ width: `${totalProjects > 0 ? (statusStats[status] / totalProjects) * 100 : 0}%` }}
        > </div>
        </div>
        < span className = "text-sm font-medium text-gray-900" > { statusStats[status] || 0 } </span>
          </div>
          </div>
              ))}
</div>
  </div>
  </div>

{/* Time Series Chart */}
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade dos Projetos (Séries Temporais)</h3>
    <div className="h-80 -mx-4">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.values(STATUS_COLUMNS).map((statusInfo, index) => (
                    <Line key={statusInfo.id} type="monotone" dataKey={statusInfo.title} stroke={`hsl(var(--chart-${index + 1}))`} strokeWidth={2} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    </div>
</div>

{/* Recent Projects */ }
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-8" >
  <h3 className="text-lg font-semibold text-gray-900 mb-4" > Projetos Recentes </h3>
    < div className = "space-y-3" >
    {
      projects.slice(0, 5).map((project) => {
        const categoryInfo = CATEGORIES[project.category] || CATEGORIES.ons;
        return (
          <div key= { project.id } className = "flex items-center justify-between p-3 bg-gray-50 rounded-lg" >
            <div className="flex items-center" >
              <span className="text-lg mr-3" > { categoryInfo.emoji } </span>
                < div >
                <p className="font-medium text-gray-900" > { project.title } </p>
                  < p className = "text-sm text-gray-500" > Atualizado em { project.updatedAt.toLocaleDateString('pt-BR') } </p>
                    </div>
                    </div>
                    < div className = {`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`
      }>
      { project.status }
      </div>
      </div>
      );
    })
}
</div>
  </div>
  </div>
    );
  };

const KanbanScreen = () => {
  const columns = Object.keys(STATUS_COLUMNS); // Removed type annotation

  return (
    <div className= "p-4 lg:p-6" >
    <div className="mb-6" >
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2" > Kanban Board </h1>
        < p className = "text-gray-600" > Organize seus projetos visualmente </p>
          </div>

          < div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto" >
          {
            columns.map((status) => (
              <KanbanColumn
              key= { status }
              status = { status }
              projects = { getProjectsByStatus(status) }
              onProjectEdit = { openItemEditor }
              onProjectCreate = { createNewItem }
              onDragOver = { handleDragOver }
              onDrop = { handleDrop }
              onDragStart = { handleDragStart }
              />
          ))
          }
            </div>
            </div>
    );
  };

const TableScreen = () => {
  const filteredProjects = getFilteredProjects();

  return (
    <div className= "p-4 lg:p-6" >
    <div className="mb-6" >
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2" > Tabela de Projetos </h1>
        < p className = "text-gray-600" > Visualize todos os seus projetos em formato de tabela </p>
          </div>

  {/* Filters */ }
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6" >
    <div className="flex flex-col sm:flex-row gap-4" >
      <div className="flex-1" >
        <div className="relative" >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size = { 20}
/>
            <input
                  type="text"
  placeholder = "Buscar projetos..."
  value = { searchTerm }
  onChange = {(e) => setSearchTerm(e.target.value)}
className = "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
  </div>
  </div>
  < div className = "sm:w-48" >
    <select
                value={ filterCategory }
onChange = {(e) => setFilterCategory(e.target.value)}
className = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
  <option value="all" > Todas as categorias</ option >
  {
    Object.entries(CATEGORIES).map(([key, value]) => (
      <option key= { key } value = { key } >
      { value.emoji } { value.label }
    </option>
    ))
  }
    </select>
    </div>
    </div>
    </div>

{/* Table */ }
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" >
  <div className="overflow-x-auto" >
    <table className="w-full" >
      <thead className="bg-gray-50 border-b border-gray-200" >
        <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" > Projeto </th>
          < th className = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" > Status </th>
            < th className = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" > Categoria </th>
              < th className = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" > Atualizado </th>
                < th className = "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" > Ações </th>
                  </tr>
                  </thead>
                  < tbody className = "bg-white divide-y divide-gray-200" >
                  {
                    filteredProjects.map((project) => {
                      const categoryInfo = CATEGORIES[project.category] || CATEGORIES.ons; // Removed CategoryKey cast
                      const statusInfo = STATUS_COLUMNS[project.status]; // Removed StatusKey cast

                      return (
                        <tr key= { project.id } className = "hover:bg-gray-50" >
                          <td className="px-4 py-4" >
                            <div>
                            <div className="text-sm font-medium text-gray-900" > { project.title } </div>
                              < div className = "text-sm text-gray-500" > ID: { project.id } </div>
                                </div>
                                </td>
                                < td className = "px-4 py-4" >
                                  <div className="flex items-center" >
                                    <span className="text-lg mr-2" > { statusInfo?.emoji } </span>
                                      < span className = "text-sm text-gray-900" > { statusInfo?.title || project.status
                    }</span>
                    </div>
                    </td>
                    < td className = "px-4 py-4" >
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`} >
                    <span className="mr-1" > { categoryInfo.emoji } </span>
{ categoryInfo.label }
</div>
  </td>
  < td className = "px-4 py-4 text-sm text-gray-900" >
    { project.updatedAt.toLocaleDateString('pt-BR') }
    </td>
    < td className = "px-4 py-4" >
      <div className="flex items-center space-x-2" >
        <button
                            onClick={ () => openItemEditor(project) }
className = "text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
  >
  <Edit3 size={ 16 } />
    </button>
    < button
onClick = {() => deleteProject(project.id)}
className = "text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
  >
  <Trash2 size={ 16 } />
    </button>
    </div>
    </td>
    </tr>
                  );
                })
}
</tbody>
  </table>
  </div>
  </div>
  </div>
    );
  };

const FilesScreen = () => {
  const handleFileUpload = (event, type) => { // Removed type annotations
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        alert(`Arquivo ${file.name} carregado com sucesso!`);
      };

      if (type === 'image') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const uploadSections = [
    {
      type: 'pdf', // Removed 'as const'
      label: 'Upload PDF',
      icon: FilePdf,
      color: 'red', // Removed 'as const'
      accept: '.pdf'
    },
    {
      type: 'image', // Removed 'as const'
      label: 'Upload Imagem',
      icon: FileImage,
      color: 'blue', // Removed 'as const'
      accept: 'image/*'
    },
    {
      type: 'excel', // Removed 'as const'
      label: 'Upload Excel',
      icon: FileSpreadsheet,
      color: 'green', // Removed 'as const'
      accept: '.xlsx,.xls'
    }
  ];

  return (
    <div className= "p-4 lg:p-6" >
    <div className="mb-6" >
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2" > Gerenciador de Arquivos </h1>
        < p className = "text-gray-600" > Upload e gerenciamento de PDFs, imagens e planilhas Excel </p>
          </div>

  {/* Upload Section */ }
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" >
  {
    uploadSections.map(({ type, label, icon: Icon, color, accept }) => (
      <div key= { type } className = "bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center" >
      <div className={`p-4 ${colorClasses[color].bg} rounded-lg inline-block mb-4`} >
    <Icon className={ `h-8 w-8 ${colorClasses[color].text}` } />
      </div>
      < h3 className = "text-lg font-semibold text-gray-900 mb-2" > { label } </h3>
        < p className = "text-sm text-gray-600 mb-4" >
          Faça upload de { type === 'pdf' ? 'documentos PDF' : type === 'image' ? 'imagens' : 'planilhas Excel' }
  </p>
    < input
  type = "file"
  accept = { accept }
  onChange = {(e) => handleFileUpload(e, type)}
className = "hidden"
id = {`${type}-upload`}
              />
  < label
htmlFor = {`${type}-upload`}
className = {`inline-flex items-center px-4 py-2 ${colorClasses[color].button} text-white rounded-lg cursor-pointer transition-colors`}
              >
  <Upload size={ 16 } className = "mr-2" />
    Selecionar { type.toUpperCase() }
</label>
  </div>
          ))
}
</div>

{/* Markdown Editor for Links */ }
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200" >
  <h3 className="text-lg font-semibold text-gray-900 mb-4" > Editor de Links e Referências </h3>
    < div className = "grid grid-cols-1 lg:grid-cols-2 gap-6" >
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-2" >
        Editor Markdown
          </label>
          < textarea
placeholder = "Cole aqui seus links e referências em formato Markdown..."
className = "w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
deafaultValue = {`# Links e Referências

## Documentos PDF
- [Relatório Técnico ONS](link-para-pdf)
- [Manual de Procedimentos](link-para-pdf)

## Imagens
![Diagrama do Sistema](link-para-imagem)

## Planilhas Excel
- [Dados de Análise](link-para-excel)
- [Cronograma do Projeto](link-para-excel)

## Links Externos
- [Documentação Oficial](https://exemplo.com)
- [Tutorial Completo](https://exemplo.com/tutorial)`}
              />
  </div>
  < div >
  <label className="block text-sm font-medium text-gray-700 mb-2" >
    Preview
    </label>
    < div className = "h-64 p-4 border border-gray-200 rounded-lg bg-gray-50 overflow-y-auto" >
      <div className="prose prose-sm max-w-none" >
        <ReactMarkdown remarkPlugins={ [remarkGfm] }>
          {`# Links e Referências

## Documentos PDF
- [Relatório Técnico ONS](link-para-pdf)
- [Manual de Procedimentos](link-para-pdf)

## Imagens
![Diagrama do Sistema](link-para-imagem)

## Planilhas Excel
- [Dados de Análise](link-para-excel)
- [Cronograma do Projeto](link-para-excel)

## Links Externos
- [Documentação Oficial](https://exemplo.com)
- [Tutorial Completo](https://exemplo.com/tutorial)`}
</ReactMarkdown>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>
    );
  };

const renderCurrentScreen = () => {
  switch (currentScreen) {
    case 'dashboard':
      return <DashboardScreen />;
    case 'kanban':
      return <KanbanScreen />;
    case 'table':
      return <TableScreen />;
    case 'files':
      return <FilesScreen />;
    case 'api-data':
      return <ApiDataScreen />;
    default:
      return <DashboardScreen />;
  }
};

return (
  <div className= "min-h-screen bg-gray-50 flex" >
  {/* Sidebar */ }
  < Sidebar
currentScreen = { currentScreen }
onScreenChange = { setCurrentScreen }
onExport = { handleExport }
onImport = { handleImport }
onSync = { handleSync }
isOpen = { sidebarOpen }
onClose = {() => setSidebarOpen(false)}
      />

{/* Main Content */ }
<div className="flex-1 flex flex-col lg:ml-0" >
  {/* Mobile Header */ }
  < div className = "lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3" >
    <div className="flex items-center justify-between" >
      <button
              onClick={ () => setSidebarOpen(true) }
className = "p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
  >
  <Menu size={ 24 } />
    </button>
    < h1 className = "text-lg font-semibold text-gray-900" > Kanban Pro </h1>
      < div className = "w-10" /> {/* Spacer */ }
        </div>
        </div>

{/* Screen Content */ }
<main className="flex-1 overflow-auto" >
  { renderCurrentScreen() }
  </main>
  </div>

{/* Item Editor */ }
<ItemEditor
        item={ editingItem }
isOpen = {!!editingItem}
onSave = { handleSaveItem }
onDelete = { handleDeleteItem }
onClose = {() => setEditingItem(null)}
      />
  </div>
  );
}
