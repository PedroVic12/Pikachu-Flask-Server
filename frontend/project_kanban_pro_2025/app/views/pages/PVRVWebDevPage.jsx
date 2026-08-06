"use client";

import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// --- PALETAS DE CORES E TEMAS (FUNCIONANDO 100% EM TODAS AS SEÇÕES) ---
const colorPalettes = {
  neutral: {
    name: 'Padrão / Dark Cyberpunk',
    values: {
      '--bg-color': '#0d1117',
      '--text-color': '#e6edf3',
      '--primary-title-color': '#58a6ff',
      '--card-bg-color': '#161b22',
      '--border-color': 'rgba(255, 255, 255, 0.12)',
      '--nav-link-color': '#8b949e',
      '--nav-link-hover-color': '#58a6ff',
      '--header-overlay-color': 'rgba(13, 17, 23, 0.85)',
      '--accent-glow': 'rgba(88, 166, 255, 0.25)'
    }
  },
  solar: {
    name: 'Solar & ONS Gold',
    values: {
      '--bg-color': '#1c1917',
      '--text-color': '#fef08a',
      '--primary-title-color': '#f59e0b',
      '--card-bg-color': '#292524',
      '--border-color': 'rgba(245, 158, 11, 0.25)',
      '--nav-link-color': '#d6d3d1',
      '--nav-link-hover-color': '#fbbf24',
      '--header-overlay-color': 'rgba(28, 25, 23, 0.90)',
      '--accent-glow': 'rgba(245, 158, 11, 0.3)'
    }
  },
  oceanic: {
    name: 'Oceano Hydro SEP',
    values: {
      '--bg-color': '#06202a',
      '--text-color': '#e0f2fe',
      '--primary-title-color': '#38bdf8',
      '--card-bg-color': '#0b2e3c',
      '--border-color': 'rgba(56, 189, 248, 0.25)',
      '--nav-link-color': '#7dd3fc',
      '--nav-link-hover-color': '#38bdf8',
      '--header-overlay-color': 'rgba(6, 32, 42, 0.90)',
      '--accent-glow': 'rgba(56, 189, 248, 0.3)'
    }
  },
  tricolor: {
    name: 'Tricolor Fluminense / Neon',
    values: {
      '--bg-color': '#0b1c2e',
      '--text-color': '#ffffff',
      '--primary-title-color': '#10b981',
      '--card-bg-color': 'rgba(255, 255, 255, 0.06)',
      '--border-color': 'rgba(16, 185, 129, 0.3)',
      '--nav-link-color': '#a7f3d0',
      '--nav-link-hover-color': '#34d399',
      '--header-overlay-color': 'rgba(11, 28, 46, 0.90)',
      '--accent-glow': 'rgba(16, 185, 129, 0.3)'
    }
  }
};

