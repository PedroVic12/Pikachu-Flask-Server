
import './Planner_ONS_Page.css';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';


import { Sun, Moon, } from 'lucide-react';


const STORAGE_KEY = 'hub_ons_unified_v1';
const PROJECT_START = new Date(2026, 3, 12); // 12 mar 2026 
const MONTHS = ['Jan/26', 'Fev/26', 'Mar/26', 'Abr/26', 'Mai/26', 'Jun/26', 'Jul/26'];
const CATEGORIES = { 'Gestão de Projetos': '#1e293b', 'Planejamento Curto Prazo - PLC': '#16a34a', 'Engenharia Elétrica': '#3b82f6', 'Obras e atividades SECO': '#f59e0b' };
const DEFAULT_CATEGORY = 'Gestão de Projetos';
const CAT_COLORS = { 'Gestão de Projetos': '#94a3b8', 'Planejamento Curto Prazo - PLC': '#4ade80', 'Engenharia Elétrica': '#60a5fa', 'Obras e atividades SECO': '#fbbf24' };



//Recomendação feita por Copilot Microsoft - 07/04/2026
const DEFAULT_MD = `## Gestão de Projetos
## 🧭 Gestão Pessoal e Organização (Rotina PLC / ONS)
- [ ] Atualizar Kanban semanal (mensal + estudos + código) __TODO
- [ ] Planejar o dia com foco na vB (Pesada / Média) __TODO
- [ ] Registrar o que foi feito no Mensal (log técnico) __ONS
- [ ] Revisar prioridades do estágio (PLC) com o que impacta o Mensal __ONS

---

## ⚡ Mensal ONS – Casos de Referência (PLC)
### 🔹 vA / vB / vC – Maio 2026
- [x] Preparação do caso SEMENTE (vA concluída)
- [x] Política energética – Pesada (quase final)
- [x] Política energética – Média (em conferência)

- [x] Conferir **PESADA**:
  - [x] Ler PWF base e OPF
  - [x] Verificar balanço energético e swing __TODO
  - [x] Revisar despachos (Tucuruí, Belo Monte, Teles Pires, Madeira) 

- [x] Conferir **MÉDIA**:
  - [x] Ler PWF base
  - [ ] Comparar política energética × despacho atual __TODO

- [x] Finalizar **Complexo Madeira** (Pesada e Média) __TODO
- [ ] Montar arquivos da **vB** (.dat, .dut, .pwf, .opf, .prm, BNT1) __TODO
- [ ] Rodar **Build Case no Organon** (vB) __TODO
- [ ] Conferir Pos-OPF e variação da swing __TODO

---

## 🔌 Engenharia Elétrica – Estudos Técnicos Aplicados
- [ ] Revisar conceitos de:
  - [ ] Barra swing e balanço de potência
  - [ ] Intercâmbio HVDC (bipolos / BtB)
  - [ ] OPF e perdas no SIN __TODO
- [ ] Estudar SEP usando casos reais do Mensal (PWF) __TODO
- [x] Anotar aprendizados técnicos do Mensal (engenharia real) __DONE

---

## 🧠 Faculdade – Engenharia Elétrica
- [x] Circuitos Digitais I
- [x] Estudo semanal de Circuitos Elétricos / SEP __TODO
- [ ] Exercícios de Fluxo de Potência (relacionar com ANAREDE) __TODO
- [ ] Consolidar relação teoria ↔ prática (ONS) __TODO

---

## 💻 Programação Aplicada (ONS + Estudos)
### 🔹 Python / Engenharia de Dados
- [ ] Usar pandas para análise de casos (Pesada × Média) __TODO

### 🔹 Backend / Visualização
- [ ] Estrutura inicial Flask (app.py) para análise de casos __TODO
- [ ] Dashboard simples (HTML + Tailwind) para visualizar resultados __TODO

---

## 🌌 Projetos Pessoais Técnicos (baixo prazo)
- [ ] Dashboard SEP interativo (tensões, fluxos, swing) __TODO
- [ ] Projeto Astronomia + Engenharia (visual tipo NASA / Artemis) __IDEIA
- [ ] Blog técnico (.md / Quarto) explicando SEP e Mensal __IDEIA

---

## 🧘 Rotina Pessoal e Foco
- [ ] Sessões de foco (2 × 50 min/dia) para vB __TODO
- [ ] Ajustar rotina TDAH com blocos técnicos e pausas __TODO
- [ ] Manter equilíbrio entre estágio, faculdade e estudos __ONGOING

`;

const DEFAULT_TASKS = [
    { id: 1, title: 'Levantamento de Requisitos', category: 'Gestão de Projetos', startMonth: 0, duration: 1, color: '#475569', description: '', notes: '' },
    { id: 2, title: 'Estudos de SEP e Circuitos CA', category: 'Engenharia Elétrica', startMonth: 0.5, duration: 2, color: '#3b82f6', description: '', notes: '' },
    { id: 3, title: 'Estudos de SEP usando PandaPower e AnaRede', category: 'Engenharia Elétrica', startMonth: 2, duration: 3, color: '#6366f1', description: '', notes: '' },
    { id: 4, title: 'MUST SP e Obras Mensal', category: 'Obras e atividades SECO', startMonth: 1, duration: 2.5, color: '#f59e0b', description: '', notes: '' },
    { id: 5, title: 'Planjemanto inicial 2026', category: 'Planejamento Curto Prazo - PLC', startMonth: 0, duration: 4, color: '#16a34a', description: '', notes: '' },
];

