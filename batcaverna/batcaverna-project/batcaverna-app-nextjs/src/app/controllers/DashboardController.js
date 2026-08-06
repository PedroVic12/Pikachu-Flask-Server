"use client";

import React from 'react';
import * as XLSX from 'xlsx';

// Configurando o localstorage
const localStorageRef = typeof window !== 'undefined'
  ? window.localStorage
  : { getItem: () => null, setItem: () => null, removeItem: () => null };

// ---------------------------------------------------------------------
// 2.1 DataBaseController – Gerenciamento localStorage e exportação
// ---------------------------------------------------------------------
export class DataBaseController {
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
    const storedValue = localStorageRef.getItem(key);
    if (storedValue === null || storedValue === "null") return defaultValue;
    try {
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (e) {
      return storedValue || defaultValue;
    }
  }

  static set(key, value) {
    localStorageRef.setItem(key, JSON.stringify(value));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bat_storage_update', { detail: { key, value } }));
    }
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
      if (typeof window !== 'undefined') alert("Nenhum dado encontrado para esta chave.");
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
export class DashboardModel {
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

// ---------------------------------------------------------------------
// 3.1 useSkillsController – Gerencia habilidades, XP, rotinas
// ---------------------------------------------------------------------
export const DEFAULT_SKILLS_DATA = {
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

export function useSkillsController() {
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
export function useDashboardController() {
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