// --- DADOS DAS TECNOLOGIAS ---
const techStackData = {
  python: {
    name: 'Python (FastAPI, Flask & Pandas)',
    color: '#38bdf8',
    bgColor: 'rgba(56, 189, 248, 0.3)',
    difficulty: 'Avançado',
    description: '<strong>Pilar do Backend, Dados e Otimização:</strong> Usado para APIs robustas (FastAPI, Flask), processamento de dados (Pandas) e análise de contingências de redes elétricas (PandaPower). Integrado com Jupyter Notebooks e relatórios dinâmicos compilados com Quarto (.qmd).',
    scores: { performance: 75, webBackend: 95, desktop: 50, embedded: 25 }
  },
  julia: {
    name: 'Julia Lang (Cálculo Científico)',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.3)',
    difficulty: 'Avançado',
    description: '<strong>Cálculo Científico de Alta Performance:</strong> Ideal para simulações elétricas complexas, fluxo de carga e álgebra linear rápida. Une a simplicidade sintática do Python à velocidade de execução do C++.',
    scores: { performance: 95, webBackend: 45, desktop: 30, embedded: 10 }
  },
  javascript: {
    name: 'JS/TS (Next.js & React)',
    color: '#facc15',
    bgColor: 'rgba(250, 204, 21, 0.3)',
    difficulty: 'Intermediário',
    description: '<strong>Frontend Moderno e Reativo:</strong> Desenvolvimento de Single Page Applications e Server-Side Rendering (Next.js 16). Estilização fluida baseada em Tailwind CSS para interfaces mobile-first e dashboards.',
    scores: { performance: 80, webBackend: 85, desktop: 45, embedded: 10 }
  },
  cpp: {
    name: 'C++ (Drogon Server & IoT)',
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.3)',
    difficulty: 'Avançado',
    description: '<strong>Performance Extrema e Baixo Nível:</strong> APIs web assíncronas ultrarrápidas usando o framework Drogon, algoritmos de redes elétricas de alto desempenho e firmware embarcado para microcontroladores (Arduino, ESP32) com WebSockets.',
    scores: { performance: 98, webBackend: 85, desktop: 65, embedded: 90 }
  },
  pyqt6: {
    name: 'PyQt6 / PySide6 Desktop',
    color: '#c084fc',
    bgColor: 'rgba(192, 132, 252, 0.3)',
    difficulty: 'Avançado',
    description: '<strong>Interfaces Nativas Desktop:</strong> Desenvolvimento de painéis de controle, ferramentas de automação e GUIs ricas integrando Python e Qt6, ideal para aplicativos como o SysPL Launcher Desktop.',
    scores: { performance: 70, webBackend: 10, desktop: 95, embedded: 10 }
  },
  rust: {
    name: 'Rust (Tauri Backend)',
    color: '#fb923c',
    bgColor: 'rgba(251, 146, 60, 0.3)',
    difficulty: 'Avançado',
    description: '<strong>Segurança de Memória e Velocidade:</strong> Backend robusto para aplicações desktop em conjunto com Tauri, combinando o controle do C++ com garantias estáticas contra falhas de concorrência e memória.',
    scores: { performance: 96, webBackend: 70, desktop: 88, embedded: 85 }
  }
};

const chartLabels = ['Performance', 'Backend Web', 'Desktop GUI', 'Sist. Embarcados'];
const chartLabelKeys = ['performance', 'webBackend', 'desktop', 'embedded'];

const radarChartData = chartLabels.map((label, index) => {
  const dataPoint = { axis: label };
  Object.keys(techStackData).forEach(techKey => {
    dataPoint[techKey] = techStackData[techKey].scores[chartLabelKeys[index]];
  });
  return dataPoint;
});

// --- DADOS DO ROTEIRO EM MARKDOWN ---
const INITIAL_ROTEIRO = {
  "Tarefas Gerais": {
    status: "EM ANDAMENTO",
    tasks: [
      { id: "tg-1", text: "3 dashboards Streamlit - Asimov", completed: true },
      { id: "tg-2", text: "Dashboard Desktop MUST - Refatoração Template", completed: true },
      { id: "tg-3", text: "Estudos de ASP com Python", completed: true },
      { id: "tg-4", text: "Bots e RPA com Python", completed: true },
      { id: "tg-5", text: "Estudos de IA, ML, DL, Chatbots, N8N, AI agentes", completed: true }
    ]
  },
  "Estágio ONS": {
    status: "CONCLUÍDO",
    tasks: [
      { id: "ons-1", text: "Relatório + Reunião Semanal", completed: true },
      { id: "ons-2", text: "Dashboard MUST com PyPDF2 e camelot", completed: true },
      { id: "ons-3", text: "Simulação Deck e Correção VD/VE (AnaREDE/AnaTEM)", completed: true },
      { id: "ons-4", text: "Análise de Contingências com PandaPower e AnaREDE", completed: true },
      { id: "ons-5", text: "Atividades Mensal PLC - VA, VB e politica energetica", completed: true }
    ]
  },
  "Eng. Elétrica UFF 2025/2026": {
    status: "EM ANDAMENTO",
    tasks: [
      { id: "uff-1", text: "Matemática aplicada, Provas Antigas", completed: true },
      { id: "uff-2", text: "Circuitos digitais e elétricos com Arduino e ESP32", completed: false },
      { id: "uff-3", text: "Jedi Cyberpunk - Python com Métodos Numericos", completed: false },
      { id: "uff-4", text: "Modelagem de Circuitos Elétricos com Laplace, Z e Fourier", completed: false },
      { id: "uff-5", text: "IoT e Arduino com WebSockets e HTML/JS", completed: false },
      { id: "uff-6", text: "Processamento Digital de Sinais (PDS)", completed: false }
    ]
  },
  "Projetos GitHub": {
    status: "A FAZER",
    tasks: [
      { id: "git-1", text: "Backend: Charizard (Drogon), Pikachu (Flask), Raichu (FastAPI)", completed: true },
      { id: "git-2", text: "Frontend: HTML, React, Flutter, Astro, PySide6, Streamlit", completed: true },
      { id: "git-3", text: "Electrical-System-Simulator (SEP)", completed: true },
      { id: "git-4", text: "meu-react-app-template (Gohan, Quizz, Habits)", completed: true },
      { id: "git-5", text: "my-flutter-getx-app (Kyogre, SCRUM, Todo)", completed: true },
      { id: "git-6", text: "Calistenia App + Goku IA trainer", completed: true }
    ]
  }
};

