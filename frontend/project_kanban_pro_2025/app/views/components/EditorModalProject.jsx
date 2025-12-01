'use client';

import React, { useState, useEffect } from 'react';

// Editar Item MOdal
const ItemEditor = ({ 
  item,
  isOpen,
  onSave,
  onDelete,
  onClose
}) => { 
  const [editContent, setEditContent] = useState(item?.content || '');
  const [editTitle, setEditTitle] = useState(item?.title || '');
  const [editCategory, setEditCategory] = useState(item?.category || 'ons'); // Removed type annotation and CategoryKey cast
  const [showPreview, setShowPreview] = useState(true);

  // Update state when item changes
  useEffect(() => {
    if (item) {
      setEditContent(item.content || '');
      setEditTitle(item.title);
      setEditCategory(item.category || 'ons'); // Removed type annotation and CategoryKey cast
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
    <div className= "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" >
    <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col" >
      {/* Modal Header */ }
      < div className = "flex items-center justify-between p-4 lg:p-6 border-b border-gray-200" >
        <div className="flex items-center gap-4" >
          <h2 className="text-xl font-semibold text-gray-900" > Editar Item </h2>
            < button
  onClick = {() => setShowPreview(!showPreview)}
className = "flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200 transition-colors"
  >
  { showPreview?<EyeOff size = { 16 } /> : <Eye size={ 16 } />}
{ showPreview ? 'Ocultar Preview' : 'Mostrar Preview' }
</button>
  </div>

  < div className = "flex items-center gap-2" >
    <button
              onClick={ () => onDelete(item.id) }
className = "flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
  >
  <Trash2 size={ 16 } />
    < span className = "hidden sm:inline" > Excluir </span>
      </button>
      < button
onClick = { handleSave }
className = "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
  >
  <Save size={ 16 } />
    < span className = "hidden sm:inline" > Salvar </span>
      </button>
      < button
onClick = { onClose }
className = "p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
  >
  <X size={ 20 } />
    </button>
    </div>
    </div>

{/* Modal Content */ }
<div className="flex-1 p-4 lg:p-6 overflow-hidden" >
  {/* Title and Category */ }
  < div className = "flex flex-col sm:flex-row gap-4 mb-4" >
    <input
              type="text"
value = { editTitle }
onChange = {(e) => setEditTitle(e.target.value)}
className = "flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
placeholder = "Título do item..."
  />
  <select
              value={ editCategory }
onChange = {(e) => setEditCategory(e.target.value)} // Removed CategoryKey cast
className = "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  >
{
  Object.entries(CATEGORIES).map(([key, value]) => (
    <option key= { key } value = { key } >
    { value.emoji } { value.label }
  </option>
  ))
}
  </select>
  </div>

{/* Editor and Preview */ }
<div className={ `grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-4 h-full` }>
  {/* Editor */ }
  < div className = "flex flex-col" >
    <div className="flex items-center justify-between mb-2" >
      <h3 className="text-sm font-medium text-gray-700" > Editor </h3>
        < span className = "text-xs text-gray-500" > Markdown suportado </span>
          </div>
          < textarea
value = { editContent }
onChange = {(e) => setEditContent(e.target.value)}
className = "flex-1 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
placeholder = "Escreva seu conteúdo em Markdown..."
  />
  </div>

{/* Preview */ }
{
  showPreview && (
    <div className="flex flex-col" >
      <div className="flex items-center mb-2" >
        <h3 className="text-sm font-medium text-gray-700" > Preview </h3>
          </div>
          < div className = "flex-1 p-4 border border-gray-200 rounded-md bg-gray-50 overflow-y-auto" >
            <div className="prose prose-sm max-w-none" >
              <ReactMarkdown remarkPlugins={ [remarkGfm] }>
                { editContent || 'Nada para mostrar...' }
</ReactMarkdown>
  </div>
  </div>
  </div>
            )
}
</div>
  </div>
  </div>
  </div>
  );
};

export default ItemEditor;