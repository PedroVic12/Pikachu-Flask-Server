// ---------------------------------------------------------------------
// 2.3 BatmanProfileModel – Dados do perfil (notas, metas, missões)
// ---------------------------------------------------------------------
class BatmanProfileModel {
  constructor() {
    this.profileData = {
      basicInfo: {
        nomeVerdadeiro: "Pedro Victor Rodrigues Veras",
        ocupacao: "Estudante de Eng. Elétrica na UFF, Cientista de Dados JR de Astronomia e Estagiário da PLC no ONS",
        base: "Niteroi/CG City, RJ",
        corOlhos: "Castanhos",
        corCabelo: "Preto",
        altura: "1,72 m",
        peso: "80 kg"
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
          ${['info', 'notas', 'metas', 'perfil', 'habilidades'].map(tab => html`<button key=${tab} onClick=${() => setActiveProfileTab(tab)} className=${`profile-tab-btn ${activeProfileTab === tab ? 'active' : ''}`}>${tab === 'info' ? '📊 Info' : tab === 'notas' ? '📝 Notas' : tab === 'metas' ? '🎯 Metas' : tab == "habilidades" ? '⚡ Habilidades' : ''}</button>`)
    }
        </div >
        <div className="batman-card p-6">
          ${activeProfileTab === 'info' && renderInfoTab()}
          ${activeProfileTab === 'notas' && renderNotesTab()}
          ${activeProfileTab === 'metas' && renderGoalsTab()}
          ${activeProfileTab === 'perfil' && renderProfileTab()}
          ${activeProfileTab === 'habilidades' && SkillsWidget()}
        </div>
        <div className="mt-6 text-center text-xs text-gray-600"><p>Sistema Batman © 2024. Todos os direitos reservados.</p><p>Gotham City Database v1.0</p></div>
      </div >
    </div >
  `;
};