// --- COMPONENTES AUXILIARES ---

const ThemeSwitcher = ({ currentTheme, onThemeChange }) => (
  <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-gray-800 my-4 shadow-xl">
    <span className="text-xs font-bold text-gray-400 mr-1 uppercase tracking-wider">🎨 Paleta de Cores:</span>
    {Object.keys(colorPalettes).map(key => {
      const palette = colorPalettes[key];
      const isActive = currentTheme === key;
      return (
        <button
          key={key}
          onClick={() => onThemeChange(key)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            isActive ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-400' : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
          }`}
          title={palette.name}
        >
          <span className="w-3.5 h-3.5 rounded-full border border-white/50" style={{ backgroundColor: palette.values['--primary-title-color'] }}></span>
          <span className="hidden sm:inline">{palette.name}</span>
        </button>
      );
    })}
  </div>
);

const DevOpsProjectsSection = () => {
  const projects = [
    { id: 1, name: 'BatCaverna / Next.js Kanban Pro', url: 'http://localhost:3000', env: 'DEV', stack: 'Next.js 16 / React / Turbopack', db: 'kanban.xlsx + LocalStorage', status: 'Online (HTTP 200)' },
    { id: 2, name: 'Pikachu Flask Backend Server', url: 'http://localhost:5000', env: 'DEV', stack: 'Python / Flask / REST API', db: 'sqlite / PostgreSQL', status: 'Standby' },
    { id: 3, name: 'FastAPI Microservice SEP', url: 'http://localhost:8000', env: 'STABLE', stack: 'Python / FastAPI / Pydantic', db: 'batcaverna.sqlite', status: 'Online' },
    { id: 4, name: 'Streamlit IA & Data App', url: 'http://localhost:8501', env: 'STABLE', stack: 'Streamlit / Pandas / Plotly', db: 'data.sqlite', status: 'Online' }
  ];

  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-extrabold section-title flex items-center gap-2">
          <span>🌐</span> GERENCIADOR DEV-OPS & URLS ATIVAS
        </h2>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
          LOCAL HOSTS
        </span>
      </div>
      <p className="text-xs sm:text-sm opacity-80 mb-6">
        Monitoramento de servidores locais, portas de desenvolvimento (DEV vs STABLE) e arquivos de banco de dados SQLite.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map(p => (
          <div key={p.id} className="card p-5 border border-gray-700/50 hover:border-cyan-500 transition-all flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm sm:text-base font-bold text-cyan-400">{p.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.env === 'DEV' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' : 'bg-green-500/20 text-green-300 border border-green-500/50'}`}>
                  {p.env}
                </span>
              </div>
              <div className="space-y-1 text-xs font-mono opacity-90">
                <div>🔗 <strong>URL:</strong> <a href={p.url} target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold hover:text-cyan-300">{p.url}</a></div>
                <div>⚡ <strong>Stack:</strong> {p.stack}</div>
                <div>💾 <strong>Banco:</strong> {p.db}</div>
                <div>📡 <strong>Status:</strong> <span className="text-green-400 font-bold">{p.status}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const EcosystemSection = () => (
  <section className="mb-12">
    <h2 className="text-xl sm:text-2xl font-bold section-title text-center mb-4 flex items-center justify-center gap-2">
      <span>🧠</span> 1. O ECOSSISTEMA DE DESENVOLVIMENTO PVRV
    </h2>
    <p className="text-xs sm:text-sm text-center max-w-3xl mx-auto mb-8 opacity-80">
      Visão geral das camadas que compõem sistemas modernos, desde o hardware até a interface do usuário.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="card p-5 border border-gray-800 hover:border-blue-500 transition">
        <div className="text-3xl mb-2">🧠</div>
        <h3 className="text-base font-bold section-title mb-1">Backend & Análise</h3>
        <p className="text-xs opacity-80">Processa dados para otimização SEP, IA e lógica de negócios. <strong>Stack:</strong> Python, C++, Rust.</p>
      </div>
      <div className="card p-5 border border-gray-800 hover:border-blue-500 transition">
        <div className="text-3xl mb-2">📊</div>
        <h3 className="text-base font-bold section-title mb-1">Frontend & Visualização</h3>
        <p className="text-xs opacity-80">Interfaces interativas e dashboards reativos. <strong>Stack:</strong> Next.js 16, React, TailwindCSS, Flutter.</p>
      </div>
      <div className="card p-5 border border-gray-800 hover:border-blue-500 transition">
        <div className="text-3xl mb-2">💻</div>
        <h3 className="text-base font-bold section-title mb-1">Aplicações Desktop</h3>
        <p className="text-xs opacity-80">Ferramentas de controle nativo no OS. <strong>Stack:</strong> PySide6 (Qt6), Tauri (Rust), C++ Win32.</p>
      </div>
      <div className="card p-5 border border-gray-800 hover:border-blue-500 transition">
        <div className="text-3xl mb-2">🛠️</div>
        <h3 className="text-base font-bold section-title mb-1">Automação & IoT</h3>
        <p className="text-xs opacity-80">Controle direto de microcontroladores e processos industriais. <strong>Stack:</strong> Arduino (C++), ESP32 WebSockets.</p>
      </div>
    </div>
  </section>
);

const LanguageSelector = ({ selectedTechs, onSelectTech }) => (
  <div className="flex flex-wrap justify-center gap-2 mb-6">
    {Object.keys(techStackData).map(key => {
      const tech = techStackData[key];
      const isActive = selectedTechs.includes(key);
      return (
        <button
          key={key}
          onClick={() => onSelectTech(key)}
          className={`font-semibold text-xs py-2 px-3.5 rounded-xl border transition-all duration-200 ${
            isActive ? 'scale-105 shadow-lg text-white font-bold' : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            backgroundColor: isActive ? tech.color : 'var(--card-bg-color)',
            borderColor: tech.color,
            color: isActive ? '#000000' : 'var(--text-color)'
          }}
        >
          {tech.name}
        </button>
      );
    })}
  </div>
);

// --- COMPONENTE DE GRÁFICO DE RADAR 3D REATIVO ---
const TechChart = ({ selectedTechs }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="w-full max-w-lg mx-auto h-72 sm:h-80 my-4 flex items-center justify-center border border-gray-800 rounded-2xl bg-black/40 shadow-2xl">
        <span className="text-xs font-mono text-cyan-400 animate-pulse">⚡ Carregando Gráfico Radar 3D...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto h-72 sm:h-80 my-4 relative p-2 bg-gradient-to-b from-blue-950/20 to-black/60 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
         style={{ transform: 'perspective(1000px) rotateX(4deg)', transformStyle: 'preserve-3d' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
          <PolarGrid stroke="var(--border-color)" strokeWidth={1.5} />
          <PolarAngleAxis dataKey="axis" tick={{ fill: 'var(--text-color)', fontSize: 11, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-color)', fontSize: 9 }} />
          {selectedTechs.map(techKey => {
            const tech = techStackData[techKey];
            return (
              <Radar
                key={techKey}
                name={tech.name}
                dataKey={techKey}
                stroke={tech.color}
                strokeWidth={2.5}
                fill={tech.bgColor}
                fillOpacity={0.65}
              />
            );
          })}
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const TechDetailsAside = ({ techKey }) => {
  if (!techKey) {
    return (
      <aside className="card p-6 h-fit border border-gray-800 shadow-xl">
        <h3 className="text-lg font-bold section-title">Selecione uma Tecnologia</h3>
        <p className="text-xs mt-2 opacity-80">Clique nas tecnologias acima para visualizá-las no gráfico de radar 3D e ver os detalhes técnicos.</p>
      </aside>
    );
  }
  const tech = techStackData[techKey];
  return (
    <aside className="card p-6 h-fit border border-gray-800 shadow-xl">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold" style={{ color: tech.color }}>{tech.name}</h3>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-800 text-cyan-400">{tech.difficulty}</span>
      </div>
      <div className="text-xs leading-relaxed opacity-90 space-y-2" dangerouslySetInnerHTML={{ __html: tech.description }}></div>
    </aside>
  );
};

const RoadmapCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { icon: '🏗️', title: 'Passo 1: Fundamento Sólido', subtitle: 'Fullstack Smart Grids & ONS', points: ['Python: Domine Pandas, FastAPI, Flask e Pandapower.', 'JS/TS: Next.js 16, React, TailwindCSS para dashboards reativos.'] },
    { icon: '🎯', title: 'Passo 2: Especialização', subtitle: 'Cálculo & Performance', points: ['Dados/IA: Redes Neurais e Machine Learning.', 'Tempo Real / SEP: C++ (Drogon), Julia e Rust (Tauri).'] },
    { icon: '📂', title: 'Passo 3: Portfólio Ativo', subtitle: 'Projetos Práticos', points: ['Simulador de Redes Elétricas (ANAREDE / PandaPower).', 'Painéis KanbanPro & Automação de Scripts Python.'] }
  ];

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  const slide = slides[currentSlide];

  return (
    <div className="card p-6 relative max-w-2xl mx-auto border border-gray-800 shadow-xl">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-3xl p-3 bg-black/40 rounded-xl border border-gray-800">{slide.icon}</span>
        <div>
          <h3 className="text-lg font-bold section-title">{slide.title}</h3>
          <p className="text-xs opacity-70">{slide.subtitle}</p>
        </div>
      </div>
      <ul className="space-y-2 text-xs list-disc list-inside opacity-90 font-mono">
        {slide.points.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
        <button onClick={prevSlide} disabled={currentSlide === 0} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded text-xs font-bold">← Anterior</button>
        <span className="text-xs font-mono opacity-70">{currentSlide + 1} / {slides.length}</span>
        <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded text-xs font-bold">Próximo →</button>
      </div>
    </div>
  );
};

const RoteiroPessoalSection = () => {
  const [roteiro, setRoteiro] = useState(INITIAL_ROTEIRO);

  const handleToggleTask = (category, taskId) => {
    setRoteiro(prev => {
      const updated = { ...prev };
      const tasks = updated[category].tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      updated[category] = { ...updated[category], tasks };
      return updated;
    });
  };

  return (
    <section className="mb-12">
      <h2 className="text-xl sm:text-2xl font-bold section-title text-center mb-2 flex items-center justify-center gap-2">
        <span>📋</span> 4. MEU ROTEIRO PESSOAL & TAREFAS
      </h2>
      <p className="text-xs sm:text-sm text-center opacity-80 mb-8 max-w-3xl mx-auto">
        Dashboard de tarefas, estudos UFF, estágio ONS e projetos GitHub.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(roteiro).map(([category, data]) => (
          <div key={category} className="card p-5 border border-gray-800 flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-cyan-400">{category}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {data.status}
              </span>
            </div>
            <ul className="space-y-2 flex-1">
              {data.tasks.map(t => (
                <li key={t.id} className="flex items-center gap-2.5 text-xs">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => handleToggleTask(category, t.id)}
                    className="w-4 h-4 rounded text-blue-500 cursor-pointer"
                  />
                  <span className={t.completed ? 'line-through opacity-50' : 'opacity-90'}>{t.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- COMPONENTE PRINCIPAL PVRV WEB DEV CORE (100% RESPONSIVO) ---
export default function PVRVWebDevPage({ theme: globalTheme = 'dark' }) {
  const [selectedTechs, setSelectedTechs] = useState(['python', 'javascript']);
  const [currentTheme, setCurrentTheme] = useState('neutral');

  useEffect(() => {
    if (globalTheme === 'dark') setCurrentTheme('neutral');
    else setCurrentTheme('solar');
  }, [globalTheme]);

  const handleSelectTech = (techKey) => {
    setSelectedTechs(prev =>
      prev.includes(techKey) ? prev.filter(t => t !== techKey) : [...prev, techKey]
    );
  };

  const themeValues = colorPalettes[currentTheme]?.values || colorPalettes.neutral.values;

  return (
    <div style={themeValues} className="w-full h-full p-4 sm:p-6 lg:p-8 bg-[#0d1117] text-[#e6edf3] overflow-y-auto transition-all duration-300">
      
      {/* SELETOR DE PALETAS DE CORES */}
      <ThemeSwitcher currentTheme={currentTheme} onThemeChange={setCurrentTheme} />

      {/* HEADER PRINCIPAL */}
      <header className="p-6 sm:p-8 rounded-2xl bg-black/50 border border-gray-800 text-center mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-cyan-900/20"></div>
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase">
            PVRV WEB DEV & DEV-OPS CORE 2026
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold section-title mt-3 mb-2">
            Meu Legado de Dev: Guia & Roteiro Pessoal
          </h1>
          <p className="text-xs sm:text-sm max-w-3xl mx-auto opacity-80">
            Jornada pelas tecnologias, linguagens e estratégias para redes elétricas inteligentes, backend assíncrono e dashboards.
          </p>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL EM GRID RESPONSIVO */}
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 1. SEÇÃO DEV-OPS & URLS LOCALHOST */}
        <DevOpsProjectsSection />

        {/* 2. SEÇÃO ECOSSISTEMA */}
        <EcosystemSection />

        {/* 3. STACK DE TECNOLOGIAS E DETALHES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-6 bg-black/40 rounded-2xl border border-gray-800 shadow-xl">
            <h2 className="text-xl sm:text-2xl font-extrabold section-title text-center mb-2 flex items-center justify-center gap-2">
              <span>⚡</span> 2. STACK DE TECNOLOGIAS & RADAR 3D
            </h2>
            <p className="text-xs text-center opacity-70 mb-6">
              Clique nas tecnologias para comparar no radar.
            </p>

            <LanguageSelector selectedTechs={selectedTechs} onSelectTech={handleSelectTech} />
            <TechChart selectedTechs={selectedTechs} />
          </div>

          <TechDetailsAside techKey={selectedTechs.length > 0 ? selectedTechs[selectedTechs.length - 1] : null} />
        </div>

        {/* 4. PLANO DE AÇÃO (ROADMAP) */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold section-title text-center mb-4 flex items-center justify-center gap-2">
            <span>🎯</span> 3. PLANO DE AÇÃO (ROADMAP)
          </h2>
          <RoadmapCarousel />
        </section>

        {/* 5. ROTEIRO PESSOAL */}
        <RoteiroPessoalSection />

      </div>

    </div>
  );
}
