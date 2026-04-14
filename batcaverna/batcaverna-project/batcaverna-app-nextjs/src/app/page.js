// =======================================================
// page.js – Dashboard BatCaverna (Versão Modular)
// =======================================================


//! npm install chart.js htm three xlsx

"use client"

import React, { useEffect, useRef, useState } from 'react';
//import ReactDOM from 'react-dom/client';

// ---------------------------------------------------------------------
// 1. IMPORTAÇÕES DE DEPENDÊNCIAS EXTERNAS
//    (Assumindo que as bibliotecas estejam disponíveis globalmente
//     ou via import maps; utilizamos import dinâmico para Three.js)
// ---------------------------------------------------------------------

import htm from 'htm';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Chart from 'chart.js/auto';
import XLSX from 'xlsx'; // xlsx


// Configurando o localstorage
// SOLUÇÃO DEFINITIVA PARA NEXT.JS
const localStorage = typeof window !== 'undefined'
  ? window.localStorage
  : { getItem: () => null, setItem: () => null, removeItem: () => null };


// Helper para JSX-like com htm
const html = htm.bind(React.createElement);

// =====================================================================
// 2. MODELOS E CONTROLLERS DE DADOS
// =====================================================================

// ---------------------------------------------------------------------
// 2.1 DataBaseController – Gerenciamento localStorage e exportação
// ---------------------------------------------------------------------
class DataBaseController {
  static KEYS = {
    TASKS: 'bat_tasks_v3',
    SKILLS: 'dashboard-skills-v1',
    PROFILE: 'bat_profile_v1',
    HABIT_PLAYER: 'bat_habit_player',
    HABIT_LIST: 'bat_habit_list',
    HABIT_SKILLS: 'bat_habit_skills',
    EDITOR_SETTINGS: 'bat_editor_settings'
  };

  static get(key, defaultValue) {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null || storedValue === "null") return defaultValue;
    try {
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (e) {
      return storedValue || defaultValue;
    }
  }

  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('bat_storage_update', { detail: { key, value } }));
  }

  static formatDate(date) {
    return date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  static formatTime(date) {
    return date.toLocaleTimeString('pt-BR');
  }

  static exportToXlsx(key, filename) {
    const data = this.get(key, null);
    if (!data) {
      alert("Nenhum dado encontrado para esta chave.");
      return;
    }
    let ws;
    if (Array.isArray(data)) {
      ws = XLSX.utils.json_to_sheet(data);
    } else {
      const rows = [];
      const flattenObject = (obj, prefix = '') => {
        for (let k in obj) {
          if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            flattenObject(obj[k], prefix + k + '.');
          } else {
            rows.push({ Key: prefix + k, Value: JSON.stringify(obj[k]) });
          }
        }
      };
      if (data.unlockedSkills) {
        ws = XLSX.utils.json_to_sheet(data.unlockedSkills);
      } else if (data.notes) {
        ws = XLSX.utils.json_to_sheet(data.notes);
      } else {
        flattenObject(data);
        ws = XLSX.utils.json_to_sheet(rows);
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
}

// ---------------------------------------------------------------------
// 2.2 DashboardModel – Busca e parse do Markdown (tarefas)
// ---------------------------------------------------------------------
class DashboardModel {
  async fetchAndProcessMarkdown() {
    const GITHUB_MARKDOWN_URL = "https://raw.githubusercontent.com/PedroVic12/Pikachu-Flask-Server/refs/heads/main/batcaverna/batcaverna_pv.md";
    const DEFAULT_TASKS_MD = `# 🦇 Projetos Bat-Caverna __IN_PROGRESS\n- [ ] Carregando dados do GitHub...`;
    try {
      const response = await fetch(GITHUB_MARKDOWN_URL);
      if (!response.ok) throw new Error('Failed to fetch markdown');
      let markdown = await response.text();
      markdown = markdown.replace(/\[([xX])\]/g, '[x]');
      return this.parseTasksFromMarkdown(markdown);
    } catch (error) {
      console.error('Error fetching markdown:', error);
      return this.parseTasksFromMarkdown(DEFAULT_TASKS_MD);
    }
  }

  parseTasksFromMarkdown(markdown) {
    if (!markdown) return [];
    const mdString = String(markdown);
    const categories = mdString.split(/^#\s+/m).slice(1);
    const KANBAN_TAGS = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'COMPLETED'];
    return categories.map(cat => {
      const lines = cat.trim().split('\n');
      const header = lines[0].trim();
      let label = header;
      let explicitStatus = null;
      const tagMatch = header.match(/__([A-Z_]+)$/);
      if (tagMatch && KANBAN_TAGS.includes(tagMatch[1])) {
        explicitStatus = tagMatch[1];
        label = header.replace(tagMatch[0], '').trim();
      }
      const taskLines = lines.slice(1).filter(line => line.match(/^\s*-\s*\[[ x]\]/i));
      const items = taskLines.map(line => {
        const isChecked = line.match(/^\s*-\s*\[x\]/i);
        const text = line.replace(/^\s*-\s*\[[ x]\]\s*/i, '').trim();
        return { completed: !!isChecked, text: text };
      });
      const hasTasks = items.length > 0;
      if (!hasTasks) return null;
      const completedCount = items.filter(item => item.completed).length;
      const progress = hasTasks ? Math.round((completedCount / items.length) * 100) : 0;
      const status = explicitStatus || (progress === 100 ? 'COMPLETED' : progress > 0 ? 'IN_PROGRESS' : 'TODO');
      const color = progress > 70 ? '#39ff14' : progress > 40 ? '#00e5ff' : progress > 10 ? '#ffab00' : '#f44336';
      return { label, progress, color, items, status };
    }).filter(Boolean);
  }

  getAstroData() {
    const now = new Date();
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    const daysSinceNewMoon = (now - knownNewMoon) / 86400000;
    const LUNAR_CYCLE = 29.53058867;
    const currentCyclePos = (daysSinceNewMoon / LUNAR_CYCLE) % 1;
    const phaseIndex = Math.floor(currentCyclePos * 8 + 0.5) % 8;
    const moonPhases = [
      { name: "Lua Nova", emoji: "🌑" }, { name: "Crescente", emoji: "🌒" },
      { name: "Quarto Crescente", emoji: "🌓" }, { name: "Gibosa Crescente", emoji: "🌔" },
      { name: "Lua Cheia", emoji: "🌕" }, { name: "Gibosa Minguante", emoji: "🌖" },
      { name: "Quarto Minguante", emoji: "🌗" }, { name: "Minguante", emoji: "🌘" }
    ];
    const hour = now.getHours();
    let score = 50;
    if ((hour >= 5 && hour <= 8) || (hour >= 17 && hour <= 20)) score += 40;
    if ((hour >= 11 && hour <= 14) || (hour >= 23 || hour <= 2)) score += 20;
    if (phaseIndex === 0 || phaseIndex === 4) score += 30;
    else if (phaseIndex === 2 || phaseIndex === 6) score += 15;
    score = Math.min(100, score);
    let fishingForecast;
    if (score > 85) fishingForecast = { text: "Excelente", color: "text-cyan-400" };
    else if (score > 65) fishingForecast = { text: "Bom", color: "text-green-400" };
    else if (score > 40) fishingForecast = { text: "Regular", color: "text-yellow-400" };
    else fishingForecast = { text: "Fraco", color: "text-red-400" };
    const constellationsByMonth = {
      0: [{ name: "Órion", emoji: "🏹" }, { name: "Cão Maior", emoji: "🐕" }],
      1: [{ name: "Gêmeos", emoji: "♊" }, { name: "Carina", emoji: "⛵️" }],
      2: [{ name: "Leão", emoji: "🦁" }, { name: "Cruzeiro do Sul", emoji: "✝️" }],
      3: [{ name: "Cruzeiro do Sul", emoji: "✝️" }, { name: "Virgem", emoji: "♍" }],
      4: [{ name: "Centauro", emoji: "🐎" }, { name: "Balança", emoji: "⚖️" }],
      5: [{ name: "Escorpião", emoji: "🦂" }, { name: "Sagitário", emoji: "♐" }],
      6: [{ name: "Escorpião", emoji: "🦂" }, { name: "Águia", emoji: "🦅" }],
      7: [{ name: "Sagitário", emoji: "♐" }, { name: "Capricórnio", emoji: "♑" }],
      8: [{ name: "Aquário", emoji: "♒" }, { name: "Grou", emoji: "🐦" }],
      9: [{ name: "Peixes", emoji: "♓" }, { name: "Fênix", emoji: "🔥" }],
      10: [{ name: "Áries", emoji: "♈" }, { name: "Baleia", emoji: "🐳" }],
      11: [{ name: "Touro", emoji: "🐂" }, { name: "Órion", emoji: "🏹" }]
    };
    return {
      moonPhase: moonPhases[phaseIndex],
      fishingForecast,
      constellations: constellationsByMonth[now.getMonth()] || []
    };
  }
}



function GlassContainer() {
  return html`
    <div className="glass-panel p-6">
      <h1 className="neon-text text-2xl">Batcaverna PV WebSite</h1>
      <p>O CSS agora é carregado de forma nativa pelo Next.js.</p>
    </div>
  `;
}

// ---------------------------------------------------------------------
// 2.3 BatmanProfileModel – Dados do perfil (notas, metas, missões)
// ---------------------------------------------------------------------
class BatmanProfileModel {
  constructor() {
    this.profileData = {
      basicInfo: {
        nomeVerdadeiro: "Pedro Victor Veras",
        ocupacao: "Estudante e Estagiário no ONS",
        base: "Niteroi City, RJ",
        corOlhos: "Castanhos",
        corCabelo: "Preto",
        altura: "1,72 m",
        peso: "81 kg"
      },
      progress: {
        perfis: { current: 16, total: 32, percent: 50 },
        arquivosAudio: { current: 0, total: 29, percent: 0 }
      },
      notes: [
        { id: 1, text: "Monitorar atividades da região SP e SECO no ONS no Dashboard Tauri Desktop", date: "2025-03-27", category: "ons" },
        { id: 2, text: "Atualizar e Verificar Sistemas Kanban, SCRUM, Todo List, Planner diários", date: "2024-02-04", category: "tecnologia" },
        { id: 3, text: "Treinamento de força e hipertrofia", date: "2024-02-03", category: "treinamento" }
      ],
      goals: [
        { id: 1, name: "Ser aprovado com nota máxima em Circuitos Digitais", progress: 75, deadline: "2026-06-06" },
        { id: 2, name: "Se estabelecer na rotina do ONS - PLC com Engenharia Elétrica e Tecnologia", progress: 40, deadline: "2026-06-06" }
      ],
      stats: { forca: 70, agilidade: 80, inteligencia: 88, resistencia: 82, estrategia: 76, sigilo: 94 },
      missions: [
        { id: 1, name: "Patrulha noturna", status: "concluido" },
        { id: 2, name: "Uso de ferramentas Python, JS e Office (Word, Excel e PowerPoint)", status: "em_andamento" },
        { id: 3, name: "Estudos, Quizz Games e Provas antigas da UFF", status: "pendente" }
      ]
    };
  }

  getProfileData() { return this.profileData; }

  addNote(noteText) {
    const newNote = {
      id: Date.now(),
      text: noteText,
      date: new Date().toISOString().split('T')[0],
      category: "geral"
    };
    this.profileData.notes.unshift(newNote);
    return this.profileData.notes;
  }

  deleteNote(noteId) {
    this.profileData.notes = this.profileData.notes.filter(note => note.id !== noteId);
    return this.profileData.notes;
  }

  updateGoalProgress(goalId, newProgress) {
    const goal = this.profileData.goals.find(g => g.id === goalId);
    if (goal) goal.progress = Math.min(100, Math.max(0, newProgress));
    return this.profileData.goals;
  }
}

// =====================================================================
// 3. CONTROLLERS (Hooks)
// =====================================================================

// ---------------------------------------------------------------------
// 3.1 useSkillsController – Gerencia habilidades, XP, rotinas
// ---------------------------------------------------------------------
const DEFAULT_SKILLS_DATA = {
  currentXP: 9311,
  totalXP: 45000,
  level: 7,
  improvementPoints: 1,
  unlockedSkills: [
    { id: 'code1', name: 'Lógica em Python & React', category: 'code', description: 'Aumenta a velocidade de codificação em 15%', level: 1, maxLevel: 5 },
    { id: 'body_mind1', name: 'Calistenia Básica', category: 'body_mind', description: 'Garante energia para codar. Meta: 100 flexões', level: 1, maxLevel: 3 },
  ],
  availableSkills: [
    { id: 'engineering1', name: 'Domínio do Anarede & SEP', category: 'engineering', description: 'Resolve fluxos de potência 30% mais rápido no ONS', xpCost: 1500, requiredLevel: 8 },
    { id: 'code2', name: 'Arquitetura Tauri v2 (Rust)', category: 'code', description: 'Cria apps desktop consumindo 50% menos RAM', xpCost: 1200, requiredLevel: 7 },
    { id: 'body_mind2', name: 'Hiperfoco (Gestão TDAH)', category: 'body_mind', description: 'Bloqueia distrações externas por 2 horas', xpCost: 1800, requiredLevel: 9 },
  ],
  objectives: [
    { id: 'obj1', name: 'Engenheiro Full-Stack', description: 'Alcançar o Nível 10 unindo SEP e Desenvolvimento', xpReward: 2000, completed: false },
    { id: 'obj2', name: 'Mestre das Ferramentas', description: 'Desbloquear 5 habilidades entre Next.js, Python e Matemática', xpReward: 1500, completed: false, current: 2, target: 5 },
    { id: 'obj3', name: 'Disciplina de Ferro', description: 'Completar o Protocolo Hard Reset 7 vezes', xpReward: 1000, completed: false, current: 3, target: 7 },
  ],
  dailyRoutines: [
    { id: 'morning', name: 'Ignição Matinal', time: '06:30-08:00', tasks: ['Acordar', 'Treino Caseiro (Força/ABS)', 'Alinhar tarefas do dia'], completed: true },
    { id: 'work', name: 'Estágio ONS (Foco Profundo)', time: '08:30-17:30', tasks: ['Scripts Python/Pandas', 'Simulações Organon/Anarede', 'Revisar pendências'], completed: false },
    { id: 'study', name: 'Batcaverna (Estudos & Code)', time: '19:30-21:30', tasks: ['Teoria UFF (Sadiku/Stevenson)', 'Codar Projetos Web/Desktop'], completed: false },
    { id: 'evening', name: 'Descompressão', time: '21:30-23:00', tasks: ['Jogo do Fluzão / The Witcher', 'Jantar', 'Preencher Log_Template.md'], completed: false },
  ],
  skillCategories: [
    { id: 'code', name: 'Desenvolvimento (Code)', total: 25, unlocked: 9 },
    { id: 'engineering', name: 'Engenharia Elétrica (UFF/ONS)', total: 25, unlocked: 6 },
    { id: 'body_mind', name: 'Corpo & Mente (Treino/Foco)', total: 25, unlocked: 6 },
  ]
};

function useSkillsController() {
  const [skillsData, setSkillsData] = React.useState(() => DataBaseController.get(DataBaseController.KEYS.SKILLS, DEFAULT_SKILLS_DATA));
  const xpPercentage = Math.round((skillsData.currentXP / skillsData.totalXP) * 100);
  const xpToNextLevel = skillsData.totalXP - skillsData.currentXP;

  const unlockSkill = (skillId) => {
    setSkillsData(prev => {
      const skill = prev.availableSkills.find(s => s.id === skillId);
      if (!skill || prev.improvementPoints <= 0 || prev.currentXP < skill.xpCost || prev.level < skill.requiredLevel) return prev;
      const newUnlocked = {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        description: skill.description,
        level: 1,
        maxLevel: skill.maxLevel || 3
      };
      const updatedSkills = {
        ...prev,
        improvementPoints: prev.improvementPoints - 1,
        currentXP: prev.currentXP - skill.xpCost,
        unlockedSkills: [...prev.unlockedSkills, newUnlocked],
        availableSkills: prev.availableSkills.filter(s => s.id !== skillId)
      };
      DataBaseController.set(DataBaseController.KEYS.SKILLS, updatedSkills);
      return updatedSkills;
    });
  };

  const completeRoutine = (routineId) => {
    setSkillsData(prev => {
      const updatedRoutines = prev.dailyRoutines.map(routine =>
        routine.id === routineId ? { ...routine, completed: true } : routine
      );
      const updatedSkills = {
        ...prev,
        dailyRoutines: updatedRoutines,
        currentXP: prev.currentXP + 250,
        objectives: prev.objectives.map(obj => {
          if (obj.id === 'obj3') {
            const newCurrent = (obj.current || 0) + 1;
            return { ...obj, current: newCurrent, completed: newCurrent >= obj.target };
          }
          return obj;
        })
      };
      DataBaseController.set(DataBaseController.KEYS.SKILLS, updatedSkills);
      return updatedSkills;
    });
  };

  const resetDailyRoutines = () => {
    setSkillsData(prev => {
      const updatedSkills = {
        ...prev,
        dailyRoutines: prev.dailyRoutines.map(routine => ({ ...routine, completed: false }))
      };
      DataBaseController.set(DataBaseController.KEYS.SKILLS, updatedSkills);
      return updatedSkills;
    });
  };

  const completeObjective = (objectiveId) => {
    setSkillsData(prev => {
      const objective = prev.objectives.find(obj => obj.id === objectiveId);
      if (!objective || objective.completed) return prev;
      const updatedSkills = {
        ...prev,
        objectives: prev.objectives.map(obj => obj.id === objectiveId ? { ...obj, completed: true } : obj),
        currentXP: prev.currentXP + objective.xpReward
      };
      DataBaseController.set(DataBaseController.KEYS.SKILLS, updatedSkills);
      return updatedSkills;
    });
  };

  return { skillsData, xpPercentage, xpToNextLevel, unlockSkill, completeRoutine, resetDailyRoutines, completeObjective };
}

// ---------------------------------------------------------------------
// 3.2 useDashboardController – Gerencia tarefas, tempo, dados astro
// ---------------------------------------------------------------------
function useDashboardController() {
  const model = React.useMemo(() => new DashboardModel(), []);
  const [activeView, setActiveView] = React.useState('kanban');
  const [currentTime, setCurrentTime] = React.useState('');
  const [astroData, setAstroData] = React.useState({ moonPhase: {}, fishingForecast: {}, constellations: [] });
  const [tasksMarkdown, setTasksMarkdown] = React.useState(() => DataBaseController.get(DataBaseController.KEYS.TASKS, ''));
  const tasks = React.useMemo(() => model.parseTasksFromMarkdown(tasksMarkdown), [tasksMarkdown, model]);

  React.useEffect(() => {
    const fetchMarkdown = async () => {
      const GITHUB_MARKDOWN_URL = "https://raw.githubusercontent.com/PedroVic12/Pikachu-Flask-Server/refs/heads/main/batcaverna/batcaverna_pv.md";
      try {
        const response = await fetch(GITHUB_MARKDOWN_URL + `?cachebust=${new Date().getTime()}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        setTasksMarkdown(currentMarkdown => {
          if (text !== currentMarkdown) {
            DataBaseController.set(DataBaseController.KEYS.TASKS, text);
            return text;
          }
          return currentMarkdown;
        });
      } catch (error) {
        console.error("❌ Erro ao buscar markdown, usando local:", error.message);
      }
    };
    fetchMarkdown();
    const pollInterval = setInterval(fetchMarkdown, 60000);
    return () => clearInterval(pollInterval);
  }, []);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR'));
      setAstroData(model.getAstroData());
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString('pt-BR'));
    setAstroData(model.getAstroData());
    return () => clearInterval(intervalId);
  }, [model]);

  const handleMarkdownChange = (e) => {
    const newMarkdown = e.target.value;
    setTasksMarkdown(newMarkdown);
    DataBaseController.set(DataBaseController.KEYS.TASKS, newMarkdown);
  };

  const handleKanbanUpdate = (cardLabel, newStatus) => {
    const lines = tasksMarkdown.split('\n');
    const categoryIndex = lines.findIndex(line => line.trim().startsWith(`# ${cardLabel}`));
    if (categoryIndex !== -1) {
      let headerLine = lines[categoryIndex];
      headerLine = headerLine.replace(/__([A-Z_]+)$/, '').trim();
      lines[categoryIndex] = `${headerLine} __${newStatus}`;
      const newMarkdown = lines.join('\n');
      setTasksMarkdown(newMarkdown);
      DataBaseController.set(DataBaseController.KEYS.TASKS, newMarkdown);
    }
  };

  return {
    activeView,
    setActiveView,
    currentTime,
    ...astroData,
    tasks,
    tasksMarkdown,
    handleMarkdownChange,
    handleKanbanUpdate
  };
}

// ---------------------------------------------------------------------
// 3.3 useBatmanProfileController – Gerencia perfil, notas, metas, integrações
// ---------------------------------------------------------------------
function useBatmanProfileController() {
  const [model] = React.useState(() => new BatmanProfileModel());
  const [activeProfileTab, setActiveProfileTab] = React.useState('info');
  const [profileData, setProfileData] = React.useState(() => DataBaseController.get(DataBaseController.KEYS.PROFILE, model.getProfileData()));
  const [newNote, setNewNote] = React.useState('');
  const [habitXP, setHabitXP] = React.useState(0);
  const [skillLevel, setSkillLevel] = React.useState(0);

  React.useEffect(() => {
    const habitPlayer = DataBaseController.get(DataBaseController.KEYS.HABIT_PLAYER, { xp: 0 });
    const skills = DataBaseController.get(DataBaseController.KEYS.SKILLS, { level: 0 });
    setHabitXP(habitPlayer.xp || 0);
    setSkillLevel(skills.level || 0);

    const handleStorageUpdate = (e) => {
      if (e.detail.key === DataBaseController.KEYS.HABIT_PLAYER) setHabitXP(e.detail.value.xp);
      if (e.detail.key === DataBaseController.KEYS.SKILLS) setSkillLevel(e.detail.value.level);
    };
    window.addEventListener('bat_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('bat_storage_update', handleStorageUpdate);
  }, []);

  React.useEffect(() => {
    DataBaseController.set(DataBaseController.KEYS.PROFILE, profileData);
  }, [profileData]);

  const handleAddNote = () => {
    if (newNote.trim()) {
      const updatedNotes = model.addNote(newNote.trim());
      setProfileData(prev => ({ ...prev, notes: [...model.profileData.notes] }));
      setNewNote('');
    }
  };

  const handleDeleteNote = (noteId) => {
    const updatedNotes = model.deleteNote(noteId);
    setProfileData(prev => ({ ...prev, notes: [...updatedNotes] }));
  };

  const handleUpdateGoal = (goalId, progress) => {
    const updatedGoals = model.updateGoalProgress(goalId, progress);
    setProfileData(prev => ({ ...prev, goals: [...updatedGoals] }));
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'urgente': return 'bg-red-900/30 text-red-300';
      case 'tecnologia': return 'bg-blue-900/30 text-blue-300';
      case 'treinamento': return 'bg-green-900/30 text-green-300';
      case 'investigação': return 'bg-purple-900/30 text-purple-300';
      default: return 'bg-gray-900/30 text-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'concluido': return 'bg-green-900/30 text-green-400';
      case 'em_andamento': return 'bg-yellow-900/30 text-yellow-400';
      case 'pendente': return 'bg-gray-900/30 text-gray-400';
      default: return 'bg-gray-900/30';
    }
  };

  return {
    profileData,
    activeProfileTab,
    setActiveProfileTab,
    newNote,
    setNewNote,
    handleAddNote,
    handleDeleteNote,
    handleUpdateGoal,
    getCategoryColor,
    getStatusColor,
    habitXP,
    skillLevel
  };
}

// =====================================================================
// 4. COMPONENTES DE UI COMPARTILHADOS
// =====================================================================

const Header = ({ currentTime }) => {
  const now = new Date();
  const DataAtual = `${now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  return html`
    <header>
    ${GlassContainer()}
      <h1 className="text-3xl font-bold neon-text">Bat Caverna Dashboard 🦇</h1>
      <p className="text-sm text-gray-400">${DataAtual}</p>
      <div className="flex justify-between items-center mt-4">
        <h2 className="font-semibold text-gray-300">Horário Local</h2>
        <span className="font-mono text-lg bg-black/20 px-2 rounded">${currentTime}</span>
      </div>
    </header>
  `;
};

const WeeklyFocus = ({ tasks }) => html`
  <section className="bg-black/20 p-3 rounded-lg">
    <h2 className="font-semibold text-gray-300 mb-2">🎯 Foco da Semana</h2>
    <ul className="space-y-2">
      ${tasks.map(task => html`
        <li key=${task.label} className="text-lg">
          <div className="flex justify-between mb-1">
            <span className="text-gray-300">${task.label}</span>
            <span className="text-gray-500">${task.progress}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-1.5">
            <div className="h-1.5 rounded-full" style=${{ width: `${task.progress}%`, backgroundColor: task.color }}></div>
          </div>
        </li>
      `)}
    </ul>
  </section>
`;

const LinksPanel = () => {
  const [expandedGroups, setExpandedGroups] = React.useState({ redes: false, apps: false, projetos: false, entretenimento: false });
  const toggleGroup = (group) => setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  const linkSections = [
    { id: 'redes', title: '🔗 Redes Sociais', links: [{ url: 'https://github.com/PedroVic12', text: '🌍 GitHub' }, { url: 'https://linkedin.com/in/pedrovictor12', text: '💼 LinkedIn', variant: 'bg-blue-600' }] },
    { id: 'apps', title: '📱 Aplicativos', links: [{ url: 'PVRV/Gohan_treinamentos_2025.html', text: '💪 App Produtividade' }, { url: 'https://gohann-treinamentos-web-app-one.vercel.app', text: '📚 Ionic Gohan Treinamentos' }] },
    { id: 'projetos', title: '⚙️ Projetos', links: [{ url: 'http://127.0.0.1:5000/', text: '🚀 Pikachu API Server' }, { url: 'https://electrical-system-simulator.vercel.app/', text: '⚡ SEP para Leigos' }, { url: "PVRV/Habit_Tracker.html", text: "📊 Habit Tracker XP" }] },
    { id: 'entretenimento', title: '🎮 Entretenimento', links: [{ url: 'https://www.mat.ufmg.br/futebol/classificacao-para-libertadores_seriea/', text: '⚽ Prob. Futebol', variant: 'bg-green-700' }, { url: 'outro_arquivo.html', text: '📄 Outros Links' }] }
  ];
  return html`
    <div className="bg-black/30 backdrop-blur-sm p-3 rounded-xl border border-gray-700/50 shadow-lg">
      <div className="flex items-center justify-between mb-3 p-2 bg-black/30 rounded-lg">
        <h2 className="font-bold text-base text-gray-200">🔗 Painel de Links</h2>
        <div className="text-xs text-gray-400">${linkSections.flatMap(g => g.links).length} links</div>
      </div>
      <div className="space-y-2">
        ${linkSections.map(section => html`
          <div key=${section.id} className="bg-black/20 rounded-lg overflow-hidden">
            <button onClick=${() => toggleGroup(section.id)} className="w-full px-3 py-2 text-left text-sm font-medium text-gray-200 bg-black/30 hover:bg-black/40 transition-colors flex items-center justify-between">
              <span>${section.title}</span><span className="transform transition-transform ${expandedGroups[section.id] ? 'rotate-180' : ''} text-gray-400">▼</span>
            </button>
            ${expandedGroups[section.id] ? html`
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                ${section.links.map((link, i) => html`
                  <a key=${i} href=${link.url} target="_blank" rel="noopener noreferrer" className="w-full text-center px-2 py-1.5 text-xs ${link.variant || 'bg-gray-700/80'} text-white rounded shadow hover:bg-opacity-90 transition flex items-center justify-center gap-2">
                    ${link.text}
                  </a>
                `)}
              </div>
            ` : ''}
          </div>
        `)}
      </div>
    </div>
  `;
};

const Footer = () => html`
  <footer className="text-center text-xs text-gray-600 mt-auto pt-4">
    <p>BatDashboard © 2025. Todos os direitos reservados.</p>
    <p>Criado por Pedro Victor Veras</p>
  </footer>
`;

// Componentes específicos do perfil
const InfoCard = ({ title, children, className = '' }) => html`
  <div className=${`batman-card p-4 ${className}`}>
    <h3 className="font-bold text-lg mb-3 text-yellow-400 border-b border-yellow-800 pb-2">${title}</h3>
    ${children}
  </div>
`;

const ProgressBar = ({ label, current, total, percent, color = 'batman-progress-bar' }) => html`
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <span className="text-gray-300">${label}</span>
      <span className="text-yellow-400 font-mono">${current}/${total} (${percent}%)</span>
    </div>
    <div className="w-full bg-gray-800 rounded-full h-3">
      <div className=${`h-3 rounded-full ${color}`} style=${{ width: `${percent}%` }}></div>
    </div>
  </div>
`;

const StatCard = ({ label, value }) => html`
  <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
    <div className="text-xs text-gray-400 mb-1">${label}</div>
    <div className="flex items-center">
      <div className="flex-1">
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div className="h-2 rounded-full bg-yellow-500" style=${{ width: `${value}%` }}></div>
        </div>
      </div>
      <div className="ml-2 text-yellow-400 font-bold">${value}</div>
    </div>
  </div>
`;

const NoteCard = ({ note, onDelete, getCategoryColor }) => html`
  <div className="batman-card p-4">
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1">
        <p className="text-gray-300">${note.text}</p>
        <div className="flex items-center mt-2">
          <span className="text-xs text-gray-500">${note.date}</span>
          <span className=${`ml-2 text-xs px-2 py-1 rounded ${getCategoryColor(note.category)}`}>${note.category}</span>
        </div>
      </div>
      <button onClick=${() => onDelete(note.id)} className="ml-2 text-red-400 hover:text-red-300">×</button>
    </div>
  </div>
`;

const GoalCard = ({ goal, onUpdate, getStatusColor }) => {
  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value);
    onUpdate(goal.id, newProgress);
  };
  return html`
    <div className="batman-card p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-gray-200">${goal.name}</h4>
        <span className="text-xs text-yellow-400">${goal.deadline}</span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-400">Progresso</span>
          <span className="text-sm font-bold text-yellow-400">${goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div className="h-3 rounded-full batman-progress-bar" style=${{ width: `${goal.progress}%` }}></div>
        </div>
      </div>
      <input type="range" min="0" max="100" value=${goal.progress} onChange=${handleProgressChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0%</span><span>100%</span>
      </div>
    </div>
  `;
};

// =====================================================================
// 5. WIDGETS (Telas principais)
// =====================================================================

// ---------------------------------------------------------------------
// 5.1 SkillsWidget
// ---------------------------------------------------------------------
const SkillsWidget = () => {
  const { skillsData, xpPercentage, xpToNextLevel, unlockSkill, completeRoutine, resetDailyRoutines, completeObjective } = useSkillsController();

  const SkillCategory = ({ category }) => html`
    <div className="skill-card bg-black/30 p-4 rounded-lg">
      <h3 className="font-bold text-gray-200 mb-2">${category.name}</h3>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">Progresso</span>
        <span className="text-sm font-semibold">${category.unlocked}/${category.total}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div className="h-2 rounded-full xp-progress-bar" style=${{ width: `${(category.unlocked / category.total) * 100}%` }}></div>
      </div>
    </div>
  `;

  const UnlockedSkillCard = ({ skill }) => html`
    <div className="skill-card unlocked bg-black/30 p-3 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-green-400">${skill.name}</h4>
          <p className="text-xs text-gray-400 mt-1">${skill.description}</p>
        </div>
        <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">Nível ${skill.level}/${skill.maxLevel}</span>
      </div>
    </div>
  `;

  const AvailableSkillCard = ({ skill }) => {
    const canUnlock = skillsData.improvementPoints > 0 && skillsData.currentXP >= skill.xpCost && skillsData.level >= skill.requiredLevel;
    return html`
      <div className=${`skill-card ${canUnlock ? 'unlocked' : 'locked'} bg-black/30 p-3 rounded-lg cursor-pointer hover:bg-black/40`} onClick=${() => canUnlock && unlockSkill(skill.id)}>
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold ${canUnlock ? 'text-cyan-300' : 'text-gray-500'}">${skill.name}</h4>
            <p className="text-xs text-gray-400 mt-1">${skill.description}</p>
          </div>
          <div className="text-right">
            <div className="text-xs ${canUnlock ? 'text-cyan-400' : 'text-gray-500'}">${skill.xpCost} XP</div>
            <div className="text-xs text-gray-500 mt-1">Nível ${skill.requiredLevel}+</div>
          </div>
        </div>
        ${!canUnlock ? html`<div className="text-xs text-red-400 mt-2">${skillsData.level < skill.requiredLevel ? 'Nível insuficiente' : skillsData.currentXP < skill.xpCost ? 'XP insuficiente' : 'Pontos insuficientes'}</div>` : ''}
      </div>
    `;
  };

  const RoutineCard = ({ routine }) => html`
    <div className="skill-card bg-black/30 p-3 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-200">${routine.name}</h4>
        <span className="routine-time text-xs">${routine.time}</span>
      </div>
      <ul className="space-y-1 mb-3">
        ${routine.tasks.map((task, i) => html`<li key=${i} className="text-sm text-gray-400 flex items-center"><span className="mr-2">•</span> ${task}</li>`)}
      </ul>
      <button onClick=${() => completeRoutine(routine.id)} disabled=${routine.completed} className=${`w-full py-2 rounded-md text-sm font-medium transition ${routine.completed ? 'bg-green-900/30 text-green-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}`}>
        ${routine.completed ? '✅ Concluído' : 'Marcar como Concluído (+250 XP)'}
      </button>
    </div>
  `;

  const ObjectiveCard = ({ objective }) => html`
    <div className="skill-card bg-black/30 p-3 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-gray-200">${objective.name}</h4>
          <p className="text-xs text-gray-400 mt-1">${objective.description}</p>
        </div>
        <span className="text-xs bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded">+${objective.xpReward} XP</span>
      </div>
      ${objective.current !== undefined ? html`
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progresso</span><span>${objective.current}/${objective.target}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="h-2 rounded-full xp-progress-bar" style=${{ width: `${(objective.current / objective.target) * 100}%` }}></div>
          </div>
        </div>
      ` : ''}
      <button onClick=${() => completeObjective(objective.id)} disabled=${objective.completed || (objective.current !== undefined && objective.current < objective.target)} className=${`w-full py-2 rounded-md text-sm font-medium transition ${objective.completed ? 'bg-green-900/30 text-green-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
        ${objective.completed ? '✅ Objetivo Concluído' : 'Reivindicar Recompensa'}
      </button>
    </div>
  `;

  return html`
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="glass-panel !bg-black/20 p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-cyan-300">Habilidades PVRV 🦇</h2>
            <div className="text-right">
              <div className="text-lg font-bold text-green-400">Nível ${skillsData.level}</div>
              <div className="text-sm text-gray-400">${skillsData.improvementPoints} Ponto(s) de Melhoria</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-gray-300">Progresso do Nível</span>
              <span className="text-gray-300">${skillsData.currentXP}/${skillsData.totalXP} XP (${xpPercentage}%)</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-4">
              <div className="h-4 rounded-full xp-progress-bar" style=${{ width: `${xpPercentage}%` }}></div>
            </div>
            <div className="text-right text-sm text-gray-400 mt-1">${xpToNextLevel} XP para o próximo nível</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${skillsData.skillCategories.map(category => html`<${SkillCategory} key=${category.id} category=${category} />`)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="glass-panel !bg-black/20 p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Habilidades Desbloqueadas</h3>
              <div className="space-y-3">
                ${skillsData.unlockedSkills.map(skill => html`<${UnlockedSkillCard} key=${skill.id} skill=${skill} />`)}
              </div>
            </div>
            <div className="glass-panel !bg-black/20 p-4">
              <h3 className="text-lg font-semibold text-cyan-300 mb-3">🆕 Habilidades Disponíveis</h3>
              <p className="text-sm text-gray-400 mb-3">Clique em uma habilidade para desbloquear usando pontos de melhoria</p>
              <div className="space-y-3">
                ${skillsData.availableSkills.map(skill => html`<${AvailableSkillCard} key=${skill.id} skill=${skill} />`)}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="glass-panel !bg-black/20 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-yellow-400">📅 Rotinas Diárias</h3>
                <button onClick=${resetDailyRoutines} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">Resetar Rotinas</button>
              </div>
              <div className="space-y-3">
                ${skillsData.dailyRoutines.map(routine => html`<${RoutineCard} key=${routine.id} routine=${routine} />`)}
              </div>
            </div>
            <div className="glass-panel !bg-black/20 p-4">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">🎯 Objetivos</h3>
              <div className="space-y-3">
                ${skillsData.objectives.map(obj => html`<${ObjectiveCard} key=${obj.id} objective=${obj} />`)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// ---------------------------------------------------------------------
// 5.2 KanbanWidget
// ---------------------------------------------------------------------
const KanbanCard = ({ card, onDragStart }) => html`
  <div draggable="true" onDragStart=${e => onDragStart(e, card.label)} className="bg-black/40 p-3 rounded-lg border border-gray-700 hover:border-cyan-400 transition cursor-grab active:cursor-grabbing">
    <h4 className="font-bold text-gray-200">${card.label}</h4>
    <p className="text-xs text-gray-400 mt-1">${card.items.filter(i => i.completed).length} / ${card.items.length} tarefas concluídas</p>
    <div className="w-full bg-black/30 rounded-full h-1.5 mt-2">
      <div className="h-1.5 rounded-full" style=${{ width: `${card.progress}%`, backgroundColor: card.color }}></div>
    </div>
  </div>
`;

const KanbanColumn = ({ title, cards, status, color, onDrop, onDragStart }) => {
  const [isOver, setIsOver] = React.useState(false);
  const handleDragOver = (e) => { e.preventDefault(); setIsOver(true); };
  const handleDragLeave = () => setIsOver(false);
  const handleDrop = (e) => { onDrop(e, status); setIsOver(false); };
  return html`
    <div onDragOver=${handleDragOver} onDragLeave=${handleDragLeave} onDrop=${handleDrop} className=${`flex-1 min-w-[280px] bg-black/20 rounded-lg p-3 flex flex-col transition-colors ${isOver ? 'kanban-column-drag-over' : ''}`}>
      <h3 className="font-bold text-lg px-2 pb-2 border-b-2" style=${{ borderColor: color }}>${title}</h3>
      <div className="flex-1 pt-3 space-y-3 overflow-y-auto">
        ${cards.map(card => html`<${KanbanCard} key=${card.label} card=${card} onDragStart=${onDragStart} />`)}
      </div>
    </div>
  `;
};

const KanbanWidget = ({ tasks, onUpdate }) => {
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
  return html`
    <div className="w-full h-full p-4 flex gap-4 overflow-x-auto">
      ${Object.entries(columnMeta).map(([status, meta]) => html`
        <${KanbanColumn} key=${status} title=${meta.title} cards=${columns[status] || []} status=${status} color=${meta.color} onDragStart=${onDragStart} onDrop=${onDrop} />
      `)}
    </div>
  `;
};

// ---------------------------------------------------------------------
// 5.3 OrbitWidget (Three.js)
// ---------------------------------------------------------------------
const SOLAR_SYSTEM_DATA = new Map([
  ['sun', { name: 'Sol', radius: 4.5, color: 0xffcc33, isStar: true }],
  ['earth', { name: 'Terra', radius: 0.8, color: 0x2288ff, orbit: { radius: 25.0, period: 365 } }],
  ['mars', { name: 'Marte', radius: 0.45, color: 0xff5733, orbit: { radius: 38.0, period: 687 } }],
  ['moon', { name: 'Lua', radius: 0.25, color: 0xaaaaaa, orbit: { radius: 2.5, period: 27, center: 'earth' } }]
]);

class OrbitalMechanics {
  static calculateSpeed(period, timeScale = 0.005) { if (!period) return 0; return timeScale * (365 / period); }
  static calculatePosition(angle, radius) { const x = Math.cos(angle) * radius; const z = Math.sin(angle) * radius; return new THREE.Vector3(x, 0, z); }
}

function mountPhysicsOrbitSystem(container) {
  if (!container) return { stop: () => { }, setCameraTarget: () => { } };
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
  camera.position.set(0, 40, 70);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 10;
  controls.maxDistance = 200;
  // Estrelas de fundo
  const starVertices = Array.from({ length: 15000 }, () => THREE.MathUtils.randFloatSpread(2000));
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })));
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const celestialObjects = new Map();
  const orbitalStates = new Map();
  SOLAR_SYSTEM_DATA.forEach((data, id) => {
    const material = data.isStar ? new THREE.MeshBasicMaterial({ color: data.color }) : new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.6 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.radius, 32, 32), material);
    scene.add(mesh);
    celestialObjects.set(id, mesh);
    if (data.isStar) scene.add(new THREE.PointLight(0xffddaa, 2.5, 1000));
    if (data.orbit) {
      orbitalStates.set(id, { angle: Math.random() * Math.PI * 2, speed: OrbitalMechanics.calculateSpeed(data.orbit.period) });
      const orbitLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(Array.from({ length: 129 }, (_, i) => {
          const theta = (i / 128) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(theta) * data.orbit.radius, 0, Math.sin(theta) * data.orbit.radius);
        })),
        new THREE.LineBasicMaterial({ color: data.color, transparent: true, opacity: 0.4 })
      );
      if (data.orbit.center && celestialObjects.get(data.orbit.center)) celestialObjects.get(data.orbit.center).add(orbitLine);
      else scene.add(orbitLine);
    }
  });
  let running = true;
  let targetObject = celestialObjects.get('sun');
  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    orbitalStates.forEach((state, id) => {
      state.angle += state.speed;
      const data = SOLAR_SYSTEM_DATA.get(id);
      const object = celestialObjects.get(id);
      if (data && object) {
        let position = OrbitalMechanics.calculatePosition(state.angle, data.orbit.radius);
        if (data.orbit.center) {
          const centerObject = celestialObjects.get(data.orbit.center);
          if (centerObject) position.add(centerObject.position);
        }
        object.position.copy(position);
      }
    });
    celestialObjects.forEach(obj => { obj.rotation.y += 0.005; });
    if (targetObject) controls.target.lerp(targetObject.position, 0.1);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
  const onResize = () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', onResize);
  return {
    stop: () => {
      running = false;
      window.removeEventListener('resize', onResize);
      if (container && renderer.domElement && renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      renderer.dispose();
      controls.dispose();
    },
    setCameraTarget: (targetName) => {
      const newTarget = celestialObjects.get(targetName);
      if (newTarget) targetObject = newTarget;
    }
  };
}

const OrbitWidget = () => {
  // Referência direta para a DIV (substitui o getElementById)
  const containerRef = useRef(null);
  // Referência para a instância da simulação (Three.js/Physics)
  const simRef = useRef(null);

  const [target, setTarget] = useState('sun');

  // Efeito para montar a simulação
  useEffect(() => {
    // No Next.js/React, usamos o .current da referência
    if (containerRef.current) {
      simRef.current = mountPhysicsOrbitSystem(containerRef.current);
    }

    // Cleanup: limpa a memória ao fechar a página ou remover o componente
    return () => {
      if (simRef.current?.stop) simRef.current.stop();
    };
  }, []);

  // Efeito para atualizar a câmera quando o target mudar
  useEffect(() => {
    if (simRef.current?.setCameraTarget) {
      simRef.current.setCameraTarget(target);
    }
  }, [target]);

  return html`
    <div className="w-full h-full relative">
      <!-- Usamos ref em vez de ID para garantir que o React gerencie o elemento -->
      <div 
        ref=${containerRef} 
        className="w-full h-full absolute top-0 left-0"
      ></div>
      
      <div className="absolute top-2 left-2 md:top-4 md:left-4 glass-panel !p-1 md:!p-2 flex gap-1 md:gap-2">
        <button 
          onClick=${() => setTarget('sun')} 
          className=${`px-2 py-1 rounded-md md:px-3 text-xs md:text-sm transition ${target === 'sun' ? 'bg-cyan-500 text-black font-semibold' : 'bg-black/40 hover:bg-black/60'}`}
        >
          Visão: Sol ☀️
        </button>
        <button 
          onClick=${() => setTarget('earth')} 
          className=${`px-2 py-1 rounded-md md:px-3 text-xs md:text-sm transition ${target === 'earth' ? 'bg-cyan-500 text-black font-semibold' : 'bg-black/40 hover:bg-black/60'}`}
        >
          Visão: Terra 🌍
        </button>
      </div>
    </div>
  `;
};

// ---------------------------------------------------------------------
// 5.4 HabitTrackerWidget
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
  const xpPercentage = (player.xp / player.xpToNextLevel) * 100;
  return html`
    <div className=${`p-4 rounded-lg mb-6 ${isSuperSaiyan ? 'bg-yellow-400/10 border-yellow-500' : 'bg-gray-800/50 border-gray-700'} border`}>
      <div className="flex items-center space-x-4 mb-4">
        <img src=${player.avatar} alt="Player Avatar" className="w-16 h-16 rounded-full border-2 border-gray-700"/>
        <div className="flex-1">
          <p className="font-bold text-lg">${player.name}</p>
          <p className=${`text-sm ${isSuperSaiyan ? 'text-yellow-300' : 'text-blue-300'} font-semibold`}>${status}</p>
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
  const buttonClass = `px-4 py-1 text-sm font-bold rounded-md transition-transform transform hover:scale-105 ${habit.completed ? 'opacity-50 cursor-not-allowed' : ''}`;
  return html`
    <div className=${`bg-gray-800 p-4 rounded-lg flex items-center justify-between ${habit.completed ? "opacity-50 line-through" : ""}`}>
      <div className="flex items-center space-x-3 flex-grow">
        <span className="text-2xl">${habit.icon}</span>
        <div>
          <div>${habit.text}</div>
          ${habit.lastCompleted && html`<div className="text-xs text-gray-400">Completado: ${habit.lastCompleted}</div>`}
        </div>
      </div>
      ${habit.type === 'good' ? html`
        <button onClick=${() => onComplete(habit)} disabled=${habit.completed} className=${`${buttonClass} ${isSuperSaiyan ? 'bg-yellow-400 hover:bg-yellow-300 text-yellow-900' : 'bg-green-400 hover:bg-green-300 text-green-900'}`}>
          +${habit.xp} XP
        </button>
      ` : html`
        <button onClick=${() => onComplete(habit)} disabled=${habit.completed} className=${`${buttonClass} bg-red-500 hover:bg-red-400 text-red-900`}>
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <form onSubmit=${handleSubmit} className="bg-gray-800 p-6 rounded-lg w-full max-w-sm">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold">Adicionar Novo Hábito</h3>
          <button type="button" onClick=${onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        <input type="text" value=${text} onChange=${(e) => setText(e.target.value)} placeholder="Ex: Meditar por 10 minutos" className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3" autoFocus />
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="good" checked=${type === 'good'} onChange=${(e) => setType(e.target.value)} className="text-green-500 bg-gray-700" />
            <span>Bom Hábito</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="bad" checked=${type === 'bad'} onChange=${(e) => setType(e.target.value)} className="text-red-500 bg-gray-700" />
            <span>Mau Hábito</span>
          </label>
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick=${onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 transition-colors">Adicionar</button>
        </div>
      </form>
    </div>
  `;
};

const HabitCompletionModal = ({ habit, player, onClose, isSuperSaiyan }) => {
  if (!habit) return null;
  return html`
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50" onClick=${onClose}>
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl" onClick=${e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">Tarefa realizada!</h2>
            <p className="text-gray-400 flex items-center mt-1"><span className="text-xl mr-2">${habit.icon}</span>${habit.text}</p>
          </div>
          <button onClick=${onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        <div className=${`p-4 rounded-md mb-4 ${isSuperSaiyan ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
          <p className="font-semibold">${player.name}</p>
          <div className="flex items-center space-x-2 text-green-400">
            <p>+${habit.xp} XP</p>
            ${isSuperSaiyan && html`<span className="text-yellow-300 font-bold animate-pulse">SUPER SAIYAN MODE!</span>`}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Habilidades melhoradas:</h3>
          <div className="space-y-2">
            ${[
      { name: 'Força', xp: (habit.xp * 0.3).toFixed(2) },
      { name: 'Inteligência', xp: (habit.xp * 0.2).toFixed(2) },
      { name: 'Disciplina', xp: (habit.xp * 0.4).toFixed(2) }
    ].map(char => html`
              <div key=${char.name} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                <div>
                  <p>${char.name}</p>
                  <p className="text-sm text-green-400">+${char.xp} XP</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">
                  ${Math.floor(Math.random() * 5 + 1)}
                </div>
              </div>
            `)}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick=${onClose} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Continuar</button>
        </div>
      </div>
    </div>
  `;
};

const HabitsView = ({ habits, onCompleteHabit, isSuperSaiyan, handleResetDay, setShowAddHabitModal }) => html`
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-green-400">Bons Hábitos</h2>
      <button onClick=${handleResetDay} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-md">Resetar Dia</button>
    </div>
    <div className="space-y-2">
      ${habits.filter(h => h.type === 'good').map(habit => html`<${HabitItem} key=${habit.id} habit=${habit} onComplete=${onCompleteHabit} isSuperSaiyan=${isSuperSaiyan} />`)}
    </div>
    <div>
      <h2 className="text-xl font-bold mb-3 text-red-400">Maus Hábitos</h2>
      <div className="space-y-2">
        ${habits.filter(h => h.type === 'bad').map(habit => html`<${HabitItem} key=${habit.id} habit=${habit} onComplete=${onCompleteHabit} isSuperSaiyan=${isSuperSaiyan} />`)}
      </div>
    </div>
    <button onClick=${() => setShowAddHabitModal(true)} className="fixed bottom-6 right-6 bg-amber-500 hover:bg-amber-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-lg transition-transform transform hover:scale-110 z-50">+</button>
  </div>
`;

const HabitDashboardView = ({ progressData, isSuperSaiyan }) => {
  if (!progressData || progressData.length === 0) return html`<div className="bg-gray-800 rounded-lg p-6"><h2 className="text-xl font-bold mb-4">Acompanhamento Semanal</h2><p className="text-gray-400">Nenhum hábito completado esta semana ainda.</p></div>`;
  const maxCompleted = Math.max(...progressData.map(d => d.completed), 1);
  return html`
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Acompanhamento Semanal</h2>
      <div className="flex justify-between items-end h-48 space-x-1">
        ${progressData.map(data => html`
          <div key=${data.day} className="flex flex-col items-center flex-1">
            <div className="text-xs text-gray-400 mb-1">${data.completed}</div>
            <div className="w-full bg-gray-700 rounded-t-md flex-grow flex items-end relative">
              <div className=${`w-full rounded-t-md ${isSuperSaiyan ? 'bg-yellow-500' : 'bg-blue-500'}`} style=${{ height: `${(data.completed / maxCompleted) * 90}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">${data.day}</p>
          </div>
        `)}
      </div>
      <div className="mt-4 text-center text-sm text-gray-400">Hábitos completados por dia esta semana</div>
    </div>
  `;
};

const HabitSkillsView = ({ skills, isSuperSaiyan }) => html`
  <div className="bg-gray-800 rounded-lg p-6">
    <h2 className="text-xl font-bold mb-4">Minhas Habilidades</h2>
    <div className="space-y-4">
      ${skills.map(skill => html`
        <div key=${skill.name}>
          <div className="flex justify-between mb-1">
            <span className="font-semibold">${skill.name} - Nível ${skill.level}</span>
            <span className="text-sm text-gray-400">${skill.xp} / ${skill.xpToNext} XP</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className=${`h-2.5 rounded-full ${isSuperSaiyan ? 'bg-yellow-500' : 'bg-blue-500'}`} style=${{ width: `${(skill.xp / skill.xpToNext) * 100}%` }}></div>
          </div>
        </div>
      `)}
    </div>
  </div>
`;

const HabitTrackerWidget = () => {
  const initialHabits = [
    { id: 1, icon: '💪', text: 'Treinar por 30 minutos', type: 'good', xp: 25, completed: false, lastCompleted: null },
    { id: 2, icon: '📖', text: 'Ler 10 páginas de um livro', type: 'good', xp: 15, completed: false, lastCompleted: null },
    { id: 3, icon: '🍔', text: 'Comer fast-food', type: 'bad', xp: -10, completed: false, lastCompleted: null },
    { id: 4, icon: '💻', text: 'Estudar programação por 1 hora', type: 'good', xp: 20, completed: false, lastCompleted: null },
    { id: 5, icon: '📱', text: 'Ficar procrastinando nas redes sociais', type: 'bad', xp: -10, completed: false, lastCompleted: null }
  ];
  const initialPlayer = { name: "Guerreiro Z", title: "Novato", level: 1, xp: 0, xpToNextLevel: 100, avatar: "https://placehold.co/100x100/334155/e2e8f0?text=GZ" };
  const initialSkills = [
    { name: 'Força', level: 1, xp: 0, xpToNext: 100 },
    { name: 'Inteligência', level: 1, xp: 0, xpToNext: 100 },
    { name: 'Disciplina', level: 1, xp: 0, xpToNext: 100 },
    { name: 'Resiliência', level: 1, xp: 0, xpToNext: 100 }
  ];

  const [player, setPlayer] = React.useState(() => DataBaseController.get(DataBaseController.KEYS.HABIT_PLAYER, initialPlayer));
  const [habits, setHabits] = React.useState(() => {
    const saved = DataBaseController.get(DataBaseController.KEYS.HABIT_LIST, null);
    const lastReset = localStorage.getItem('lastReset');
    const today = new Date().toDateString();
    if (saved) {
      if (lastReset === today) return saved;
      localStorage.setItem('lastReset', today);
      return saved.map(h => ({ ...h, completed: false }));
    }
    localStorage.setItem('lastReset', today);
    return initialHabits;
  });
  const [skills, setSkills] = React.useState(() => DataBaseController.get(DataBaseController.KEYS.HABIT_SKILLS, initialSkills));
  const [completedHabit, setCompletedHabit] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('habitos');
  const [showAddHabitModal, setShowAddHabitModal] = React.useState(false);
  const [weeklyProgress, setWeeklyProgress] = React.useState([]);

  const isSuperSaiyan = React.useMemo(() => player.level >= 3, [player.level]);
  const status = isSuperSaiyan ? "Super Saiyan" : `Guerreiro Z Nv.${player.level}`;

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
      setPlayer(prev => ({
        ...prev,
        level: prev.level + 1,
        xp: prev.xp - prev.xpToNextLevel,
        xpToNextLevel: Math.floor(prev.xpToNextLevel * 1.5)
      }));
    }
  }, [player.xp, player.xpToNextLevel]);

  const handleCompleteHabit = (habit) => {
    const todayFormatted = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
    const updatedHabits = habits.map(h => h.id === habit.id ? { ...h, completed: true, lastCompleted: todayFormatted } : h);
    setHabits(updatedHabits);
    setPlayer(prev => ({ ...prev, xp: Math.max(0, prev.xp + habit.xp) }));
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
    localStorage.setItem('lastReset', new Date().toDateString());
    setHabits(prev => prev.map(h => ({ ...h, completed: false })));
  };

  return html`
    <div className=${`w-full h-full p-4 overflow-y-auto transition-all duration-500 ${isSuperSaiyan ? 'bg-gradient-to-br from-yellow-900/20 via-black/40 to-black/40 super-saiyan-aura rounded-xl' : ''}`}>
      <div className="max-w-2xl mx-auto pb-20">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-white">Habit Tracker - Saiyan Mode</h1>
          <div className="flex items-center space-x-6 text-gray-400 border-b-2 border-gray-700">
            <span className=${`ht-tab ${activeTab === 'habitos' ? 'ht-tab-active' : ''}`} onClick=${() => setActiveTab('habitos')}>HÁBITOS</span>
            <span className=${`ht-tab ${activeTab === 'dashboard' ? 'ht-tab-active' : ''}`} onClick=${() => setActiveTab('dashboard')}>DASHBOARD</span>
            <span className=${`ht-tab ${activeTab === 'habilidades' ? 'ht-tab-active' : ''}`} onClick=${() => setActiveTab('habilidades')}>HABILIDADES</span>
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

// ---------------------------------------------------------------------
// 5.5 ChecklistWidget, ChartWidget, MarkdownViewerWidget, MarkdownEditorWidget
// ---------------------------------------------------------------------
const ChecklistWidget = ({ tasks }) => {
  if (!tasks || tasks.length === 0) return html`<div className="flex items-center justify-center h-full text-gray-400">Nenhuma tarefa encontrada.</div>`;
  return html`
    <div className="w-full h-full p-2 md:p-6 overflow-y-auto">
      <div className="space-y-6 max-w-4xl mx-auto">
        ${tasks.map(category => html`
          <div key=${category.label} className="glass-panel !p-4 !bg-black/20">
            <h3 className="text-lg font-semibold text-cyan-300 border-b-2 border-cyan-500/20 pb-2 mb-3">${category.label}</h3>
            <ul className="space-y-2">
              ${category.items.map((item, index) => html`
                <li key=${index} className="flex items-center bg-black/30 p-3 rounded-md transition-all hover:bg-black/50">
                  <input type="checkbox" readOnly checked=${item.completed} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 cursor-not-allowed" />
                  <label className=${`ml-3 text-gray-300 ${item.completed ? 'line-through text-gray-500' : ''}`}>${item.text}</label>
                </li>
              `)}
            </ul>
          </div>
        `)}
      </div>
    </div>
  `;
};

const TasksChart = ({ data }) => {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;
    const chartInstance = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.progress),
          backgroundColor: data.map(d => d.color),
          borderColor: 'rgba(10, 10, 25, 0.8)',
          borderWidth: 4,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: { legend: { display: false } }
      }
    });
    return () => chartInstance.destroy();
  }, [data]);
  return html`<canvas ref=${canvasRef}></canvas>`;
};

const ChartWidget = ({ data }) => html`
  <div className="w-full h-full p-4 md:p-8 flex items-center justify-center">
    <div className="w-full max-w-md aspect-square">
      <${TasksChart} data=${data} />
    </div>
  </div>
`;

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
  html = html.split(/\n\n+/).map(p => {
    const t = p.trim();
    if (t.startsWith('<') || t === '') return p;
    return `<p class="text-gray-300 leading-relaxed mb-4">${t.replace(/\n/g, '<br>')}</p>`;
  }).join('');
  return html;
};

const MarkdownViewerWidget = ({ markdownText }) => {
  const htmlContent = React.useMemo(() => renderMarkdownToHTML(markdownText), [markdownText]);
  return html`<div className="w-full h-full p-4 md:p-8 overflow-y-auto markdown-view" dangerouslySetInnerHTML=${{ __html: htmlContent }}></div>`;
};

const MarkdownEditorWidget = ({ markdown, onChange }) => {
  const defaultSettings = {
    fontFamily: "'Architects Daughter', cursive",
    backgroundColor: '#1a1a1a',
    color: '#e6f7ff',
    fontSize: '16px'
  };
  const [settings, setSettings] = React.useState(() => DataBaseController.get(DataBaseController.KEYS.EDITOR_SETTINGS, defaultSettings));
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    DataBaseController.set(DataBaseController.KEYS.EDITOR_SETTINGS, newSettings);
  };
  return html`
    <div className="w-full h-full p-2 md:p-4 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-300">📝 Editor de Tarefas</h3>
          <p className="text-xs text-gray-400">Tags: __TODO, __IN_PROGRESS</p>
        </div>
        <div className="flex gap-2 bg-black/40 p-2 rounded-lg items-center flex-wrap justify-center">
          <select value=${settings.fontFamily} onChange=${(e) => updateSetting('fontFamily', e.target.value)} className="bg-gray-800 text-white text-xs p-1 rounded border border-gray-700 outline-none focus:border-cyan-500">
            <option value="'Architects Daughter', cursive">Excalidraw (Hand)</option>
            <option value="'Inter', sans-serif">Padrão (Inter)</option>
            <option value="'Fira Code', monospace">Code (Monospace)</option>
          </select>
          <input type="number" min="12" max="32" value=${parseInt(settings.fontSize)} onChange=${(e) => updateSetting('fontSize', `${e.target.value}px`)} className="w-12 bg-gray-800 text-white text-xs p-1 rounded border border-gray-700 outline-none focus:border-cyan-500" />
          <div className="relative group flex items-center gap-1 bg-gray-800 rounded px-1 border border-gray-700">
            <span className="text-xs text-gray-400">BG</span>
            <input type="color" value=${settings.backgroundColor} onChange=${(e) => updateSetting('backgroundColor', e.target.value)} className="w-5 h-5 rounded cursor-pointer border-none p-0 overflow-hidden bg-transparent" title="Cor de Fundo" />
          </div>
          <div className="relative group flex items-center gap-1 bg-gray-800 rounded px-1 border border-gray-700">
            <span className="text-xs text-gray-400">A</span>
            <input type="color" value=${settings.color} onChange=${(e) => updateSetting('color', e.target.value)} className="w-5 h-5 rounded cursor-pointer border-none p-0 overflow-hidden bg-transparent" title="Cor do Texto" />
          </div>
        </div>
      </div>
      <textarea className="w-full h-full flex-1 p-4 rounded-md markdown-editor focus:outline-none focus:ring-2 focus:ring-[var(--neon-cyan)] transition-all duration-300 shadow-inner" style=${{ fontFamily: settings.fontFamily, backgroundColor: settings.backgroundColor, color: settings.color, fontSize: settings.fontSize, lineHeight: '1.6', border: '1px solid rgba(255,255,255,0.1)' }} value=${markdown} onChange=${onChange}></textarea>
    </div>
  `;
};

// ---------------------------------------------------------------------
// 5.6 BatmanProfileWidget
// ---------------------------------------------------------------------
const BatmanProfileWidget = () => {
  const {
    profileData, activeProfileTab, setActiveProfileTab, newNote, setNewNote,
    handleAddNote, handleDeleteNote, handleUpdateGoal, getCategoryColor, getStatusColor,
    habitXP, skillLevel
  } = useBatmanProfileController();

  const [selectedExportKey, setSelectedExportKey] = React.useState(DataBaseController.KEYS.PROFILE);
  const handleExport = () => {
    const keyName = Object.keys(DataBaseController.KEYS).find(key => DataBaseController.KEYS[key] === selectedExportKey) || 'DATA';
    DataBaseController.exportToXlsx(selectedExportKey, `BatCaverna_${keyName}_${new Date().toISOString().split('T')[0]}`);
  };

  const renderInfoTab = () => html`
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <${InfoCard} title="INFORMAÇÕES">
        <table className="w-full">
          <tbody>
            ${Object.entries(profileData.basicInfo).map(([key, value]) => html`
              <tr key=${key} className="border-b border-gray-800 last:border-0">
                <td className="py-2 text-gray-400 capitalize">${key.replace(/([A-Z])/g, ' $1')}</td>
                <td className="py-2 text-right text-gray-200">${value}</td>
              </tr>
            `)}
          </tbody>
        </table>
      <//>
      <${InfoCard} title="INTEGRAÇÃO SISTÊMICA">
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-green-900/50">
            <div><div className="text-gray-400 text-xs">HABIT TRACKER</div><div className="text-green-400 font-bold text-lg">${habitXP} XP</div></div>
            <div className="text-2xl">🔥</div>
          </div>
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-blue-900/50">
            <div><div className="text-gray-400 text-xs">NÍVEL DE HABILIDADES</div><div className="text-blue-400 font-bold text-lg">LVL ${skillLevel}</div></div>
            <div className="text-2xl">⚡</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-black/30 rounded-lg border border-gray-800">
          <div className="batman-binary text-center text-sm">0101 1101 E</div>
          <div className="text-center text-xs text-gray-500 mt-1">Sincronização de Dados Ativa</div>
        </div>
      <//>
      <${InfoCard} title="ESTATÍSTICAS" className="lg:col-span-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          ${Object.entries(profileData.stats).map(([key, value]) => html`<${StatCard} key=${key} label=${key.toUpperCase()} value=${value} />`)}
        </div>
      <//>
      <${InfoCard} title="MISSÕES ATIVAS" className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${profileData.missions.map(mission => html`
            <div key=${mission.id} className="flex justify-between items-center p-3 bg-black/40 rounded-lg">
              <div><span className="text-gray-200">${mission.name}</span></div>
              <span className=${`text-xs px-3 py-1 rounded-full ${getStatusColor(mission.status)}`}>${mission.status.replace('_', ' ').toUpperCase()}</span>
            </div>
          `)}
        </div>
      <//>
    </div>
  `;

  const renderNotesTab = () => html`
    <div className="space-y-6">
      <${InfoCard} title="ADICIONAR NOTA">
        <div className="flex gap-2">
          <input type="text" value=${newNote} onChange=${e => setNewNote(e.target.value)} placeholder="Digite uma nova nota..." className="flex-1 bg-black/40 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-yellow-500" onKeyPress=${e => e.key === 'Enter' && handleAddNote()} />
          <button onClick=${handleAddNote} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition">Adicionar</button>
        </div>
      <//>
      <${InfoCard} title="NOTAS">
        <div className="space-y-4">
          ${profileData.notes.length === 0 ? html`<div className="text-center py-8 text-gray-500">Nenhuma nota encontrada</div>` : profileData.notes.map(note => html`<${NoteCard} key=${note.id} note=${note} onDelete=${handleDeleteNote} getCategoryColor=${getCategoryColor} />`)}
        </div>
      <//>
    </div>
  `;

  const renderGoalsTab = () => html`
    <div className="space-y-6">
      <${InfoCard} title="METAS">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${profileData.goals.map(goal => html`<${GoalCard} key=${goal.id} goal=${goal} onUpdate=${handleUpdateGoal} getStatusColor=${getStatusColor} />`)}
        </div>
      <//>
      <${InfoCard} title="BACKUP DE DADOS (.XLSX)">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs text-gray-400 mb-2">Selecione a Base de Dados</label>
            <select className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-yellow-500" value=${selectedExportKey} onChange=${(e) => setSelectedExportKey(e.target.value)}>
              ${Object.entries(DataBaseController.KEYS).map(([key, value]) => html`<option key=${key} value=${value}>${key}</option>`)}
            </select>
          </div>
          <button onClick=${handleExport} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition flex items-center justify-center gap-2">
            <span>📥</span> Baixar Excel
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Exporta os dados selecionados do LocalStorage para planilha Excel.</p>
      <//>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <${InfoCard} title="PROGRESSO TOTAL">
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-yellow-400">${Math.round(profileData.goals.reduce((sum, goal) => sum + goal.progress, 0) / (profileData.goals.length || 1))}%</div>
            <div className="text-sm text-gray-400 mt-2">Média de Conclusão</div>
          </div>
        <//>
        <${InfoCard} title="METAS ATIVAS">
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-yellow-400">${profileData.goals.length}</div>
            <div className="text-sm text-gray-400 mt-2">Metas em Andamento</div>
          </div>
        <//>
        <${InfoCard} title="PRÓXIMO PRAZO">
          <div className="text-center py-4">
            <div className="text-xl font-bold text-yellow-400">${profileData.goals.sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0]?.deadline || 'N/A'}</div>
            <div className="text-sm text-gray-400 mt-2">Data Limite</div>
          </div>
        <//>
      </div>
    </div>
  `;

  const renderProfileTab = () => html`
    <div className="space-y-6">
      <${InfoCard} title="PERFIL COMPLETO">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center text-2xl">🦇</div>
            <div>
              <h3 className="text-xl font-bold text-yellow-400">Bruce Wayne / Batman</h3>
              <p className="text-gray-400">O Cavaleiro das Trevas</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4">
            <h4 className="font-bold text-gray-300 mb-2">DESCRIÇÃO</h4>
            <p className="text-gray-400 leading-relaxed">Batman é o alter-ego de Bruce Wayne, um bilionário, playboy e filantropo. Após testemunhar o assassinato de seus pais quando criança, Wayne jurou vingança contra os criminosos e treinou física e intelectualmente para criar uma persona inspirada em morcegos para combater o crime em Gotham City.</p>
          </div>
        </div>
      <//>
      <${InfoCard} title="HABILIDADES">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${["Mestre em artes marciais", "Detetive especialista", "Estrategista brilhante", "Hacker e técnico", "Especialista em furtividade", "Perito em interrogatório"].map(skill => html`<div key=${skill} className="flex items-center p-3 bg-black/40 rounded-lg"><span className="text-yellow-400 mr-2">✓</span><span className="text-gray-300">${skill}</span></div>`)}
        </div>
      <//>
      <${InfoCard} title="EQUIPAMENTOS">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          ${[
      { name: "Batarang", icon: "⚔️" }, { name: "Traje", icon: "🦇" }, { name: "Cinto Utilidades", icon: "🔧" }, { name: "Batmóvel", icon: "🚗" },
      { name: "Batcomputador", icon: "💻" }, { name: "Bat-sinal", icon: "🔦" }, { name: "Batwing", icon: "✈️" }, { name: "Bat-caverna", icon: "🏰" }
    ].map(item => html`<div key=${item.name} className="text-center p-3 bg-black/40 rounded-lg"><div className="text-2xl mb-1">${item.icon}</div><div className="text-sm text-gray-300">${item.name}</div></div>`)}
        </div>
      <//>
    </div>
  `;

  return html`
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="batman-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div><h1 className="text-2xl font-bold text-yellow-400">🦇 BANCO DE DADOS - PERFIL BATMAN</h1><p className="text-gray-400 mt-1">Sistema de gerenciamento do Cavaleiro das Trevas</p></div>
            <div className="mt-4 md:mt-0 text-right"><div className="text-lg font-mono text-yellow-400">${DataBaseController.formatTime(new Date())}</div><div className="text-sm text-gray-400">${DataBaseController.formatDate(new Date())}</div></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          ${['info', 'notas', 'metas', 'perfil'].map(tab => html`<button key=${tab} onClick=${() => setActiveProfileTab(tab)} className=${`profile-tab-btn ${activeProfileTab === tab ? 'active' : ''}`}>${tab === 'info' ? '📊 Info' : tab === 'notas' ? '📝 Notas' : tab === 'metas' ? '🎯 Metas' : '🦇 Perfil'}</button>`)}
        </div>
        <div className="batman-card p-6">
          ${activeProfileTab === 'info' && renderInfoTab()}
          ${activeProfileTab === 'notas' && renderNotesTab()}
          ${activeProfileTab === 'metas' && renderGoalsTab()}
          ${activeProfileTab === 'perfil' && renderProfileTab()}
        </div>
        <div className="mt-6 text-center text-xs text-gray-600"><p>Sistema Batman © 2024. Todos os direitos reservados.</p><p>Gotham City Database v1.0</p></div>
      </div>
    </div>
  `;
};

// =====================================================================
// 6. APLICAÇÃO PRINCIPAL
// =====================================================================
const DashboardPainelPage = () => {
  const { activeView, setActiveView, currentTime, tasks, tasksMarkdown, handleMarkdownChange, handleKanbanUpdate } = useDashboardController();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const TABS = React.useMemo(() => [
    { id: 'kanban', label: '🗂️ KanbanPro' },
    { id: 'orbit', label: '🛰️ Sistema Orbital' },
    { id: 'habit-tracker', label: '🔥 Habit Tracker' },
    { id: 'perfil', label: '🦇 Perfil' },
    { id: 'skills', label: '⚡ Habilidades' },
    { id: 'checklist', label: '✅ Checklist' },
    { id: 'tasks', label: '📊 Gráfico' },
    { id: 'view-markdown', label: '📄 Visualizador' },
    { id: 'manage-tasks', label: '📝 Editor' },
  ], []);

  const activeWidget = React.useMemo(() => {
    switch (activeView) {
      case 'kanban': return html`<${KanbanWidget} tasks=${tasks} onUpdate=${handleKanbanUpdate} />`;
      case 'orbit': return html`<${OrbitWidget} />`;
      case 'habit-tracker': return html`<${HabitTrackerWidget} />`;
      case 'perfil': return html`<${BatmanProfileWidget} />`;
      case 'skills': return html`<${SkillsWidget} />`;
      case 'checklist': return html`<${ChecklistWidget} tasks=${tasks} />`;
      case 'tasks': return html`<${ChartWidget} data=${tasks} />`;
      case 'view-markdown': return html`<${MarkdownViewerWidget} markdownText=${tasksMarkdown} />`;
      case 'manage-tasks': return html`<${MarkdownEditorWidget} markdown=${tasksMarkdown} onChange=${handleMarkdownChange} />`;
      default: return html`<div className="p-4">Visualização não encontrada</div>`;
    }
  }, [activeView, tasks, tasksMarkdown, handleKanbanUpdate, handleMarkdownChange]);

  return html`
    <div className="h-dvh w-screen flex flex-col lg:flex-row gap-4 p-2 md:p-4">
      ${isDrawerOpen && html`<div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick=${() => setIsDrawerOpen(false)}></div>`}
      <aside className=${`fixed top-0 left-0 h-full w-80 max-w-full lg:static lg:h-auto lg:w-1/3 lg:max-w-md glass-panel p-4 flex flex-col gap-4 overflow-y-auto z-50 transition-transform transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <${Header} currentTime=${currentTime} />
        <div className="flex-1 min-h-0 bg-black/20 p-3 rounded-lg overflow-y-auto space-y-4">
          <${WeeklyFocus} tasks=${tasks} />
          <p>Aqui entra alguns informações pegando o Pikachu Flask API sobre o dia de hoje e requisições GET de API</p>
        </div>
        <${LinksPanel} />
        <${Footer} />
      </aside>
      <main className="h-3/5 lg:h-auto flex-1 min-h-0 lg:min-w-0 glass-panel flex flex-col p-0">
        <nav className="flex-shrink-0 border-b border-[var(--border-color)] px-2 flex items-center overflow-x-auto no-scrollbar">
          <button onClick=${() => setIsDrawerOpen(true)} className="p-2 rounded-md hover:bg-black/20 lg:hidden mr-2 text-gray-400 hover:text-white flex-shrink-0" aria-label="Abrir menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
          <div className="flex space-x-2">
            ${TABS.map(tab => html`<button key=${tab.id} onClick=${() => { setActiveView(tab.id); setIsDrawerOpen(false); }} className=${`tab-btn whitespace-nowrap ${activeView === tab.id ? 'active' : ''}`}>${tab.label}</button>`)}
          </div>
        </nav>
        <div className="flex-1 relative min-h-0">${activeWidget}</div>
      </main>
    </div>
  `;
};


// Exportações (caso necessário, mas o script já executa)
export default DashboardPainelPage;

