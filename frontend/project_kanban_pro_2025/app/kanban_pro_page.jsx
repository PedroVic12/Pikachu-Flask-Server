'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Table, FileText, Kanban, Menu, X, Plus, Edit3, Save, Eye, EyeOff,
  Trash2, GripVertical, Upload, Download, BarChart3, TrendingUp,
  Users, Clock, Search, Filter, FileImage, FileSpreadsheet,
  Paperclip, ExternalLink
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ==================== MODELS ====================

class Project {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.title = data.title || 'Novo Projeto';
    this.status = data.status || 'todo';
    this.category = data.category || 'ons';
    this.content = data.content || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.files = data.files || [];
  }

  update(data) {
    if (data.title !== undefined) this.title = data.title;
    if (data.status !== undefined) this.status = data.status;
    if (data.category !== undefined) this.category = data.category;
    if (data.content !== undefined) this.content = data.content;
    if (data.files !== undefined) this.files = data.files;
    this.updatedAt = new Date();
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      status: this.status,
      category: this.category,
      content: this.content,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      files: this.files
    };
  }

  static fromJSON(json) {
    return new Project(json);
  }
}

class FileAttachment {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || 'file';
    this.type = data.type || 'application/octet-stream';
    this.url = data.url || '';
    this.size = data.size || 0;
  }

  static fromFile(file, dataUrl) {
    return new FileAttachment({
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      url: dataUrl,
      size: file.size
    });
  }
}

// ==================== REPOSITORY ====================

class ProjectRepository {
  constructor(storageKey = 'kanban-projects-mvc') {
    this.storageKey = storageKey;
    this.cache = null;
  }

  _loadFromStorage() {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return this._getInitialData();

      const parsed = JSON.parse(data);
      return parsed.map(item => Project.fromJSON(item));
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return this._getInitialData();
    }
  }

  _saveToStorage(projects) {
    if (typeof window === 'undefined') return;

    try {
      const data = projects.map(p => p.toJSON());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      this.cache = projects;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Falha ao salvar. O localStorage pode estar cheio.');
    }
  }

  _getInitialData() {
    return [
      new Project({
        id: '1',
        title: 'Minicurso Circuitos Elétricos CC',
        status: 'todo',
        category: 'uff',
        content: '# Minicurso Circuitos Elétricos CC\n\n## Objetivos\n- Fundamentos de circuitos CC\n- Análise nodal e de malhas',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15')
      }),
      new Project({
        id: '2',
        title: 'Landing Pages Templates',
        status: 'paused',
        category: 'web',
        content: '# Landing Pages Templates\n\n## Tecnologias\n- AstroJS\n- Three.js\n- Google Analytics',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-12')
      })
    ];
  }

  findAll() {
    if (!this.cache) {
      this.cache = this._loadFromStorage();
    }
    return [...this.cache];
  }

  findById(id) {
    const projects = this.findAll();
    return projects.find(p => p.id === id);
  }

  findByStatus(status) {
    const projects = this.findAll();
    return projects.filter(p => p.status === status);
  }

  findByCategory(category) {
    const projects = this.findAll();
    return projects.filter(p => p.category === category);
  }

  create(projectData) {
    const projects = this.findAll();
    const newProject = new Project(projectData);
    projects.push(newProject);
    this._saveToStorage(projects);
    return newProject;
  }

  update(id, updateData) {
    const projects = this.findAll();
    const index = projects.findIndex(p => p.id === id);

    if (index === -1) {
      throw new Error('Project not found');
    }

    projects[index].update(updateData);
    this._saveToStorage(projects);
    return projects[index];
  }

  delete(id) {
    const projects = this.findAll();
    const filtered = projects.filter(p => p.id !== id);
    this._saveToStorage(filtered);
    return filtered.length < projects.length;
  }

  exportToExcel() {
    const projects = this.findAll();
    const exportData = projects.map(p => ({
      'Título': p.title,
      'Status': p.status,
      'ID': p.id,
      'Categoria': p.category,
      'Criado em': p.createdAt.toLocaleDateString('pt-BR'),
      'Atualizado em': p.updatedAt.toLocaleDateString('pt-BR'),
      'Conteúdo': p.content,
      'Arquivos': p.files.map(f => f.name).join(', ')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projetos');
    XLSX.writeFile(wb, `kanban-backup-${Date.now()}.xlsx`);
  }

  importFromExcel(file, callback) {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const projects = jsonData.map(row => new Project({
          id: row['ID'] || Date.now().toString() + Math.random(),
          title: row['Título'] || 'Sem título',
          status: row['Status'] || 'todo',
          category: row['Categoria'] || 'ons',
          content: row['Conteúdo'] || '',
          createdAt: new Date(row['Criado em'] || Date.now()),
          updatedAt: new Date(row['Atualizado em'] || Date.now())
        }));

        this._saveToStorage(projects);
        callback(null, projects);
      } catch (error) {
        callback(error);
      }
    };

    reader.onerror = () => callback(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  }
}

// ==================== CONTROLLERS ====================

class ProjectController {
  constructor(repository) {
    this.repository = repository;
  }

  getAllProjects() {
    return this.repository.findAll();
  }

  getProjectsByStatus(status) {
    return this.repository.findByStatus(status);
  }

  getProjectsByCategory(category) {
    return this.repository.findByCategory(category);
  }

  searchProjects(searchTerm, filterCategory = 'all') {
    let projects = this.repository.findAll();

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      projects = projects.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term)
      );
    }

    if (filterCategory !== 'all') {
      projects = projects.filter(p => p.category === filterCategory);
    }

    return projects;
  }

  createProject(projectData) {
    return this.repository.create(projectData);
  }

  updateProject(id, updateData) {
    return this.repository.update(id, updateData);
  }

  deleteProject(id) {
    return this.repository.delete(id);
  }

  moveProject(id, newStatus) {
    return this.repository.update(id, { status: newStatus });
  }

  getStatistics() {
    const projects = this.repository.findAll();

    const statusStats = {};
    const categoryStats = {};

    projects.forEach(p => {
      statusStats[p.status] = (statusStats[p.status] || 0) + 1;
      categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
    });

    return {
      total: projects.length,
      statusStats,
      categoryStats,
      completedCount: statusStats['agents'] || 0,
      completionRate: projects.length > 0
        ? ((statusStats['agents'] || 0) / projects.length * 100).toFixed(1)
        : 0
    };
  }

  exportProjects() {
    this.repository.exportToExcel();
  }

  importProjects(file, callback) {
    this.repository.importFromExcel(file, callback);
  }
}

// ==================== CONFIGURATION ====================

const CATEGORIES = {
  'ons': { emoji: '📂', label: 'Relatórios Técnicos ONS', color: 'bg-blue-100 text-blue-800' },
  'uff': { emoji: '🧪', label: 'Estudos UFF', color: 'bg-purple-100 text-purple-800' },
  'python': { emoji: '⚙️', label: 'Projetos Python', color: 'bg-green-100 text-green-800' },
  'web': { emoji: '🚀', label: 'MVP de Aplicações Web', color: 'bg-orange-100 text-orange-800' },
  'spiritual': { emoji: '🧘‍♂️', label: 'Alinhamento Espiritual', color: 'bg-pink-100 text-pink-800' }
};

const STATUS_COLUMNS = {
  'todo': { id: 'todo', title: 'Em Rascunho', emoji: '✏️' },
  'progress': { id: 'progress', title: 'Em Análise', emoji: '🔍' },
  'paused': { id: 'paused', title: 'Projetos Parados', emoji: '⏸️' },
  'agents': { id: 'agents', title: 'Agentes IA', emoji: '🤖' },
  'uff2025': { id: 'uff2025', title: 'UFF 2025', emoji: '🎓' }
};

// ==================== UTILITIES ====================

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return <FileImage className="h-5 w-5 text-blue-500" />;
  if (fileType === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
  if (fileType.includes('spreadsheet') || fileType.includes('excel'))
    return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  return <Paperclip className="h-5 w-5 text-gray-500" />;
};

// ==================== COMPONENTS ====================

function ProjectForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || 'ons',
    status: initialData?.status || 'todo',
    content: initialData?.content || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.emoji} {value.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(STATUS_COLUMNS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.emoji} {value.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Conteúdo (Markdown)
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32 font-mono text-sm"
          placeholder="# Título do Projeto&#10;&#10;## Descrição..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {initialData ? 'Atualizar' : 'Criar'} Projeto
        </button>
      </div>
    </form>
  );
}

// ==================== MAIN APP ====================

export default function App() {
  const [controller] = useState(() => new ProjectController(new ProjectRepository()));
  const [projects, setProjects] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    refreshProjects();
  }, []);

  const refreshProjects = () => {
    setProjects(controller.getAllProjects());
  };

  const handleCreateProject = (formData) => {
    controller.createProject(formData);
    refreshProjects();
    setShowModal(false);
  };

  const handleUpdateProject = (formData) => {
    controller.updateProject(editingProject.id, formData);
    refreshProjects();
    setShowModal(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (id) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      controller.deleteProject(id);
      refreshProjects();
      if (editingProject?.id === id) {
        setShowModal(false);
        setEditingProject(null);
      }
    }
  };

  const handleMoveProject = (id, newStatus) => {
    controller.moveProject(id, newStatus);
    refreshProjects();
  };

  const handleExport = () => {
    controller.exportProjects();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    controller.importProjects(file, (error) => {
      if (error) {
        alert('Erro ao importar arquivo: ' + error.message);
      } else {
        alert('Dados importados com sucesso!');
        refreshProjects();
      }
    });
    e.target.value = '';
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  // Dashboard View
  const DashboardView = () => {
    const stats = controller.getStatistics();

    return (
      <div className="p-4 lg:p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Visão geral dos seus projetos</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Novo Projeto
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Progresso</p>
                <p className="text-2xl font-bold text-gray-900">{stats.statusStats.progress || 0}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Finalizados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa Conclusão</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Status dos Projetos</h3>
            <div className="space-y-3">
              {Object.entries(STATUS_COLUMNS).map(([status, info]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{info.emoji}</span>
                    <span className="text-sm text-gray-600">{info.title}</span>
                  </div>
                  <span className="text-sm font-medium">{stats.statusStats[status] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Categorias</h3>
            <div className="space-y-3">
              {Object.entries(CATEGORIES).map(([category, info]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{info.emoji}</span>
                    <span className="text-sm text-gray-600">{info.label}</span>
                  </div>
                  <span className="text-sm font-medium">{stats.categoryStats[category] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Kanban View
  const KanbanView = () => {
    const columns = Object.entries(STATUS_COLUMNS).map(([status, info]) => ({
      ...info,
      status,
      items: controller.getProjectsByStatus(status)
    }));

    return (
      <div className="p-4 lg:p-6 h-full flex flex-col">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Kanban Board</h1>
            <p className="text-gray-600">Organize seus projetos visualmente</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Novo Projeto
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div
              key={column.status}
              className="bg-white rounded-xl shadow-sm border p-4 min-w-80 md:min-w-0 flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedItem) {
                  handleMoveProject(draggedItem.id, column.status);
                  setDraggedItem(null);
                }
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{column.emoji}</span>
                  <h2 className="font-semibold text-gray-900 text-sm">{column.title}</h2>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {column.items.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto">
                {column.items.map((item) => {
                  const categoryInfo = CATEGORIES[item.category] || CATEGORIES.ons;
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => setDraggedItem(item)}
                      onClick={() => openEditModal(item)}
                      className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-all border group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                          <span>{categoryInfo.emoji}</span>
                        </div>
                        <GripVertical size={14} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {item.content.replace(/[#*`]/g, '').substring(0, 80)}...
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>{item.updatedAt.toLocaleDateString('pt-BR')}</span>
                        {item.files?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Paperclip size={10} />
                            {item.files.length}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Table View
  const TableView = () => {
    const filteredProjects = controller.searchProjects(searchTerm, filterCategory);

    return (
      <div className="p-4 lg:p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Tabela de Projetos</h1>
            <p className="text-gray-600">Visualize todos os seus projetos</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Novo Projeto
          </button>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as categorias</option>
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.emoji} {value.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projeto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atualizado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => {
                  const categoryInfo = CATEGORIES[project.category] || CATEGORIES.ons;
                  const statusInfo = STATUS_COLUMNS[project.status];

                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{project.title}</div>
                          <div className="text-sm text-gray-500">ID: {project.id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{statusInfo?.emoji}</span>
                          <span className="text-sm text-gray-900">{statusInfo?.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                          <span className="mr-1">{categoryInfo.emoji}</span>
                          {categoryInfo.label}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {project.updatedAt.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(project)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Sidebar Component
  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">Kanban Pro MVC</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="mt-8 px-4">
        <div className="space-y-2">
          <button
            onClick={() => { setCurrentScreen('dashboard'); setSidebarOpen(false); }}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${currentScreen === 'dashboard'
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <LayoutDashboard size={20} className="mr-3" />
            Dashboard
          </button>

          <button
            onClick={() => { setCurrentScreen('kanban'); setSidebarOpen(false); }}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${currentScreen === 'kanban'
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <Kanban size={20} className="mr-3" />
            Kanban
          </button>

          <button
            onClick={() => { setCurrentScreen('table'); setSidebarOpen(false); }}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${currentScreen === 'table'
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <Table size={20} className="mr-3" />
            Tabela
          </button>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Download size={20} className="mr-3" />
              Backup Excel
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Upload size={20} className="mr-3" />
              Importar Excel
            </button>
          </div>
        </div>
      </nav>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );

  // Modal Component
  const Modal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </h2>
            <button
              onClick={() => {
                setShowModal(false);
                setEditingProject(null);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <ProjectForm
              initialData={editingProject}
              onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
              onCancel={() => {
                setShowModal(false);
                setEditingProject(null);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render current view
  const renderView = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardView />;
      case 'kanban':
        return <KanbanView />;
      case 'table':
        return <TableView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Kanban Pro MVC</h1>
            <div className="w-10" />
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          {renderView()}
        </main>
      </div>

      <Modal />
    </div>
  );
}