'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  LayoutDashboard, Table, FileText, Kanban, Menu, X, Plus, Edit3, Save, Eye,
  EyeOff, Trash2, GripVertical, Upload, Download, FolderSync as Sync,
  BarChart3, TrendingUp, Users, Clock, Search, Filter, MoreVertical,
  FileImage, FileSpreadsheet, File as FilePdf, Database
} from 'lucide-react';

import CATEGORIES from '../../Repository.jsx';

// Componente de Preview do Markdown
const MarkdownPreview = ({ content }) => {
  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ node, ...props }) => (
              <img
                {...props}
                className="max-w-full h-auto rounded-lg border border-gray-200 my-4"
                alt={props.alt || 'Imagem'}
                loading="lazy"
              />
            ),
            code: ({ node, inline, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden my-4">
                  <div className="px-4 py-2 bg-gray-800 text-sm">
                    <span className="font-mono">{match[1]}</span>
                  </div>
                  <pre className="p-4 overflow-x-auto">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              ) : (
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            },
            table: ({ node, children, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200" {...props}>
                  {children}
                </table>
              </div>
            ),
            th: ({ node, children, ...props }) => (
              <th className="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-700 border-b" {...props}>
                {children}
              </th>
            ),
            td: ({ node, children, ...props }) => (
              <td className="px-4 py-2 border-b border-gray-200" {...props}>
                {children}
              </td>
            ),
            h1: ({ node, children, ...props }) => (
              <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 border-b pb-2" {...props}>
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
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4 bg-blue-50 py-2" {...props}>
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
              <a className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            ),
            hr: ({ node, ...props }) => (
              <hr className="my-4 border-gray-300" {...props} />
            ),
          }}
        >
          {content || '*Nada para mostrar...*'}
        </ReactMarkdown>
      </div>
    </div>
  );
};

// Componente de Editor de Texto
const MarkdownEditor = ({ content, onChange }) => {
  const lines = content.split('\n').length;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Edit3 size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Editor Markdown</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            {lines} {lines === 1 ? 'linha' : 'linhas'}
          </span>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full p-4 border-0 focus:ring-0 focus:outline-none font-mono text-sm resize-none overflow-y-auto"
        placeholder="# Título

Escreva seu conteúdo em Markdown...

## Subtítulo
- Lista item 1
- Lista item 2

> Citação importante

![Descrição da imagem](https://exemplo.com/imagem.jpg)

\`\`\`javascript
// Código de exemplo
console.log('Hello World');
\`\`\`"
        rows={30}
        style={{
          minHeight: '300px',
        }}
      />
    </div>
  );
};

// Componente de Cabeçalho do Modal
const ModalHeader = ({
  activeTab,
  setActiveTab,
  onDelete,
  onSave,
  onClose,
  item,
  editTitle,
  setEditTitle,
  editCategory,
  setEditCategory
}) => {
  return (
    <>
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Editar Item</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'editor'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Edit3 size={16} />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'preview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Eye size={16} />
              <span>Preview</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(item.id)}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Excluir</span>
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
              placeholder="Digite o título do item..."
            />
          </div>
          <div className="lg:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.emoji} {value.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

// Componente Principal do Modal
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

    onSave({
      title: editTitle,
      content: editContent,
      category: editCategory
    });
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <ModalHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onDelete={onDelete}
          onSave={handleSave}
          onClose={onClose}
          item={item}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          editCategory={editCategory}
          setEditCategory={setEditCategory}
        />

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'editor' && (
            <div className="h-full">
              <MarkdownEditor
                content={editContent}
                onChange={setEditContent}
              />
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Preview</span>
                </div>
                <span className="text-xs text-gray-500">
                  Renderização em tempo real
                </span>
              </div>
              <MarkdownPreview content={editContent} />
            </div>
          )}
        </div>

        {/* Rodapé com Informações */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-xs text-gray-500">
              {editContent.length} caracteres • {editContent.split('\n').length} linhas
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500">
                Use <code className="bg-gray-200 px-1.5 py-0.5 rounded">![alt](url)</code> para imagens
              </div>
              <div className="text-xs text-gray-500">
                <span className="hidden sm:inline">Pressione</span> Ctrl+S para salvar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemEditor;