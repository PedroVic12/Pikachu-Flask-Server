// ItemEditor.jsx (ou onde você tem o componente)

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Edit3, Save, Eye, X, Trash2 } from 'lucide-react';

import { CATEGORIES } from '../../controllers/Repository.jsx';

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
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'preview'

  // Update state when item changes
  useEffect(() => {
    if (item) {
      setEditContent(item.content || '');
      setEditTitle(item.title);
      setEditCategory(item.category || 'ons');
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;

    // Padroniza os checkboxes para minúsculas ([X] -> [x]) antes de salvar
    const standardizedContent = editContent.replace(/- \[x\]/gi, '- [x]');

    onSave({
      title: editTitle,
      content: standardizedContent,
      category: editCategory
    });
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Editar Item</h2>
            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${activeTab === 'editor'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Edit3 size={14} />
                Editor
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${activeTab === 'preview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(item.id)}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Excluir</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Salvar</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col">
          {/* Title and Category */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
              placeholder="Título do item..."
            />
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.emoji} {value.label}
                </option>
              ))}
            </select>
          </div>

          {/* Editor and Preview Tabs Content */}
          <div className="flex-1 overflow-hidden border border-gray-200 rounded-md bg-white">
            {/* Editor Tab */}
            {activeTab === 'editor' && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Edit3 size={16} className="text-gray-500" />
                    <h3 className="text-sm font-medium text-gray-700">Editor</h3>
                  </div>
                  <span className="text-xs text-gray-500">Markdown suportado</span>
                </div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 p-4 border-0 focus:ring-0 focus:outline-none font-mono text-sm resize-none overflow-y-auto min-h-[200px]"
                  placeholder="Escreva seu conteúdo em Markdown..."
                  rows={25}
                  style={{
                    maxHeight: 'calc(90vh - 250px)',
                    minHeight: '300px'
                  }}
                />
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-gray-500" />
                    <h3 className="text-sm font-medium text-gray-700">Preview</h3>
                  </div>
                  <span className="text-xs text-gray-500">Visualização em tempo real</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 250px)' }}>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        img: ({ node, ...props }) => (
                          <div className="my-4">
                            <img
                              {...props}
                              className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                              alt={props.alt || 'Imagem'}
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4KPGRlZnM+CjxzdHlsZT4KICAuY2xzLTEgewogICAgZmlsbDogI2YzZjRmNjsKICB9CiAgLmNscy0yIHsKICAgIGZpbGw6ICNlMmU0ZTg7CiAgfQogIC5jbHMtMyB7CiAgICBmaWxsOiAjZDVkNmRhOwogIH0KPC9zdHlsZT4KPC9kZWZzPgo8dGl0bGU+SW1hZ2UgcGxhY2Vob2xkZXI8L3RpdGxlPgo8ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIj4KPGcgaWQ9IkxheWVyXzEtMiIgZGF0YS1uYW1lPSJMYXllciAxIj4KPHJlY3QgY2xhc3M9ImNscy0xIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgcng9IjgiLz4KPHJlY3QgY2xhc3M9ImNscy0yIiB4PSI1MCIgeT0iNjAiIHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiByeD0iNiIvPgo8cmVjdCBjbGFzcz0iY2xzLTMiIHg9IjEwMCIgeT0iOTAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiIHJ4PSI0Ii8+CjxjaXJjbGUgY2xhc3M9ImNscy0zIiBjeD0iMjAwIiBjeT0iMTcwIiByPSI0MCIvPgo8L2c+CjwvZz4KPC9zdmc+';
                              }}
                            />
                            {props.alt && (
                              <p className="text-xs text-gray-500 text-center mt-2">
                                {props.alt}
                              </p>
                            )}
                          </div>
                        ),
                        code: ({ node, inline, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="bg-gray-800 text-gray-100 rounded-lg overflow-hidden my-4">
                              <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
                                <span className="text-xs font-mono">{match[1]}</span>
                              </div>
                              <pre className="p-4 overflow-x-auto">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          ) : (
                            <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                        table: ({ node, children, ...props }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full divide-y divide-gray-200" {...props}>
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ node, children, ...props }) => (
                          <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props}>
                            {children}
                          </th>
                        ),
                        td: ({ node, children, ...props }) => (
                          <td className="px-4 py-2 border-t border-gray-200" {...props}>
                            {children}
                          </td>
                        ),
                        h1: ({ node, children, ...props }) => (
                          <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900" {...props}>
                            {children}
                          </h1>
                        ),
                        h2: ({ node, children, ...props }) => (
                          <h2 className="text-xl font-bold mt-5 mb-3 text-gray-800" {...props}>
                            {children}
                          </h2>
                        ),
                        h3: ({ node, children, ...props }) => (
                          <h3 className="text-lg font-bold mt-4 mb-2 text-gray-700" {...props}>
                            {children}
                          </h3>
                        ),
                        blockquote: ({ node, children, ...props }) => (
                          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4" {...props}>
                            {children}
                          </blockquote>
                        ),
                        ul: ({ node, children, ...props }) => (
                          <ul className="list-disc pl-6 my-2 space-y-1" {...props}>
                            {children}
                          </ul>
                        ),
                        ol: ({ node, children, ...props }) => (
                          <ol className="list-decimal pl-6 my-2 space-y-1" {...props}>
                            {children}
                          </ol>
                        ),
                        a: ({ node, children, ...props }) => (
                          <a className="text-blue-600 hover:text-blue-800 underline" {...props}>
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {editContent || '*Nada para mostrar...*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Character/Lines Counter */}
          <div className="flex justify-between items-center mt-3 px-1">
            <div className="text-xs text-gray-500">
              {editContent.length} caracteres
              {editContent.split('\n').length > 1 && ` • ${editContent.split('\n').length} linhas`}
            </div>
            <div className="text-xs text-gray-500">
              Dica: Use ![](URL) ou &lt;img src="URL" /&gt; para adicionar imagens
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemEditor;