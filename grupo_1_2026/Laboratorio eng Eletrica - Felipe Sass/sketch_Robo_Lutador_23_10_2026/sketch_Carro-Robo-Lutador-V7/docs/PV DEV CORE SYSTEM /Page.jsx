import React, { useEffect, useMemo, useState } from 'react';
import { FontBar, GlobalStyles, GlassCard, Sidebar } from './Components.jsx';

const semestersInitial = [
  { code: '2022.2', title: 'Fundamentos matemáticos & programação', subjects: [{ name: 'Cálculo I', status: 'CONCLUÍDO', grade: 8.5 }, { name: 'Geometria Analítica', status: 'CONCLUÍDO', grade: 9.0 }, { name: 'Programação de Computadores', status: 'CONCLUÍDO', grade: 9.8 }] },
  { code: '2023.1', title: 'Física clássica & álgebra linear', subjects: [{ name: 'Cálculo II', status: 'CONCLUÍDO', grade: 8.2 }, { name: 'Álgebra Linear', status: 'CONCLUÍDO', grade: 8.8 }, { name: 'Física I', status: 'CONCLUÍDO', grade: 8.5 }] },
  { code: '2023.2', title: 'Cálculo vetorial & ondas', subjects: [{ name: 'Cálculo III', status: 'CONCLUÍDO', grade: 8.4 }, { name: 'Física II', status: 'CONCLUÍDO', grade: 8.6 }] },
  { code: '2024.1', title: 'Eletromagnetismo & métodos numéricos', subjects: [{ name: 'Física III', status: 'CONCLUÍDO', grade: 9.0 }, { name: 'Métodos Numéricos', status: 'CONCLUÍDO', grade: 9.4 }] },
  { code: '2024.2', title: 'Circuitos elétricos & sinais', subjects: [{ name: 'Circuitos Elétricos I', status: 'CONCLUÍDO', grade: 9.1 }, { name: 'Sinais e Sistemas', status: 'CONCLUÍDO', grade: 8.9 }] },
  { code: '2025.1', title: 'Circuitos trifásicos & eletrônica', subjects: [{ name: 'Circuitos Elétricos II', status: 'CONCLUÍDO', grade: 9.2 }, { name: 'Teoria Eletromagnética', status: 'CONCLUÍDO', grade: 8.7 }] },
  { code: '2025.2', title: 'Conversão de energia & controle', subjects: [{ name: 'Máquinas Elétricas', status: 'CONCLUÍDO', grade: 9.0 }, { name: 'Sistemas de Controle', status: 'CONCLUÍDO', grade: 9.3 }] },
  { code: '2026.1', title: 'Sistemas de potência I & PDS', subjects: [{ name: 'Sistemas Elétricos de Potência I', status: 'CONCLUÍDO', grade: 9.5 }, { name: 'Processamento Digital de Sinais', status: 'CONCLUÍDO', grade: 9.1 }] },
  { code: '2026.2', title: 'Análise SEP, eletrônica de potência & IoT', subjects: [{ name: 'Sistemas Elétricos de Potência II', status: 'EM ANDAMENTO', grade: 9.4 }, { name: 'Eletrônica de Potência', status: 'EM ANDAMENTO', grade: 9.0 }, { name: 'Microcontroladores e IoT', status: 'EM ANDAMENTO', grade: 9.7 }] },
  { code: '2027.1', title: 'Proteção SEP, smart grids & otimização', subjects: [{ name: 'Proteção de Sistemas Elétricos', status: 'PREVISTO', grade: 9.5 }, { name: 'Fluxo de Potência Ótimo', status: 'PREVISTO', grade: 9.6 }] },
  { code: '2027.2', title: 'TCC, transmissão HVDC & formatura', subjects: [{ name: 'Trabalho de Conclusão de Curso', status: 'PREVISTO', grade: 10 }, { name: 'Transmissão HVDC', status: 'PREVISTO', grade: 9.6 }] },
];

