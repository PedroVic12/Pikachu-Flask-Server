"use client";

import { DataBaseController } from './DashboardController.js';

// Key constante para o LocalStorage
export const GAMER_HEROES_STORAGE_KEY = 'bat_gamer_heroes_v1';

// Initial Seed Data para os 4 Heróis do Multiverso
export const INITIAL_HEROES_DATA = {
  batman: {
    heroId: "batman",
    heroName: "Batman",
    alterEgo: "Bruce Wayne / Pedro Victor",
    heroClass: "Mestre Tático & Investigador da Batcaverna",
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    wallpaper: "/batman-wallpaper.jpg",
    themeColor: "text-yellow-400",
    accentBorder: "border-yellow-500/50",
    bgGradient: "from-yellow-950/30 via-black/80 to-black",
    stats: { forca: 70, agilidade: 80, inteligencia: 88, resistencia: 82, estrategia: 76, sigilo: 94 },
    basicInfo: {
      nomeVerdadeiro: "Pedro Victor Rodrigues Veras",
      ocupacao: "Estudante de Eng. Elétrica na UFF e Estagiário no ONS",
      base: "Niterói / CG City, RJ",
      corOlhos: "Castanhos",
      corCabelo: "Preto",
      altura: "1,72 m",
      peso: "80 kg"
    },
    poderes: ["Dinheiro Infinito", "Habilidades de Investigação", "Treinamento em Artes Marciais", "Mestre em Tática"],
    habilidades: ["Agilidade", "Força", "Inteligência", "Estratégia", "Sigilo", "Resistência"],
    conhecimentos: ["A Arte da Guerra", "Investigação Criminal", "Programação Desktop", "Hacking", "Cyber Segurança", "Python Scripts", "Sistemas Operacionais (C++ / Rust)"],
    quests: [
      { id: "batman_1", text: "🦇 Patrulha Noturna: Organizar KanbanPro e Checklist", xp: 30, coins: 5, completed: false },
      { id: "batman_2", text: "⚡ Simulação SEP no ANAREDE / Organon (ONS)", xp: 40, coins: 10, completed: false },
      { id: "batman_3", text: "💪 Treino de Força & Calistenia na Batcaverna", xp: 25, coins: 5, completed: false },
      { id: "batman_4", text: "🐍 Script Python para Automação de Tarefas", xp: 35, coins: 8, completed: false }
    ]
  },
  spiderman: {
    heroId: "spiderman",
    heroName: "Homem-Aranha",
    alterEgo: "Peter Parker",
    heroClass: "Vibe Coder & Biocientista Arachnídeo",
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    wallpaper: "/homem-aranha-wallpaper.jpg",
    themeColor: "text-red-500",
    accentBorder: "border-red-500/50",
    bgGradient: "from-red-950/40 via-black/80 to-black",
    stats: { forca: 85, agilidade: 98, inteligencia: 92, resistencia: 80, estrategia: 85, sigilo: 88 },
    basicInfo: {
      nomeVerdadeiro: "Peter Parker",
      profissao: "Fotógrafo, Cientista e Super-Herói",
      base: "Nova York, EUA",
      corOlhos: "Castanhos",
      corCabelo: "Castanho",
      altura: "1,78 m",
      peso: "75 kg"
    },
    poderes: ["Super força", "Agilidade sobre-humana", "Sentido Aranha (Sentidos aranhas)", "DNA Arquinidiano", "Fluidos de teias"],
    habilidades: ["Fotografia", "Ciência e Tecnologia", "Combate Corpo a Corpo", "Acrobacias", "Engenharia"],
    conhecimentos: ["Física Quântica", "Química", "Biologia", "Engenharia Elétrica", "Tecnologia", "Robótica", "Vibe Coding"],
    quests: [
      { id: "spidey_1", text: "🕸️ Sessão Vibe Coding em Python/React", xp: 35, coins: 8, completed: false },
      { id: "spidey_2", text: "🔬 Estudo de Física Quântica & Engenharia", xp: 30, coins: 5, completed: false },
      { id: "spidey_3", text: "📸 Registro Fotográfico & Documentação de Código", xp: 20, coins: 5, completed: false },
      { id: "spidey_4", text: "⚡ Desenvolvimento de Novo Gadget Tech", xp: 40, coins: 10, completed: false }
    ]
  },
  gohan: {
    heroId: "gohan",
    heroName: "Son Gohan (Beast)",
    alterEgo: "Guerreiro Z",
    heroClass: "Saiyan Scholar (Estudioso & Potencial Oculto)",
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    wallpaper: "/gohan-wallpaper.jpg",
    themeColor: "text-purple-400",
    accentBorder: "border-purple-500/50",
    bgGradient: "from-purple-950/40 via-black/80 to-black",
    stats: { forca: 96, agilidade: 92, inteligencia: 95, resistencia: 90, estrategia: 88, sigilo: 80 },
    basicInfo: {
      nomeVerdadeiro: "Son Gohan",
      profissao: "Pesquisador Científico e Guerreiro Z",
      base: "Distrito 43 / Montanhas Paozu",
      corOlhos: "Pretos / Vermelhos (Beast)",
      corCabelo: "Preto / Prateado",
      altura: "1,76 m",
      peso: "80 kg"
    },
    poderes: ["Transformação Beast", "Kamehameha", "Masenko", "Sentimento de Proteção", "Ki Infinito"],
    habilidades: ["Pesquisa Entomológica", "Estudo Acadêmico", "Artes Marciais", "Hiperfoco Saiyajin"],
    conhecimentos: ["Biologia", "Física de Partículas", "Filosofia Z", "Estratégia de Combate"],
    quests: [
      { id: "gohan_1", text: "🐉 Sala do Tempo: 2 Horas de Hiperfoco UFF", xp: 50, coins: 12, completed: false },
      { id: "gohan_2", text: "📖 Leitura de Artigo Científico / Caderno Quarto .QMD", xp: 30, coins: 6, completed: false },
      { id: "gohan_3", text: "🔥 Despertar do Potencial Oculto (Estudo sem distrações)", xp: 40, coins: 10, completed: false },
      { id: "gohan_4", text: "⚡ Treino Intensivo de Ki com Piccolo", xp: 45, coins: 10, completed: false }
    ]
  },
  witcher: {
    heroId: "witcher",
    heroName: "Geralt de Rívia",
    alterEgo: "The Witcher (O Bruxo)",
    heroClass: "Mestre Caçador & Alquimista de Kaer Morhen",
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    wallpaper: "/the-witcher-background.jpg",
    themeColor: "text-amber-400",
    accentBorder: "border-amber-500/50",
    bgGradient: "from-amber-950/40 via-black/80 to-black",
    stats: { forca: 88, agilidade: 90, inteligencia: 86, resistencia: 95, estrategia: 92, sigilo: 84 },
    basicInfo: {
      nomeVerdadeiro: "Geralt de Rívia",
      profissao: "Caçador de Monstros e Alquimista",
      base: "Kaer Morhen / Continente",
      corOlhos: "Amarelos Felinos",
      corCabelo: "Branco Prateado",
      altura: "1,85 m",
      peso: "85 kg"
    },
    poderes: ["Sinais de Bruxaria (Aard, Igni, Quen, Axii, Yrden)", "Visão Noturna", "Metabolismo Mutante", "Reflexos Sobrenaturais"],
    habilidades: ["Alquimia", "Esgrima Dupla", "Rastreamento", "Resistência a Toxinas"],
    conhecimentos: ["Botânica de Ervas", "Bestiário", "Estratégia de Contratos", "Preparação de Elixires"],
    quests: [
      { id: "witcher_1", text: "⚔️ Caça aos Maus Hábitos: Eliminar Procrastinação", xp: 35, coins: 8, completed: false },
      { id: "witcher_2", text: "🧪 Alquimia da Saúde: Beber 2L de Água & Dieta", xp: 25, coins: 5, completed: false },
      { id: "witcher_3", text: "📜 Contrato UFF: Resolver Exercícios e Provas Antigas", xp: 45, coins: 10, completed: false },
      { id: "witcher_4", text: "🐺 Preparação de Elixires de Foco na Batcaverna", xp: 30, coins: 6, completed: false }
    ]
  }
};

