import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Edit3, Save, Eye, X, Trash2 } from 'lucide-react';

import { CATEGORIES } from '../../controllers/Repository.jsx';

const ItemEditor = ({ item, isOpen, onSave, onDelete, onClose }) => {
  const [editContent, setEditContent] = useState(item?.content || '');
  const [editTitle, setEditTitle] = useState(item?.title || '');
  const [editCategory, setEditCategory] = useState(item?.category || 'ons');
  const [activeTab, setActiveTab] = useState('editor');

  // States para melhor UI e UX no editor em markdown dentro do site
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);

  // States para customização da fonte do editor
  const [editorSettings, setEditorSettings] = useState({
    fontFamily: "'Architects Daughter', cursive",
    backgroundColor: '#1a1a1a',
    color: '#e6f7ff',
    fontSize: '16px',
  });

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

  const updateEditorSetting = (key, value) => {
    setEditorSettings((prev) => ({ ...prev, [key]: value }));
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 bg-gray-100 p-3 rounded-lg">
        <div>
          <h4 className="text-md font-semibold text-gray-800">Customizar Editor</h4>
        </div>
        <div className="flex gap-3 items-center flex-wrap justify-center">
          <select
            value={editorSettings.fontFamily}
            onChange={(e) => updateEditorSetting('fontFamily', e.target.value)}
            className="bg-gray-200 text-gray-800 text-sm p-2 rounded-md border border-gray-300 outline-none focus:border-blue-500"
          >
            <option value="'Architects Daughter', cursive">Estilo Manuscrito</option>
            <option value="'Inter', sans-serif">Padrão (Inter)</option>
            <option value="'Fira Code', monospace">Código (Mono)</option>
          </select>

          <input
            type="number"
            min="12"
            max="32"
            value={parseInt(editorSettings.fontSize)}
            onChange={(e) => updateEditorSetting('fontSize', `${e.target.value}px`)}
            className="w-20 bg-gray-200 text-gray-800 text-sm p-2 rounded-md border border-gray-300 outline-none focus:border-blue-500"
          />

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Fundo:</label>
            <input
              type="color"
              value={editorSettings.backgroundColor}
              onChange={(e) => updateEditorSetting('backgroundColor', e.target.value)}
              className="w-8 h-8 rounded-md cursor-pointer border border-gray-300"
              title="Cor de Fundo"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Texto:</label>
            <input
              type="color"
              value={editorSettings.color}
              onChange={(e) => updateEditorSetting('color', e.target.value)}
              className="w-8 h-8 rounded-md cursor-pointer border border-gray-300"
              title="Cor do Texto"
            />
          </div>
        </div>
      </div>

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
        className="flex-1 p-4 border-0 focus:ring-0 focus:outline-none resize-none overflow-y-auto min-h-[200px]"
        placeholder="Escreva seu conteúdo em Markdown..."
        rows={25}
        style={{
          maxHeight: 'calc(90vh - 250px)',
          minHeight: '300px',
          fontFamily: editorSettings.fontFamily,
          backgroundColor: editorSettings.backgroundColor,
          color: editorSettings.color,
          fontSize: editorSettings.fontSize,
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

      <div
        className="flex-1 p-4 overflow-y-auto"
        style={{
          maxHeight: 'calc(90vh - 250px)',
          fontFamily: editorSettings.fontFamily,
          fontSize: editorSettings.fontSize,
          backgroundColor: '#f9fafb', // Cor de fundo padrão para o preview
          color: '#374151', // Cor do texto padrão para o preview
        }}
      >
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

  const renderPreviewFullscreen = () => {
    if (!isPreviewFullscreen) return null;

    return (
      <div className="fixed inset-0 z-[60] bg-white flex flex-col">
        {/* Header fixo */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900">Preview (Tela cheia)</span>
            <span className="text-xs text-gray-500">Visualização do conteúdo</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewFullscreen(false)}
            className="text-xs px-3 py-1 rounded-md bg-gray-900 text-white hover:bg-black"
          >
            Fechar
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className={`prose max-w-none`}
            style={{
              fontFamily: editorSettings.fontFamily,
              fontSize: editorSettings.fontSize,
            }}
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