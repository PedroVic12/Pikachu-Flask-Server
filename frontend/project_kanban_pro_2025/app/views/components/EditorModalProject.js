import React, { useState, useEffect } from 'react';
import { Save, X, Trash2, FileCheck, Flame, Zap, FileText } from 'lucide-react';

import { CATEGORIES } from '../../controllers/Repository.jsx';
import CustomizableMarkdownEditor from './CustomizableMarkdownEditor.jsx';

const ItemEditor = ({ item, isOpen, onSave, onDelete, onClose }) => {
  const [editContent, setEditContent] = useState(item?.content || '');
  const [editTitle, setEditTitle] = useState(item?.title || '');
  const [editCategory, setEditCategory] = useState(item?.category || 'ons');

  useEffect(() => {
    if (item) {
      setEditContent(item.content || '');
      setEditTitle(item.title || '');
      setEditCategory(item.category || 'ons');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    if (!item) return;
    const standardizedContent = editContent.replace(/- \[x\]/gi, '- [x]');
    onSave({ title: editTitle, content: standardizedContent, category: editCategory });
    onClose();
  };

  const lineCount = editContent ? editContent.split('\n').length : 0;
  const charCount = editContent ? editContent.length : 0;
  const progressPercent = Math.min(Math.round((lineCount / 500) * 100), 100);

  const getStatusBadge = () => {
    if (lineCount >= 500) {
      return {
        label: `🎉 Documento Completo & Publicável (${lineCount}/500 linhas • 100% • ${charCount} chars)`,
        icon: FileCheck,
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse",
      };
    } else if (lineCount >= 200) {
      return {
        label: `🔥 Nota Avançada - Excede 200 Linhas (AGENTS.md VSCode) (${lineCount}/500 linhas • ${progressPercent}% • ${charCount} chars)`,
        icon: Flame,
        className: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-400 font-bold",
      };
    } else if (lineCount >= 50) {
      return {
        label: `⚡ Nota em Desenvolvimento (${lineCount}/500 linhas • ${progressPercent}% • ${charCount} chars)`,
        icon: Zap,
        className: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200 border border-blue-400 font-bold",
      };
    } else {
      return {
        label: `📝 Rascunho Inicial (${lineCount}/500 linhas • ${progressPercent}% • ${charCount} chars)`,
        icon: FileText,
        className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600 font-bold",
      };
    }
  };

  const currentBadge = getStatusBadge();
  const BadgeIcon = currentBadge.icon;

  const renderTopProgressBar = () => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 overflow-hidden rounded-t-xl relative">
      <div
        className={`h-full transition-all duration-300 ease-out ${
          lineCount >= 500
            ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_12px_rgba(16,185,129,0.9)]"
            : lineCount >= 200
            ? "bg-gradient-to-r from-amber-500 to-yellow-400"
            : lineCount >= 50
            ? "bg-gradient-to-r from-blue-500 to-cyan-400"
            : "bg-gradient-to-r from-gray-400 to-blue-400"
        }`}
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );

  const renderHeaderActions = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onDelete(item.id)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
      >
        <Trash2 size={16} />
        <span className="hidden sm:inline">Excluir</span>
      </button>

      <button
        onClick={handleSave}
        className="flex items-center gap-1.5 px-4 py-1.5 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors shadow-sm"
      >
        <Save size={16} />
        <span className="hidden sm:inline">Salvar & Sincronizar</span>
      </button>

      <button
        onClick={onClose}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 lg:px-6 border-b border-gray-200 dark:border-gray-700 gap-2">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Editor de Escrita</h2>
        
        {/* Badge Reativo de Status da Nota */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${currentBadge.className}`}>
          <BadgeIcon size={14} />
          <span className="font-bold">{currentBadge.label}</span>
        </div>
      </div>

      {renderHeaderActions()}
    </div>
  );

  const renderTitleAndCategory = () => (
    <div className="flex flex-col sm:flex-row gap-2 mb-3">
      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-semibold"
        placeholder="Título da nota ou projeto..."
      />

      <select
        value={editCategory}
        onChange={(e) => setEditCategory(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 px-1 text-xs gap-2">
      <div className="flex items-center gap-2">
        <b className="text-gray-900 dark:text-gray-100 font-bold">
          Progresso: {progressPercent}% ({lineCount}/500 linhas)
        </b>
        <span className="text-gray-500 dark:text-gray-400">
          • {charCount} caracteres
        </span>
      </div>

      {lineCount >= 500 ? (
        <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-800">
          🎉 Documento Completo & Publicável no Blog Batcaverna!
        </span>
      ) : lineCount >= 200 ? (
        <span className="font-bold text-amber-600 dark:text-amber-400">
          ⚠️ Regra AGENTS.md: &gt; 200 linhas (Transferir para arquivo físico .md)
        </span>
      ) : (
        <span className="text-gray-500 dark:text-gray-400">
          Meta: Atingir 500 linhas para considerar documento completo.
        </span>
      )}
    </div>
  );

  const renderContent = () => (
    <div className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col bg-white dark:bg-gray-800">
      {renderTitleAndCategory()}
      <CustomizableMarkdownEditor
        markdown={editContent}
        onChange={(e) => setEditContent(e.target.value)}
      />
      {renderCounter()}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
        {renderTopProgressBar()}
        {renderHeader()}
        {renderContent()}
      </div>
    </div>
  );
};

export default ItemEditor;
