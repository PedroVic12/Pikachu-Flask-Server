"use client";

import React, { useState, useEffect } from 'react';
import { DataBaseController } from '../controllers/DashboardController.js';
import AudioEffects from '../controllers/AudioEffects.js';

const KanbanCard = ({ card, onDragStart, onClick }) => (
  <div
    draggable="true"
    onDragStart={e => onDragStart(e, card.id || card.label)}
    onClick={() => onClick(card)}
    className="bg-black/50 p-4 rounded-xl border border-gray-800 hover:border-yellow-500/60 transition cursor-grab active:cursor-grabbing shadow-lg hover:scale-[1.02]"
  >
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-bold text-gray-200 text-sm">{card.title || card.label}</h4>
      {card.filename && (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
          .MD
        </span>
      )}
    </div>

    {card.content && (
      <p className="text-xs text-gray-400 line-clamp-2 mb-2 font-mono">
        {card.content.replace(/#|\*|-|`/g, '').substring(0, 100)}...
      </p>
    )}

    <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-gray-800">
      <span>📁 {card.filename || 'nota.md'}</span>
      {card.fileHash && <span className="font-mono text-cyan-400"># {card.fileHash.substring(0, 6)}</span>}
    </div>
  </div>
);

const KanbanColumn = ({ title, cards, status, color, onDrop, onDragStart, onCardClick }) => {
  const [isOver, setIsOver] = useState(false);
  const handleDragOver = (e) => { e.preventDefault(); setIsOver(true); };
  const handleDragLeave = () => setIsOver(false);
  const handleDrop = (e) => { onDrop(e, status); setIsOver(false); };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex-1 min-w-[300px] max-w-[380px] bg-black/40 backdrop-blur-md rounded-2xl p-4 flex flex-col border border-gray-800 transition-colors ${isOver ? 'border-yellow-500 bg-yellow-950/20' : ''}`}
    >
      <div className="flex justify-between items-center px-2 pb-3 border-b-2" style={{ borderColor: color }}>
        <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">{title}</h3>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-gray-800 text-gray-300 font-mono">
          {cards.length}
        </span>
      </div>
      <div className="flex-1 pt-4 space-y-3 overflow-y-auto min-h-[400px]">
        {cards.map(card => (
          <KanbanCard key={card.id || card.label} card={card} onDragStart={onDragStart} onClick={onCardClick} />
        ))}
      </div>
    </div>
  );
};

export const KanbanWidget = ({ tasks = [], onUpdate }) => {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [excelHash, setExcelHash] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Carregar dados da API kanban-sync no disco (kanban.xlsx e /public/notas)
  const fetchSyncData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/kanban-sync');
      const data = await res.json();
      if (data.success && data.cards) {
        setCards(data.cards);
        setExcelHash(data.excelHash);
        DataBaseController.set(DataBaseController.KEYS.KANBAN_CARDS, data.cards);
        setSyncStatus(`🟢 Sincronizado com kanban.xlsx e arquivos .MD (${data.cardsCount} notas)`);
      } else {
        setSyncStatus(`⚠️ Usando dados do LocalStorage`);
      }
    } catch (e) {
      console.error("Erro ao sincronizar com servidor:", e);
      setSyncStatus(`⚠️ Servidor offline - usando LocalStorage`);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchSyncData();
  }, []);

  const onDragStart = (e, cardId) => {
    e.dataTransfer.setData("cardId", cardId);
  };

  const onDrop = (e, newStatus) => {
    AudioEffects.playClick();
    const cardId = e.dataTransfer.getData("cardId");
    
    const updatedCards = cards.map(c => (c.id === cardId || c.label === cardId) ? { ...c, status: newStatus } : c);
    setCards(updatedCards);
    DataBaseController.set(DataBaseController.KEYS.KANBAN_CARDS, updatedCards);
    if (onUpdate) onUpdate(cardId, newStatus);
  };

  const handleCardClick = (card) => {
    AudioEffects.playClick();
    setSelectedCard(card);
    setEditContent(card.content || '');
  };

  // Salvar Alterações de volta para o Disco & Excel (Obsidian / VSCode / kanban.xlsx)
  const handleSaveToDisk = async () => {
    if (!selectedCard) return;

    AudioEffects.playCoinSound();
    setIsSyncing(true);

    const updatedCard = { ...selectedCard, content: editContent };
    const updatedCards = cards.map(c => c.id === selectedCard.id ? updatedCard : c);
    setCards(updatedCards);
    setSelectedCard(updatedCard);

    try {
      const res = await fetch('/api/kanban-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: updatedCards })
      });
      const data = await res.json();
      if (data.success) {
        setExcelHash(data.excelHash);
        DataBaseController.set(DataBaseController.KEYS.KANBAN_CARDS, updatedCards);
        setSyncStatus(`✅ SALVO NO DISCO E NO EXCEL! Hash MD5: ${data.excelHash.substring(0, 8)}`);
        setTimeout(() => setSyncStatus('🟢 Sincronizado com kanban.xlsx e arquivos .MD'), 4000);
      }
    } catch (e) {
      console.error("Erro ao salvar no disco:", e);
      setSyncStatus(`❌ Erro ao gravar no arquivo Excel`);
    } finally {
      setIsSyncing(false);
    }
  };

  const displayCards = cards.length > 0 ? cards : tasks;

  const columns = {
    BACKLOG: displayCards.filter(t => t.status === 'BACKLOG'),
    TODO: displayCards.filter(t => t.status === 'TODO'),
    IN_PROGRESS: displayCards.filter(t => t.status === 'IN_PROGRESS'),
    COMPLETED: displayCards.filter(t => t.status === 'COMPLETED')
  };

  const columnMeta = {
    BACKLOG: { title: 'BACKLOG', color: '#8b5cf6' },
    TODO: { title: 'A FAZER', color: '#3b82f6' },
    IN_PROGRESS: { title: 'EM ANDAMENTO', color: '#f59e0b' },
    COMPLETED: { title: 'CONCLUÍDO', color: '#10b981' }
  };

  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col space-y-4 bg-black/40 overflow-y-auto">
      
      {/* BARRA DE FERRAMENTAS E SINCRONIZAÇÃO DE PLANILHA */}
      <div className="p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
            <span>🗂️</span> KANBANPRO & GESTÃO DE NOTAS OBSIDIAN / EXCEL
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Sincronização em Tempo Real com <code className="text-yellow-400 font-mono">kanban.xlsx</code> e arquivos Markdown em <code className="text-cyan-400 font-mono">/public/notas</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {syncStatus && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-black/50 border border-gray-800 text-gray-300 font-mono">
              {syncStatus}
            </span>
          )}

          <button
            onClick={fetchSyncData}
            disabled={isSyncing}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <span>🔄</span> {isSyncing ? 'Sincronizando...' : 'Recarregar do Disco'}
          </button>
        </div>
      </div>

      {/* PAINEL KANBAN COM COLUNAS */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {Object.entries(columnMeta).map(([status, meta]) => (
          <KanbanColumn
            key={status}
            title={meta.title}
            cards={columns[status] || []}
            status={status}
            color={meta.color}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      {/* MODAL DE EDIÇÃO E VISUALIZAÇÃO DE CARD MARKDOWN */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-yellow-500/40 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl space-y-4">
            
            <div className="flex justify-between items-start border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-yellow-400">{selectedCard.title || selectedCard.label}</h3>
                <p className="text-xs text-gray-400 font-mono">Arquivo: /public/notas/{selectedCard.filename || 'nota.md'}</p>
              </div>
              <button onClick={() => setSelectedCard(null)} className="text-gray-400 hover:text-white text-2xl font-bold">×</button>
            </div>

            <div className="flex-1 min-h-[300px] flex flex-col">
              <label className="text-xs text-gray-400 mb-1 font-bold">Conteúdo Markdown (Sincronizado com Obsidian / VSCode / Excel):</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 w-full bg-black/60 border border-gray-700 rounded-xl p-4 text-sm font-mono text-gray-200 focus:outline-none focus:border-yellow-500 resize-none"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-800">
              <div className="text-xs text-gray-500 font-mono">
                Hash: {selectedCard.fileHash || 'N/A'}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedCard(null)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl transition">
                  Cancelar
                </button>
                <button onClick={handleSaveToDisk} disabled={isSyncing} className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5">
                  <span>💾</span> {isSyncing ? 'Gravando no Disco...' : 'Salvar Alterações no Disco & Excel'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default KanbanWidget;
