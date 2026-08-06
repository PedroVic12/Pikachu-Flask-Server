"use client";

import React from 'react';
import htm from 'htm';
import { DataBaseController } from '../controllers/DashboardController.js';
import AudioEffects from '../controllers/AudioEffects.js';

const html = htm.bind(React.createElement);

// ---------------------------------------------------------------------
// 5.4 HabitTrackerWidget com Efeitos Sonoros Nativos
// ---------------------------------------------------------------------
const HabitProgressCircle = ({ radius, stroke, progress, isSuperSaiyan }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return html`
    <svg height=${radius * 2} width=${radius * 2} className="transform -rotate-90">
      <circle stroke="#4a5568" fill="transparent" strokeWidth=${stroke} r=${normalizedRadius} cx=${radius} cy=${radius} />
      <circle stroke=${isSuperSaiyan ? "#f59e0b" : "#3b82f6"} fill="transparent" strokeWidth=${stroke} strokeDasharray=${circumference + ' ' + circumference} style=${{ strokeDashoffset }} r=${normalizedRadius} cx=${radius} cy=${radius} />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-2xl font-bold fill-white -rotate-90 transform-gpu" style=${{ transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}>
        ${Math.round(progress)}%
      </text>
    </svg>
  `;
};

const HabitPlayerStats = ({ player, isSuperSaiyan, status }) => {
  const xpPercentage = Math.min(100, Math.max(0, (player.xp / (player.xpToNextLevel || 100)) * 100));
  return html`
    <div className=${`p-4 rounded-lg mb-6 ${isSuperSaiyan ? 'bg-yellow-400/10 border-yellow-500' : 'bg-gray-800/50 border-gray-700'} border`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 rounded-full border-2 border-yellow-500 flex items-center justify-center text-3xl bg-black/50">🦇</div>
        <div className="flex-1">
          <p className="font-bold text-lg text-yellow-400">${player.name}</p>
          <p className=${`text-sm ${isSuperSaiyan ? 'text-yellow-300 font-bold animate-pulse' : 'text-blue-300'} font-semibold`}>${status}</p>
          <p className="text-xs text-gray-400">XP: ${player.xp} / ${player.xpToNextLevel}</p>
        </div>
        <div className="w-20 h-20">
          <${HabitProgressCircle} radius=${40} stroke=${6} progress=${xpPercentage} isSuperSaiyan=${isSuperSaiyan} />
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-4">
        <div className=${`h-4 rounded-full xp-bar-transition ${isSuperSaiyan ? 'bg-yellow-400' : 'bg-blue-500'}`} style=${{ width: `${xpPercentage}%` }}></div>
      </div>
    </div>
  `;
};

const HabitItem = ({ habit, onComplete, isSuperSaiyan }) => {
  const buttonClass = `px-4 py-1.5 text-xs font-bold rounded-lg transition-transform transform hover:scale-105 ${habit.completed ? 'opacity-50 cursor-not-allowed' : ''}`;
  return html`
    <div className=${`bg-gray-800/80 p-4 rounded-lg flex items-center justify-between border border-gray-700/50 ${habit.completed ? "opacity-50 line-through" : ""}`}>
      <div className="flex items-center space-x-3 flex-grow">
        <span className="text-2xl">${habit.icon}</span>
        <div>
          <div className="font-semibold text-gray-200">${habit.text}</div>
          ${habit.lastCompleted && html`<div className="text-xs text-gray-400">Completado: ${habit.lastCompleted}</div>`}
        </div>
      </div>
      ${habit.type === 'good' ? html`
        <button onClick=${() => onComplete(habit)} disabled=${habit.completed} className=${`${buttonClass} ${isSuperSaiyan ? 'bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-bold' : 'bg-green-500 hover:bg-green-400 text-black'}`}>
          +${habit.xp} XP (+$5 Fichas)
        </button>
      ` : html`
        <button onClick=${() => onComplete(habit)} disabled=${habit.completed} className=${`${buttonClass} bg-red-500 hover:bg-red-400 text-white`}>
          ${habit.xp} XP
        </button>
      `}
    </div>
  `;
};

const HabitAddModal = ({ onAddHabit, onClose }) => {
  const [text, setText] = React.useState('');
  const [type, setType] = React.useState('good');
  const handleSubmit = (e) => { e.preventDefault(); if (!text.trim()) return; onAddHabit({ text, type }); setText(''); };
  return html`
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
      <form onSubmit=${handleSubmit} className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-yellow-400">Adicionar Novo Hábito</h3>
          <button type="button" onClick=${onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        <input type="text" value=${text} onChange=${(e) => setText(e.target.value)} placeholder="Ex: Treinar calistenia por 30min" className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white mb-3" autoFocus />
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
            <input type="radio" name="type" value="good" checked=${type === 'good'} onChange=${(e) => setType(e.target.value)} className="text-green-500 bg-gray-700" />
            <span>Hábito Saudável (+XP +Fichas)</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
            <input type="radio" name="type" value="bad" checked=${type === 'bad'} onChange=${(e) => setType(e.target.value)} className="text-red-500 bg-gray-700" />
            <span>Mau Hábito (-XP)</span>
          </label>
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick=${onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold transition">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold transition">Adicionar Hábito</button>
        </div>
      </form>
    </div>
  `;
};

