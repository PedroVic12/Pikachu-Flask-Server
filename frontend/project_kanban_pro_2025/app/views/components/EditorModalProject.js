import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Save, X, Trash2, Split } from 'lucide-react';

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
              <span className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700">
                <Split size={14} />
                Editor Lado a Lado
              </span>
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
              <span className="hidden sm:inline">Salvar e Fechar</span>
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

          {/* Editor and Preview Split-Screen */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
            {/* Editor */}
            <div className="h-full flex flex-col border border-gray-200 rounded-md bg-white">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700">Editor Markdown</h3>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 p-4 w-full h-full border-0 focus:ring-0 focus:outline-none font-mono text-sm resize-none overflow-y-auto"
                placeholder="Escreva seu conteúdo em Markdown..."
              />
            </div>

            {/* Preview */}
            <div className="h-full flex flex-col border border-gray-200 rounded-md bg-gray-50">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700">Preview</h3>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom components for styling remain the same
                      img: ({ node, ...props }) => <img {...props} className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm" alt={props.alt || ''} />,
                      table: ({ node, ...props }) => <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200" {...props} /></div>,
                      th: ({ node, ...props }) => <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
                      td: ({ node, ...props }) => <td className="px-4 py-2 border-t border-gray-200" {...props} />,
                      a: ({ node, ...props }) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
                    }}
                  >
                    {editContent || '*Comece a digitar para ver a mágica acontecer...*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          {/* Character/Lines Counter */}
          <div className="flex justify-between items-center mt-3 px-1">
            <div className="text-xs text-gray-500">
              {editContent.length} caracteres
              {editContent.split('\n').length > 1 && ` • ${editContent.split('\n').length} linhas`}
            </div>
            <div className="text-xs text-gray-500">
              Dica: Use `[texto][var]` e `[var]: url` para links.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemEditor;