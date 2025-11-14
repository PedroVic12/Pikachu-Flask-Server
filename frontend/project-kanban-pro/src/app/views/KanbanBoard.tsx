import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Table, FileText, Kanban, Menu, X, Plus, Edit3, Save, Eye, EyeOff, Trash2, GripVertical, Upload, Download, BarChart3, Search, Filter, MoreVertical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ProjectItem, CATEGORIES, STATUS_COLUMNS } from '../models/Project';
import { projectController } from '../controllers/ProjectController';
import { FileAttachment } from '../models/Project';

interface KanbanBoardProps {
  onSelectProject: (project: ProjectItem) => void;
  searchTerm: string;
  filterCategory: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onSelectProject, searchTerm, filterCategory }) => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<ProjectItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProjects();
  }, [searchTerm, filterCategory]);

  const loadProjects = () => {
    const filteredProjects = projectController.searchProjects(searchTerm, filterCategory === 'all' ? undefined : filterCategory);
    setProjects(filteredProjects);
  };

  const handleDragStart = (e: React.DragEvent, item: ProjectItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const updatedProject = { ...draggedItem, status, updatedAt: new Date() };
    projectController.updateProject(draggedItem.id, { status, updatedAt: new Date() });
    
    setProjects(prev => 
      prev.map(project => 
        project.id === draggedItem.id ? updatedProject : project
      )
    );
    
    setDraggedItem(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await projectController.importFromExcel(file);
      loadProjects(); // Reload projects after import
    } catch (error) {
      console.error('Import error:', error);
      // Show error to user
    }
  };

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => project.status === status);
  };

  const getCategoryInfo = (category?: string) => {
    if (!category) return { emoji: '📁', label: 'Geral', color: 'bg-gray-100 text-gray-800' };
    return CATEGORIES[category as keyof typeof CATEGORIES] || { emoji: '📁', label: category, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meu Kanban</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => projectController.exportToExcel()}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </button>
          <button 
            onClick={handleImportClick}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Excel
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".xlsx, .xls"
              className="hidden" 
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Object.entries(STATUS_COLUMNS).map(([statusKey, status]) => (
          <div 
            key={statusKey}
            className="bg-gray-50 rounded-lg p-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, statusKey)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-xl mr-2">{status.emoji}</span>
                <h3 className="font-semibold">{status.title}</h3>
              </div>
              <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {getProjectsByStatus(statusKey).length}
              </span>
            </div>

            <div className="space-y-3">
              {getProjectsByStatus(statusKey).map(project => {
                const categoryInfo = getCategoryInfo(project.category);
                return (
                  <div 
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project)}
                    onClick={() => onSelectProject(project)}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 line-clamp-2">{project.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${categoryInfo.color} ml-2`}>
                        {categoryInfo.emoji} {categoryInfo.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Atualizado em {new Date(project.updatedAt).toLocaleDateString('pt-BR')}</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button 
                onClick={() => {
                  const newProject: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'> = {
                    title: 'Novo Item',
                    status: statusKey,
                    category: 'ons',
                    content: '# Novo Item\n\nDescreva aqui o conteúdo...',
                    files: []
                  };
                  const created = projectController.createProject(newProject);
                  onSelectProject(created);
                }}
                className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Adicionar item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