// ---------------------------------------------------------------------
// CLASSE PRINCIPAL: GamerTrafficHeroesController
// ---------------------------------------------------------------------
export class GamerTrafficHeroesController {
  constructor() {
    this.heroesData = this.loadFromStorage();
  }

  // Carrega do LocalStorage ou Inicializa com os Dados Iniciais em Código
  loadFromStorage() {
    if (typeof window === 'undefined') return INITIAL_HEROES_DATA;
    try {
      const saved = localStorage.getItem(GAMER_HEROES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge seguro garantindo que novos heróis ou novas propriedades existam
        return {
          ...INITIAL_HEROES_DATA,
          ...parsed
        };
      }
    } catch (e) {
      console.error("Erro ao carregar GamerTrafficHeroes do LocalStorage:", e);
    }
    return INITIAL_HEROES_DATA;
  }

  // Salva no LocalStorage e Notifica Ouvintes
  saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GAMER_HEROES_STORAGE_KEY, JSON.stringify(this.heroesData));
      window.dispatchEvent(new CustomEvent('bat_storage_update', {
        detail: { key: GAMER_HEROES_STORAGE_KEY, value: this.heroesData }
      }));
    } catch (e) {
      console.error("Erro ao salvar GamerTrafficHeroes no LocalStorage:", e);
    }
  }

  // Obtém todos os Heróis
  getHeroes() {
    return this.heroesData;
  }

  // Obtém um Herói específico
  getHero(heroId) {
    return this.heroesData[heroId] || this.heroesData.batman;
  }

  // Conclui uma Quest do Herói, aumenta o XP e evolui de Nível se atingir meta!
  completeQuest(heroId, questId) {
    const hero = this.heroesData[heroId];
    if (!hero) return { success: false, reason: "Herói não encontrado" };

    const quest = hero.quests.find(q => q.id === questId);
    if (!quest) return { success: false, reason: "Quest não encontrada" };
    if (quest.completed) return { success: false, reason: "Quest já concluída" };

    // 1. Marca Quest como Concluída
    quest.completed = true;

    // 2. Adiciona XP ao Herói
    hero.xp += quest.xp;

    // 3. Lógica de Subir de Nível do Herói (Level Up)
    let leveledUp = false;
    let oldLevel = hero.level;

    while (hero.xp >= hero.xpToNextLevel) {
      hero.xp -= hero.xpToNextLevel;
      hero.level += 1;
      hero.xpToNextLevel = Math.floor(hero.xpToNextLevel * 1.4);
      leveledUp = true;

      // Aumenta os Atributos do Herói conforme ele sobe de nível
      if (hero.stats) {
        Object.keys(hero.stats).forEach(stat => {
          hero.stats[stat] = Math.min(100, hero.stats[stat] + 2);
        });
      }
    }

    // 4. Atualiza o XP Geral do Jogador (Habit Tracker)
    const currentHabitPlayer = DataBaseController.get(DataBaseController.KEYS.HABIT_PLAYER, { xp: 0, level: 1, xpToNextLevel: 100 });
    const updatedHabitPlayer = {
      ...currentHabitPlayer,
      xp: (currentHabitPlayer.xp || 0) + quest.xp
    };
    DataBaseController.set(DataBaseController.KEYS.HABIT_PLAYER, updatedHabitPlayer);

    // 5. Adiciona Moedas / Fichas $ para a Loja Gamer
    const currentGamerWallet = DataBaseController.get(DataBaseController.KEYS.GAMER_TOKENS, { coins: 45, history: [] });
    const updatedGamerWallet = {
      ...currentGamerWallet,
      coins: (currentGamerWallet.coins || 0) + (quest.coins || 5)
    };
    DataBaseController.set(DataBaseController.KEYS.GAMER_TOKENS, updatedGamerWallet);

    // 6. Salva as alterações
    this.saveToStorage();

    return {
      success: true,
      heroName: hero.heroName,
      xpGained: quest.xp,
      coinsGained: quest.coins,
      leveledUp,
      oldLevel,
      newLevel: hero.level
    };
  }

  // Adiciona uma Nova Quest Personalizada para o Herói
  addQuest(heroId, questText, xp = 25, coins = 5) {
    const hero = this.heroesData[heroId];
    if (!hero) return null;

    const newQuest = {
      id: `${heroId}_custom_${Date.now()}`,
      text: questText,
      xp,
      coins,
      completed: false
    };

    hero.quests.push(newQuest);
    this.saveToStorage();
    return newQuest;
  }

  // Reseta as Quests Diárias dos Heróis para poder refazê-las
  resetDailyQuests() {
    Object.keys(this.heroesData).forEach(heroId => {
      this.heroesData[heroId].quests.forEach(quest => {
        quest.completed = false;
      });
    });
    this.saveToStorage();
  }

  // Reseta o Progresso Completo para os Dados Iniciais de Código
  resetToDefault() {
    this.heroesData = JSON.parse(JSON.stringify(INITIAL_HEROES_DATA));
    this.saveToStorage();
  }
}

// Instância Singleton do Controller
export const gamerTrafficHeroesController = new GamerTrafficHeroesController();
export default gamerTrafficHeroesController;
