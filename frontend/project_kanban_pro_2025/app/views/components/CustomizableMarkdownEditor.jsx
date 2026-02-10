import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Edit3, Eye } from 'lucide-react';

const CustomizableMarkdownEditor = ({ markdown, onChange, isPreviewFullscreen, onToggleFullscreen }) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [settings, setSettings] = useState({
    fontFamily: "'Architects Daughter', cursive",
    backgroundColor: '#1a1a1a',
    color: '#e6f7ff',
    fontSize: '16px',
  });

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Ensure fullscreen preview respects current settings
  useEffect(() => {
    if (isPreviewFullscreen) {
      // You might want to pass settings to the fullscreen view or ensure it has its own derived from here
      // For now, it will use the same settings
    }
  }, [isPreviewFullscreen]);

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
          <option value="'Architects Daughter', cursive">Estilo Manuscrito</option>
          <option value="'Inter', sans-serif">Padrão (Inter)</option>
          <option value="'Fira Code', monospace">Código (Mono)</option>
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

  const renderPreviewArea = () => (
    <div className="h-full flex flex-col flex-1">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Preview</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Visualização em tempo real</span>
          {onToggleFullscreen && (
            <button
              type="button"
              onClick={() => onToggleFullscreen(true)}
              className="text-xs px-2 py-1 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            >
              Tela cheia
            </button>
          )}
        </div>
      </div>

      <div
        className="flex-1 p-4 overflow-y-auto"
        style={{
          maxHeight: 'calc(90vh - 250px)', // Adjust based on parent container height
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          backgroundColor: '#f9fafb', // Default background for preview
          color: '#374151', // Default text color for preview
        }}
      >
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown || '*Nada para mostrar...*'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );


  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        {renderTabSwitcher()}
      </div>
      <div className="flex-1 overflow-hidden border border-gray-200 rounded-md bg-white">
        {activeTab === 'editor' ? renderEditorArea() : renderPreviewArea()}
      </div>
    </div>
  );
};

export default CustomizableMarkdownEditor;
