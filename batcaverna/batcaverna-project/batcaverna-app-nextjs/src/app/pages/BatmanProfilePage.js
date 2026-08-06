"use client";

import React, { useState, useEffect } from 'react';
import htm from 'htm';
import * as XLSX from 'xlsx';
import { DataBaseController } from '../controllers/DashboardController.js';
import gamerTrafficHeroesController, { GAMER_HEROES_STORAGE_KEY } from '../controllers/gamer-traffic-heroes.js';
import { InfoCard, StatCard, NoteCard, GoalCard } from '../components/UIComponents.js';
import SkillsWidget from './SkillsWidget.js';
import HabitTrackerWidget from './HabitTrackerWidget2.js';
import GamerStoreWidget from './GamerStoreWidget.js';

const html = htm.bind(React.createElement);

// ---------------------------------------------------------------------
// CONTROLLER UNIFICADO DO PERFIL E MULTIVERSO DE HERÓIS
// ---------------------------------------------------------------------
export function useBatmanProfileController() {
  const [selectedHeroId, setSelectedHeroId] = useState('batman');
  const [activeProfileTab, setActiveProfileTab] = useState('info');
  
  const [heroes, setHeroes] = useState(() => gamerTrafficHeroesController.getHeroes());
  const [profileData, setProfileData] = useState(() => DataBaseController.get(DataBaseController.KEYS.PROFILE, heroes.batman));
  const [levelUpMessage, setLevelUpMessage] = useState('');

  const [newNote, setNewNote] = useState('');
  const [newQuestText, setNewQuestText] = useState('');
  const [habitXP, setHabitXP] = useState(0);
  const [skillLevel, setSkillLevel] = useState(0);
  const [coins, setCoins] = useState(45);

  useEffect(() => {
    const habitPlayer = DataBaseController.get(DataBaseController.KEYS.HABIT_PLAYER, { xp: 0 });
    const skills = DataBaseController.get(DataBaseController.KEYS.SKILLS, { level: 0 });
    const gamerTokens = DataBaseController.get(DataBaseController.KEYS.GAMER_TOKENS, { coins: 45 });
    setHabitXP(habitPlayer.xp || 0);
    setSkillLevel(skills.level || 0);
    setCoins(gamerTokens.coins || 45);

    const handleStorageUpdate = (e) => {
      if (e.detail.key === GAMER_HEROES_STORAGE_KEY) {
        setHeroes(gamerTrafficHeroesController.getHeroes());
      }
      if (e.detail.key === DataBaseController.KEYS.HABIT_PLAYER) setHabitXP(e.detail.value?.xp || 0);
      if (e.detail.key === DataBaseController.KEYS.SKILLS) setSkillLevel(e.detail.value?.level || 0);
      if (e.detail.key === DataBaseController.KEYS.GAMER_TOKENS) setCoins(e.detail.value?.coins || 0);
      if (e.detail.key === DataBaseController.KEYS.PROFILE) setProfileData(e.detail.value);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('bat_storage_update', handleStorageUpdate);
      return () => window.removeEventListener('bat_storage_update', handleStorageUpdate);
    }
  }, []);

  const currentHero = heroes[selectedHeroId] || heroes.batman;

  const handleCompleteQuest = (quest) => {
    const result = gamerTrafficHeroesController.completeQuest(selectedHeroId, quest.id);
    if (result.success) {
      setHeroes(gamerTrafficHeroesController.getHeroes());
      if (result.leveledUp) {
        setLevelUpMessage(`🎉 LEVEL UP! ${result.heroName} subiu para o Nível ${result.newLevel}! (+Atributos Aumentados)`);
        setTimeout(() => setLevelUpMessage(''), 5000);
      }
    }
  };

  const handleAddCustomQuest = () => {
    if (newQuestText.trim()) {
      gamerTrafficHeroesController.addQuest(selectedHeroId, newQuestText.trim());
      setHeroes(gamerTrafficHeroesController.getHeroes());
      setNewQuestText('');
    }
  };

  const handleResetDailyQuests = () => {
    gamerTrafficHeroesController.resetDailyQuests();
    setHeroes(gamerTrafficHeroesController.getHeroes());
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const newNoteObj = {
        id: Date.now(),
        text: newNote.trim(),
        date: new Date().toISOString().split('T')[0],
        category: "geral"
      };
      const updatedNotes = [newNoteObj, ...(profileData.notes || [])];
      const updatedProfile = { ...profileData, notes: updatedNotes };
      setProfileData(updatedProfile);
      DataBaseController.set(DataBaseController.KEYS.PROFILE, updatedProfile);
      setNewNote('');
    }
  };

  const handleDeleteNote = (noteId) => {
    const updatedNotes = (profileData.notes || []).filter(note => note.id !== noteId);
    const updatedProfile = { ...profileData, notes: updatedNotes };
    setProfileData(updatedProfile);
    DataBaseController.set(DataBaseController.KEYS.PROFILE, updatedProfile);
  };

  const handleUpdateGoal = (goalId, progress) => {
    const updatedGoals = (profileData.goals || []).map(g => g.id === goalId ? { ...g, progress } : g);
    const updatedProfile = { ...profileData, goals: updatedGoals };
    setProfileData(updatedProfile);
    DataBaseController.set(DataBaseController.KEYS.PROFILE, updatedProfile);
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
    currentHero,
    HEROES: heroes,
    selectedHeroId,
    setSelectedHeroId,
    activeProfileTab,
    setActiveProfileTab,
    newNote,
    setNewNote,
    newQuestText,
    setNewQuestText,
    handleAddCustomQuest,
    handleResetDailyQuests,
    handleAddNote,
    handleDeleteNote,
    handleUpdateGoal,
    getCategoryColor,
    getStatusColor,
    habitXP,
    skillLevel,
    coins,
    handleCompleteQuest,
    levelUpMessage
  };
}

