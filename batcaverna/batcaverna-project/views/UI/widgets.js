// =======================================================
// UI COMPONENTS
// =======================================================

import React, { useState, useEffect, useRef } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);


const Header = ({ currentTime }) => {
    const now = new Date();
    const DataAtual = `${now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    return html`
        <header>
            <h1 className="text-3xl font-bold neon-text">Bat Caverna Dashboard 🦇</h1>
            <p className="text-sm text-gray-400">${DataAtual}</p>
            <div className="flex justify-between items-center mt-4">
                <h2 className="font-semibold text-gray-300">Horário Local</h2>
                <span className="font-mono text-lg bg-black/20 px-2 rounded">${currentTime}</span>
            </div>
        </header>`;
};

const WeeklyFocus = ({ tasks }) => html`
    <section className="bg-black/20 p-3 rounded-lg">
        <h2 className="font-semibold text-gray-300 mb-2">🎯 Foco da Semana</h2>
        <ul className="space-y-2">${tasks.map(task => html`
            <li key=${task.label} className="text-lg">
                <div className="flex justify-between mb-1">
                    <span className="text-gray-300">${task.label}</span>
                    <span className="text-gray-900">${task.progress}%</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style=${{ width: `${task.progress}%`, backgroundColor: task.color }}></div>
                </div>
            </li>`)}
        </ul>
    </section>`;

const AstroInfo = ({ moonPhase, fishingForecast, constellations }) => html`
    <section className="bg-black/20 p-3 rounded-lg">
        <h2 className="font-semibold text-gray-300 mb-2">🔭 Astro Info</h2>
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-400">🌙 Fase da Lua</h3>
                <div className="text-right">
                    <span className="text-2xl">${moonPhase.emoji}</span><p className="text-xs text-gray-400 font-mono">${moonPhase.name}</p>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-400">🎣 Atividade de Pesca</h3>
                <span className=${`font-bold ${fishingForecast.color}`}>${fishingForecast.text}</span>
            </div>
        </div>
    </section>`;

const LinksPanel = () => html`
    <div className="bg-black/20 p-3 rounded-lg">
        <h2 className="font-semibold text-gray-300 mb-3">🔗 Painel de Links</h2>
        <div className="flex flex-col gap-3">
            <a href="https://github.com/PedroVic12" target="_blank" rel="noopener noreferrer" className="w-full text-center px-1 py-1 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-600 transition">🌍 GitHub</a>
            <a href="PVRV/Gohan_treinamentos_2025.html" target="_blank" rel="noopener noreferrer" className="w-full text-cepx-1nter px-1 py-1 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-600 transition">Abrir aplicativo Produtividade</a>

            <!-- <button onClick=${() => alert("Função React executada!")} className="w-full px-1 py-1 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition">⚡ Executar Ação</button> -->
        </div>
    </div>`;

const Footer = () => html`
    <footer className="text-center text-xs text-gray-600 mt-auto pt-4">
        <p>BatDashboard © 2025. Todos os direitos reservados.</p>
        <p>Criado por Pedro Victor Veras</p>
    </footer>
`;

const IoTSimulator = () => {
    const chartRef = useRef(null);
    const [lastTemp, setLastTemp] = useState('--');
    const [lastLdr, setLastLdr] = useState('--');
    const [lastBtn, setLastBtn] = useState('OFF');

    useEffect(() => {
        const canvas = chartRef.current; if (!canvas) return;
        const chart = new Chart(canvas, {
            type: 'line', data: { labels: Array(15).fill(''), datasets: [{ label: 'Temperatura', data: Array(15).fill(null), borderColor: '#ffab00', backgroundColor: 'rgba(255, 171, 0, 0.1)', fill: true, tension: 0.4, yAxisID: 'y_temp' }, { label: 'Luminosidade', data: Array(15).fill(null), borderColor: '#00e5ff', backgroundColor: 'rgba(0, 229, 255, 0.1)', fill: true, tension: 0.4, yAxisID: 'y_ldr' }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.1)' } }, y_temp: { type: 'linear', position: 'left', min: 15, max: 35, ticks: { color: '#ffab00' }, grid: { color: 'rgba(255,255,255,0.1)' } }, y_ldr: { type: 'linear', position: 'right', min: 0, max: 1100, ticks: { color: '#00e5ff' }, grid: { drawOnChartArea: false } } }, plugins: { legend: { display: false } }, animation: { duration: 500 }, interaction: { intersect: false, mode: 'index' } }
        });
        const intervalId = setInterval(() => {
            const newTemp = (25 + Math.random() * 5 - 2.5).toFixed(1); const newLdr = Math.floor(Math.random() * 800 + 100);
            setLastTemp(newTemp); setLastLdr(newLdr); setLastBtn(prev => Math.random() > 0.95 ? (prev === 'ON' ? 'OFF' : 'ON') : prev);
            chart.data.labels.shift(); chart.data.labels.push(''); chart.data.datasets[0].data.shift(); chart.data.datasets[0].data.push(newTemp); chart.data.datasets[1].data.shift(); chart.data.datasets[1].data.push(newLdr); chart.update();
        }, 2000);
        return () => { clearInterval(intervalId); chart.destroy(); };
    }, []);

    return html`
        <div className="bg-black/20 p-3 rounded-lg">
            <h2 className="font-semibold text-gray-300 mb-3">📡 Simulador de Sensores IoT</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-black/30 rounded-xl p-3 text-center"><p className="text-sm text-gray-400">Temp (°C)</p><p className="text-2xl font-bold text-amber-400">${lastTemp}</p></div>
                <div className="bg-black/30 rounded-xl p-3 text-center"><p className="text-sm text-gray-400">Luz (LDR)</p><p className="text-2xl font-bold text-cyan-400">${lastLdr}</p></div>
                <div className="bg-black/30 rounded-xl p-3 text-center"><p className="text-sm text-gray-400">Botão</p><p className=${`text-2xl font-bold ${lastBtn === 'ON' ? 'text-green-400' : 'text-red-500'}`}>${lastBtn}</p></div>
            </div>
            <div className="h-36"><canvas ref=${chartRef}></canvas></div>
        </div>
    `;
};

const KanbanCard = ({ card, onDragStart }) => html`
    <div 
        draggable="true"
        onDragStart=${e => onDragStart(e, card.label)}
        className="bg-black/40 p-3 rounded-lg border border-gray-700 hover:border-cyan-400 transition cursor-grab active:cursor-grabbing">
        <h4 className="font-bold text-gray-200">${card.label}</h4>
        <p className="text-xs text-gray-400 mt-1">${card.items.filter(i => i.completed).length} / ${card.items.length} tarefas concluídas</p>
        <div className="w-full bg-black/30 rounded-full h-1.5 mt-2">
            <div className="h-1.5 rounded-full" style=${{ width: `${card.progress}%`, backgroundColor: card.color }}></div>
        </div>
    </div>`;

const KanbanColumn = ({ title, cards, status, color, onDrop, onDragStart }) => {
    const [isOver, setIsOver] = useState(false);
    const handleDragOver = (e) => { e.preventDefault(); setIsOver(true); };
    const handleDragLeave = () => setIsOver(false);
    const handleDrop = (e) => { onDrop(e, status); setIsOver(false); };

    return html`
        <div 
            onDragOver=${handleDragOver}
            onDragLeave=${handleDragLeave}
            onDrop=${handleDrop}
            className=${`flex-1 min-w-[280px] bg-black/20 rounded-lg p-3 flex flex-col transition-colors ${isOver ? 'kanban-column-drag-over' : ''}`}>
            <h3 className="font-bold text-lg px-2 pb-2 border-b-2" style=${{ borderColor: color }}>${title}</h3>
            <div className="flex-1 pt-3 space-y-3 overflow-y-auto">
                ${cards.map(card => html`<${KanbanCard} key=${card.label} card=${card} onDragStart=${onDragStart} />`)}
            </div>
        </div>`;
};

const KanbanProView = ({ tasks, onUpdate }) => {
    const onDragStart = (e, cardLabel) => {
        e.dataTransfer.setData("cardLabel", cardLabel);
    };

    const onDrop = (e, newStatus) => {
        const cardLabel = e.dataTransfer.getData("cardLabel");
        onUpdate(cardLabel, newStatus);
    };

    const columns = {
        BACKLOG: tasks.filter(t => t.status === 'BACKLOG'),
        TODO: tasks.filter(t => t.status === 'TODO'),
        IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
        COMPLETED: tasks.filter(t => t.status === 'COMPLETED')
    };
    const columnMeta = {
        BACKLOG: { title: 'BACKLOG', color: 'var(--kanban-backlog)' },
        TODO: { title: 'A FAZER', color: 'var(--kanban-todo)' },
        IN_PROGRESS: { title: 'EM ANDAMENTO', color: 'var(--kanban-progress)' },
        COMPLETED: { title: 'CONCLUÍDO', color: 'var(--kanban-completed)' }
    };

    return html`
        <div className="w-full h-full p-4 flex gap-4 overflow-x-auto">
            ${Object.entries(columnMeta).map(([status, meta]) => html`
                <${KanbanColumn} 
                    key=${status} 
                    title=${meta.title} 
                    cards=${columns[status] || []} 
                    status=${status}
                    color=${meta.color}
                    onDragStart=${onDragStart}
                    onDrop=${onDrop}
                />
            `)}
        </div>`;
};

const ChecklistCardComponent = ({ tasks }) => {
    if (!tasks || tasks.length === 0) {
        return html`<div className="flex items-center justify-center h-full text-gray-400">Nenhuma tarefa encontrada.</div>`;
    }
    return html`
        <div className="w-full h-full p-2 md:p-6 overflow-y-auto">
            <div className="space-y-6 max-w-4xl mx-auto">
                ${tasks.map(category => html`
                    <div key=${category.label} className="glass-panel !p-4 !bg-black/20">
                        <h3 className="text-lg font-semibold text-cyan-300 border-b-2 border-cyan-500/20 pb-2 mb-3">${category.label}</h3>
                        <ul className="space-y-2">${category.items.map((item, index) => html`
                            <li key=${index} className="flex items-center bg-black/30 p-3 rounded-md transition-all hover:bg-black/50">
                                <input type="checkbox" readOnly checked=${item.completed} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 cursor-not-allowed" />
                                <label className=${`ml-3 text-gray-300 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                                    ${item.text}
                                </label>
                            </li>
                        `)}</ul>
                    </div>
                `)}
            </div>
        </div>
    `;
};

const TasksChart = ({ data }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current || !data || data.length === 0) return;
        const chartInstance = new Chart(canvasRef.current, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    data: data.map(d => d.progress),
                    backgroundColor: data.map(d => d.color),
                    borderColor: 'rgba(10, 10, 25, 0.8)',
                    borderWidth: 4,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '70%',
                plugins: { legend: { display: false } }
            }
        });
        return () => chartInstance.destroy();
    }, [data]);
    return html`<canvas ref=${canvasRef}></canvas>`;
};