const HabitCompletionModal = ({ habit, player, onClose, isSuperSaiyan }) => {
  if (!habit) return null;
  return html`
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50" onClick=${onClose}>
      <div className="bg-gray-800 border border-yellow-500/40 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick=${e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-yellow-400">🎉 Hábito Concluído!</h2>
            <p className="text-gray-300 flex items-center mt-1"><span className="text-xl mr-2">${habit.icon}</span>${habit.text}</p>
          </div>
          <button onClick=${onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        <div className=${`p-4 rounded-lg mb-4 ${isSuperSaiyan ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-blue-500/20'}`}>
          <p className="font-bold text-gray-200">${player.name}</p>
          <div className="flex items-center space-x-2 text-green-400 mt-1">
            <p className="font-bold">+${habit.xp} XP | +$5 Fichas de Games</p>
            ${isSuperSaiyan && html`<span className="text-yellow-300 font-bold animate-pulse">SUPER SAIYAN MODE!</span>`}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick=${onClose} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg transition-colors text-sm">Continuar</button>
        </div>
      </div>
    </div>
  `;
};

const HabitsView = ({ habits, onCompleteHabit, isSuperSaiyan, handleResetDay, setShowAddHabitModal }) => html`
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-green-400 flex items-center gap-2"><span>🌱</span> Hábitos Saudáveis & Rotinas</h2>
      <button onClick=${handleResetDay} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-bold rounded-lg transition">Resetar Dia</button>
    </div>
    <div className="space-y-3">
      ${habits.filter(h => h.type === 'good').map(habit => html`<${HabitItem} key=${habit.id} habit=${habit} onComplete=${onCompleteHabit} isSuperSaiyan=${isSuperSaiyan} />`)}
    </div>
    <div>
      <h2 className="text-xl font-bold mb-3 text-red-400 flex items-center gap-2"><span>⚠️</span> Maus Hábitos para Evitar</h2>
      <div className="space-y-3">
        ${habits.filter(h => h.type === 'bad').map(habit => html`<${HabitItem} key=${habit.id} habit=${habit} onComplete=${onCompleteHabit} isSuperSaiyan=${isSuperSaiyan} />`)}
      </div>
    </div>
    <button onClick=${() => setShowAddHabitModal(true)} className="fixed bottom-6 right-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-transform transform hover:scale-110 z-50">+</button>
  </div>
`;

const HabitDashboardView = ({ progressData, isSuperSaiyan }) => {
  if (!progressData || progressData.length === 0) return html`<div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700"><h2 className="text-xl font-bold mb-4 text-yellow-400">Acompanhamento Semanal</h2><p className="text-gray-400">Nenhum hábito completado esta semana ainda.</p></div>`;
  const maxCompleted = Math.max(...progressData.map(d => d.completed), 1);
  return html`
    <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-yellow-400">Acompanhamento Semanal de Hábitos</h2>
      <div className="flex justify-between items-end h-48 space-x-2">
        ${progressData.map(data => html`
          <div key=${data.day} className="flex flex-col items-center flex-1">
            <div className="text-xs text-gray-400 mb-1 font-mono">${data.completed}</div>
            <div className="w-full bg-gray-700/60 rounded-t-md flex-grow flex items-end relative">
              <div className=${`w-full rounded-t-md ${isSuperSaiyan ? 'bg-yellow-500' : 'bg-blue-500'}`} style=${{ height: `${(data.completed / maxCompleted) * 90}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-bold">${data.day}</p>
          </div>
        `)}
      </div>
      <div className="mt-4 text-center text-xs text-gray-400">Hábitos e rotinas completados por dia nesta semana</div>
    </div>
  `;
};

const HabitSkillsView = ({ skills, isSuperSaiyan }) => html`
  <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
    <h2 className="text-xl font-bold mb-4 text-cyan-300">Progresso por Atributo</h2>
    <div className="space-y-4">
      ${skills.map(skill => html`
        <div key=${skill.name}>
          <div className="flex justify-between mb-1">
            <span className="font-semibold text-gray-200">${skill.name} - Nível ${skill.level}</span>
            <span className="text-xs text-gray-400 font-mono">${skill.xp} / ${skill.xpToNext} XP</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div className=${`h-3 rounded-full ${isSuperSaiyan ? 'bg-yellow-500' : 'bg-blue-500'}`} style=${{ width: `${Math.min(100, (skill.xp / (skill.xpToNext || 100)) * 100)}%` }}></div>
          </div>
        </div>
      `)}
    </div>
  </div>
`;

export const HabitTrackerWidget = () => {
  const initialHabits = [
    { id: 1, icon: '💪', text: 'Treino de Calistenia / Força (30min)', type: 'good', xp: 25, completed: false, lastCompleted: null },
    { id: 2, icon: '📖', text: 'Estudos UFF / Sadiku / Teoria (1h)', type: 'good', xp: 20, completed: false, lastCompleted: null },
    { id: 3, icon: '⚡', text: 'Estágio ONS - Scripts Python & SEP', type: 'good', xp: 30, completed: false, lastCompleted: null },
    { id: 4, icon: '🍔', text: 'Comer Fast-Food / Junk Food', type: 'bad', xp: -10, completed: false, lastCompleted: null },
    { id: 5, icon: '📱', text: 'Procrastinar nas redes sociais', type: 'bad', xp: -10, completed: false, lastCompleted: null }
  ];
  const initialPlayer = { name: "Pedro Victor (Batman Herói)", title: "Guerreiro Z", level: 3, xp: 150, xpToNextLevel: 300, avatar: "" };
  const initialSkills = [
    { name: 'Força & Calistenia', level: 2, xp: 40, xpToNext: 100 },
    { name: 'Inteligência (UFF / SEP)', level: 3, xp: 85, xpToNext: 150 },
    { name: 'Disciplina & Rotina', level: 2, xp: 60, xpToNext: 100 },
    { name: 'Programação (Python / React)', level: 3, xp: 110, xpToNext: 150 }
  ];

  const [player, setPlayer] = React.useState(() => DataBaseController.get(DataBaseController.KEYS.HABIT_PLAYER, initialPlayer));
  const [habits, setHabits] = React.useState(() => {
    const saved = DataBaseController.get(DataBaseController.KEYS.HABIT_LIST, null);
    const lastReset = typeof window !== 'undefined' ? localStorage.getItem('lastReset') : null;
    const today = new Date().toDateString();
    if (saved && Array.isArray(saved)) {
      if (lastReset === today) return saved;
      if (typeof window !== 'undefined') localStorage.setItem('lastReset', today);
      return saved.map(h => ({ ...h, completed: false }));
    }
    if (typeof window !== 'undefined') localStorage.setItem('lastReset', today);
    return initialHabits;
  });
  const [skills, setSkills] = React.useState(() => DataBaseController.get(DataBaseController.KEYS.HABIT_SKILLS, initialSkills));
  const [completedHabit, setCompletedHabit] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('habitos');
  const [showAddHabitModal, setShowAddHabitModal] = React.useState(false);
  const [weeklyProgress, setWeeklyProgress] = React.useState([]);

  const isSuperSaiyan = React.useMemo(() => player.level >= 3, [player.level]);
  const status = isSuperSaiyan ? "Super Saiyan Mode 🔥" : `Guerreiro Z Nv.${player.level}`;

  React.useEffect(() => {
    DataBaseController.set(DataBaseController.KEYS.HABIT_PLAYER, player);
    DataBaseController.set(DataBaseController.KEYS.HABIT_LIST, habits);
    DataBaseController.set(DataBaseController.KEYS.HABIT_SKILLS, skills);
  }, [player, habits, skills]);

  React.useEffect(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    const weekData = days.map(day => ({ day, completed: 0 }));
    habits.forEach(habit => {
      if (habit.lastCompleted) {
        try {
          const completedDate = new Date(habit.lastCompleted);
          if (isNaN(completedDate.getTime())) return;
          const dayDiff = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));
          if (dayDiff <= 6 && dayDiff >= 0) weekData[completedDate.getDay()].completed += 1;
        } catch (e) { console.error(e); }
      }
    });
    setWeeklyProgress([...weekData.slice(1), weekData[0]]);
  }, [habits]);

  React.useEffect(() => {
    if (player.xp >= player.xpToNextLevel) {
      AudioEffects.playLevelUp();
      setPlayer(prev => ({
        ...prev,
        level: prev.level + 1,
        xp: prev.xp - prev.xpToNextLevel,
        xpToNextLevel: Math.floor(prev.xpToNextLevel * 1.5)
      }));
    }
  }, [player.xp, player.xpToNextLevel]);

  const handleCompleteHabit = (habit) => {
    // 🔊 Toca o efeito sonoro correspondente (Bom hábito vs Mau hábito)
    if (habit.type === 'good') {
      AudioEffects.playGoodHabit();
    } else {
      AudioEffects.playBadHabit();
    }

    const todayFormatted = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
    const updatedHabits = habits.map(h => h.id === habit.id ? { ...h, completed: true, lastCompleted: todayFormatted } : h);
    setHabits(updatedHabits);
    setPlayer(prev => ({ ...prev, xp: Math.max(0, prev.xp + habit.xp) }));

    // Adiciona moedas/fichas para a Loja Gamer
    if (habit.type === 'good') {
      const currentGamerData = DataBaseController.get(DataBaseController.KEYS.GAMER_TOKENS, { coins: 45, history: [], inventory: {} });
      const updatedGamerData = {
        ...currentGamerData,
        coins: (currentGamerData.coins || 0) + 5
      };
      DataBaseController.set(DataBaseController.KEYS.GAMER_TOKENS, updatedGamerData);
    }

    const updatedSkills = skills.map(skill => {
      if (habit.type === 'good') {
        const xpGain = Math.floor(habit.xp * (0.2 + Math.random() * 0.3));
        const newXp = skill.xp + xpGain;
        if (newXp >= skill.xpToNext) {
          return { ...skill, level: skill.level + 1, xp: newXp - skill.xpToNext, xpToNext: Math.floor(skill.xpToNext * 1.5) };
        }
        return { ...skill, xp: newXp };
      }
      return skill;
    });
    setSkills(updatedSkills);
    setCompletedHabit(habit);
  };

  const handleAddHabit = ({ text, type }) => {
    AudioEffects.playClick();
    setHabits([...habits, {
      id: Date.now(),
      icon: type === 'good' ? '⭐' : '⚠️',
      text,
      type,
      xp: type === 'good' ? 15 : -10,
      completed: false,
      lastCompleted: null
    }]);
    setShowAddHabitModal(false);
  };

  const handleResetDay = () => {
    AudioEffects.playClick();
    if (typeof window !== 'undefined') localStorage.setItem('lastReset', new Date().toDateString());
    setHabits(prev => prev.map(h => ({ ...h, completed: false })));
  };

  const changeTab = (tabName) => {
    AudioEffects.playClick();
    setActiveTab(tabName);
  };

  return html`
    <div className=${`w-full h-full p-4 overflow-y-auto transition-all duration-500 ${isSuperSaiyan ? 'bg-gradient-to-br from-yellow-900/20 via-black/40 to-black/40 super-saiyan-aura rounded-xl' : ''}`}>
      <div className="max-w-3xl mx-auto pb-20">
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-yellow-400">🔥 HABIT TRACKER & ROTINAS BATCAVERNA</h1>
          <div className="flex items-center space-x-6 text-gray-400 border-b-2 border-gray-700/60 pb-2">
            <span className=${`ht-tab cursor-pointer text-sm font-bold ${activeTab === 'habitos' ? 'text-yellow-400 border-b-2 border-yellow-400 pb-2' : ''}`} onClick=${() => changeTab('habitos')}>HÁBITOS</span>
            <span className=${`ht-tab cursor-pointer text-sm font-bold ${activeTab === 'dashboard' ? 'text-yellow-400 border-b-2 border-yellow-400 pb-2' : ''}`} onClick=${() => changeTab('dashboard')}>GRÁFICO SEMANAL</span>
            <span className=${`ht-tab cursor-pointer text-sm font-bold ${activeTab === 'habilidades' ? 'text-yellow-400 border-b-2 border-yellow-400 pb-2' : ''}`} onClick=${() => changeTab('habilidades')}>ATRIBUTOS</span>
          </div>
        </header>
        <${HabitPlayerStats} player=${player} isSuperSaiyan=${isSuperSaiyan} status=${status} />
        <main>
          ${activeTab === 'habitos' && html`<${HabitsView} habits=${habits} onCompleteHabit=${handleCompleteHabit} isSuperSaiyan=${isSuperSaiyan} handleResetDay=${handleResetDay} setShowAddHabitModal=${setShowAddHabitModal} />`}
          ${activeTab === 'dashboard' && html`<${HabitDashboardView} progressData=${weeklyProgress} isSuperSaiyan=${isSuperSaiyan} />`}
          ${activeTab === 'habilidades' && html`<${HabitSkillsView} skills=${skills} isSuperSaiyan=${isSuperSaiyan} />`}
        </main>
        ${showAddHabitModal && html`<${HabitAddModal} onAddHabit=${handleAddHabit} onClose=${() => setShowAddHabitModal(false)} />`}
        <${HabitCompletionModal} habit=${completedHabit} player=${player} onClose=${() => setCompletedHabit(null)} isSuperSaiyan=${isSuperSaiyan} />
      </div>
    </div>
  `;
};

export { HabitTrackerWidget };
export default HabitTrackerWidget;
