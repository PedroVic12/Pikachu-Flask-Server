//! Dashboard_Controller.js

import React, { useState, useEffect, useRef, useMemo } from 'react';


// =======================================================
// ! DATA & STATE MANAGEMENT (Controllers & Models)
// =======================================================

const TASK_STORAGE_KEY = 'dashboard-tasks-v3';
const DEFAULT_TASKS_MD = `# 🦇 Projetos Bat-Caverna __IN_PROGRESS\n- [x] Iniciar BatDashboard\n- [x] Integrar simulação orbital\n- [ ] Calibrar sensores do Batmóvel\n\n# 📚 Pesquisa e Inteligência __TODO\n- [x] Analisar padrões do Coringa\n- [ ] Mapear atividades do Pinguim\n- [ ] Investigar roubo no museu de Gotham\n\n# ✅ Manutenção de Equipamentos __COMPLETED\n- [x] Polir o Bat-sinal\n- [x] Recarregar Batarangues\n- [x] Testar gancho de escalada\n\n# 🏃 Treinamento Físico\n- [ ] 100 Flexões\n- [ ] 10km de corrida\n\n# 🕵️‍♂️ Casos Abertos (Backlog) __BACKLOG\n- [ ] O mistério do Charada\n- [ ] A conspiração da Corte das Corujas`;

class StorageController {
    static get(key, defaultValue) {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    }
    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}


class DashboardModel {
    parseTasksFromMarkdown(markdown) {
        if (!markdown) return [];
        const categories = markdown.split(/^#\s+/m).slice(1);
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

            const taskLines = lines.slice(1).filter(line => line.match(/^\s*-\s*\[[ x]\]/));
            const items = taskLines.map(line => ({
                completed: !!line.match(/^\s*-\s*\[x\]/i),
                text: line.replace(/^\s*-\s*\[[ x]\]\s*/, '').trim()
            }));

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
        const moonPhases = [{ name: "Lua Nova", emoji: "🌑" }, { name: "Crescente", emoji: "🌒" }, { name: "Quarto Crescente", emoji: "🌓" }, { name: "Gibosa Crescente", emoji: "🌔" }, { name: "Lua Cheia", emoji: "🌕" }, { name: "Gibosa Minguante", emoji: "🌖" }, { name: "Quarto Minguante", emoji: "🌗" }, { name: "Minguante", emoji: "🌘" }];

        const hour = now.getHours();
        let score = 50;
        if ((hour >= 5 && hour <= 8) || (hour >= 17 && hour <= 20)) { score += 40; }
        if ((hour >= 11 && hour <= 14) || (hour >= 23 || hour <= 2)) { score += 20; }
        if (phaseIndex === 0 || phaseIndex === 4) { score += 30; }
        else if (phaseIndex === 2 || phaseIndex === 6) { score += 15; }
        score = Math.min(100, score);
        let fishingForecast;
        if (score > 85) fishingForecast = { text: "Excelente", color: "text-cyan-400" };
        else if (score > 65) fishingForecast = { text: "Bom", color: "text-green-400" };
        else if (score > 40) fishingForecast = { text: "Regular", color: "text-yellow-400" };
        else fishingForecast = { text: "Fraco", color: "text-red-400" };

        const constellationsByMonth = { 0: [{ name: "Órion", emoji: "🏹" }, { name: "Cão Maior", emoji: "🐕" }], 1: [{ name: "Gêmeos", emoji: "♊" }, { name: "Carina", emoji: "⛵️" }], 2: [{ name: "Leão", emoji: "🦁" }, { name: "Cruzeiro do Sul", emoji: "✝️" }], 3: [{ name: "Cruzeiro do Sul", emoji: "✝️" }, { name: "Virgem", emoji: "♍" }], 4: [{ name: "Centauro", emoji: "🐎" }, { name: "Balança", emoji: "⚖️" }], 5: [{ name: "Escorpião", emoji: "🦂" }, { name: "Sagitário", emoji: "♐" }], 6: [{ name: "Escorpião", emoji: "🦂" }, { name: "Águia", emoji: "🦅" }], 7: [{ name: "Sagitário", emoji: "♐" }, { name: "Capricórnio", emoji: "♑" }], 8: [{ name: "Aquário", emoji: "♒" }, { name: "Grou", emoji: "🐦" }], 9: [{ name: "Peixes", emoji: "♓" }, { name: "Fênix", emoji: "🔥" }], 10: [{ name: "Áries", emoji: "♈" }, { name: "Baleia", emoji: "🐳" }], 11: [{ name: "Touro", emoji: "🐂" }, { name: "Órion", emoji: "🏹" }] };

        return {
            moonPhase: moonPhases[phaseIndex],
            fishingForecast,
            constellations: constellationsByMonth[now.getMonth()] || []
        };
    }
}

export function useDashboardController() {
    const model = useMemo(() => new DashboardModel(), []);
    const [activeView, setActiveView] = useState('checklist');
    const [currentTime, setCurrentTime] = useState('');
    const [astroData, setAstroData] = useState({ moonPhase: {}, fishingForecast: {}, constellations: [] });
    const [tasksMarkdown, setTasksMarkdown] = useState(() => StorageController.get(TASK_STORAGE_KEY, DEFAULT_TASKS_MD));
    const tasks = useMemo(() => model.parseTasksFromMarkdown(tasksMarkdown), [tasksMarkdown, model]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('pt-BR'));
            setAstroData(model.getAstroData());
        }, 1000);
        setCurrentTime(new Date().toLocaleTimeString('pt-BR'));
        setAstroData(model.getAstroData());
        return () => clearInterval(intervalId);
    }, [model]);

    const handleMarkdownChange = (e) => {
        const newMarkdown = e.target.value;
        setTasksMarkdown(newMarkdown);
        StorageController.set(TASK_STORAGE_KEY, newMarkdown);
    };

    const handleKanbanUpdate = (cardLabel, newStatus) => {
        const KANBAN_TAGS_REGEX = /__([A-Z_]+)$/;
        const lines = tasksMarkdown.split('\n');
        const categoryIndex = lines.findIndex(line => line.trim().startsWith(`# ${cardLabel}`));

        if (categoryIndex !== -1) {
            let headerLine = lines[categoryIndex];
            headerLine = headerLine.replace(KANBAN_TAGS_REGEX, '').trim();
            lines[categoryIndex] = `${headerLine} __${newStatus}`;

            const newMarkdown = lines.join('\n');
            setTasksMarkdown(newMarkdown);
            StorageController.set(TASK_STORAGE_KEY, newMarkdown);
        }
    };

    return { activeView, setActiveView, currentTime, ...astroData, tasks, tasksMarkdown, handleMarkdownChange, handleKanbanUpdate };
}
