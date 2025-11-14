import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Trash2, Eye, EyeOff, Upload, FileImage, FilePdf, FileSpreadsheet } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ProjectItem, CATEGORIES } from '../models/Project';
import { projectController } from '../controllers/ProjectController';
import { FileAttachment } from '../models/Project';

interface ProjectDetailProps {
  project: ProjectItem | null;
  onClose: () => void;
  onSave: (updatedProject: ProjectItem) => void;
  onDelete: (id: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('ons');
  const [showPreview, setShowPreview] = useState(true);
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project) {
      setEditTitle(project.title);
      setEditContent(project.content || '');
      setEditCategory(project.category || 'ons');
      setFiles(project.files || []);
      setIsEditing(false);
    }
  }, [project]);

  if (!project) return null;

  const handleSave = () => {
    const updatedProject = {
      ...project,
      title: editTitle,
      content: editContent,
      category: editCategory,
      updatedAt: new Date()
    };
    
    projectController.updateProject(project.id, updatedProject);
    onSave(updatedProject);
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload the file to a server
    const newFile: FileAttachment = {
      id: Date.now().toString(),
      name: file.name,
      type: getFileType(file.name),
      url: URL.createObjectURL(file),
      size: file.size
    };

    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    
    // Update project with new files
    const updatedProject = { ...project, files: updatedFiles };
    projectController.updateProject(project.id, { files: updatedFiles });
    onSave(updatedProject);
  };

  const getFileType = (filename: string): 'pdf' | 'image' | 'excel' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    return 'excel';
  };

  const renderFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FilePdf className="w-5 h-5 text-red-500" />;
      case 'image':
        return <FileImage className="w-5 h-5 text-blue-500" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
      default:
        return <FileImage className="w-5 h-5 text-gray-500" />;
    }
  };

  const categoryInfo = CATEGORIES[editCategory as keyof typeof CATEGORIES] || 
    { emoji: '📁', label: editCategory, color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="border rounded px-2 py-1 w-full"
                placeholder="Título do projeto"
              />
            ) : (
              project.title
            )}
          </h2>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                  title="Salvar"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(project.title);
                    setEditContent(project.content || '');
                    setEditCategory(project.category || 'ons');
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  title="Cancelar"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  title="Editar"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
                      onDelete(project.id);
                      onClose();
                    }
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  title="Excluir"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.color}`}>
                {categoryInfo.emoji} {categoryInfo.label}
              </span>
              <span className="text-sm text-gray-500">
                Atualizado em {new Date(project.updatedAt).toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Descrição</h3>
                {isEditing && (
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    type="button"
                  >
                    {showPreview ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" /> Editar
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" /> Visualizar
                      </>
                    )}
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  {!showPreview && (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-64 p-2 border rounded font-mono text-sm"
                      placeholder="Digite o conteúdo em Markdown..."
                    />
                  )}
                  {showPreview && (
                    <div className="border rounded p-4 min-h-64 bg-gray-50">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose max-w-none">
                        {editContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose max-w-none p-4 bg-gray-50 rounded">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content || '_Sem descrição_'}</ReactMarkdown>
                </div>
              )}
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Anexos</h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  type="button"
                >
                  <Upload className="w-4 h-4 mr-1" /> Adicionar arquivo
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              {files.length > 0 ? (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center p-2 border rounded hover:bg-gray-50">
                      <div className="mr-3">
                        {renderFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      {isEditing && (
                        <button
                          onClick={() => {
                            const updatedFiles = files.filter(f => f.id !== file.id);
                            setFiles(updatedFiles);
                            projectController.updateProject(project.id, { files: updatedFiles });
                          }}
                          className="ml-1 p-1 text-red-400 hover:text-red-600"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
                  <p>Nenhum arquivo anexado</p>
                  <p className="text-sm mt-1">Arraste arquivos aqui ou clique para fazer upload</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
