import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import ReactMarkdown from 'react-markdown'; // Still needed for raw parsing, but we'll use custom rendering
import remarkGfm from 'remark-gfm';
import { Edit3, Eye, Maximize, Minimize } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'custom_markdown_editor_settings';

// Custom render function for Markdown to HTML with specific styling
const renderMarkdownToHTML = (markdownText) => {
    if (!markdownText) return '';
    let html = String(markdownText);
    html = html.replace(/```([\s\S]*?)```/gim, (match, p1) => `<pre class="bg-black/50 p-3 rounded-md overflow-x-auto my-4"><code class="font-mono text-sm">${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold neon-text mb-4 mt-6 pb-2 border-b border-gray-700">$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-cyan-300 mb-3 mt-5 pb-1 border-b border-gray-800">$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-300 mb-2 mt-4">$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>').replace(/\*(.*?)\*/gim, '<em>$1</em>').replace(/__(.*?)__/gim, '<strong>$1</strong>').replace(/_(.*?)_/gim, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">$1</a>');
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-black/50 px-2 py-1 rounded-md font-mono text-sm text-amber-300">$1</code>');
    html = html.replace(/^\s*[-*]\s*(\[([ xX])\])\s*(.+)$/gm, (match, checkbox, state, text) => `<li class="flex items-center mb-2"><span class="inline-block w-4 h-4 border-${state.trim().toLowerCase() === 'x' ? '0 bg-cyan-500 text-black' : '2 border-gray-500 bg-gray-700'} rounded-sm mr-3 flex items-center justify-center font-bold flex-shrink-0">${state.trim().toLowerCase() === 'x' ? '✓' : ''}</span><span class="${state.trim().toLowerCase() === 'x' ? 'line-through text-gray-500' : ''}">${text}</span></li>`);
    html = html.replace(/^\s*[-*]\s+(?!\[([ xX])\])([^\n]+)$/gm, '<li class="ml-6 list-disc marker:text-cyan-400 mb-2">$2</li>');
    html = html.replace(/((?:<li[\s\S]*?<\/li>\s*)+)/gim, '<ul class="space-y-1 mb-4">$1</ul>').replace(/<ul>\s*(<ul[\s\S]*?<\/ul>)\s*<\/ul>/gim, '$1');
    html = html.replace(/^---\s*$/gim, '<hr class="border-gray-700 my-6">').replace(/^===\s*$/gim, '<hr class="border-cyan-500 my-6">');
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-600 pl-4 italic text-gray-400 my-4">$1</blockquote>');
    html = html.split(/\n\n+/).map(p => { const t = p.trim(); if (t.startsWith('<') || t === '') return p; return `<p class="text-gray-300 leading-relaxed mb-4">${t.replace(/\n/g, '<br>')}</p>`; }).join('');
    return html;
};


const CustomizableMarkdownEditor = ({ markdown, onChange }) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [isInternalPreviewFullscreen, setIsInternalPreviewFullscreen] = useState(false);

  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedSettings ? JSON.parse(savedSettings) : {
        fontFamily: "'Excalifont-Regular', cursive",
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const renderedHtml = useMemo(() => renderMarkdownToHTML(markdown), [markdown]); // Memoize the HTML rendering

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
          <option value="'Excalifont-Regular', cursive">Excalidraw (Hand)</option>
          <option value="'Inter', sans-serif">Padrão (Inter)</option>
          <option value="'CascadiaCode', monospace">Código (Cascadia)</option>
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
          maxHeight: 'calc(90vh - 250px)',
          minHeight: '300px',
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
        maxHeight: isFullScreen ? 'none' : 'calc(90vh - 250px)',
        fontFamily: settings.fontFamily,
        fontSize: settings.fontSize,
        backgroundColor: settings.backgroundColor,
        color: settings.color,
      }}
    >
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
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
            <Minimize size={14} className="mr-1" />
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