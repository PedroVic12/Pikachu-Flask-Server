import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Edit3, Eye, Maximize, Minimize } from 'lucide-react'; // Added Maximize, Minimize

const LOCAL_STORAGE_KEY = 'custom_markdown_editor_settings';

const CustomizableMarkdownEditor = ({ markdown, onChange }) => { // Removed isPreviewFullscreen, onToggleFullscreen
  const [activeTab, setActiveTab] = useState('editor');
  const [isInternalPreviewFullscreen, setIsInternalPreviewFullscreen] = useState(false); // Internal fullscreen state

  const [settings, setSettings] = useState(() => {
    // Load settings from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedSettings ? JSON.parse(savedSettings) : {
        fontFamily: "'Excalifont-Regular', cursive", // Updated default to Excalifont-Regular
        backgroundColor: '#1a1a1a',
        color: '#e6f7ff',
        fontSize: '16px',
      };
    }
    return {
      fontFamily: "'Excalifont-Regular', cursive",
      backgroundColor: '#1a1a1a',
      color: '#e6f7ff',
      fontSize: '16px',
    };
  });

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

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

  const renderEditorControls = () => (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 bg-gray-100 p-3 rounded-lg">
      <div>
        <h4 className="text-md font-semibold text-gray-800">Customizar Editor</h4>
      </div>
      <div className="flex gap-3 items-center flex-wrap justify-center">
        <select
          value={settings.fontFamily}
          onChange={(e) => updateSetting('fontFamily', e.target.value)}
          className="bg-gray-200 text-gray-800 text-sm p-2 rounded-md border border-gray-300 outline-none focus:border-blue-500"
        >
          <option value="'Excalifont-Regular', cursive">Excalidraw (Hand)</option> {/* Updated value and label */}
          <option value="'Inter', sans-serif">Padrão (Inter)</option>
          <option value="'CascadiaCode', monospace">Código (Cascadia)</option> {/* Added Cascadia Code */}
        </select>

        <input
          type="number"
          min="12"
          max="32"
          value={parseInt(settings.fontSize)}
          onChange={(e) => updateSetting('fontSize', `${e.target.value}px`)}
          className="w-20 bg-gray-200 text-gray-800 text-sm p-2 rounded-md border border-gray-300 outline-none focus:border-blue-500"
        />

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Fundo:</label>
          <input
            type="color"
            value={settings.backgroundColor}
            onChange={(e) => updateSetting('backgroundColor', e.target.value)}
            className="w-8 h-8 rounded-md cursor-pointer border border-gray-300"
            title="Cor de Fundo"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Texto:</label>
          <input
            type="color"
            value={settings.color}
            onChange={(e) => updateSetting('color', e.target.value)}
            className="w-8 h-8 rounded-md cursor-pointer border border-gray-300"
            title="Cor do Texto"
          />
        </div>
      </div>
    </div>
  );

  const renderEditorArea = () => (
    <div className="h-full flex flex-col flex-1">
      {renderEditorControls()}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Edit3 size={16} className="text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Editor</h3>
        </div>
        <span className="text-xs text-gray-500">Markdown suportado</span>
      </div>

      <textarea
        value={markdown}
        onChange={onChange}
        className="flex-1 p-4 border-0 focus:ring-0 focus:outline-none resize-none overflow-y-auto min-h-[200px]"
        placeholder="Escreva seu conteúdo em Markdown..."
        rows={25}
        style={{
          maxHeight: 'calc(90vh - 250px)', // Adjust based on parent container height
          minHeight: '300px', // Ensure a minimum height
          fontFamily: settings.fontFamily,
          backgroundColor: settings.backgroundColor,
          color: settings.color,
          fontSize: settings.fontSize,
        }}
      />
    </div>
  );

  const renderPreviewContent = (isFullScreen = false) => (
    <div
      className={`flex-1 p-4 overflow-y-auto ${isFullScreen ? 'min-h-0' : ''}`}
      style={{
        maxHeight: isFullScreen ? 'none' : 'calc(90vh - 250px)', // Adjust based on parent container height
        fontFamily: settings.fontFamily,
        fontSize: settings.fontSize,
        backgroundColor: settings.backgroundColor, // Applied to preview
        color: settings.color, // Applied to preview
      }}
    >
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {markdown || '*Nada para mostrar...*'}
        </ReactMarkdown>
      </div>
    </div>
  );

  const renderPreviewArea = () => (
    <div className="h-full flex flex-col flex-1">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Preview</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Visualização em tempo real</span>
          <button
            type="button"
            onClick={() => setIsInternalPreviewFullscreen(true)}
            className="text-xs px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            title="Tela cheia"
          >
            <Maximize size={14} />
          </button>
        </div>
      </div>
      {renderPreviewContent()}
    </div>
  );

  const renderFullscreenPreview = () => {
    if (!isInternalPreviewFullscreen) return null;

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
            onClick={() => setIsInternalPreviewFullscreen(false)}
            className="text-xs px-3 py-1 rounded-md bg-gray-900 text-white hover:bg-black"
            title="Fechar tela cheia"
          >
            <Minimize size={14} className="mr-1" /> {/* Changed icon to Minimize */}
            Fechar
          </button>
        </div>

        {/* Conteúdo scrollável */}
        {renderPreviewContent(true)}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        {renderTabSwitcher()}
      </div>
      <div className="flex-1 overflow-hidden border border-gray-200 rounded-md bg-white">
        {activeTab === 'editor' ? renderEditorArea() : renderPreviewArea()}
      </div>
      {renderFullscreenPreview()}
    </div>
  );
};

export default CustomizableMarkdownEditor;