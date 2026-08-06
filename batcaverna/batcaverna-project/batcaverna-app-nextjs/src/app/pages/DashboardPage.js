"use client";

import React from 'react';
import { useDashboardController } from '../controllers/DashboardController.js';
import { Header, WeeklyFocus, Footer } from '../components/UIComponents.js';

import KanbanWidget from './KanbanWidget.js';
import OrbitWidget from './OrbitWidget.js';
import HabitTrackerWidget from './HabitTrackerWidget2.js';
import BatmanProfileWidget from './BatmanProfilePage.js';
import SkillsWidget from './SkillsWidget.js';
import GamerStoreWidget from './GamerStoreWidget.js';
import { ChecklistWidget, ChartWidget, MarkdownViewerWidget, MarkdownEditorWidget } from './MarkdownWidgets.js';

export const DashboardPainelPage = () => {
  const { activeView, setActiveView, currentTime, tasks, tasksMarkdown, handleMarkdownChange, handleKanbanUpdate } = useDashboardController();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const TABS = React.useMemo(() => [
    { id: 'perfil', label: '🦇 Perfil do Herói' },
    // { id: 'loja', label: '🎮 Loja de Fichas ($)' },
    // { id: 'habit-tracker', label: '🔥 Hábitos & Rotinas' },
    // { id: 'skills', label: '⚡ Habilidades' },
    { id: 'kanban', label: '🗂️ KanbanPro' },
    { id: 'orbit', label: '🛰️ Sistema Orbital' },
    { id: 'checklist', label: '✅ Checklist' },
    { id: 'tasks', label: '📊 Gráfico' },
    { id: 'view-markdown', label: '📄 Visualizador' },
    // { id: 'manage-tasks', label: '📝 Editor' },
  ], []);

  const activeWidget = React.useMemo(() => {
    switch (activeView) {
      case 'perfil': return <BatmanProfileWidget />;
      case 'loja': return <GamerStoreWidget />;
      case 'habit-tracker': return <HabitTrackerWidget />;
      case 'skills': return <SkillsWidget />;
      case 'kanban': return <KanbanWidget tasks={tasks} onUpdate={handleKanbanUpdate} />;
      case 'orbit': return <OrbitWidget />;
      case 'checklist': return <ChecklistWidget tasks={tasks} />;
      case 'tasks': return <ChartWidget data={tasks} />;
      case 'view-markdown': return <MarkdownViewerWidget markdownText={tasksMarkdown} />;
      case 'manage-tasks': return <MarkdownEditorWidget markdown={tasksMarkdown} onChange={handleMarkdownChange} />;
      default: return <BatmanProfileWidget />;
    }
  }, [activeView, tasks, tasksMarkdown, handleKanbanUpdate, handleMarkdownChange]);

  return (
    <div className="h-dvh w-screen flex flex-col lg:flex-row gap-4 p-2 md:p-4">
      {isDrawerOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsDrawerOpen(false)}></div>}
      <aside className={`fixed top-0 left-0 h-full w-80 max-w-full lg:static lg:h-auto lg:w-1/3 lg:max-w-md glass-panel p-4 flex flex-col gap-4 overflow-y-auto z-50 transition-transform transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <Header currentTime={currentTime} />
        <div className="flex-1 min-h-0 bg-black/20 p-3 rounded-lg overflow-y-auto space-y-4">
          <WeeklyFocus tasks={tasks} />
          <div className="p-3 bg-black/40 rounded-lg border border-yellow-500/30">
            <h4 className="text-xs font-bold text-yellow-400 mb-1">🎮 RECOMPENSAS GAMER ATIVAS</h4>
            <p className="text-xs text-gray-300">
              Acumule XP e $ Fichas em Hábitos Saudáveis para jogar COD, FIFA, Smite 2 e Pokémon!
            </p>
          </div>
        </div>
        <Footer />
      </aside>

      <main className="h-3/5 lg:h-auto flex-1 min-h-0 lg:min-w-0 glass-panel flex flex-col p-0">
        <nav className="flex-shrink-0 border-b border-[var(--border-color)] px-2 flex items-center overflow-x-auto no-scrollbar">
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 rounded-md hover:bg-black/20 lg:hidden mr-2 text-gray-400 hover:text-white flex-shrink-0" aria-label="Abrir menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
          <div className="flex space-x-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveView(tab.id); setIsDrawerOpen(false); }}
                className={`tab-btn whitespace-nowrap ${activeView === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
        <div className="flex-1 relative min-h-0">{activeWidget}</div>
      </main>
    </div>
  );
};

export default DashboardPainelPage;
