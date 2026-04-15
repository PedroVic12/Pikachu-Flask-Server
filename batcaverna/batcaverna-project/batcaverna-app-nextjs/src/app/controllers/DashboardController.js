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
