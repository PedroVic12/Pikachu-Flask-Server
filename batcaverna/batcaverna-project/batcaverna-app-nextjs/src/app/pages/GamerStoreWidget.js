"use client";

import React, { useState, useEffect } from 'react';
import { DataBaseController } from '../controllers/DashboardController.js';
import AudioEffects from '../controllers/AudioEffects.js';

const INITIAL_STORE_DATA = {
  coins: 45,
  totalXP: 9311,
  history: [
    { id: 1, name: '1H de FIFA / EA FC', costCoins: 10, date: '2025-08-05' }
  ],
  inventory: {
    cod: 2,
    fifa: 1,
    smite: 0,
    pokemon: 1,
    cinema: 0,
    cheatmeal: 0
  }
};

const REWARD_CATALOG = [
  { id: 'cod', name: 'Call of Duty (COD)', category: 'FPS / Tiro', costCoins: 10, costXP: 500, icon: '🔫', description: '1 Hora de gameplay liberada no Call of Duty.' },
  { id: 'fifa', name: 'FIFA / EA FC', category: 'Futebol / Esporte', costCoins: 10, costXP: 500, icon: '⚽', description: '1 Hora de jogos ou Ultimate Team liberada.' },
  { id: 'smite', name: 'Smite 2', category: 'MOBA / Ação', costCoins: 8, costXP: 400, icon: '⚡', description: '1 Hora de arena dos deuses no Smite 2.' },
  { id: 'pokemon', name: 'Pokémon / RPG', category: 'Nintendo / RPG', costCoins: 8, costXP: 400, icon: '🐾', description: '1 Hora de batalhas e capturas Pokémon.' },
  { id: 'cinema', name: 'Sessão Cinema / Séries', category: 'Entretenimento', costCoins: 15, costXP: 750, icon: '🍿', description: '2 Horas de filmes, anime ou séries.' },
  { id: 'cheatmeal', name: 'Cheat Meal / Lanche', category: 'Gastronomia', costCoins: 25, costXP: 1200, icon: '🍕', description: 'Lanche especial de recompensa semanal.' }
];

export const GamerStoreWidget = () => {
  const [storeData, setStoreData] = useState(() => DataBaseController.get(DataBaseController.KEYS.GAMER_TOKENS, INITIAL_STORE_DATA));
  const [message, setMessage] = useState('');

  useEffect(() => {
    DataBaseController.set(DataBaseController.KEYS.GAMER_TOKENS, storeData);
  }, [storeData]);

  const handleRedeem = (item) => {
    if (storeData.coins < item.costCoins) {
      AudioEffects.playBadHabit();
      setMessage(`❌ Saldo insuficiente! Você precisa de $${item.costCoins} Fichas.`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    AudioEffects.playCoinSound();

    setStoreData(prev => {
      const newInventory = {
        ...prev.inventory,
        [item.id]: (prev.inventory[item.id] || 0) + 1
      };
      const newHistory = [
        { id: Date.now(), name: item.name, costCoins: item.costCoins, date: new Date().toLocaleDateString('pt-BR') },
        ...prev.history
      ];
      return {
        ...prev,
        coins: prev.coins - item.costCoins,
        inventory: newInventory,
        history: newHistory
      };
    });

    setMessage(`🎉 SUCESSO! 1 Ficha de ${item.name} resgatada para a sua Mochila Gamer!`);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleUseToken = (itemId, itemName) => {
    if ((storeData.inventory[itemId] || 0) <= 0) return;
    AudioEffects.playCoinSound();
    setStoreData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [itemId]: prev.inventory[itemId] - 1
      }
    }));
    setMessage(`⏱️ Ficha de ${itemName} ativada! Bom jogo!`);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-black/40 backdrop-blur-md rounded-2xl border border-gray-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header da Loja Gamer */}
        <div className="p-6 bg-gradient-to-r from-yellow-950/40 via-black to-yellow-950/20 rounded-2xl border border-yellow-500/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
              <span>🎮</span> LOJA DE FICHAS & RECOMPENSAS GAMER
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Troque suas Fichas $ e XP acumulados em Hábitos e Rotinas por horas de Call of Duty, EA FC, Smite 2 e Pokémon!
            </p>
          </div>
          <div className="flex items-center gap-4 bg-black/60 p-3.5 rounded-xl border border-yellow-500/50">
            <div>
              <div className="text-xs text-gray-400">SALDO DISPONÍVEL</div>
              <div className="text-2xl font-extrabold text-yellow-400 font-mono">${storeData.coins} Fichas</div>
            </div>
            <div className="text-3xl">🪙</div>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-xl text-xs md:text-sm font-bold text-center animate-bounce">
            {message}
          </div>
        )}

        {/* MOCHILA / INVENTÁRIO DO JOGADOR */}
        <div className="p-6 bg-black/50 rounded-2xl border border-gray-800">
          <h2 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
            <span>🎒</span> MOCHILA DE FICHAS ADQUIRIDAS (ESTOQUE)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {REWARD_CATALOG.map(item => {
              const count = storeData.inventory[item.id] || 0;
              return (
                <div key={item.id} className={`p-3 rounded-xl border text-center ${count > 0 ? 'bg-cyan-950/30 border-cyan-500/50' : 'bg-black/40 border-gray-800 opacity-50'}`}>
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs font-bold text-gray-200 truncate">{item.name}</div>
                  <div className="text-sm font-extrabold text-cyan-300 mt-1">{count} Restantes</div>
                  {count > 0 && (
                    <button onClick={() => handleUseToken(item.id, item.name)} className="w-full mt-2 py-1 bg-cyan-500 hover:bg-cyan-400 text-black text-[10px] font-bold rounded-lg transition">
                      Usar Ficha ⏱️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CATÁLOGO DE PRODUTOS DA LOJA GAMER */}
        <div>
          <h2 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <span>🛒</span> CATÁLOGO DE RECOMPENSAS GAMER
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REWARD_CATALOG.map(item => (
              <div key={item.id} className="p-5 bg-black/60 rounded-2xl border border-gray-800 hover:border-yellow-500/50 transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-3xl p-2 bg-black/40 rounded-xl border border-gray-800">{item.icon}</span>
                    <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-full text-[10px] font-bold">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-gray-100">{item.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500">PREÇO</div>
                    <div className="text-sm font-extrabold text-yellow-400 font-mono">${item.costCoins} Fichas</div>
                  </div>
                  <button onClick={() => handleRedeem(item)} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-xl shadow-lg transition">
                    Resgatar 🪙
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GamerStoreWidget;
