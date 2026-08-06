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