const OrbitalView = () => {
    const simRef = useRef(null);
    const [target, setTarget] = useState('sun');
    useEffect(() => {
        const container = document.getElementById('simulation-container');
        if (container) simRef.current = mountPhysicsOrbitSystem(container);
        return () => { if (simRef.current?.stop) simRef.current.stop(); };
    }, []);
    useEffect(() => {
        if (simRef.current?.setCameraTarget) simRef.current.setCameraTarget(target);
    }, [target]);
    return html`
        <div className="w-full h-full relative">
            <div id="simulation-container" className="w-full h-full absolute top-0 left-0"></div>
            <div className="absolute top-2 left-2 md:top-4 md:left-4 glass-panel !p-1 md:!p-2 flex gap-1 md:gap-2">
                <button onClick=${() => setTarget('sun')} className=${`px-2 py-1 rounded-md md:px-3 text-xs md:text-sm transition ${target === 'sun' ? 'bg-cyan-500 text-black font-semibold' : 'bg-black/40 hover:bg-black/60'}`}>Visão: Sol ☀️</button>
                <button onClick=${() => setTarget('earth')} className=${`px-2 py-1 rounded-md md:px-3 text-xs md:text-sm transition ${target === 'earth' ? 'bg-cyan-500 text-black font-semibold' : 'bg-black/40 hover:bg-black/60'}`}>Visão: Terra 🌍</button>
            </div>
        </div>`;
};
