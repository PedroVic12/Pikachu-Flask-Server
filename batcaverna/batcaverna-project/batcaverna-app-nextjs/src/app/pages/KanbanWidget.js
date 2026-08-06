"use client";

import React from 'react';

const KanbanCard = ({ card, onDragStart }) => (
  <div
    draggable="true"
    onDragStart={e => onDragStart(e, card.label)}
    className="bg-black/40 p-3 rounded-lg border border-gray-700 hover:border-cyan-400 transition cursor-grab active:cursor-grabbing"
  >
    <h4 className="font-bold text-gray-200">{card.label}</h4>
    <p className="text-xs text-gray-400 mt-1">
      {card.items.filter(i => i.completed).length} / {card.items.length} tarefas concluídas
    </p>
    <div className="w-full bg-black/30 rounded-full h-1.5 mt-2">
      <div className="h-1.5 rounded-full" style={{ width: `${card.progress}%`, backgroundColor: card.color }}></div>
    </div>
  </div>
);

const KanbanColumn = ({ title, cards, status, color, onDrop, onDragStart }) => {
  const [isOver, setIsOver] = React.useState(false);
  const handleDragOver = (e) => { e.preventDefault(); setIsOver(true); };
  const handleDragLeave = () => setIsOver(false);
  const handleDrop = (e) => { onDrop(e, status); setIsOver(false); };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 min-w-[280px] bg-black/20 rounded-lg p-3 flex flex-col transition-colors ${isOver ? 'kanban-column-drag-over' : ''}`}
    >
      <h3 className="font-bold text-lg px-2 pb-2 border-b-2" style={{ borderColor: color }}>{title}</h3>
      <div className="flex-1 pt-3 space-y-3 overflow-y-auto">
        {cards.map(card => (
          <KanbanCard key={card.label} card={card} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
};

export const KanbanWidget = ({ tasks = [], onUpdate }) => {
  const onDragStart = (e, cardLabel) => { e.dataTransfer.setData("cardLabel", cardLabel); };
  const onDrop = (e, newStatus) => { const cardLabel = e.dataTransfer.getData("cardLabel"); onUpdate(cardLabel, newStatus); };

  const columns = {
    BACKLOG: tasks.filter(t => t.status === 'BACKLOG'),
    TODO: tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    COMPLETED: tasks.filter(t => t.status === 'COMPLETED')
  };

  const columnMeta = {
    BACKLOG: { title: 'BACKLOG', color: 'var(--kanban-backlog)' },
    TODO: { title: 'A FAZER', color: 'var(--kanban-todo)' },
    IN_PROGRESS: { title: 'EM ANDAMENTO', color: 'var(--kanban-progress)' },
    COMPLETED: { title: 'CONCLUÍDO', color: 'var(--kanban-completed)' }
  };

  return (
    <div className="w-full h-full p-4 flex gap-4 overflow-x-auto">
      {Object.entries(columnMeta).map(([status, meta]) => (
        <KanbanColumn
          key={status}
          title={meta.title}
          cards={columns[status] || []}
          status={status}
          color={meta.color}
          onDragStart={onDragStart}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
};

export default KanbanWidget;
