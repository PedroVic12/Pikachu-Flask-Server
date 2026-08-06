"use client";

import React, { useState, useEffect } from 'react';
import { DataBaseController } from '../controllers/DashboardController.js';

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
      setMessage(`❌ Saldo insuficiente! Você precisa de $${item.costCoins} Fichas.`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

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

    setMessage(`🎉 SUCESSO! 1 Ficha de "${item.name}" resgatada! Aproveite a jogatina.`);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleUseToken = (itemId, itemName) => {
    if ((storeData.inventory[itemId] || 0) <= 0) return;
    setStoreData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [itemId]: prev.inventory[itemId] - 1
      }
    }));
    setMessage(`🎮 Ficha ativada! 1 Hora de ${itemName} em andamento. Bom jogo!`);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header do Banco de Fichas */}
        <div className="glass-panel !bg-black/40 p-6 border border-yellow-500/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                <span>🎮</span> LOJA DE FICHAS & GAMER REWARDS
              </h2>
              <p className="text-gray-300 text-sm mt-1">
                Troque seu XP e Hábitos Saudáveis por horas de jogos (COD, FIFA, Smite 2, Pokémon)!
              </p>
            </div>

            <div className="flex items-center gap-4 bg-black/50 p-4 rounded-xl border border-yellow-500/40">
              <div className="text-center">
                <div className="text-xs text-gray-400">SALDO DE FICHAS</div>
                <div className="text-2xl font-bold text-yellow-400 font-mono">${storeData.coins}</div>
              </div>
              <div className="h-8 w-px bg-gray-700"></div>
              <div className="text-center">
                <div className="text-xs text-gray-400">FICHAS DISPONÍVEIS</div>
                <div className="text-2xl font-bold text-cyan-400 font-mono">
                  {Object.values(storeData.inventory).reduce((a, b) => a + b, 0)}
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg text-sm font-semibold animate-pulse text-center">
              {message}
            </div>
          )}
        </div>

        {/* Minha Mochila de Fichas (Fichas Prontas para Jogar) */}
        <div className="glass-panel !bg-black/20 p-5">
          <h3 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
            🎒 Minha Mochila de Jogatina (Fichas Adquiridas)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {REWARD_CATALOG.map(item => {
              const count = storeData.inventory[item.id] || 0;
              return (
                <div key={item.id} className={`p-3 rounded-lg border text-center transition-all ${count > 0 ? 'bg-cyan-950/40 border-cyan-500/50' : 'bg-black/20 border-gray-800 opacity-60'}`}>
                  <div className="text-3xl mb-1">{item.icon}</div>
                  <div className="text-xs font-bold text-gray-200 truncate">{item.name}</div>
                  <div className="text-sm font-bold text-cyan-400 my-1">{count} Horas</div>
                  <button
                    onClick={() => handleUseToken(item.id, item.name)}
                    disabled={count <= 0}
                    className={`w-full py-1 text-xs font-bold rounded transition ${count > 0 ? 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                  >
                    {count > 0 ? 'Usar Ficha ⏱️' : 'Sem Fichas'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Catálogo de Resgate de Fichas */}
        <div className="glass-panel !bg-black/20 p-5">
          <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
            🛒 Catálogo de Recompensas (Troca por Fichas $)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REWARD_CATALOG.map(item => {
              const canAfford = storeData.coins >= item.costCoins;
              return (
                <div key={item.id} className="bg-black/40 p-4 rounded-xl border border-gray-700/60 hover:border-yellow-500/60 transition flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-3xl">{item.icon}</span>
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded font-bold font-mono">
                        ${item.costCoins} Fichas
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-gray-200">{item.name}</h4>
                    <span className="text-xs text-gray-500 block mb-2">{item.category}</span>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Ou {item.costXP} XP</span>
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${canAfford ? 'bg-yellow-500 hover:bg-yellow-400 text-black cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    >
                      <span>🛒</span> Resgatar (${item.costCoins})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GamerStoreWidget;
