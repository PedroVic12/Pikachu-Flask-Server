"use client";

import React from 'react';
import { useSkillsController } from '../controllers/DashboardController.js';

export const SkillsWidget = () => {
  const { skillsData, xpPercentage, xpToNextLevel, unlockSkill, completeRoutine, resetDailyRoutines, completeObjective } = useSkillsController();

  const SkillCategory = ({ category }) => (
    <div className="skill-card bg-black/30 p-4 rounded-lg">
      <h3 className="font-bold text-gray-200 mb-2">{category.name}</h3>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">Progresso</span>
        <span className="text-sm font-semibold">{category.unlocked}/{category.total}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div className="h-2 rounded-full xp-progress-bar" style={{ width: `${(category.unlocked / category.total) * 100}%` }}></div>
      </div>
    </div>
  );

  const UnlockedSkillCard = ({ skill }) => (
    <div className="skill-card unlocked bg-black/30 p-3 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-green-400">{skill.name}</h4>
          <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
        </div>
        <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">Nível {skill.level}/{skill.maxLevel}</span>
      </div>
    </div>
  );

  const AvailableSkillCard = ({ skill }) => {
    const canUnlock = skillsData.improvementPoints > 0 && skillsData.currentXP >= skill.xpCost && skillsData.level >= skill.requiredLevel;
    return (
      <div className={`skill-card ${canUnlock ? 'unlocked' : 'locked'} bg-black/30 p-3 rounded-lg cursor-pointer hover:bg-black/40`} onClick={() => canUnlock && unlockSkill(skill.id)}>
        <div className="flex justify-between items-start">
          <div>
            <h4 className={`font-bold ${canUnlock ? 'text-cyan-300' : 'text-gray-500'}`}>{skill.name}</h4>
            <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
          </div>
          <div className="text-right">
            <div className={`text-xs ${canUnlock ? 'text-cyan-400' : 'text-gray-500'}`}>{skill.xpCost} XP</div>
            <div className="text-xs text-gray-500 mt-1">Nível {skill.requiredLevel}+</div>
          </div>
        </div>
        {!canUnlock ? (
          <div className="text-xs text-red-400 mt-2">{skillsData.level < skill.requiredLevel ? 'Nível insuficiente' : skillsData.currentXP < skill.xpCost ? 'XP insuficiente' : 'Pontos insuficientes'}</div>
        ) : null}
      </div>
    );
  };

  const RoutineCard = ({ routine }) => (
    <div className="skill-card bg-black/30 p-3 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-200">{routine.name}</h4>
        <span className="routine-time text-xs">{routine.time}</span>
      </div>
      <ul className="space-y-1 mb-3">
        {routine.tasks.map((task, i) => <li key={i} className="text-sm text-gray-400 flex items-center"><span className="mr-2">•</span> {task}</li>)}
      </ul>
      <button onClick={() => completeRoutine(routine.id)} disabled={routine.completed} className={`w-full py-2 rounded-md text-sm font-medium transition ${routine.completed ? 'bg-green-900/30 text-green-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}`}>
        {routine.completed ? '✅ Concluído' : 'Marcar como Concluído (+250 XP)'}
      </button>
    </div>
  );

  const ObjectiveCard = ({ objective }) => (
    <div className="skill-card bg-black/30 p-3 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-gray-200">{objective.name}</h4>
          <p className="text-xs text-gray-400 mt-1">{objective.description}</p>
        </div>
        <span className="text-xs bg-cyan-900/30 text-cyan-400 px-2 py-1 rounded">+{objective.xpReward} XP</span>
      </div>
      {objective.current !== undefined ? (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progresso</span><span>{objective.current}/{objective.target}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="h-2 rounded-full xp-progress-bar" style={{ width: `${(objective.current / objective.target) * 100}%` }}></div>
          </div>
        </div>
      ) : null}
      <button onClick={() => completeObjective(objective.id)} disabled={objective.completed || (objective.current !== undefined && objective.current < objective.target)} className={`w-full py-2 rounded-md text-sm font-medium transition ${objective.completed ? 'bg-green-900/30 text-green-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
        {objective.completed ? '✅ Objetivo Concluído' : 'Reivindicar Recompensa'}
      </button>
    </div>
  );

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="glass-panel !bg-black/20 p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-cyan-300">Habilidades PVRV 🦇</h2>
            <div className="text-right">
              <div className="text-lg font-bold text-green-400">Nível {skillsData.level}</div>
              <div className="text-sm text-gray-400">{skillsData.improvementPoints} Ponto(s) de Melhoria</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-gray-300">Progresso do Nível</span>
              <span className="text-gray-300">{skillsData.currentXP}/{skillsData.totalXP} XP ({xpPercentage}%)</span>
            </div>
            <div className="w-full bg-black/40 rounded-full h-4">
              <div className="h-4 rounded-full xp-progress-bar" style={{ width: `${xpPercentage}%` }}></div>
            </div>
            <div className="text-right text-sm text-gray-400 mt-1">{xpToNextLevel} XP para o próximo nível</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {skillsData.skillCategories.map(category => <SkillCategory key={category.id} category={category} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="glass-panel !bg-black/20 p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Habilidades Desbloqueadas</h3>
              <div className="space-y-3">
                {skillsData.unlockedSkills.map(skill => <UnlockedSkillCard key={skill.id} skill={skill} />)}
              </div>
            </div>
            <div className="glass-panel !bg-black/20 p-4">
              <h3 className="text-lg font-semibold text-cyan-300 mb-3">🆕 Habilidades Disponíveis</h3>
              <p className="text-sm text-gray-400 mb-3">Clique em uma habilidade para desbloquear usando pontos de melhoria</p>
              <div className="space-y-3">
                {skillsData.availableSkills.map(skill => <AvailableSkillCard key={skill.id} skill={skill} />)}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="glass-panel !bg-black/20 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-yellow-400">📅 Rotinas Diárias</h3>
                <button onClick={resetDailyRoutines} className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">Resetar Rotinas</button>
              </div>
              <div className="space-y-3">
                {skillsData.dailyRoutines.map(routine => <RoutineCard key={routine.id} routine={routine} />)}
              </div>
            </div>
            <div className="glass-panel !bg-black/20 p-4">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">🎯 Objetivos</h3>
              <div className="space-y-3">
                {skillsData.objectives.map(obj => <ObjectiveCard key={obj.id} objective={obj} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsWidget;
