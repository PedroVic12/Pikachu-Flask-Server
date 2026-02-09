
import Chart from 'chart.js/auto';
const { useRef, useEffect, useMemo, useState } = React;
const { DataBaseController } = window;

const ChecklistWidget = ({ tasks }) => {
    if (!tasks || tasks.length === 0) return html`<div className="flex items-center justify-center h-full text-gray-400">Nenhuma tarefa encontrada.</div>`;
    return html`<div className="w-full h-full p-2 md:p-6 overflow-y-auto"><div className="space-y-6 max-w-4xl mx-auto">${tasks.map(category => html`<div key=${category.label} className="glass-panel !p-4 !bg-black/20"><h3 className="text-lg font-semibold text-cyan-300 border-b-2 border-cyan-500/20 pb-2 mb-3">${category.label}</h3><ul className="space-y-2">${category.items.map((item, index) => html`<li key=${index} className="flex items-center bg-black/30 p-3 rounded-md transition-all hover:bg-black/50"><input type="checkbox" readOnly checked=${item.completed} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 cursor-not-allowed" /><label className=${`ml-3 text-gray-300 ${item.completed ? 'line-through text-gray-500' : ''}`}>${item.text}</label></li>`)}</ul></div>`)}</div></div>`;
};

const TasksChart = ({ data }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current || !data || data.length === 0) return;
        let chartInstance = new Chart(canvasRef.current, {
            type: 'doughnut',
            data: { labels: data.map(d => d.label), datasets: [{ data: data.map(d => d.progress), backgroundColor: data.map(d => d.color), borderColor: 'rgba(10, 10, 25, 0.8)', borderWidth: 4, hoverOffset: 8 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }
        });
        return () => chartInstance.destroy();
    }, [data]);
    return html`<canvas ref=${canvasRef}></canvas>`;
};

const ChartWidget = ({ data }) => html`<div className="w-full h-full p-4 md:p-8 flex items-center justify-center"><div className="w-full max-w-md aspect-square"><${TasksChart} data=${data} /></div></div>`;

const renderMarkdownToHTML = (markdownText) => {
    if (!markdownText) return '';
    let html = String(markdownText);
    html = html.replace(/```([\s\S]*?)```/gim, (match, p1) => `<pre class="bg-black/50 p-3 rounded-md overflow-x-auto my-4"><code class="font-mono text-sm">${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`);
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold neon-text mb-4 mt-6 pb-2 border-b border-gray-700">$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-cyan-300 mb-3 mt-5 pb-1 border-b border-gray-800">$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-300 mb-2 mt-4">$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>').replace(/\*(.*?)\*/gim, '<em>$1</em>').replace(/__(.*?)__/gim, '<strong>$1</strong>').replace(/_(.*?)_/gim, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">$1</a>');
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-black/50 px-2 py-1 rounded-md font-mono text-sm text-amber-300">$1</code>');
    html = html.replace(/^\s*[-*]\s*(\[([ xX])\])\s*(.+)$/gm, (match, checkbox, state, text) => `<li class="flex items-center mb-2"><span class="inline-block w-4 h-4 border-${state.trim().toLowerCase() === 'x' ? '0 bg-cyan-500 text-black' : '2 border-gray-500 bg-gray-700'} rounded-sm mr-3 flex items-center justify-center font-bold flex-shrink-0">${state.trim().toLowerCase() === 'x' ? '✓' : ''}</span><span class="${state.trim().toLowerCase() === 'x' ? 'line-through text-gray-500' : ''}">${text}</span></li>`);
    html = html.replace(/^\s*[-*]\s+(?!\[([ xX])\])([^\n]+)$/gm, '<li class="ml-6 list-disc marker:text-cyan-400 mb-2">$2</li>');
    html = html.replace(/((?:<li[\s\S]*?<\/li>\s*)+)/gim, '<ul class="space-y-1 mb-4">$1</ul>').replace(/<ul>\s*(<ul[\s\S]*?<\/ul>)\s*<\/ul>/gim, '$1');
    html = html.replace(/^---\s*$/gim, '<hr class="border-gray-700 my-6">').replace(/^===\s*$/gim, '<hr class="border-cyan-500 my-6">');
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-600 pl-4 italic text-gray-400 my-4">$1</blockquote>');
    html = html.split(/\n\n+/).map(p => { const t = p.trim(); if (t.startsWith('<') || t === '') return p; return `<p class="text-gray-300 leading-relaxed mb-4">${t.replace(/\n/g, '<br>')}</p>`; }).join('');
    return html;
};

