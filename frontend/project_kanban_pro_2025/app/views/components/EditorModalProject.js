import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Edit3, Save, Eye, X, Trash2 } from 'lucide-react';

import { CATEGORIES } from '../../controllers/Repository.jsx';

// (Google Font abaixo eu explico na próxima seção)
import { Inter } from 'next/font/google';
const editorFont = Inter({ subsets: ['latin'], weight: ['400', '500', '600'] });

const ItemEditor = ({ item, isOpen, onSave, onDelete, onClose }) => {
  const [editContent, setEditContent] = useState(item?.content || '');
  const [editTitle, setEditTitle] = useState(item?.title || '');
  const [editCategory, setEditCategory] = useState(item?.category || 'ons');
  const [activeTab, setActiveTab] = useState('editor');

  useEffect(() => {
    if (item) {
      setEditContent(item.content || '');
      setEditTitle(item.title);
      setEditCategory(item.category || 'ons');
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;
    const standardizedContent = editContent.replace(/- \[x\]/gi, '- [x]');
    onSave({ title: editTitle, content: standardizedContent, category: editCategory });
    onClose();
  };

  if (!isOpen || !item) return null;

  const renderTabSwitcher = () => (
    <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
      <button
        onClick={() => setActiveTab('editor')}
        className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
          activeTab === 'editor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Edit3 size={14} />
        Editor
      </button>

      <button
        onClick={() => setActiveTab('preview')}
        className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
          activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Eye size={14} />
        Preview
      </button>
    </div>
  );

  const renderHeaderActions = () => (
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
  );

  const renderHeader = () => (
    <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Editar Item</h2>
        {renderTabSwitcher()}
      </div>
      {renderHeaderActions()}
    </div>
  );

  const renderTitleAndCategory = () => (
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
  );

  const renderEditorTab = () => (
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
        className={[
          'flex-1 p-4 border-0 focus:ring-0 focus:outline-none text-sm resize-none overflow-y-auto min-h-[200px]',
          editorFont.className, // fonte Google aplicada só aqui
        ].join(' ')}
        placeholder="Escreva seu conteúdo em Markdown..."
        rows={25}
        style={{ maxHeight: 'calc(90vh - 250px)', minHeight: '300px' }}
      />
    </div>
  );

  const renderPreviewTab = () => (
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
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {editContent || '*Nada para mostrar...*'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );

  const renderEditorOrPreviewContainer = () => (
    <div className="flex-1 overflow-hidden border border-gray-200 rounded-md bg-white">
      {activeTab === 'editor' ? renderEditorTab() : renderPreviewTab()}
    </div>
  );

  const renderCounter = () => (
    <div className="flex justify-between items-center mt-3 px-1">
      <div className="text-base text-gray-900">
        {editContent.length} caracteres
        {editContent.split('\n').length > 1 && ` • ${editContent.split('\n').length} linhas`}
      </div>
      <div className="text-xs text-gray-500">
        Dica: Use ![](URL) ou &lt;img src="URL" /&gt; para adicionar imagens
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col">
      {renderTitleAndCategory()}
      {renderEditorOrPreviewContainer()}
      {renderCounter()}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[100vh] flex flex-col">
        {renderHeader()}
        {renderContent()}
      </div>
    </div>
  );
};

export default ItemEditor;