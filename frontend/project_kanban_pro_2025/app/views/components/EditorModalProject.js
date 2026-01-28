import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Edit3, Save, Eye, X, Trash2 } from 'lucide-react';

import { CATEGORIES } from '../../controllers/Repository.jsx';

// (Google Font abaixo eu explico na próxima seção)
import { Inter } from 'next/font/google';
const editorFont = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
});

const ItemEditor = ({ item, isOpen, onSave, onDelete, onClose }) => {
  const [editContent, setEditContent] = useState(item?.content || '');
  const [editTitle, setEditTitle] = useState(item?.title || '');
  const [editCategory, setEditCategory] = useState(item?.category || 'ons');
  const [activeTab, setActiveTab] = useState('editor');


  // States para melhor UI e UX no editor em markdown dentro do site
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  // fonte só da UI (não muda markdown)
  const [editorFontSizePx, setEditorFontSizePx] = useState(14);  // textarea
  const [previewFontSizePx, setPreviewFontSizePx] = useState(14); // preview

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

        style={{
            maxHeight: 'calc(90vh - 250px)',
            minHeight: '300px',
            fontSize: `${editorFontSizePx}px`,
          }}
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
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Visualização em tempo real</span>

        <button
          type="button"
          onClick={() => setIsPreviewFullscreen(true)}
          className="text-xs px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
        >
          Tela cheia
        </button>
      </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 250px)' }}>
        <div className="prose prose-sm max-w-none"
        
          style={{ fontSize: `${previewFontSizePx}px` }}

        >
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

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const renderPreviewFullscreen = () => {
  if (!isPreviewFullscreen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col">
      {/* Header fixo */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">Preview (Tela cheia)</span>
          <span className="text-xs text-gray-500">Somente UI • Markdown não é alterado</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewFontSizePx((s) => clamp(s - 1, 11, 22))}
            className="text-xs px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            title="Diminuir fonte"
          >
            A-
          </button>

          <button
            type="button"
            onClick={() => setPreviewFontSizePx((s) => clamp(s + 1, 11, 22))}
            className="text-xs px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            title="Aumentar fonte"
          >
            A+
          </button>

          <button
            type="button"
            onClick={() => setPreviewFontSizePx(14)}
            className="text-xs px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            title="Reset fonte"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewFullscreen(false)}
            className="text-xs px-3 py-1 rounded-md bg-gray-900 text-white hover:bg-black"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          className={`prose max-w-none ${editorFont.className}`}
          style={{ fontSize: `${previewFontSizePx}px` }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {editContent || '*Nada para mostrar...*'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

return (
  <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[100vh] flex flex-col">
        {renderHeader()}
        {renderContent()}
      </div>
    </div>

    {/* Tela cheia do editor Modal*/}
    {renderPreviewFullscreen()}
  </>
);
};

export default ItemEditor;