const timeline = [
  { category: 'BRASIL', year: '1500–1530', title: 'Período pré-colonial', text: 'Chegada de Cabral, exploração do pau-brasil e navegação astronômica no Atlântico Sul.' },
  { category: 'BRASIL', year: '1530–1548', title: 'Capitanias hereditárias', text: 'Organização administrativa da América Portuguesa e primeiros levantamentos cartográficos.' },
  { category: 'BRASIL', year: '1549–1808', title: 'Governo-Geral e período colonial', text: 'Centralização em Salvador e no Rio de Janeiro, ciclo do ouro e transformação científica no mundo.' },
  { category: 'CIÊNCIA', year: '1687', title: 'Newton publica os Principia', text: 'As leis do movimento e da gravitação estabelecem fundamentos da mecânica clássica.' },
  { category: 'BRASIL', year: '1808–1822', title: 'Período Joanino', text: 'A corte portuguesa chega ao Brasil e são criadas instituições de ensino e pesquisa.' },
  { category: 'CIÊNCIA', year: '1820–1865', title: 'Ohm, Faraday e Maxwell', text: 'Leis fundamentais conectam corrente, tensão, indução eletromagnética e campos.' },
  { category: 'BRASIL', year: '1822–1889', title: 'Império do Brasil', text: 'Independência, Primeiro e Segundo Reinados, abolição da escravidão e modernização.' },
  { category: 'PESSOAL', year: '2022.2–2027.2', title: 'Engenharia Elétrica na UFF', text: 'Trajetória acadêmica em engenharia, sistemas de potência, programação e desenvolvimento.' },
];

const technologies = [
  { name: 'Python', category: 'Simulação, APIs e ciência de dados', value: 96, color: '#38bdf8' },
  { name: 'Julia', category: 'Cálculo científico de alta performance', value: 88, color: '#c084fc' },
  { name: 'JavaScript / React', category: 'Interfaces web e visualização', value: 90, color: '#facc15' },
  { name: 'C++', category: 'Sistemas embarcados e performance', value: 92, color: '#fb7185' },
  { name: 'Rust', category: 'Sistemas seguros e aplicações desktop', value: 82, color: '#fb923c' },
  { name: 'PyQt', category: 'Ferramentas desktop', value: 84, color: '#34d399' },
];

const startingTasks = [
  { group: 'Estágio ONS', items: ['Análise de contingências SEP', 'Automação de relatórios e painéis', 'Simulações com ferramentas de engenharia'] },
  { group: 'Engenharia UFF', items: ['Circuitos digitais com Arduino e ESP32', 'Modelagem com Laplace, Z e Fourier', 'Processamento Digital de Sinais'] },
  { group: 'Projetos', items: ['Electrical System Simulator', 'Dashboards de dados e energia', 'Aplicações web e ferramentas open source'] },
];

const formatCountdown = () => {
  const end = new Date(2027, 11, 15, 20, 0, 0);
  const start = new Date(2022, 7, 15, 8, 0, 0);
  const now = new Date();
  const remain = Math.max(0, end - now);
  return {
    days: Math.floor(remain / 86400000),
    hours: Math.floor(remain / 3600000) % 24,
    minutes: Math.floor(remain / 60000) % 60,
    seconds: Math.floor(remain / 1000) % 60,
    progress: Math.min(100, Math.max(0, (now - start) / (end - start) * 100)),
  };
};

