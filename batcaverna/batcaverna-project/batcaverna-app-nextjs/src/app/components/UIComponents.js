"use client";

import React from 'react';

export function GlassContainer() {
  return (
    <div className="glass-panel p-6">
      <h1 className="neon-text text-2xl">Batcaverna PV WebSite</h1>
      <p>O CSS agora é carregado de forma nativa pelo Next.js.</p>
    </div>
  );
}

export const Header = ({ currentTime }) => {
  const now = new Date();
  const DataAtual = `${now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  return (
    <header>
      <GlassContainer />
      <h1 className="text-3xl font-bold neon-text">Bat Caverna Dashboard 🦇</h1>
      <p className="text-sm text-gray-400">{DataAtual}</p>
      <div className="flex justify-between items-center mt-4">
        <h2 className="font-semibold text-gray-300">Horário Local</h2>
        <span className="font-mono text-lg bg-black/20 px-2 rounded">{currentTime}</span>
      </div>
    </header>
  );
};

export const WeeklyFocus = ({ tasks = [] }) => (
  <section className="bg-black/20 p-3 rounded-lg">
    <h2 className="font-semibold text-gray-300 mb-2">🎯 Foco da Semana</h2>
    <ul className="space-y-2">
      {Array.isArray(tasks) && tasks.filter(Boolean).map((task, idx) => (
        <li key={task.label || idx} className="text-lg">
          <div className="flex justify-between mb-1">
            <span className="text-gray-300">{task.label}</span>
            <span className="text-gray-500">{task.progress}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-1.5">
            <div className="h-1.5 rounded-full" style={{ width: `${task.progress || 0}%`, backgroundColor: task.color || '#00e5ff' }}></div>
          </div>
        </li>
      ))}
    </ul>
  </section>
);

export const LinksPanel = () => {
  const [expandedGroups, setExpandedGroups] = React.useState({ redes: false, apps: false, projetos: false, entretenimento: false });
  const toggleGroup = (group) => setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  const linkSections = [
    { id: 'redes', title: '🔗 Redes Sociais', links: [{ url: 'https://github.com/PedroVic12', text: '🌍 GitHub' }, { url: 'https://linkedin.com/in/pedrovictor12', text: '💼 LinkedIn', variant: 'bg-blue-600' }] },
    { id: 'apps', title: '📱 Aplicativos', links: [{ url: 'PVRV/Gohan_treinamentos_2025.html', text: '💪 App Produtividade' }, { url: 'https://gohann-treinamentos-web-app-one.vercel.app', text: '📚 Ionic Gohan Treinamentos' }] },
    { id: 'projetos', title: '⚙️ Projetos', links: [{ url: 'http://127.0.0.1:5000/', text: '🚀 Pikachu API Server' }, { url: 'https://electrical-system-simulator.vercel.app/', text: '⚡ SEP para Leigos' }, { url: "PVRV/Habit_Tracker.html", text: "📊 Habit Tracker XP" }] },
    { id: 'entretenimento', title: '🎮 Entretenimento', links: [{ url: 'https://www.mat.ufmg.br/futebol/classificacao-para-libertadores_seriea/', text: '⚽ Prob. Futebol', variant: 'bg-green-700' }, { url: 'outro_arquivo.html', text: '📄 Outros Links' }] }
  ];

  return (
    <div className="bg-black/30 backdrop-blur-sm p-3 rounded-xl border border-gray-700/50 shadow-lg">
      <div className="flex items-center justify-between mb-3 p-2 bg-black/30 rounded-lg">
        <h2 className="font-bold text-base text-gray-200">🔗 Painel de Links</h2>
        <div className="text-xs text-gray-400">{linkSections.flatMap(g => g.links).length} links</div>
      </div>
      <div className="space-y-2">
        {linkSections.map(section => (
          <div key={section.id} className="bg-black/20 rounded-lg overflow-hidden">
            <button onClick={() => toggleGroup(section.id)} className="w-full px-3 py-2 text-left text-sm font-medium text-gray-200 bg-black/30 hover:bg-black/40 transition-colors flex items-center justify-between">
              <span>{section.title}</span><span className={`transform transition-transform ${expandedGroups[section.id] ? 'rotate-180' : ''} text-gray-400`}>▼</span>
            </button>
            {expandedGroups[section.id] ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                {section.links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className={`w-full text-center px-2 py-1.5 text-xs ${link.variant || 'bg-gray-700/80'} text-white rounded shadow hover:bg-opacity-90 transition flex items-center justify-center gap-2`}>
                    {link.text}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Footer = () => (
  <footer className="text-center text-xs text-gray-600 mt-auto pt-4">
    <p>BatDashboard © 2025. Todos os direitos reservados.</p>
    <p>Criado por Pedro Victor Veras</p>
  </footer>
);

export const InfoCard = ({ title, children, className = '' }) => (
  <div className={`batman-card p-4 ${className}`}>
    <h3 className="font-bold text-lg mb-3 text-yellow-400 border-b border-yellow-800 pb-2">{title}</h3>
    {children}
  </div>
);

export const ProgressBar = ({ label, current, total, percent, color = 'batman-progress-bar' }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <span className="text-gray-300">{label}</span>
      <span className="text-yellow-400 font-mono">{current}/{total} ({percent}%)</span>
    </div>
    <div className="w-full bg-gray-800 rounded-full h-3">
      <div className={`h-3 rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

export const StatCard = ({ label, value }) => (
  <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className="flex items-center">
      <div className="flex-1">
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div className="h-2 rounded-full bg-yellow-500" style={{ width: `${value}%` }}></div>
        </div>
      </div>
      <div className="ml-2 text-yellow-400 font-bold">{value}</div>
    </div>
  </div>
);

export const NoteCard = ({ note, onDelete, getCategoryColor }) => (
  <div className="batman-card p-4">
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1">
        <p className="text-gray-300">{note.text}</p>
        <div className="flex items-center mt-2">
          <span className="text-xs text-gray-500">{note.date}</span>
          <span className={`ml-2 text-xs px-2 py-1 rounded ${getCategoryColor ? getCategoryColor(note.category) : 'bg-gray-800'}`}>{note.category}</span>
        </div>
      </div>
      <button onClick={() => onDelete(note.id)} className="ml-2 text-red-400 hover:text-red-300">×</button>
    </div>
  </div>
);

export const GoalCard = ({ goal, onUpdate, getStatusColor }) => {
  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value);
    onUpdate(goal.id, newProgress);
  };
  return (
    <div className="batman-card p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-gray-200">{goal.name}</h4>
        <span className="text-xs text-yellow-400">{goal.deadline}</span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-400">Progresso</span>
          <span className="text-sm font-bold text-yellow-400">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div className="h-3 rounded-full batman-progress-bar" style={{ width: `${goal.progress}%` }}></div>
        </div>
      </div>
      <input type="range" min="0" max="100" value={goal.progress} onChange={handleProgressChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0%</span><span>100%</span>
      </div>
    </div>
  );
};
