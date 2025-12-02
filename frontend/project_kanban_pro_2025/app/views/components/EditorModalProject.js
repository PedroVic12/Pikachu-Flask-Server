'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LayoutDashboard, Table, FileText, Kanban, Menu, X, Plus, Edit3, Save, Eye, EyeOff, Trash2, GripVertical, Upload, Download, FolderSync as Sync, BarChart3, TrendingUp, Users, Clock, Search, Filter, MoreVertical, FileImage, FileSpreadsheet, File as FilePdf, Database } from 'lucide-react';

import CATEGORIES from '../../Repository.jsx';
// Editar Item Modal
const ItemEditor = ({
  item,
  isOpen,
  onSave,
  onDelete,
  onClose
}) => {
  const [editContent, setEditContent] = useState(item?.content || '');
  const [editTitle, setEditTitle] = useState(item?.title || '');
  const [editCategory, setEditCategory] = useState(item?.category || 'ons');
  const [activeTab, setActiveTab] = useState('editor');

  useEffect(() => {
    if (item) {
      setEditContent(item.content || '');
      setEditTitle(item.title || '');
      setEditCategory(item.category || 'ons');
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

  const lineCount = editContent.split('\n').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Editar Item</h2>
            <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'editor'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Edit3 size={16} />
                Editor
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'preview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Eye size={16} />
                Preview
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(item.id)}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Excluir</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Salvar</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          {/* Title and Category */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
              placeholder="Título do item..."
            />
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.emoji} {value.label}
                </option>
              ))}
            </select>
          </div>

          {/* Editor/Preview Container */}
          <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm">
            {/* Editor Tab */}
            {activeTab === 'editor' && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Edit3 size={16} className="text-gray-500" />
                    <h3 className="text-sm font-medium text-gray-700">Editor de Markdown</h3>
                  </div>
                  <span className="text-xs text-gray-500">Markdown suportado</span>
                </div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 p-4 border-0 focus:ring-0 focus:outline-none font-mono text-sm resize-none overflow-y-auto"
                  placeholder="Escreva seu conteúdo em Markdown...

# Título
## Subtítulo
**Negrito** *Itálico*
- Lista
![Imagem](url)
[Link](url)"
                  style={{
                    minHeight: '400px',
                    height: '100%'
                  }}
                />
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-gray-500" />
                    <h3 className="text-sm font-medium text-gray-700">Preview</h3>
                  </div>
                  <span className="text-xs text-gray-500">Visualização em tempo real</span>
                </div>
                <div className="flex-1 p-6 overflow-y-auto bg-white">
                  <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({ node, ...props }) => (
                          <div className="my-6">
                            <img
                              {...props}
                              className="max-w-full h-auto rounded-lg border border-gray-200 shadow-md"
                              alt={props.alt || 'Imagem'}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'bg-red-50 border border-red-200 rounded-lg p-4 text-center';
                                errorDiv.innerHTML = `<p class="text-red-600 text-sm">❌ Erro ao carregar imagem</p><p class="text-xs text-gray-500 mt-1">${props.src}</p>`;
                                e.target.parentNode.appendChild(errorDiv);
                              }}
                            />
                            {props.alt && (
                              <p className="text-sm text-gray-600 text-center mt-2 italic">
                                {props.alt}
                              </p>
                            )}
                          </div>
                        ),
                        code: ({ node, inline, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden my-4 shadow-lg">
                              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                                <span className="text-xs font-mono text-gray-400">{match[1]}</span>
                              </div>
                              <pre className="p-4 overflow-x-auto">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          ) : (
                            <code className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-sm font-mono" {...props}>
                              {children}
                            </code>
                          );
                        },
                        table: ({ node, children, ...props }) => (
                          <div className="overflow-x-auto my-6 shadow-md rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200" {...props}>
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ node, children, ...props }) => (
                          <th className="px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-700 uppercase tracking-wider" {...props}>
                            {children}
                          </th>
                        ),
                        td: ({ node, children, ...props }) => (
                          <td className="px-6 py-4 border-t border-gray-200 text-sm" {...props}>
                            {children}
                          </td>
                        ),
                        h1: ({ node, children, ...props }) => (
                          <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 border-b-2 border-blue-500 pb-2" {...props}>
                            {children}
                          </h1>
                        ),
                        h2: ({ node, children, ...props }) => (
                          <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800" {...props}>
                            {children}
                          </h2>
                        ),
                        h3: ({ node, children, ...props }) => (
                          <h3 className="text-xl font-bold mt-5 mb-2 text-gray-700" {...props}>
                            {children}
                          </h3>
                        ),
                        blockquote: ({ node, children, ...props }) => (
                          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 italic text-gray-700 my-4 bg-blue-50 rounded-r-lg" {...props}>
                            {children}
                          </blockquote>
                        ),
                        ul: ({ node, children, ...props }) => (
                          <ul className="list-disc pl-6 my-3 space-y-2" {...props}>
                            {children}
                          </ul>
                        ),
                        ol: ({ node, children, ...props }) => (
                          <ol className="list-decimal pl-6 my-3 space-y-2" {...props}>
                            {children}
                          </ol>
                        ),
                        a: ({ node, children, ...props }) => (
                          <a className="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer" {...props}>
                            {children}
                          </a>
                        ),
                        hr: ({ node, ...props }) => (
                          <hr className="my-8 border-t-2 border-gray-300" {...props} />
                        ),
                      }}
                    >
                      {editContent || '*Nada para mostrar... Comece a escrever no editor!*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="flex justify-between items-center mt-4 px-2">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <FileText size={14} />
                {editContent.length} caracteres
              </span>
              {lineCount > 1 && (
                <span className="flex items-center gap-1">
                  <Database size={14} />
                  {lineCount} linhas
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <FileImage size={14} />
              Dica: Use ![alt](URL) para imagens
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Component
export default function ItemEditorDemo() {
  const [isOpen, setIsOpen] = useState(true);

  const handleSave = (data) => {
    console.log('Salvando:', data);
    alert('Item salvo com sucesso!');
  };

  const handleDelete = (id) => {
    if (confirm('Deseja realmente excluir este item?')) {
      console.log('Deletando item:', id);
      alert('Item excluído!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <Edit3 size={20} />
        Abrir Editor de Item
      </button>

      <ItemEditor
        item={sampleItem}
        isOpen={isOpen}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}