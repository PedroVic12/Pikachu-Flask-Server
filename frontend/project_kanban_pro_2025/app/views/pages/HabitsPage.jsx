"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Dumbbell,
  BookOpen,
  Sparkles,
  Lightbulb,
  RefreshCw,
  TrendingUp,
  Award,
  Flame,
} from "lucide-react";

const INITIAL_HABITS = [
  {
    id: "money",
    title: "One to make your Money 💰",
    description: "Trabalhar em alguma tarefa que gere renda. Projetos Tech: Chatbots, Sites, Aplicativos, automação e modelos IA.",
    count: 0,
    icon: DollarSign,
    color: "bg-emerald-500",
    textColor: "text-emerald-500",
    borderColor: "border-emerald-500/20",
    glowColor: "shadow-emerald-500/10",
  },
  {
    id: "shape",
    title: "One to keep you in shape 💪",
    description: "Treino físico Calistenia + Alongamentos + Calistenia App + Movimentos Calistênicos + Força.",
    count: 0,
    icon: Dumbbell,
    color: "bg-red-500",
    textColor: "text-red-500",
    borderColor: "border-red-500/20",
    glowColor: "shadow-red-500/10",
  },
  {
    id: "knowledge",
    title: "One to build Knowledge 🧠",
    description: "2 Disciplinas da UFF por Dia, 2 Aulas + 5 Exercícios resolvidos.",
    count: 0,
    icon: BookOpen,
    color: "bg-cyan-500",
    textColor: "text-cyan-500",
    borderColor: "border-cyan-500/20",
    glowColor: "shadow-cyan-500/10",
  },
  {
    id: "mindset",
    title: "One to Grow your Mindset ⚡",
    description: "Fazer 1 Projeto que resolva problemas e colocar em prática algo que você aprendeu hoje, tanto de programação quanto de Engenharia Elétrica.",
    count: 0,
    icon: Sparkles,
    color: "bg-amber-500",
    textColor: "text-amber-500",
    borderColor: "border-amber-500/20",
    glowColor: "shadow-amber-500/10",
  },
  {
    id: "creative",
    title: "One to Stay Creative 💡",
    description: "Ler um livro, refletir ou estudar algo de valor interno. Assistir a documentários, explorar o universo, atividades de inovação ou algo artístico.",
    count: 0,
    icon: Lightbulb,
    color: "bg-purple-500",
    textColor: "text-purple-500",
    borderColor: "border-purple-500/20",
    glowColor: "shadow-purple-500/10",
  },
];

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const maxWeeklyCount = 40;

  // Carregar dados do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("gohan_habits");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Garantir que todas as propriedades visuais sejam preservadas do objeto estático
        const merged = INITIAL_HABITS.map(h => {
          const savedHabit = parsed.find(p => p.id === h.id);
          return {
            ...h,
            count: savedHabit ? savedHabit.count : 0
          };
        });
        setHabits(merged);
      } catch (e) {
        setHabits(INITIAL_HABITS);
      }
    } else {
      setHabits(INITIAL_HABITS);
    }
    setIsLoaded(true);
  }, []);

  // Salvar no localStorage sempre que os hábitos mudarem
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("gohan_habits", JSON.stringify(habits));
    }
  }, [habits, isLoaded]);

  const totalCount = habits.reduce((sum, h) => sum + h.count, 0);

  const handleIncrement = (id) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const newCount = Math.min(h.count + 1, 15);
          
          // Triggers/Alertas motivacionais de Goku
          if (newCount === 5) {
            alert(`🔥 Incrível! Você completou 5 metas do hábito: "${h.title}". Continue firme no caminho da excelência!`);
          }
          
          const newTotal = totalCount + 1;
          if (newTotal === 25) {
            alert("🌟 Parabéns meu jovem Padawan! Você está com a energia vibrando alto! Busque a paz e equilíbrio! Que a Força esteja com você, Pedro Victor!");
          } else if (newTotal === 40) {
            alert("⚡ ESTÁ COMPLETO! Você alcançou o nível Super Sayajin nesta semana! Corpo, Mente e Espírito integrados perfeitamente!");
          }
          
          return { ...h, count: newCount };
        }
        return h;
      })
    );
  };

  const handleReset = () => {
    if (confirm("Deseja resetar o contador de hábitos para iniciar uma nova semana?")) {
      setHabits(INITIAL_HABITS);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Porcentagem geral da barra de progresso
  const progressPercent = Math.min((totalCount / maxWeeklyCount) * 100, 100);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
            Controle de Hábitos & Hobbies
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            "You only need 5 hobbies (Corpo x Mente x Espírito)" — Alcance sua melhor versão.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-900/30 rounded-lg transition-all"
        >
          <RefreshCw size={16} />
          Resetar Semana
        </button>
      </div>

      {/* Barra de Progresso Geral */}
      <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-cyan-500" size={20} />
            <span className="font-semibold text-gray-800 dark:text-gray-200">Progresso Semanal</span>
          </div>
          <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
            {totalCount} / {maxWeeklyCount} Conclusões ({Math.round(progressPercent)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          Importante cuidar das suas Habilidades (trabalho), Saúde mental (estudos), saúde emocional (relacionamentos) e saúde física (treinos)!
        </p>
      </div>

      {/* Grid de Hábitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map((h) => {
          const IconComponent = h.icon;
          const individualPercent = Math.min((h.count / 15) * 100, 100);
          return (
            <div
              key={h.id}
              className={`bg-white dark:bg-gray-800/80 border ${h.borderColor} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${h.color} bg-opacity-10 text-white ${h.textColor} shadow-sm`}>
                    <IconComponent size={24} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{h.title}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed whitespace-pre-line">
                  {h.description}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <span>Conclusões na semana (Máx: 15)</span>
                  <span className={`${h.textColor} font-bold`}>{h.count} / 15</span>
                </div>
                
                {/* Mini progress bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${h.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${individualPercent}%` }}
                  ></div>
                </div>

                <button
                  onClick={() => handleIncrement(h.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm bg-gradient-to-r ${h.id === "money" ? "from-emerald-500 to-teal-500" : h.id === "shape" ? "from-red-500 to-orange-500" : h.id === "knowledge" ? "from-cyan-500 to-blue-500" : h.id === "mindset" ? "from-amber-500 to-yellow-500" : "from-purple-500 to-pink-500"} shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
                >
                  <Flame size={16} />
                  Concluir Hoje (+1)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rodapé Motivacional */}
      <div className="text-center pt-8 border-t border-gray-100 dark:border-gray-700/50">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-semibold rounded-full shadow-sm animate-pulse">
          <Award size={18} />
          Hora de se tornar um Super Sayajin! Lindo, Inteligente e Focado!
        </div>
      </div>
    </div>
  );
}
