"use client";

import React, { useState } from 'react';
import htm from 'htm';
import * as XLSX from 'xlsx';
import { DataBaseController } from '../controllers/DashboardController.js';
import { InfoCard, StatCard, NoteCard, GoalCard } from '../components/UIComponents.js';
import SkillsWidget from './SkillsWidget.js';
import HabitTrackerWidget from './HabitTrackerWidget2.js';
import GamerStoreWidget from './GamerStoreWidget.js';

const html = htm.bind(React.createElement);

class HomemAranhaProfileModel {

  constructor() {
    this.profileData = {
      basicInfo: {
        nomeVerdadeiro: "Peter Parker",
        profissao: "Fotógrafo e Super-Herói",
        base: "Nova York, EUA",

      },

      poderes: [],

      habilidades: [],

      conhecimentos: [],
    }
  }
}

// ---------------------------------------------------------------------
// 2.3 BatmanProfileModel – Dados do perfil (notas, metas, missões)
// ---------------------------------------------------------------------
export class BatmanProfileModel {
  constructor() {
    this.profileData = {
      basicInfo: {
        nomeVerdadeiro: "Pedro Victor Rodrigues Veras",
        ocupacao: "Estudante de Eng. Elétrica na UFF e Estagiário no ONS",
        base: "Niteroi/CG City, RJ",
        corOlhos: "Castanhos",
        corCabelo: "Preto",
        altura: "1,72 m",
        peso: "80 kg"
      },
      poderes: [],

      habilidades: [],

      conhecimentos: [],

      progress: {
        perfis: { current: 16, total: 32, percent: 50 },
        arquivosAudio: { current: 0, total: 29, percent: 0 }
      },
      notes: [
        { id: 1, text: "Monitorar atividades da região SP e SECO com planejamento Mensal e Simulaçoes usando anaREDE e Organon", date: "2025-03-27", category: "ons" },
        { id: 2, text: "Atualizar e Verificar Sistemas: KanbanPro, Todo List, Planner diários, caderno digital, emails", date: "2024-02-04", category: "tecnologia" },
        { id: 3, text: "Treinamento de força, alongamentos e hipertrofia", date: "2024-02-03", category: "treinamento" }
      ],
      goals: [
        { id: 1, name: "Ser aprovado com nota máxima em Circuitos Digitais e Circuitos Eletricos CC", progress: 75, deadline: "2026-06-06" },
        { id: 2, name: "Vencer medos e corrigir hábitos", progress: 40, deadline: "2026-06-06" }
      ],
      stats: { forca: 70, agilidade: 80, inteligencia: 88, resistencia: 82, estrategia: 76, sigilo: 94 },
      missions: [
        { id: 1, name: "Estudos UFF: Cálculo 4 e Sistemas Digitais", status: "em_andamento" },
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

export function useBatmanProfileController() {
  const [model] = React.useState(() => new BatmanProfileModel());
  const [activeProfileTab, setActiveProfileTab] = React.useState('info');
  const [profileData, setProfileData] = React.useState(() => DataBaseController.get(DataBaseController.KEYS.PROFILE, model.getProfileData()));
  const [newNote, setNewNote] = React.useState('');
  const [habitXP, setHabitXP] = React.useState(0);
  const [skillLevel, setSkillLevel] = React.useState(0);
  const [coins, setCoins] = React.useState(45);

  React.useEffect(() => {
    const habitPlayer = DataBaseController.get(DataBaseController.KEYS.HABIT_PLAYER, { xp: 0 });
    const skills = DataBaseController.get(DataBaseController.KEYS.SKILLS, { level: 0 });
    const gamerTokens = DataBaseController.get(DataBaseController.KEYS.GAMER_TOKENS, { coins: 45 });
    setHabitXP(habitPlayer.xp || 0);
    setSkillLevel(skills.level || 0);
    setCoins(gamerTokens.coins || 45);

    const handleStorageUpdate = (e) => {
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
    skillLevel,
    coins
  };
}

// ---------------------------------------------------------------------
// 5.6 BatmanProfileWidget
// ---------------------------------------------------------------------
export const BatmanProfileWidget = () => {
  const {
    profileData, activeProfileTab, setActiveProfileTab, newNote, setNewNote,
    handleAddNote, handleDeleteNote, handleUpdateGoal, getCategoryColor, getStatusColor,
    habitXP, skillLevel, coins
  } = useBatmanProfileController();

  const [selectedExportKey, setSelectedExportKey] = useState(DataBaseController.KEYS.PROFILE);
  const [backupStatus, setBackupStatus] = useState('');

  // Exportar chave individual para Excel (.XLSX)
  const handleExportKeyXlsx = () => {
    const keyName = Object.keys(DataBaseController.KEYS).find(key => DataBaseController.KEYS[key] === selectedExportKey) || 'DATA';
    DataBaseController.exportToXlsx(selectedExportKey, `BatCaverna_${keyName}_${new Date().toISOString().split('T')[0]}`);
    setBackupStatus(`✅ Planilha Excel BatCaverna_${keyName}.xlsx baixada!`);
    setTimeout(() => setBackupStatus(''), 3000);
  };

  // Exportar Backup Completo com TODAS as chaves para Excel em multiplas abas
  const handleExportFullXlsx = () => {
    const wb = XLSX.utils.book_new();
    Object.entries(DataBaseController.KEYS).forEach(([keyName, storageKey]) => {
      const data = DataBaseController.get(storageKey, null);
      if (data) {
        let ws;
        if (Array.isArray(data)) {
          ws = XLSX.utils.json_to_sheet(data);
        } else {
          ws = XLSX.utils.json_to_sheet([data]);
        }
        XLSX.utils.book_append_sheet(wb, ws, keyName.substring(0, 30));
      }
    });
    XLSX.writeFile(wb, `BatCaverna_FULL_BACKUP_${new Date().toISOString().split('T')[0]}.xlsx`);
    setBackupStatus(`🎉 Backup Completo em Excel gerado com sucesso!`);
    setTimeout(() => setBackupStatus(''), 3000);
  };

  // Exportar Backup Completo para JSON
  const handleExportFullJson = () => {
    const fullData = {};
    Object.entries(DataBaseController.KEYS).forEach(([keyName, storageKey]) => {
      fullData[storageKey] = DataBaseController.get(storageKey, null);
    });
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

  // Importar Backup (Suporta .JSON e .XLSX)
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    if (file.name.endsWith('.json')) {
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          Object.entries(parsed).forEach(([key, value]) => {
            if (value !== undefined) {
              DataBaseController.set(key, value);
            }
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
            if (matchingKey) {
              DataBaseController.set(matchingKey, json);
            }
          });
          setBackupStatus(`✅ SUCESSO! Planilhas do Excel importadas para o LocalStorage.`);
          setTimeout(() => setBackupStatus(''), 4000);
        } catch (err) {
          setBackupStatus(`❌ Erro ao ler Excel: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setBackupStatus(`❌ Por favor selecione um arquivo .json ou .xlsx`);
    }
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
      <${InfoCard} title="INTEGRAÇÃO SISTÊMICA & GAMER WALLET">
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-green-900/50">
            <div><div className="text-gray-400 text-xs">HABIT TRACKER</div><div className="text-green-400 font-bold text-lg">${habitXP} XP</div></div>
            <div className="text-2xl">🔥</div>
          </div>
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-blue-900/50">
            <div><div className="text-gray-400 text-xs">NÍVEL DE HABILIDADES</div><div className="text-blue-400 font-bold text-lg">LVL ${skillLevel}</div></div>
            <div className="text-2xl">⚡</div>
          </div>
          <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-yellow-500/50">
            <div><div className="text-gray-400 text-xs">FICHAS PARA GAMES</div><div className="text-yellow-400 font-bold text-lg">$${coins} Fichas</div></div>
            <div className="text-2xl">🎮</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-black/30 rounded-lg border border-gray-800">
          <div className="batman-binary text-center text-sm">0101 1101 E</div>
          <div className="text-center text-xs text-gray-500 mt-1">Sincronização de Dados no LocalStorage Ativa</div>
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

      {/* CENTRAL DE BACKUP COMPLETO (IMPORT / EXPORT EXCEL & JSON) */}
      <${InfoCard} title="💾 CENTRAL DE BACKUP DO LOCALSTORAGE (IMPORTAR / EXPORTAR EXCEL & JSON)">
        <div className="space-y-4">

          {backupStatus && (
            <div className="p-3 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg text-xs font-semibold animate-pulse">
              ${backupStatus}
            </div>
          )}

          {/* Exportação Individual e Completa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-800 pb-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Exportar Tabela Individual</label>
              <select className="w-full bg-black/40 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 text-xs focus:outline-none focus:border-yellow-500" value=${selectedExportKey} onChange=${(e) => setSelectedExportKey(e.target.value)}>
                ${Object.entries(DataBaseController.KEYS).map(([key, value]) => html`<option key=${key} value=${value}>${key} (${value})</option>`)}
              </select>
              <button onClick=${handleExportKeyXlsx} className="w-full mt-2 bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1">
                <span>📥</span> Baixar Chave (.XLSX)
              </button>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Backup Completo (Excel Multi-Abas)</label>
              <button onClick=${handleExportFullXlsx} className="w-full mt-7 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2">
                <span>📊</span> Baixar Tudo em Excel (.XLSX)
              </button>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Backup Completo (Arquivo JSON)</label>
              <button onClick=${handleExportFullJson} className="w-full mt-7 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2">
                <span>📦</span> Baixar Backup JSON
              </button>
            </div>
          </div>

          {/* Importação de Arquivos */}
          <div>
            <label className="block text-xs text-yellow-400 font-bold mb-2">📤 Restaurar ou Importar Dados (.XLSX ou .JSON)</label>
            <input type="file" accept=".json, .xlsx, .xls" onChange=${handleImportFile} className="w-full bg-black/50 border border-yellow-500/40 rounded-lg p-2 text-xs text-gray-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400 cursor-pointer" />
            <p className="text-xs text-gray-500 mt-2">
              Envie um arquivo de backup .json ou .xlsx para carregar imediatamente no LocalStorage seus Hábitos, XP, Skills e Fichas Gamer.
            </p>
          </div>

        </div>
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
              <h3 className="text-xl font-bold text-yellow-400">Bruce Wayne / Batman (Pedro Victor)</h3>
              <p className="text-gray-400">O Cavaleiro das Trevas / Eng. Elétrica UFF & ONS</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4">
            <h4 className="font-bold text-gray-300 mb-2">DESCRIÇÃO</h4>
            <p className="text-gray-400 leading-relaxed">Batman é o alter-ego de Pedro Victor, estudante de Engenharia Elétrica na UFF e estagiário no ONS. Treinado em programação, análise de SEP e rotinas de alta performance para manter o equilíbrio entre trabalho, estudo e gaming.</p>
          </div>
        </div>
      <//>
      <${InfoCard} title="HABILIDADES REGISTRADAS">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${["Lógica de Programação (Python/React)", "Análise de Sistemas Elétricos (SEP)", "Calistenia & Treinos de Força", "Gestão TDAH & Hiperfoco", "Simulações Organon/Anarede", "Desenvolvimento Tauri/Next.js"].map(skill => html`<div key=${skill} className="flex items-center p-3 bg-black/40 rounded-lg"><span className="text-yellow-400 mr-2">✓</span><span className="text-gray-300">${skill}</span></div>`)}
        </div>
      <//>
      <${InfoCard} title="EQUIPAMENTOS DE CAMPO">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          ${[
      { name: "Batcomputador", icon: "💻" }, { name: "Caderno UFF", icon: "📚" }, { name: "Dashboard ONS", icon: "⚡" }, { name: "Controle Gamer", icon: "🎮" },
      { name: "Script Python", icon: "🐍" }, { name: "Habit Tracker", icon: "🔥" }, { name: "Relógio Sol", icon: "☀️" }, { name: "Bat-caverna", icon: "🏰" }
    ].map(item => html`<div key=${item.name} className="text-center p-3 bg-black/40 rounded-lg"><div className="text-2xl mb-1">${item.icon}</div><div className="text-sm text-gray-300">${item.name}</div></div>`)}
        </div>
      <//>
    </div>
  `;

  return html`
    <div className="w-full h-full p-2 md:p-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="batman-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">🦇 BAT-CAVERNA HERO PROFILE</h1>
              <p className="text-gray-400 mt-1">Perfil do Herói, Habilidades, Hábitos e Fichas para Games</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-lg font-mono text-yellow-400">${DataBaseController.formatTime(new Date())}</div>
              <div className="text-sm text-gray-400">${DataBaseController.formatDate(new Date())}</div>
            </div>
          </div>
        </div>

        {/* Abas Integradas do Perfil do Herói */}
        <div className="flex flex-wrap gap-2 mb-6">
          ${[
      { id: 'info', label: '📊 Info' },
      { id: 'notas', label: '📝 Notas' },
      { id: 'metas', label: '🎯 Metas & Excel' },
      { id: 'habilidades', label: '⚡ Habilidades' },
      { id: 'habitos', label: '🔥 Hábitos & Rotinas' },
      { id: 'loja', label: '🎮 Loja de Fichas ($)' },
      { id: 'perfil', label: '🦇 Perfil Herói' }
    ].map(tab => html`
            <button
              key=${tab.id}
              onClick=${() => setActiveProfileTab(tab.id)}
              className=${`profile-tab-btn ${activeProfileTab === tab.id ? 'active' : ''}`}
            >
              ${tab.label}
            </button>
          `)}
        </div>

        <div className="batman-card p-4 md:p-6">
          ${activeProfileTab === 'info' && renderInfoTab()}
          ${activeProfileTab === 'notas' && renderNotesTab()}
          ${activeProfileTab === 'metas' && renderGoalsTab()}
          ${activeProfileTab === 'habilidades' && html`<${SkillsWidget} />`}
          ${activeProfileTab === 'habitos' && html`<${HabitTrackerWidget} />`}
          ${activeProfileTab === 'loja' && html`<${GamerStoreWidget} />`}
          ${activeProfileTab === 'perfil' && renderProfileTab()}
        </div>

        <div className="mt-6 text-center text-xs text-gray-600">
          <p>Sistema BatCaverna PVRV © 2026. Todos os direitos reservados.</p>
          <p>Gotham City & UFF/ONS Database v2.0</p>
        </div>
      </div>
    </div>
  `;
};

export default BatmanProfileWidget;