export default function ProtocoloSaudeMentalPage({ fonts, selectedFont, onFontChange }) {
  const [page, setPage] = useState('overview');
  const [countdown, setCountdown] = useState(formatCountdown);
  const [semesters, setSemesters] = useState(semestersInitial);
  const [selectedSemester, setSelectedSemester] = useState('2026.2');
  const [filter, setFilter] = useState('TODOS');
  const [subjectName, setSubjectName] = useState('');
  const [subjectSemester, setSubjectSemester] = useState('2027.1');
  const [tasks, setTasks] = useState(() => startingTasks.map(group => ({ ...group, items: group.items.map(text => ({ text, done: false })) })));

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(formatCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const subjectStats = useMemo(() => {
    const all = semesters.flatMap(semester => semester.subjects);
    const completed = all.filter(subject => subject.status === 'CONCLUÍDO').length;
    const grades = all.filter(subject => subject.status !== 'PREVISTO' && subject.grade).map(subject => subject.grade);
    return { total: all.length, completed, percent: Math.round(completed / all.length * 100), average: (grades.reduce((sum, grade) => sum + grade, 0) / grades.length).toFixed(2) };
  }, [semesters]);

  const selectedTerm = semesters.find(semester => semester.code === selectedSemester);
  const filteredTimeline = timeline.filter(item => filter === 'TODOS' || item.category === filter);

  const toggleStatus = (semesterCode, subjectNameToChange) => {
    const order = ['PREVISTO', 'EM ANDAMENTO', 'CONCLUÍDO'];
    setSemesters(current => current.map(semester => semester.code !== semesterCode ? semester : {
      ...semester,
      subjects: semester.subjects.map(subject => subject.name !== subjectNameToChange ? subject : {
        ...subject,
        status: order[(order.indexOf(subject.status) + 1) % order.length],
      }),
    }));
  };

  const addSubject = event => {
    event.preventDefault();
    const trimmed = subjectName.trim();
    if (!trimmed) return;
    setSemesters(current => current.map(semester => semester.code !== subjectSemester ? semester : {
      ...semester,
      subjects: [...semester.subjects, { name: trimmed, status: 'PREVISTO', grade: 9.5 }],
    }));
    setSelectedSemester(subjectSemester);
    setSubjectName('');
  };

  const toggleTask = (groupIndex, taskIndex) => {
    setTasks(current => current.map((group, i) => i !== groupIndex ? group : {
      ...group,
      items: group.items.map((item, j) => j !== taskIndex ? item : { ...item, done: !item.done }),
    }));
  };

  return (
    <div className="app-shell" style={{ fontFamily: fonts[selectedFont] }}>
      <GlobalStyles />
      <Sidebar page={page} onNavigate={setPage} />
      <FontBar fonts={fonts} selectedFont={selectedFont} onFontChange={onFontChange} page={page} />
      <main className="main-area">
        <div className="content">
          {page === 'overview' ? (
            <>
              <div className="eyebrow">Portfólio pessoal · Engenharia Elétrica · UFF</div>
              <h1 className="page-title">Código, ciência e energia.<br />Uma jornada em construção.</h1>
              <p className="page-intro">Painel interativo da trajetória acadêmica e técnica: planejamento da graduação, métricas, projetos e tecnologias em sistemas de potência e desenvolvimento de software.</p>

              <GlassCard className="hero-card">
                <div className="row-between" style={{ flexWrap: 'wrap', marginBottom: 17 }}>
                  <div><span className="pill">🎓 PREVISÃO DE FORMATURA · 2027.2</span><h2 style={{ color: '#f8fafc', fontSize: 21, margin: '13px 0 5px' }}>Progresso da graduação</h2><div className="muted" style={{ fontSize: 12 }}>UFF · Engenharia Elétrica · 2022.2 → 2027.2</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ color: '#6ee7b7', font: '700 22px monospace' }}>{countdown.progress.toFixed(1)}%</div><div className="muted" style={{ fontSize: 10 }}>JORNADA PERCORRIDA</div></div>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${countdown.progress}%` }} /></div>
                <div className="grid grid-4" style={{ marginTop: 20 }}>
                  <div className="glass-card metric"><div className="metric-label">Dias até a previsão</div><div className="metric-value">{String(countdown.days).padStart(3, '0')}</div><div className="metric-note">contagem regressiva</div></div>
                  <div className="glass-card metric"><div className="metric-label">Horas</div><div className="metric-value">{String(countdown.hours).padStart(2, '0')}</div><div className="metric-note">até dezembro de 2027</div></div>
                  <div className="glass-card metric"><div className="metric-label">Matérias concluídas</div><div className="metric-value">{subjectStats.completed}<span style={{ color: '#728198', fontSize: 15 }}> / {subjectStats.total}</span></div><div className="metric-note">{subjectStats.percent}% do planejamento</div></div>
                  <div className="glass-card metric"><div className="metric-label">Média cadastrada</div><div className="metric-value">{subjectStats.average}</div><div className="metric-note">escala de 0 a 10</div></div>
                </div>
              </GlassCard>

              <div className="section">
                <div className="row-between" style={{ flexWrap: 'wrap' }}><h2 className="section-heading">Planejador acadêmico</h2><span className="pill">11 SEMESTRES · 2022.2—2027.2</span></div>
                <p className="section-copy">Selecione um semestre para consultar as disciplinas. Clique no status para avançar entre previsto, em andamento e concluído.</p>
                <div className="tab-row" style={{ flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 5 }}>
                  {semesters.map(semester => <button key={semester.code} className={`tab-button${selectedSemester === semester.code ? ' active' : ''}`} onClick={() => setSelectedSemester(semester.code)}>{semester.code}</button>)}
                </div>
                {selectedTerm && <GlassCard className="data-card">
                  <div className="row-between" style={{ marginBottom: 8, flexWrap: 'wrap' }}><h3>{selectedTerm.code} · {selectedTerm.title}</h3><span className="pill">{selectedTerm.subjects.length} DISCIPLINAS</span></div>
                  {selectedTerm.subjects.map(subject => <div className="list-row" key={subject.name}>
                    <div><div className="list-name">{subject.name}</div><div className="list-detail">Nota / meta: {Number(subject.grade).toFixed(1)}</div></div>
                    <button className="control-button" onClick={() => toggleStatus(selectedTerm.code, subject.name)}>{subject.status} ↻</button>
                  </div>)}
                </GlassCard>}
                <form onSubmit={addSubject} className="glass-card data-card" style={{ marginTop: 14 }}>
                  <h3>Adicionar disciplina ao planejamento</h3>
                  <div className="grid grid-2" style={{ alignItems: 'end' }}>
                    <label className="muted" style={{ fontSize: 11 }}>Nome da disciplina<input className="text-input" required value={subjectName} onChange={event => setSubjectName(event.target.value)} placeholder="Ex.: Proteção de Sistemas Elétricos" style={{ marginTop: 7 }} /></label>
                    <div className="row-between"><label className="muted" style={{ fontSize: 11, flex: 1 }}>Semestre<select className="select-input" value={subjectSemester} onChange={event => setSubjectSemester(event.target.value)} style={{ marginTop: 7 }}>{semesters.map(semester => <option key={semester.code} value={semester.code}>{semester.code}</option>)}</select></label><button className="control-button" type="submit" style={{ margin: '19px 0 0 10px' }}>＋ Adicionar</button></div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <>
              <div className="eyebrow">História · tecnologia · projetos</div>
              <h1 className="page-title">Da ciência aos sistemas<br />que movem o futuro.</h1>
              <p className="page-intro">Uma visão integrada dos marcos históricos, das tecnologias utilizadas e dos objetivos acadêmicos e profissionais.</p>

              <div className="section">
                <h2 className="section-heading">Linha do tempo</h2>
                <p className="section-copy">Explore marcos do Brasil, da ciência e da trajetória acadêmica.</p>
                <div className="tab-row">{['TODOS', 'BRASIL', 'CIÊNCIA', 'PESSOAL'].map(category => <button key={category} className={`tab-button${filter === category ? ' active' : ''}`} onClick={() => setFilter(category)}>{category}</button>)}</div>
                <GlassCard className="data-card">
                  {filteredTimeline.map(item => <article className="timeline-item" key={`${item.year}-${item.title}`}><div className="timeline-year">{item.year}<div style={{ marginTop: 7 }}><span className="pill">{item.category}</span></div></div><div><div className="timeline-title">{item.title}</div><p className="timeline-description">{item.text}</p></div></article>)}
                </GlassCard>
              </div>

              <div className="section">
                <h2 className="section-heading">Tecnologias & especialidades</h2>
                <p className="section-copy">Áreas de interesse em desenvolvimento, computação científica e engenharia elétrica.</p>
                <div className="grid grid-2">
                  {technologies.map(tech => <GlassCard className="data-card" key={tech.name}>
                    <div className="row-between"><h3>{tech.name}</h3><span style={{ color: tech.color, font: '12px monospace' }}>{tech.value}%</span></div>
                    <p>{tech.category}</p><div className="progress-track" style={{ marginTop: 13 }}><div className="progress-fill" style={{ width: `${tech.value}%`, background: tech.color }} /></div>
                  </GlassCard>)}
                </div>
              </div>

              <div className="section">
                <h2 className="section-heading">Roteiro pessoal & tarefas</h2>
                <p className="section-copy">Marque tarefas para acompanhar o progresso em estágio, graduação e projetos.</p>
                <div className="grid grid-3">
                  {tasks.map((group, groupIndex) => <GlassCard className="data-card" key={group.group}>
                    <h3>{group.group}</h3>
                    {group.items.map((item, taskIndex) => <label className="check-row" key={item.text}><input type="checkbox" checked={item.done} onChange={() => toggleTask(groupIndex, taskIndex)} /><span style={{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? .55 : 1 }}>{item.text}</span></label>)}
                  </GlassCard>)}
                </div>
              </div>

              <div className="section">
                <h2 className="section-heading">Ecossistema de desenvolvimento</h2>
                <div className="grid grid-2">
                  {[
                    ['Painéis e aplicações', 'Dashboards interativos, aplicações web e ferramentas de análise de dados.'],
                    ['Engenharia de potência', 'Modelagem SEP, fluxo de carga, análise de contingências e automação de estudos.'],
                    ['Computação científica', 'Python e Julia para métodos numéricos, álgebra simbólica e simulações.'],
                    ['Sistemas embarcados', 'Projetos com microcontroladores, sensores, IoT e comunicação em tempo real.'],
                  ].map(([title, description]) => <GlassCard className="data-card" key={title}><h3>{title}</h3><p>{description}</p></GlassCard>)}
                </div>
              </div>
            </>
          )}
          <footer style={{ color: '#627187', fontSize: 10, textAlign: 'center', marginTop: 44, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,.08)' }}>PVRV DEV CORE · Portfólio acadêmico e técnico</footer>
        </div>
      </main>
    </div>
  );
}