const MarkdownViewerWidget = ({ markdownText }) => {
    const htmlContent = useMemo(() => renderMarkdownToHTML(markdownText), [markdownText]);
    return html`<div className="w-full h-full p-4 md:p-8 overflow-y-auto markdown-view" dangerouslySetInnerHTML=${{ __html: htmlContent }}></div>`;
};

const MarkdownEditorWidget = ({ markdown, onChange }) => {
    const defaultSettings = {
        fontFamily: "'Architects Daughter', cursive",
        backgroundColor: '#1a1a1a',
        color: '#e6f7ff',
        fontSize: '16px'
    };
    const [settings, setSettings] = useState(() => DataBaseController.get(DataBaseController.KEYS.EDITOR_SETTINGS, defaultSettings));

    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        DataBaseController.set(DataBaseController.KEYS.EDITOR_SETTINGS, newSettings);
    };

    return html`
                <div className="w-full h-full p-2 md:p-4 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-300">📝 Editor de Tarefas</h3>
                            <p className="text-xs text-gray-400">Tags: __TODO, __IN_PROGRESS</p>
                        </div>

                        <div className="flex gap-2 bg-black/40 p-2 rounded-lg items-center flex-wrap justify-center">
                            <select
                                value=${settings.fontFamily}
                                onChange=${(e) => updateSetting('fontFamily', e.target.value)}
                                className="bg-gray-800 text-white text-xs p-1 rounded border border-gray-700 outline-none focus:border-cyan-500"
                            >
                                <option value="'Architects Daughter', cursive">Excalidraw (Hand)</option>
                                <option value="'Inter', sans-serif">Padrão (Inter)</option>
                                <option value="'Fira Code', monospace">Code (Monospace)</option>
                            </select>

                            <input
                                type="number"
                                min="12" max="32"
                                value=${parseInt(settings.fontSize)}
                                onChange=${(e) => updateSetting('fontSize', `${e.target.value}px`)}
                                className="w-12 bg-gray-800 text-white text-xs p-1 rounded border border-gray-700 outline-none focus:border-cyan-500"
                            />

                            <div className="relative group flex items-center gap-1 bg-gray-800 rounded px-1 border border-gray-700">
                                <span className="text-xs text-gray-400">BG</span>
                                <input
                                    type="color"
                                    value=${settings.backgroundColor}
                                    onChange=${(e) => updateSetting('backgroundColor', e.target.value)}
                                    className="w-5 h-5 rounded cursor-pointer border-none p-0 overflow-hidden bg-transparent"
                                    title="Cor de Fundo"
                                />
                            </div>
                            <div className="relative group flex items-center gap-1 bg-gray-800 rounded px-1 border border-gray-700">
                                <span className="text-xs text-gray-400">A</span>
                                <input
                                    type="color"
                                    value=${settings.color}
                                    onChange=${(e) => updateSetting('color', e.target.value)}
                                    className="w-5 h-5 rounded cursor-pointer border-none p-0 overflow-hidden bg-transparent"
                                    title="Cor do Texto"
                                />
                            </div>
                        </div>
                    </div>

                    <textarea
                        className="w-full h-full flex-1 p-4 rounded-md markdown-editor focus:outline-none focus:ring-2 focus:ring-[var(--neon-cyan)] transition-all duration-300 shadow-inner"
                        style=${{
            fontFamily: settings.fontFamily,
            backgroundColor: settings.backgroundColor,
            color: settings.color,
            fontSize: settings.fontSize,
            lineHeight: '1.6',
            border: '1px solid rgba(255,255,255,0.1)'
        }}
                        value=${markdown}
                        onChange=${onChange}>
                    </textarea>
                </div>
                `;
};

window.ChecklistWidget = ChecklistWidget;
window.ChartWidget = ChartWidget;
window.MarkdownViewerWidget = MarkdownViewerWidget;
window.MarkdownEditorWidget = MarkdownEditorWidget;