// ── Model ──
const Model = {
    load() {
        try { const d = localStorage.getItem(STORAGE_KEY); if (d) return JSON.parse(d); } catch { }
        return { tasks: DEFAULT_TASKS, markdown: DEFAULT_MD, notes: '', darkMode: true };
    },
    save(data) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { } },
    reset() { localStorage.removeItem(STORAGE_KEY); }
};

// parseMarkdown: usado pelo ReportsModule para contar checkboxes
// ChecklistModule NÃO usa rebuild — preserva raw intacto
const parseMarkdown = (md) => {
    const result = {};
    let tab = 'Geral';
    result[tab] = [];
    for (const raw of (md || '').split('\n')) {
        const trimmed = raw.trim();
        if (/^#{1,6}\s+/.test(trimmed)) {
            tab = trimmed.replace(/^#{1,6}\s+/, '').trim();
            if (!result[tab]) result[tab] = [];
            continue;
        }
        const m = raw.match(/^(\s*)- \[([ xX])\] (.+)$/);
        if (m) {
            const checked = m[2].toLowerCase() === 'x';
            if (!result[tab]) result[tab] = [];
            result[tab].push({ checked });
        }
    }
    return result;
};

const calcProgress = (md) => {
    if (!md) return { total: 0, completed: 0, pct: 0 };
    const checked = (md.match(/-\s+\[x\]/gi) || []).length;
    const unchecked = (md.match(/-\s+\[ \]/g) || []).length;
    const total = checked + unchecked;
    return { total, completed: checked, pct: total === 0 ? 0 : Math.round((checked / total) * 100) };
};

// ── Snackbar ──
const SnackbarCtx = React.createContext(null);
const SnackbarProvider = ({ children }) => {
    const [snacks, setSnacks] = useState([]);
    const push = useCallback((msg, type = 'info') => {
        const id = Date.now();
        setSnacks(s => [...s, { id, msg, type }]);
        setTimeout(() => setSnacks(s => s.filter(x => x.id !== id)), 3500);
    }, []);
    return (
        <SnackbarCtx.Provider value={push}>
            {children}
            <div className="planner-ons-snackbar">
                {snacks.map(s => (
                    <div key={s.id} className={`planner-ons-snack ${s.type}`}>
                        <span className="material-icons" style={{ fontSize: 16 }}>
                            {s.type === 'success' ? 'check_circle' : s.type === 'error' ? 'error' : 'info'}
                        </span>
                        {s.msg}
                    </div>
                ))}
            </div>
        </SnackbarCtx.Provider>
    );
};
const useSnack = () => React.useContext(SnackbarCtx);

// ══════════════════════════════════════════════════
//  GANTT MODULE
// ══════════════════════════════════════════════════
const GanttModule = ({ tasks, onUpdate }) => {
    const snack = useSnack();
    const [modal, setModal] = useState(null);
    const fileRef = useRef(null);
    const todayPct = useMemo(() => {
        const today = new Date();
        const timelineStart = new Date(PROJECT_START.getFullYear(), 0, 1);
        const timelineEnd = new Date(PROJECT_START.getFullYear(), MONTHS.length, 1);
        const pct = ((today - timelineStart) / (timelineEnd - timelineStart)) * 100;
        return Math.min(Math.max(pct, 0), 100);
    }, []);

    const todayLabel = useMemo(() => {
        return new Date().toLocaleDateString('pt-BR');
    }, []);

    const saveModal = () => {
        if (!modal.title.trim()) return;
        const updated = modal.id
            ? tasks.map(t => t.id === modal.id ? modal : t)
            : [...tasks, { ...modal, id: Date.now() }];
        onUpdate(updated);
        setModal(null);
        snack(modal.id ? 'Tarefa atualizada.' : 'Tarefa criada.', 'success');
    };
    const deleteModal = () => { onUpdate(tasks.filter(t => t.id !== modal.id)); setModal(null); snack('Eliminada.', 'info'); };

    const exportExcel = () => {
        const ws_data = [['ID', 'Título', 'Categoria', 'Início (mês)', 'Duração (meses)', 'Cor', 'Descrição', 'Notas'],
        ...tasks.map(t => [t.id, t.title, t.category, t.startMonth, t.duration, t.color, t.description || '', t.notes || ''])];
        const wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(ws_data);
        ws['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 15 }, { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 40 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');
        XLSX.writeFile(wb, `cronograma_ons_${new Date().toISOString().split('T')[0]}.xlsx`);
        snack('Excel exportado!', 'success');
    };

    const importExcel = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const wb = XLSX.read(ev.target.result, { type: 'binary' });
                const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
                const imported = rows.slice(1).filter(r => r[1]).map((r, i) => ({
                    id: r[0] || Date.now() + i, title: String(r[1] || ''), category: r[2] || DEFAULT_CATEGORY,
                    startMonth: parseFloat(r[3]) || 0, duration: parseFloat(r[4]) || 1,
                    color: r[5] || '#3b82f6', description: r[6] || '', notes: r[7] || ''
                }));
                onUpdate(imported);
                snack(`${imported.length} tarefas importadas!`, 'success');
            } catch (err) { snack('Erro: ' + err.message, 'error'); }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const byCategory = Object.keys(CATEGORIES).reduce((acc, cat) => { acc[cat] = tasks.filter(t => t.category === cat); return acc }, {});

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>Cronograma Integrado</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{tasks.length} atividade(s) · Out/2025 → Jul/2026</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <label className="planner-ons-btn planner-ons-btn-green" style={{ cursor: 'pointer' }}>
                        <span className="material-icons">upload_file</span> Importar Excel
                        <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} ref={fileRef} onChange={importExcel} />
                    </label>
                    <button className="planner-ons-btn planner-ons-btn-ghost" onClick={exportExcel}><span className="material-icons">download</span> Exportar Excel</button>
                    <button className="planner-ons-btn planner-ons-btn-primary" onClick={() => setModal({ id: null, title: '', category: DEFAULT_CATEGORY, startMonth: 0, duration: 1, color: '#3b82f6', description: '', notes: '' })}>
                        <span className="material-icons">add</span> Nova Tarefa
                    </button>
                </div>
            </div>
            <div className="planner-ons-glass" style={{ overflow: 'hidden' }}>
                <div className="planner-ons-gantt-wrap">
                    <table className="planner-ons-gantt-table">
                        <thead>
                            <tr className="planner-ons-gantt-header">
                                <th>Fase / Atividade</th>
                                {MONTHS.map(m => <th key={m}>{m}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(CATEGORIES).map(cat => {
                                const catTasks = byCategory[cat];
                                return (
                                    <React.Fragment key={cat}>
                                        <tr className="planner-ons-gantt-cat-row"><td colSpan={11} style={{ color: CAT_COLORS[cat] }}>▸ {cat}</td></tr>
                                        {catTasks.length === 0 ? (
                                            <tr className="planner-ons-gantt-task-row">
                                                <td style={{ color: 'var(--muted)', fontSize: 11, fontStyle: 'italic' }}>— sem tarefas —</td>
                                                <td colSpan={10} className="planner-ons-gantt-cell"></td>
                                            </tr>
                                        ) : catTasks.map((task, i) => {
                                            return (
                                                <tr key={task.id} className="planner-ons-gantt-task-row">
                                                    <td>{task.title}</td>
                                                    <td className="planner-ons-gantt-cell" colSpan={10} style={{ position: 'relative' }}>
                                                        {i === 0 && <div className="planner-ons-today-line" style={{ left: `${todayPct}%` }}><div className="planner-ons-today-badge">{todayLabel}</div></div>}
                                                        <div className="planner-ons-task-bar" style={{ left: `${(task.startMonth / MONTHS.length) * 100}%`, width: `${(task.duration / MONTHS.length) * 100}%`, backgroundColor: task.color }} onClick={() => setModal({ ...task })}>
                                                            {task.title}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <div className="planner-ons-modal-backdrop" onClick={() => setModal(null)}>
                    <div className="planner-ons-modal-box" onClick={e => e.stopPropagation()}>
                        <div className="planner-ons-modal-title">{modal.id ? '✏️ Editar Tarefa' : '➕ Nova Tarefa'}</div>
                        <div className="planner-ons-form-group"><label className="planner-ons-form-label">TÍTULO</label>
                            <input className="planner-ons-form-input" value={modal.title} onChange={e => setModal({ ...modal, title: e.target.value })} placeholder="Ex: Integração API" />
                        </div>
                        <div className="planner-ons-form-group"><label className="planner-ons-form-label">CATEGORIA</label>
                            <select className="planner-ons-form-input" value={modal.category} onChange={e => setModal({ ...modal, category: e.target.value })}>
                                {Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="planner-ons-form-row">
                            <div className="planner-ons-form-group"><label className="planner-ons-form-label">INÍCIO (0–10)</label>
                                <input className="planner-ons-form-input" type="number" min="0" max="10" step="0.5" value={modal.startMonth} onChange={e => setModal({ ...modal, startMonth: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="planner-ons-form-group"><label className="planner-ons-form-label">DURAÇÃO (meses)</label>
                                <input className="planner-ons-form-input" type="number" min="0.5" max="10" step="0.5" value={modal.duration} onChange={e => setModal({ ...modal, duration: parseFloat(e.target.value) || 1 })} />
                            </div>
                        </div>
                        <div className="planner-ons-form-group"><label className="planner-ons-form-label">COR</label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input type="color" value={modal.color} onChange={e => setModal({ ...modal, color: e.target.value })} style={{ width: 44, height: 36, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', background: 'none' }} />
                                <input className="planner-ons-form-input" style={{ flex: 1 }} value={modal.color} onChange={e => setModal({ ...modal, color: e.target.value })} placeholder="#3b82f6" />
                            </div>
                        </div>
                        <div className="planner-ons-form-group"><label className="planner-ons-form-label">NOTAS</label>
                            <textarea className="planner-ons-form-input" rows={2} style={{ resize: 'vertical' }} value={modal.notes || ''} onChange={e => setModal({ ...modal, notes: e.target.value })} placeholder="Observações sobre a tarefa…" />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                            {modal.id && <button className="planner-ons-btn planner-ons-btn-danger" onClick={deleteModal}>Excluir</button>}
                            <button className="planner-ons-btn planner-ons-btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
                            <button className="planner-ons-btn planner-ons-btn-primary" onClick={saveModal}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ══════════════════════════════════════════════════
//  TASK CARDS MODULE
// ══════════════════════════════════════════════════
const TaskCardsModule = ({ tasks, notes, onNotesChange, onUpdateTasks }) => {
    const snack = useSnack();
    const [editTask, setEditTask] = useState(null);

    const saveEdit = () => {
        onUpdateTasks(tasks.map(t => t.id === editTask.id ? editTask : t));
        setEditTask(null);
        snack('Tarefa atualizada.', 'success');
    };

    const totalStats = useMemo(() => {
        let total = 0, done = 0;
        tasks.forEach(t => { const p = calcProgress(t.description || ''); total += p.total; done += p.completed; });
        return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
    }, [tasks]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>Meus Rascunhos em .md </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{tasks.length} projeto(s) · {totalStats.pct}% concluído</div>
                </div>
                <button className="planner-ons-btn planner-ons-btn-primary" onClick={() => {
                    const novo = { id: Date.now(), title: 'Nova Tarefa', category: DEFAULT_CATEGORY, startMonth: 0, duration: 1, color: '#0284c7', description: '## Entregáveis\n- [ ] Sub-tarefa 1\n  - [ ] Sub-tarefa 1.1', notes: '' };
                    onUpdateTasks([...tasks, novo]);
                    snack('Nova tarefa criada.', 'success');
                }}>
                    <span className="material-icons">add</span> Nova Tarefa
                </button>
            </div>

            {/* Anotação Geral — sempre visível e persistida */}
            <div className="planner-ons-notes-box">
                <span className="material-icons" style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2, fontSize: 20 }}>sticky_note_2</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em', marginBottom: 6 }}>ANOTAÇÃO GERAL</div>
                    <textarea
                        value={notes}
                        onChange={e => onNotesChange(e.target.value)}
                        placeholder="Escreva anotações gerais aqui… (salvo automaticamente)"
                        rows={3}
                        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'vertical', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, lineHeight: 1.6 }}
                    />
                </div>
            </div>

            <div className="planner-ons-task-cards-grid">
                {tasks.map(task => {
                    const p = calcProgress(task.description || '');
                    return (
                        <div key={task.id} className="planner-ons-task-card" onClick={() => setEditTask({ ...task })}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: task.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.7)', flexShrink: 0 }}>
                                    <span className="material-icons">assignment</span>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', background: 'var(--glass-b)', padding: '3px 10px', borderRadius: 20 }}>
                                    {task.category || 'Projeto'}
                                </span>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: 'var(--text)' }}>{task.title}</div>
                            {task.notes && (
                                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, borderLeft: '2px solid var(--border)', paddingLeft: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {task.notes}
                                </div>
                            )}
                            <div style={{ marginTop: 'auto', paddingTop: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                    <span style={{ color: 'var(--planner-muted)' }}>Progresso</span>
                                    <span style={{ fontWeight: 700 }}>{p.pct}%</span>
                                </div>
                                <div className="planner-ons-prog-bar"><div className="planner-ons-prog-fill" style={{ width: `${p.pct}%`, background: task.color }} /></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {editTask && (
                <div className="planner-ons-modal-backdrop" onClick={() => setEditTask(null)}>
                    <div className="planner-ons-modal-box" onClick={e => e.stopPropagation()} style={{ width: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <input type="color" value={editTask.color} onChange={e => setEditTask({ ...editTask, color: e.target.value })} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', background: 'none' }} />
                            <input className="planner-ons-form-input" style={{ flex: 1, fontSize: 15, fontWeight: 700 }} value={editTask.title} onChange={e => setEditTask({ ...editTask, title: e.target.value })} />
                        </div>
                        <div className="planner-ons-form-group"><label className="planner-ons-form-label">CATEGORIA</label>
                            <select className="planner-ons-form-input" value={editTask.category || DEFAULT_CATEGORY} onChange={e => setEditTask({ ...editTask, category: e.target.value })}>
                                {Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="planner-ons-form-group"><label className="planner-ons-form-label">NOTAS / OBS</label>
                            <textarea className="planner-ons-form-input" rows={3} style={{ resize: 'vertical' }} value={editTask.notes || ''} onChange={e => setEditTask({ ...editTask, notes: e.target.value })} placeholder="Observações sobre esta tarefa…" />
                        </div>
                        <div className="planner-ons-form-group"><label className="planner-ons-form-label">DESCRIÇÃO / CHECKLIST (Markdown)</label>
                            <textarea className="planner-ons-form-input planner-ons-md-editor" style={{ minHeight: 220, resize: 'vertical', fontFamily: 'var(--mono)', fontSize: 12 }} value={editTask.description || ''} onChange={e => setEditTask({ ...editTask, description: e.target.value })} placeholder={"## Entregáveis\n- [ ] Tarefa principal\n  - [ ] Sub-tarefa aninhada\n- [x] Já concluída"} />
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Dica: use 2 espaços antes de "- [ ]" para sub-tarefas aninhadas.</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                            <button className="planner-ons-btn planner-ons-btn-danger" onClick={() => { onUpdateTasks(tasks.filter(t => t.id !== editTask.id)); setEditTask(null); snack('Tarefa eliminada.', 'info'); }}>Excluir</button>
                            <button className="planner-ons-btn planner-ons-btn-ghost" onClick={() => setEditTask(null)}>Cancelar</button>
                            <button className="planner-ons-btn planner-ons-btn-primary" onClick={saveEdit}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ══════════════════════════════════════════════════
//  CHECKLIST MODULE — raw-line approach
//  O MD raw é a fonte de verdade absoluta.
//  Toggle muda APENAS a linha exata por índice.
//  Nenhuma linha é perdida, nem ---,  ###, texto livre, etc.
// ══════════════════════════════════════════════════

// Classifica cada linha do MD para renderização e navegação por abas.
// Retorna array de objetos { lineIdx, type, text, checked, indent, tag, tab }
const classifyLines = (md) => {
    const lines = md.split('\n');
    const result = [];
    let currentTab = 'Geral';

    lines.forEach((raw, lineIdx) => {
        const trimmed = raw.trim();

        // Cabeçalho de aba (##+ = nova aba, # e ### = heading visual dentro da aba)
        const headingMatch = raw.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            const text = headingMatch[2].trim();
            if (level <= 2) {
                // ## ou # definem aba
                currentTab = text;
                result.push({ lineIdx, type: 'heading', level, text, tab: currentTab });
            } else {
                // ### ou mais: heading visual dentro da aba atual
                result.push({ lineIdx, type: 'heading', level, text, tab: currentTab });
            }
            return;
        }

        // Separador ---
        if (/^---+$/.test(trimmed)) {
            result.push({ lineIdx, type: 'separator', tab: currentTab });
            return;
        }

        // Checkbox item: "- [ ]" ou "- [x]" (com qualquer indentação)
        const cbMatch = raw.match(/^(\s*)- \[( |x|X)\] (.*)$/);
        if (cbMatch) {
            const indent = cbMatch[1].length;
            const checked = cbMatch[2].toLowerCase() === 'x';
            const rest = cbMatch[3];
            // Extrai __TAG opcional no final
            const tagMatch = rest.match(/__([A-Z_]+)\s*$/);
            const tag = tagMatch ? tagMatch[1] : null;
            const text = tag ? rest.replace(/__[A-Z_]+\s*$/, '').trim() : rest.trim();
            result.push({ lineIdx, type: 'checkbox', checked, text, tag, indent, sub: indent >= 2, tab: currentTab });
            return;
        }

        // Lista simples sem checkbox: "- texto"
        const listMatch = raw.match(/^(\s*)- (.+)$/);
        if (listMatch) {
            result.push({ lineIdx, type: 'list', text: listMatch[2].trim(), indent: listMatch[1].length, tab: currentTab });
            return;
        }

        // Linha vazia
        if (!trimmed) {
            result.push({ lineIdx, type: 'blank', tab: currentTab });
            return;
        }

        // Texto livre
        result.push({ lineIdx, type: 'text', text: trimmed, tab: currentTab });
    });

    return result;
};

// Toggle no raw: inverte [ ] <-> [x] NA LINHA EXATA pelo lineIdx
const toggleLineInRaw = (raw, lineIdx) => {
    const lines = raw.split('\n');
    const line = lines[lineIdx];
    if (/- \[ \]/.test(line)) lines[lineIdx] = line.replace('- [ ]', '- [x]');
    else if (/- \[x\]/i.test(line)) lines[lineIdx] = line.replace(/- \[x\]/i, '- [ ]');
    return lines.join('\n');
};

// Lista de abas únicas preservando ordem de aparição
const getTabsFromLines = (lines) => {
    const seen = new Set();
    const tabs = [];
    lines.forEach(l => {
        if (l.tab && !seen.has(l.tab)) { seen.add(l.tab); tabs.push(l.tab); }
    });
    return tabs.length ? tabs : ['Geral'];
};

// Progresso de uma aba: conta só checkboxes
const tabProgress = (lines, tab) => {
    const items = lines.filter(l => l.type === 'checkbox' && l.tab === tab);
    if (!items.length) return 0;
    return Math.round(items.filter(i => i.checked).length / items.length * 100);
};

const ChecklistModule = ({ markdown, onSave }) => {
    const snack = useSnack();
    const [rawMd, setRawMd] = useState(markdown);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const fileRef = useRef(null);

    useEffect(() => { setRawMd(markdown); }, [markdown]);

    // Classifica todas as linhas — operação leve, memo em rawMd
    const allLines = useMemo(() => classifyLines(rawMd), [rawMd]);
    const tabs = useMemo(() => getTabsFromLines(allLines), [allLines]);
    const safeTab = Math.min(activeTab, tabs.length - 1);

    // Linhas visiveis na aba ativa (exceto linhas heading que definem a aba em si no level <=2)
    const visibleLines = useMemo(() =>
        allLines.filter(l => {
            if (l.tab !== tabs[safeTab]) return false;
            // Ocultar o heading de nível 1-2 que define a aba (já exibido como título da tab)
            if (l.type === 'heading' && l.level <= 2 && l.text === tabs[safeTab]) return false;
            return true;
        }),
        [allLines, tabs, safeTab]);

    const pct = tabProgress(allLines, tabs[safeTab]);

    // Toggle: modifica SOMENTE a linha pelo lineIdx no raw
    const toggle = (lineIdx) => {
        const newMd = toggleLineInRaw(rawMd, lineIdx);
        setRawMd(newMd);
        onSave(newMd);
    };

    const handleEditorChange = (val) => { setRawMd(val); onSave(val); };

    const downloadMd = () => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([rawMd], { type: 'text/markdown' }));
        a.download = 'plano_ons.md'; a.click();
        snack('Markdown baixado.', 'success');
    };

    // Export Excel: só itens checkbox (preserva info)
    const exportExcel = () => {
        const rows = [['Aba', 'Texto', 'Concluído', 'Sub-item', 'Tag', 'Linha Original']];
        allLines.filter(l => l.type === 'checkbox').forEach(l => {
            rows.push([l.tab, l.text, l.checked ? 'Sim' : 'Não', l.sub ? 'Sim' : 'Não', l.tag || '', l.lineIdx + 1]);
        });
        const wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(rows);
        ws['!cols'] = [{ wch: 18 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 }];
        XLSX.utils.book_append_sheet(wb, ws, 'Checklist');
        XLSX.writeFile(wb, `checklist_ons_${new Date().toISOString().split('T')[0]}.xlsx`);
        snack('Excel exportado!', 'success');
    };

    // Import: .md preserva tudo; .xlsx só atualiza checked das linhas que batem por texto+aba
    const importFile = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        if (file.name.match(/\.(md|txt)$/i)) {
            reader.onload = ev => { setRawMd(ev.target.result); onSave(ev.target.result); snack('Markdown importado!', 'success'); };
            reader.readAsText(file);
        } else {
            reader.onload = ev => {
                try {
                    const wb = XLSX.read(ev.target.result, { type: 'binary' });
                    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }).slice(1);
                    // Atualiza só checkboxes que existem no raw pelo número da linha
                    let lines = rawMd.split('\n');
                    rows.forEach(r => {
                        const lineNum = parseInt(r[5]) - 1;
                        if (!isNaN(lineNum) && lines[lineNum]) {
                            const checked = String(r[2] || '').toLowerCase() === 'sim';
                            if (checked) lines[lineNum] = lines[lineNum].replace(/- \[ \]/, '- [x]');
                            else lines[lineNum] = lines[lineNum].replace(/- \[x\]/i, '- [ ]');
                        }
                    });
                    const newMd = lines.join('\n');
                    setRawMd(newMd); onSave(newMd);
                    snack('Excel importado!', 'success');
                } catch (err) { snack('Erro: ' + err.message, 'error'); }
            };
            reader.readAsBinaryString(file);
        }
        e.target.value = '';
    };

    // Render de uma linha classificada no viewer
    const renderLine = (l, idx) => {
        if (l.type === 'separator') return (
            <div key={idx} style={{ margin: '10px 16px', borderTop: '1px solid var(--border)' }} />
        );
        if (l.type === 'blank') return (
            <div key={idx} style={{ height: 6 }} />
        );
        if (l.type === 'heading') {
            const sizes = { 3: 14, 4: 13, 5: 12, 6: 11 };
            return (
                <div key={idx} style={{ padding: '12px 16px 4px', fontSize: sizes[l.level] || 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: l.level >= 4 ? 'uppercase' : 'none', borderBottom: l.level <= 3 ? '1px solid var(--border)' : 'none', marginBottom: l.level <= 3 ? 4 : 0 }}>
                    {l.text}
                </div>
            );
        }
        if (l.type === 'list') return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', paddingLeft: 16 + l.indent * 6, color: 'var(--muted)', fontSize: 13 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--muted)', flexShrink: 0, display: 'inline-block' }} />
                <span>{l.text}</span>
            </div>
        );
        if (l.type === 'text') return (
            <div key={idx} style={{ padding: '4px 16px 4px', fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
                {l.text}
            </div>
        );
        if (l.type === 'checkbox') return (
            <div key={idx}
                className={`planner-ons-checklist-item ${l.sub ? 'planner-ons-sub' : ''}`}
                style={l.indent > 2 ? { marginLeft: Math.min(l.indent * 8, 64) } : {}}
                onClick={() => toggle(l.lineIdx)}
            >
                <div className={`planner-ons-check-box ${l.checked ? 'planner-ons-checked' : ''}`} />
                <span className={`planner-ons-check-text ${l.checked ? 'planner-ons-done' : ''}`}>{l.text}</span>
                {l.tag && <span className={`planner-ons-tag-pill planner-ons-tag-${l.tag.toLowerCase()}`}>{l.tag}</span>}
            </div>
        );
        return null;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>Checklist & Planner</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Markdown fiel · tags __ONS · __TODO · __WIP · __BLOCK · __DONE</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <label className="planner-ons-btn planner-ons-btn-green" style={{ cursor: 'pointer' }}>
                        <span className="material-icons">upload_file</span> Importar
                        <input type="file" accept=".xlsx,.xls,.md,.txt" style={{ display: 'none' }} ref={fileRef} onChange={importFile} />
                    </label>
                    <button className="planner-ons-btn planner-ons-btn-ghost" onClick={exportExcel}><span className="material-icons">table_chart</span> Excel</button>
                    <button className="planner-ons-btn planner-ons-btn-ghost" onClick={downloadMd}><span className="material-icons">download</span> .md</button>
                    <button className={`planner-ons-btn ${editMode ? 'planner-ons-btn-primary' : 'planner-ons-btn-ghost'}`} onClick={() => setEditMode(!editMode)}>
                        <span className="material-icons">{editMode ? 'visibility' : 'edit'}</span>
                        {editMode ? 'Ver Widgets' : 'Editar MD'}
                    </button>
                </div>
            </div>

            {editMode ? (
                <div className="planner-ons-glass" style={{ padding: 16 }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, fontFamily: 'var(--mono)' }}>
                        Sintaxe livre: ## Aba · ### Seção · - [ ] item __TAG · &nbsp;&nbsp;- [x] sub · --- separador · texto livre
                    </div>
                    <textarea className="planner-ons-md-editor" value={rawMd} onChange={e => handleEditorChange(e.target.value)} spellCheck={false} />
                </div>
            ) : (
                <div className="planner-ons-glass" style={{ overflow: 'hidden' }}>
                    {/* Abas */}
                    <div className="planner-ons-md-tabs">
                        {tabs.map((tab, i) => (
                            <div key={tab} className={`planner-ons-md-tab ${safeTab === i ? 'planner-ons-active' : ''}`} onClick={() => setActiveTab(i)}>
                                {tab}
                                <span style={{ marginLeft: 6, fontSize: 10, color: tabProgress(allLines, tab) === 100 ? 'var(--accent2)' : 'var(--muted)' }}>
                                    {tabProgress(allLines, tab)}%
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div style={{ padding: '8px 16px 0' }}>
                        <div className="planner-ons-prog-bar"><div className="planner-ons-prog-fill" style={{ width: `${pct}%` }} /></div>
                    </div>

                    {/* Conteúdo da aba ativa — todas as linhas renderizadas fielmente */}
                    <div style={{ padding: '4px 0 12px' }}>
                        {visibleLines.length === 0 ? (
                            <div style={{ padding: '20px 16px', color: 'var(--muted)', fontSize: 13, fontStyle: 'italic' }}>
                                Nenhum conteúdo. Use o editor MD para adicionar.
                            </div>
                        ) : (
                            visibleLines.map((l, i) => renderLine(l, i))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ══════════════════════════════════════════════════
//  REPORTS MODULE
// ══════════════════════════════════════════════════
const ReportsModule = ({ tasks, markdown }) => {
    const stats = useMemo(() => {
        let tC = 0, dC = 0;
        tasks.forEach(t => { const p = calcProgress(t.description || ''); tC += p.total; dC += p.completed; });
        const parsed = parseMarkdown(markdown);
        let mT = 0, mD = 0;
        Object.values(parsed).forEach(items => items.forEach(i => { mT++; if (i.checked) mD++; }));
        return { totalTasks: tasks.length, taskItems: tC, taskDone: dC, taskPct: tC === 0 ? 0 : Math.round((dC / tC) * 100), mdItems: mT, mdDone: mD, mdPct: mT === 0 ? 0 : Math.round((mD / mT) * 100) };
    }, [tasks, markdown]);

    const SC = ({ value, sub, label, color }) => (
        <div className="planner-ons-report-stat">
            <div className="planner-ons-report-stat-value" style={{ color: color || 'var(--planner-text)' }}>
                {value}<span style={{ fontSize: 18, color: 'var(--planner-muted)', fontWeight: 400 }}>{sub}</span>
            </div>
            <div className="planner-ons-report-stat-label">{label}</div>
            <div className="planner-ons-prog-bar" style={{ marginTop: 12 }}><div className="planner-ons-prog-fill" style={{ width: '100%' }} /></div>
        </div>
    );

    return (
        <div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Painel de Controle</div>
            <div style={{ fontSize: 12, color: 'var(--planner-muted)', marginBottom: 20 }}>Visão consolidada de todos os módulos</div>
            <div className="planner-ons-report-grid">
                <SC value={stats.totalTasks} sub="" label="PROJETOS NO GANTT" color="var(--accent)" />
                <SC value={stats.taskPct} sub="%" label="PROGRESSO DAS TAREFAS" color="var(--accent2)" />
                <SC value={stats.taskDone} sub={` / ${stats.taskItems}`} label="CHECKLISTS CONCLUÍDOS" />
                <SC value={stats.mdPct} sub="%" label="PROGRESSO DO PLANNER" color="#c08ff5" />
                <SC value={stats.mdDone} sub={` / ${stats.mdItems}`} label="ITENS DO PLANNER FEITOS" />
            </div>
            <div style={{ marginTop: 32, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Detalhamento por Projeto</div>
            <div className="planner-ons-glass" style={{ overflow: 'hidden' }}>
                {tasks.map((task, i) => {
                    const p = calcProgress(task.description || '');
                    return (
                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: task.color, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{task.category || ''}</div>
                            </div>
                            <div style={{ width: 100, flexShrink: 0 }}>
                                <div className="planner-ons-prog-bar"><div className="planner-ons-prog-fill" style={{ width: `${p.pct}%`, background: task.color }} /></div>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, width: 36, textAlign: 'right' }}>{p.pct}%</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════
//  CONFIG MODULE
// ══════════════════════════════════════════════════
const ConfigModule = ({ onReset, darkMode, onToggleTheme }) => (
    <div>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Configurações</div>
        <div className="planner-ons-glass" style={{ padding: 24 }}>
            <div className="planner-ons-config-section">
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Aparência</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
                        {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{darkMode ? 'Modo Escuro ativo' : 'Modo Claro ativo'}</span>
                    <button className="planner-ons-btn planner-ons-btn-ghost" onClick={onToggleTheme}>
                        {darkMode ? <Sun size={16} style={{ marginRight: 8 }} /> : <Moon size={16} style={{ marginRight: 8 }} />}
                        Alternar para {darkMode ? 'Claro' : 'Escuro'}
                    </button>
                </div>
            </div>
            <div className="planner-ons-config-section" style={{ marginTop: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Dados Locais</div>
                <div className="planner-ons-config-label">Os dados são armazenados no localStorage do navegador.</div>
                <button className="planner-ons-btn planner-ons-btn-danger" onClick={() => { if (confirm('Resetar todos os dados?')) onReset(); }}>
                    <span className="material-icons">delete_forever</span> Limpar Base de Dados
                </button>
            </div>
            <div className="planner-ons-config-section" style={{ marginTop: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Tags Suportadas no Planner</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['ONS', 'TODO', 'WIP', 'BLOCK', 'DONE'].map(t => <span key={t} className={`planner-ons-tag-pill planner-ons-tag-${t.toLowerCase()}`}>{t}</span>)}
                </div>
                <div className="planner-ons-config-label" style={{ marginTop: 8 }}>Use __NOMEATAG no final de cada linha no Markdown.</div>
            </div>
            <div className="planner-ons-config-section" style={{ marginTop: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Módulos & Fixes</div>
                <div className="planner-ons-config-label">
                    <b>Cronograma:</b> Gantt com categorias, Import/Export Excel (.xlsx)<br />
                    <b>Meus Rascunhos:</b> Cards com checklist MD, anotação geral fixa e persistida<br />
                    <b>Checklist/Planner:</b> Parser MD corrigido (# ## ###, sub-itens 2+ espaços), Export Excel + .md<br />
                    <b>Relatórios:</b> Estatísticas consolidadas de todos os módulos<br />
                    <b>Tema:</b> Dark / Light com CSS variables, toggle na sidebar e aqui
                </div>
            </div>
        </div>
    </div>
);

// ══════════════════════════════════════════════════
//  APP
// ══════════════════════════════════════════════════
export default function PlannerONSPage() {
    const [data, setData] = useState(() => Model.load());
    const [view, setView] = useState('gantt');
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const id = 'planner-ons-material-icons';
        if (typeof document !== 'undefined' && !document.getElementById(id)) {
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Material+Icons';
            document.head.appendChild(link);
        }
    }, []);

    useEffect(() => { Model.save(data); }, [data]);

    const updateTasks = tasks => setData(d => ({ ...d, tasks }));
    const updateMarkdown = markdown => setData(d => ({ ...d, markdown }));
    const updateNotes = notes => setData(d => ({ ...d, notes }));
    const toggleTheme = () => setData(d => ({ ...d, darkMode: !d.darkMode }));
    const reset = () => { Model.reset(); setData({ tasks: DEFAULT_TASKS, markdown: DEFAULT_MD, notes: '', darkMode: true }); };

    const navItems = [
        { id: 'gantt', label: 'Planner Timeline', icon: 'view_timeline' },
        { id: 'tasks', label: 'Meus Rascunhos de Ideias', icon: 'check_box' },
        { id: 'checklist', label: 'Checklist / MD', icon: 'fact_check' },
        { id: 'reports', label: 'Dashboard', icon: 'insert_chart' },
        { id: 'config', label: 'Configurações', icon: 'settings' },
    ];
    const titles = { gantt: 'Planner e Cronograma', tasks: 'Meus Rascunhos de Ideias', checklist: 'Checklist & Planner', reports: 'Dashboard', config: 'Configurações' };

    return (
        <SnackbarProvider>
            <div className="planner-ons-container" data-theme={data.darkMode ? 'dark' : 'light'}>
                <div className="planner-ons-app-layout">
                    <div className={`planner-ons-sidebar ${collapsed ? 'planner-ons-collapsed' : ''}`}>
                        <div className="planner-ons-sidebar-logo">
                            <div className="planner-ons-logo-icon">⚡</div>
                            {!collapsed && <div><div className="planner-ons-logo-text">Planner ONS 2026</div><div className="planner-ons-logo-sub">INTEGRADO v3.1.3</div></div>}
                        </div>
                        <div className="planner-ons-nav-section">
                            {!collapsed && <div className="planner-ons-nav-label">Módulos</div>}
                            {navItems.map(item => (
                                <div key={item.id} className={`planner-ons-nav-item ${view === item.id ? 'planner-ons-active' : ''}`} onClick={() => setView(item.id)} title={collapsed ? item.label : ''}>
                                    <span className="material-icons">{item.icon}</span>
                                    {!collapsed && item.label}
                                </div>
                            ))}
                        </div>
                        <div className="planner-ons-sidebar-bottom">
                            <div className="planner-ons-nav-item" onClick={toggleTheme} title={data.darkMode ? 'Modo Claro' : 'Modo Escuro'}>
                                <span style={{ display: 'flex', alignItems: 'center' }}>{data.darkMode ? <Moon size={18} /> : <Sun size={18} />}</span>
                                {!collapsed && (data.darkMode ? 'Modo Claro' : 'Modo Escuro')}
                            </div>
                            <div className="planner-ons-nav-item" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expandir' : 'Recolher'}>
                                <span className="material-icons">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
                                {!collapsed && 'Recolher'}
                            </div>
                        </div>
                    </div>
                    <div className="planner-ons-main-area">
                        <div className="planner-ons-topbar">
                            <div>
                                <div className="planner-ons-topbar-title">{titles[view]}</div>
                                <div className="planner-ons-topbar-sub">ONS · {new Date().toLocaleDateString('pt-BR')}</div>
                            </div>
                        </div>
                        <div className="planner-ons-content-scroll">
                            {view === 'gantt' && <GanttModule tasks={data.tasks} onUpdate={updateTasks} />}
                            {view === 'tasks' && <TaskCardsModule tasks={data.tasks} notes={data.notes || ''} onNotesChange={updateNotes} onUpdateTasks={updateTasks} />}
                            {view === 'checklist' && <ChecklistModule markdown={data.markdown} onSave={updateMarkdown} />}
                            {view === 'reports' && <ReportsModule tasks={data.tasks} markdown={data.markdown} />}
                            {view === 'config' && <ConfigModule onReset={reset} darkMode={data.darkMode} onToggleTheme={toggleTheme} />}
                        </div>
                    </div>
                </div>
            </div>
        </SnackbarProvider>
    );
}


