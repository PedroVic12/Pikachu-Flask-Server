import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown'; // Still needed for renderPreviewFullscreen, but it will be removed.
import remarkGfm from 'remark-gfm'; // Still needed for renderPreviewFullscreen, but it will be removed.
import { Save, X, Trash2 } from 'lucide-react'; // Removed Edit3, Eye, Maximize, Minimize

import { CATEGORIES } from '../../controllers/Repository.jsx';
import CustomizableMarkdownEditor from './CustomizableMarkdownEditor.jsx';

const ItemEditor = ({ item, isOpen, onSave, onDelete, onClose }) => {
  const [editContent, setEditContent] = useState(item?.content || '');
  const [editTitle, setEditTitle] = useState(item?.title || '');
  const [editCategory, setEditCategory] = useState(item?.category || 'ons');

  // isPreviewFullscreen is now managed internally by CustomizableMarkdownEditor
  // const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

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

  const renderHeaderActions = () => (
    <div className="flex items-center">
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
        <X size={16} />
      </button>
    </div>
  );

  const renderHeader = () => (
    <div className="flex items-center justify-between p-2 lg:p-4 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-gray-900">Editar Item</h2>
        {/* Tab switcher moved to CustomizableMarkdownEditor */}
      </div>
      {renderHeaderActions()}
    </div>
  );

  const renderTitleAndCategory = () => (
    <div className="flex flex-col sm:flex-row mb-2">
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
      <CustomizableMarkdownEditor
        markdown={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        // isPreviewFullscreen={isPreviewFullscreen} // Removed
        // onToggleFullscreen={setIsPreviewFullscreen} // Removed
      />
      {renderCounter()}
    </div>
  );

  // renderPreviewFullscreen is now managed internally by CustomizableMarkdownEditor
  // This function is no longer needed here
  // const renderPreviewFullscreen = () => { /* ... */ };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[100vh] flex flex-col">
          {renderHeader()}
          {renderContent()}
        </div>
      </div>

      {/* Tela cheia do editor Modal*/}
      {/* renderPreviewFullscreen() is no longer called here */}
    </>
  );
};

export default ItemEditor;