// ---------------------------------------------------------------------
// BATMAN & MULTIVERSE HERÓIS WIDGET
// ---------------------------------------------------------------------
export const BatmanProfileWidget = () => {
  const {
    profileData, currentHero, HEROES, selectedHeroId, setSelectedHeroId, activeProfileTab, setActiveProfileTab,
    newNote, setNewNote, newQuestText, setNewQuestText, handleAddCustomQuest, handleResetDailyQuests,
    handleAddNote, handleDeleteNote, handleUpdateGoal, getCategoryColor, getStatusColor,
    habitXP, skillLevel, coins, handleCompleteQuest, levelUpMessage
  } = useBatmanProfileController();

  const [selectedExportKey, setSelectedExportKey] = useState(DataBaseController.KEYS.PROFILE);
  const [backupStatus, setBackupStatus] = useState('');

  // Parallax Scroll Effect
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = (e) => {
      if (e.target) setScrollY(e.target.scrollTop || 0);
    };
    const mainContainer = document.getElementById('hero-profile-scroll-container');
    if (mainContainer) {
      mainContainer.addEventListener('scroll', handleScroll);
      return () => mainContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleExportKeyXlsx = () => {
    const keyName = Object.keys(DataBaseController.KEYS).find(key => DataBaseController.KEYS[key] === selectedExportKey) || 'DATA';
    DataBaseController.exportToXlsx(selectedExportKey, `BatCaverna_${keyName}_${new Date().toISOString().split('T')[0]}`);
    setBackupStatus(`✅ Planilha Excel BatCaverna_${keyName}.xlsx baixada!`);
    setTimeout(() => setBackupStatus(''), 3000);
  };

  const handleExportFullXlsx = () => {
    const wb = XLSX.utils.book_new();
    Object.entries(DataBaseController.KEYS).forEach(([keyName, storageKey]) => {
      const data = DataBaseController.get(storageKey, null);
      if (data) {
        let ws = Array.isArray(data) ? XLSX.utils.json_to_sheet(data) : XLSX.utils.json_to_sheet([data]);
        XLSX.utils.book_append_sheet(wb, ws, keyName.substring(0, 30));
      }
    });
    XLSX.writeFile(wb, `BatCaverna_FULL_BACKUP_${new Date().toISOString().split('T')[0]}.xlsx`);
    setBackupStatus(`🎉 Backup Completo em Excel gerado com sucesso!`);
    setTimeout(() => setBackupStatus(''), 3000);
  };

  const handleExportFullJson = () => {
    const fullData = {};
    Object.entries(DataBaseController.KEYS).forEach(([keyName, storageKey]) => {
      fullData[storageKey] = DataBaseController.get(storageKey, null);
    });
    fullData[GAMER_HEROES_STORAGE_KEY] = gamerTrafficHeroesController.getHeroes();
    const jsonStr = JSON.stringify(fullData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BatCaverna_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupStatus(`📦 Arquivo de Backup JSON baixado!`);
    setTimeout(() => setBackupStatus(''), 3000);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    if (file.name.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          Object.entries(parsed).forEach(([key, value]) => {
            if (value !== undefined) DataBaseController.set(key, value);
          });
          setBackupStatus(`✅ SUCESSO! Dados restaurados do arquivo JSON.`);
          setTimeout(() => setBackupStatus(''), 4000);
        } catch (err) {
          setBackupStatus(`❌ Erro ao ler JSON: ${err.message}`);
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            const matchingKey = Object.values(DataBaseController.KEYS).find(k => k.toLowerCase().includes(sheetName.toLowerCase()) || sheetName.toLowerCase().includes(k.toLowerCase()));
            if (matchingKey) DataBaseController.set(matchingKey, json);
          });
          setBackupStatus(`✅ SUCESSO! Planilhas do Excel importadas para o LocalStorage.`);
          setTimeout(() => setBackupStatus(''), 4000);
        } catch (err) {
          setBackupStatus(`❌ Erro ao ler Excel: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const STUDY_MATERIALS = [
    { title: "📘 Caderno de Estudos UFF 2026 (Quarto .QMD)", type: "QMD", path: "file:///home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/PVRV/SPRINT%20ATUAL/Estudos_UFF_2026.qmd", desc: "Caderno ativo de metas, Pomodoros e referências da UFF" },
    { title: "⚡ Sinais e Sistemas Lineares (B.P. Lathi)", type: "PDF", path: "file:///home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/controle%20de%20versão/dev/Plugin%20Organon%20Notepad++/assets/referencias/B.P.%20Lathi%20-%20Sinais%20e%20Sistemas%20Lineares-Bookman%20(2006).pdf", desc: "Transformadas de Laplace, Fourier e Z em Engenharia Elétrica" },
    { title: "📊 Manual de Simulação ANAREDE (ONS)", type: "PDF", path: "file:///home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/PV%20Batcaverna%20Notes/Gerador%20de%20POSTS%20Instagram%20e%20Linkedin/ONS/Referencias/Manual-Anarede.pdf", desc: "Fluxo de Potência e simulações do Sistema Interligado Nacional" },
    { title: "🎯 Manual de Otimização FLUPOT (ONS)", type: "PDF", path: "file:///home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/PV%20Batcaverna%20Notes/Gerador%20de%20POSTS%20Instagram%20e%20Linkedin/ONS/Referencias/Manual-Flupot.pdf", desc: "Fluxo de Potência Otimizado (FPO)" },
    { title: "📄 Apresentação ONS Transformadas (PDF)", type: "PDF", path: "file:///home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/PV%20Batcaverna%20Notes/Gerador%20de%20POSTS%20Instagram%20e%20Linkedin/apresentacao_transformadas_ons.pdf", desc: "Slides de Laplace, Z e Fourier aplicados a conversores ONS" },
    { title: "📱 Post Instagram Transformadas (PDF)", type: "PDF", path: "file:///home/pedrov12/Documentos/GitHub/Jedi-CyberPunk/PV%20Batcaverna%20Notes/Gerador%20de%20POSTS%20Instagram%20e%20Linkedin/post_instagram_transformadas.pdf", desc: "Carrossel de 3 cards 9:16 gerado automaticamente via Python" }
  ];

  const renderInfoTab = () => html`
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* CARD DO HERÓI SELECIONADO & LEVEL BAR */}
      <${InfoCard} title=${`🦸 CLASSE DO HERÓI: ${currentHero.heroName.toUpperCase()}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-black/40 p-3.5 rounded-xl border border-gray-800">
            <div>
              <div className="text-xs text-gray-400">NÍVEL DO HERÓI</div>
              <div className=${`font-extrabold text-2xl ${currentHero.themeColor}`}>
                Nível ${currentHero.level}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">${currentHero.heroClass}</div>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs text-gray-400">XP DO NÍVEL</div>
              <div className="text-sm font-bold text-gray-200">${currentHero.xp} / ${currentHero.xpToNextLevel} XP</div>
            </div>
          </div>

          {/* Barra de Progresso do Nível do Herói */}
          <div className="w-full bg-gray-800 rounded-full h-3.5 border border-gray-700/60 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 transition-all duration-500 rounded-full" style=${{ width: `${Math.min(100, (currentHero.xp / currentHero.xpToNextLevel) * 100)}%` }}></div>
          </div>

          <table className="w-full">
            <tbody>
              ${Object.entries(currentHero.basicInfo || {}).map(([key, value]) => html`
                <tr key=${key} className="border-b border-gray-800/60 last:border-0">
                  <td className="py-2 text-gray-400 capitalize font-medium text-xs md:text-sm">${key.replace(/([A-Z])/g, ' $1')}</td>
                  <td className="py-2 text-right text-gray-200 font-bold text-xs md:text-sm">${value}</td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      <//>

      <${InfoCard} title="INTEGRAÇÃO SISTÊMICA & GAMER WALLET">
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-black/50 p-3.5 rounded-xl border border-green-500/30">
            <div><div className="text-gray-400 text-xs">HABIT TRACKER</div><div className="text-green-400 font-bold text-lg">${habitXP} XP</div></div>
            <div className="text-2xl">🔥</div>
          </div>
          <div className="flex justify-between items-center bg-black/50 p-3.5 rounded-xl border border-blue-500/30">
            <div><div className="text-gray-400 text-xs">NÍVEL DE HABILIDADES</div><div className="text-cyan-400 font-bold text-lg">LVL ${skillLevel}</div></div>
            <div className="text-2xl">⚡</div>
          </div>
          <div className="flex justify-between items-center bg-black/50 p-3.5 rounded-xl border border-yellow-500/30">
            <div><div className="text-gray-400 text-xs">FICHAS PARA GAMES</div><div className="text-yellow-400 font-bold text-lg">$${coins} Fichas</div></div>
            <div className="text-2xl">🎮</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-black/40 rounded-xl border border-gray-800 text-center">
          <div className="batman-binary text-xs text-yellow-400/80">0101 1101 GAMER TRAFFIC CORE ACTIVE</div>
          <div className="text-xs text-gray-500 mt-1">Sincronização gamer-traffic-heroes.js no LocalStorage</div>
        </div>
      <//>

      {/* CHECKLIST E QUESTS DO HERÓI SELECIONADO */}
      <${InfoCard} title=${`🎯 CHECKLIST DE QUESTS & TAREFAS: ${currentHero.heroName.toUpperCase()}`} className="lg:col-span-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <p className="text-xs text-gray-400">
            Conclua as tarefas exclusivas para acumular XP, subir o herói de nível e ganhar Fichas $ para a Loja Gamer!
          </p>
          <button onClick=${handleResetDailyQuests} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-bold rounded-lg transition whitespace-nowrap">
            🔄 Resetar Quests Diárias
          </button>
        </div>

        {/* Adicionar Nova Quest Personalizada */}
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value=${newQuestText} 
            onChange=${e => setNewQuestText(e.target.value)} 
            placeholder=${`Adicionar nova tarefa para ${currentHero.heroName}...`} 
            className="flex-1 bg-black/50 border border-gray-700 rounded-xl px-4 py-2 text-xs text-gray-200 focus:outline-none focus:border-yellow-500" 
            onKeyPress=${e => e.key === 'Enter' && handleAddCustomQuest()} 
          />
          <button onClick=${handleAddCustomQuest} className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-xl font-bold text-xs transition">
            + Adicionar
          </button>
        </div>

        <div className="space-y-3">
          ${(currentHero.quests || []).map(quest => {
            const isDone = quest.completed;
            return html`
              <div key=${quest.id} className=${`p-4 rounded-xl flex items-center justify-between border transition-all ${isDone ? 'bg-green-950/20 border-green-500/40 opacity-60' : 'bg-black/50 border-gray-800 hover:border-yellow-500/50'}`}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked=${isDone} onChange=${() => handleCompleteQuest(quest)} disabled=${isDone} className="w-5 h-5 rounded text-yellow-500 cursor-pointer" />
                  <div>
                    <div className=${`font-semibold text-sm ${isDone ? 'line-through text-gray-400' : 'text-gray-200'}`}>${quest.text}</div>
                    <div className="text-xs text-green-400 font-mono mt-0.5">+${quest.xp} XP Herói | +$${quest.coins} Fichas</div>
                  </div>
                </div>
                <button onClick=${() => handleCompleteQuest(quest)} disabled=${isDone} className=${`px-4 py-1.5 rounded-lg text-xs font-bold transition ${isDone ? 'bg-gray-800 text-gray-500' : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-md'}`}>
                  ${isDone ? 'Concluído ✓' : 'Concluir Quest'}
                </button>
              </div>
            `;
          })}
        </div>
      <//>

      <${InfoCard} title="ATRIBUTOS E ESTATÍSTICAS" className="lg:col-span-2">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          ${Object.entries(currentHero.stats || profileData.stats || {}).map(([key, value]) => html`<${StatCard} key=${key} label=${key.toUpperCase()} value=${value} />`)}
        </div>
      <//>
    </div>
  `;

  const renderHeroesTab = () => html`
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card Batman */}
        <div 
          onClick=${() => setSelectedHeroId('batman')}
          className=${`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${selectedHeroId === 'batman' ? 'bg-yellow-950/30 border-yellow-400 shadow-2xl scale-[1.02]' : 'bg-black/40 border-gray-800 hover:border-gray-600'}`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-3xl">🦇</div>
            <div>
              <h3 className="text-xl font-bold text-yellow-400">Batman (Nv. ${HEROES.batman.level})</h3>
              <p className="text-xs text-gray-400 font-semibold">${HEROES.batman.heroClass}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-gray-300">
            <div><strong className="text-yellow-400">Poderes:</strong> ${(HEROES.batman.poderes || []).join(', ')}</div>
            <div><strong className="text-yellow-400">Conhecimentos:</strong> ${(HEROES.batman.conhecimentos || []).join(', ')}</div>
          </div>
        </div>

        {/* Card Homem Aranha */}
        <div 
          onClick=${() => setSelectedHeroId('spiderman')}
          className=${`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${selectedHeroId === 'spiderman' ? 'bg-red-950/30 border-red-500 shadow-2xl scale-[1.02]' : 'bg-black/40 border-gray-800 hover:border-gray-600'}`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-3xl">🕷️</div>
            <div>
              <h3 className="text-xl font-bold text-red-500">Homem-Aranha (Nv. ${HEROES.spiderman.level})</h3>
              <p className="text-xs text-gray-400 font-semibold">${HEROES.spiderman.heroClass}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-gray-300">
            <div><strong className="text-red-400">Poderes:</strong> ${(HEROES.spiderman.poderes || []).join(', ')}</div>
            <div><strong className="text-red-400">Conhecimentos:</strong> ${(HEROES.spiderman.conhecimentos || []).join(', ')}</div>
          </div>
        </div>

        {/* Card Gohan Beast */}
        <div 
          onClick=${() => setSelectedHeroId('gohan')}
          className=${`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${selectedHeroId === 'gohan' ? 'bg-purple-950/30 border-purple-500 shadow-2xl scale-[1.02]' : 'bg-black/40 border-gray-800 hover:border-gray-600'}`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-3xl">🐉</div>
            <div>
              <h3 className="text-xl font-bold text-purple-400">Son Gohan (Nv. ${HEROES.gohan.level})</h3>
              <p className="text-xs text-gray-400 font-semibold">${HEROES.gohan.heroClass}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-gray-300">
            <div><strong className="text-purple-400">Poderes:</strong> ${(HEROES.gohan.poderes || []).join(', ')}</div>
            <div><strong className="text-purple-400">Conhecimentos:</strong> ${(HEROES.gohan.conhecimentos || []).join(', ')}</div>
          </div>
        </div>

        {/* Card Geralt de Rivia */}
        <div 
          onClick=${() => setSelectedHeroId('witcher')}
          className=${`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${selectedHeroId === 'witcher' ? 'bg-amber-950/30 border-amber-500 shadow-2xl scale-[1.02]' : 'bg-black/40 border-gray-800 hover:border-gray-600'}`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-3xl">⚔️</div>
            <div>
              <h3 className="text-xl font-bold text-amber-400">Geralt de Rívia (Nv. ${HEROES.witcher.level})</h3>
              <p className="text-xs text-gray-400 font-semibold">${HEROES.witcher.heroClass}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-gray-300">
            <div><strong className="text-amber-400">Poderes:</strong> ${(HEROES.witcher.poderes || []).join(', ')}</div>
            <div><strong className="text-amber-400">Conhecimentos:</strong> ${(HEROES.witcher.conhecimentos || []).join(', ')}</div>
          </div>
        </div>

      </div>
    </div>
  `;

  const renderNotesTab = () => html`
    <div className="space-y-6">
      <${InfoCard} title="ADICIONAR NOTA RÁPIDA">
        <div className="flex gap-2">
          <input type="text" value=${newNote} onChange=${e => setNewNote(e.target.value)} placeholder="Digite uma nova nota..." className="flex-1 bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-gray-200 text-sm focus:outline-none focus:border-yellow-500" onKeyPress=${e => e.key === 'Enter' && handleAddNote()} />
          <button onClick=${handleAddNote} className="bg-yellow-500 hover:bg-yellow-400 text-black px-5 py-2.5 rounded-xl font-bold text-sm transition">Adicionar</button>
        </div>
      <//>
      <${InfoCard} title="MINHAS NOTAS DE CAMPO">
        <div className="space-y-4">
          ${(profileData.notes || []).length === 0 ? html`<div className="text-center py-8 text-gray-500">Nenhuma nota encontrada</div>` : profileData.notes.map(note => html`<${NoteCard} key=${note.id} note=${note} onDelete=${handleDeleteNote} getCategoryColor=${getCategoryColor} />`)}
        </div>
      <//>
    </div>
  `;

  const renderStudyTab = () => html`
    <div className="space-y-6">
      <${InfoCard} title="📚 BIBLIOTECA DE ESTUDOS & REFERÊNCIAS UFF / ONS">
        <p className="text-xs text-gray-400 mb-4">
          Links dinâmicos em Markdown para cadernos Quarto (.qmd) e livros/relatórios técnicos em PDF.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${STUDY_MATERIALS.map(item => html`
            <div key=${item.title} className="p-4 bg-black/50 rounded-xl border border-gray-800 hover:border-yellow-500/50 transition">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-sm text-yellow-400">${item.title}</span>
                <span className=${`px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'QMD' ? 'bg-purple-900/60 text-purple-300' : 'bg-blue-900/60 text-blue-300'}`}>${item.type}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">${item.desc}</p>
              <a 
                href=${item.path} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold underline"
              >
                <span>🔗</span> Abrir Arquivo no Sistema
              </a>
            </div>
          `)}
        </div>
      <//>
    </div>
  `;

  const renderGoalsTab = () => html`
    <div className="space-y-6">
      <${InfoCard} title="METAS ATIVAS">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${(profileData.goals || []).map(goal => html`<${GoalCard} key=${goal.id} goal=${goal} onUpdate=${handleUpdateGoal} getStatusColor=${getStatusColor} />`)}
        </div>
      <//>

      <${InfoCard} title="💾 CENTRAL DE BACKUP (IMPORTAR / EXPORTAR EXCEL & JSON)">
        <div className="space-y-4">

          ${backupStatus && (
            <div className="p-3 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-xl text-xs font-semibold animate-pulse">
              ${backupStatus}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-800 pb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Exportar Tabela Individual</label>
              <select className="w-full bg-black/40 border border-gray-700 rounded-xl px-3 py-2 text-gray-200 text-xs focus:outline-none focus:border-yellow-500" value=${selectedExportKey} onChange=${(e) => setSelectedExportKey(e.target.value)}>
                ${Object.entries(DataBaseController.KEYS).map(([key, value]) => html`<option key=${key} value=${value}>${key} (${value})</option>`)}
              </select>
              <button onClick=${handleExportKeyXlsx} className="w-full mt-2 bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1">
                <span>📥</span> Baixar Chave (.XLSX)
              </button>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Backup Completo (Excel Multi-Abas)</label>
              <button onClick=${handleExportFullXlsx} className="w-full mt-7 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                <span>📊</span> Baixar Tudo em Excel (.XLSX)
              </button>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Backup Completo (Arquivo JSON)</label>
              <button onClick=${handleExportFullJson} className="w-full mt-7 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                <span>📦</span> Baixar Backup JSON
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-yellow-400 font-bold mb-2">📤 Restaurar ou Importar Dados (.XLSX ou .JSON)</label>
            <input type="file" accept=".json, .xlsx, .xls" onChange=${handleImportFile} className="w-full bg-black/50 border border-yellow-500/40 rounded-xl p-2 text-xs text-gray-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400 cursor-pointer" />
            <p className="text-xs text-gray-500 mt-2">
              Envie um arquivo de backup .json ou .xlsx para carregar imediatamente no LocalStorage seus Hábitos, XP, Skills e Fichas Gamer.
            </p>
          </div>

        </div>
      <//>
    </div>
  `;

  return html`
    <div id="hero-profile-scroll-container" className="w-full h-full overflow-y-auto relative bg-[#0a0a1a]">
      
      {/* Dynamic Parallax Hero Banner Background */}
      <div 
        className="w-full h-80 md:h-96 relative bg-cover bg-center transition-all duration-700 flex items-end p-6 md:p-10 shadow-2xl"
        style=${{
          backgroundImage: `url('${currentHero.wallpaper}')`,
          backgroundAttachment: 'fixed',
          transform: `translateY(${scrollY * 0.2}px)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-black/70 to-black/30"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between w-full max-w-7xl mx-auto gap-4">
          <div className="flex items-center gap-4">
            <div className=${`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 ${currentHero.accentBorder} bg-black/60 backdrop-blur-md flex items-center justify-center text-4xl md:text-5xl shadow-2xl`}>
              ${selectedHeroId === 'spiderman' ? '🕷️' : selectedHeroId === 'gohan' ? '🐉' : selectedHeroId === 'witcher' ? '⚔️' : '🦇'}
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">HERO LEVEL ${currentHero.level} • ${currentHero.heroClass}</span>
              <h1 className=${`text-3xl md:text-5xl font-extrabold ${currentHero.themeColor} drop-shadow-md`}>
                ${currentHero.heroName}
              </h1>
              <p className="text-gray-300 text-sm md:text-base font-semibold">
                ${currentHero.alterEgo}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-gray-700/50">
            <button
              onClick=${() => setSelectedHeroId('batman')}
              className=${`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${selectedHeroId === 'batman' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <span>🦇</span> Batman (Nv.${HEROES.batman.level})
            </button>
            <button
              onClick=${() => setSelectedHeroId('spiderman')}
              className=${`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${selectedHeroId === 'spiderman' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <span>🕷️</span> Spidey (Nv.${HEROES.spiderman.level})
            </button>
            <button
              onClick=${() => setSelectedHeroId('gohan')}
              className=${`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${selectedHeroId === 'gohan' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <span>🐉</span> Gohan (Nv.${HEROES.gohan.level})
            </button>
            <button
              onClick=${() => setSelectedHeroId('witcher')}
              className=${`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${selectedHeroId === 'witcher' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              <span>⚔️</span> Witcher (Nv.${HEROES.witcher.level})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 relative z-20">

        {/* Level Up Banner Notification */}
        ${levelUpMessage && html`
          <div className="p-4 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-black rounded-2xl font-extrabold text-center text-sm md:text-base shadow-2xl animate-bounce">
            ${levelUpMessage}
          </div>
        `}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-gray-800 shadow-xl">
          ${[
            { id: 'info', label: '📊 Info & Quests' },
            { id: 'herois', label: '🦸 Classes Multiverso' },
            { id: 'estudos', label: '📚 Materiais UFF/ONS' },
            { id: 'notas', label: '📝 Notas' },
            { id: 'metas', label: '🎯 Metas & Excel' },
            { id: 'habilidades', label: '⚡ Habilidades' },
            { id: 'habitos', label: '🔥 Hábitos & Rotinas' },
            { id: 'loja', label: '🎮 Loja de Fichas ($)' }
          ].map(tab => html`
            <button
              key=${tab.id}
              onClick=${() => setActiveProfileTab(tab.id)}
              className=${`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${activeProfileTab === tab.id ? 'bg-yellow-500 text-black shadow-md scale-105' : 'text-gray-400 hover:text-white hover:bg-black/30'}`}
            >
              ${tab.label}
            </button>
          `)}
        </div>

        {/* Active Tab Component Render */}
        <div className="glass-panel !bg-black/40 backdrop-blur-xl p-4 md:p-6 rounded-2xl border border-gray-800">
          ${activeProfileTab === 'info' && renderInfoTab()}
          ${activeProfileTab === 'herois' && renderHeroesTab()}
          ${activeProfileTab === 'estudos' && renderStudyTab()}
          ${activeProfileTab === 'notas' && renderNotesTab()}
          ${activeProfileTab === 'metas' && renderGoalsTab()}
          ${activeProfileTab === 'habilidades' && html`<${SkillsWidget} />`}
          ${activeProfileTab === 'habitos' && html`<${HabitTrackerWidget} />`}
          ${activeProfileTab === 'loja' && html`<${GamerStoreWidget} />`}
        </div>

        <footer className="text-center text-xs text-gray-500 py-6 border-t border-gray-800/60">
          <p>BatCaverna & Multiverse Hero System © 2026. Pedro Victor Rodrigues Veras (UFF / ONS).</p>
        </footer>

      </div>
    </div>
  `;
};

export default BatmanProfileWidget;
