'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Radar, RadarChart, PolarGrid, Legend, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// --- DADOS DAS TECNOLOGIAS ---
const techStackData = {
    python: { name: 'Python Backend', color: 'rgba(53, 114, 165, 1)', bgColor: 'rgba(53, 114, 165, 0.2)', difficulty: 'Intermediário', description: '<strong>Pilar do Backend e Dados:</strong> Usado para APIs robustas (FastAPI, Flask, Django), análise de dados complexas e simulações de sistemas elétricos (PandaPower). A base para IA e ML.', scores: { performance: 70, webBackend: 95, desktop: 40, embedded: 20 } },
    cpp: { name: 'C++ (Drogon server) e Arduino', color: 'rgba(243, 75, 125, 1)', bgColor: 'rgba(243, 75, 125, 0.2)', difficulty: 'Avançado', description: '<strong>Performance Absoluta:</strong> Para web servers de altíssima velocidade com Drogon e software que interage diretamente com hardware, onde cada microssegundo conta.', scores: { performance: 98, webBackend: 70, desktop: 60, embedded: 90 } },
    rust: { name: 'Rust', color: 'rgba(222, 165, 132, 1)', bgColor: 'rgba(222, 165, 132, 0.2)', difficulty: 'Avançado', description: '<strong>Segurança e Velocidade:</strong> A escolha moderna para sistemas críticos, combinando a performance do C++ com garantias de segurança de memória, ideal para backend e sistemas embarcados do futuro.', scores: { performance: 95, webBackend: 65, desktop: 50, embedded: 85 } },
    nodejs: { name: 'Node.js', color: 'rgba(104, 159, 56, 1)', bgColor: 'rgba(104, 159, 56, 0.2)', difficulty: 'Iniciante', description: '<strong>Ecossistema JavaScript:</strong> Utilizado para gerenciar pacotes (NPM) e construir backends rápidos e eficientes para aplicações web, integrando-se perfeitamente com frameworks de frontend.', scores: { performance: 75, webBackend: 90, desktop: 20, embedded: 10 } },
    pyside6: { name: 'PySide6 App Desktop', color: 'rgba(179, 157, 219, 1)', bgColor: 'rgba(179, 157, 219, 0.2)', difficulty: 'Intermediário', description: '<strong>Desktop com Python:</strong> Cria aplicações desktop nativas e ricas em recursos usando o poder do Python e do framework Qt, ideal para ferramentas de análise e simuladores.', scores: { performance: 60, webBackend: 0, desktop: 90, embedded: 5 } },
    flutter: { name: 'Flutter - Mobile', color: 'rgba(3, 169, 244, 1)', bgColor: 'rgba(3, 169, 244, 0.2)', difficulty: 'Intermediário', description: '<strong>Multiplataforma Nativo:</strong> Desenvolve apps para mobile, web e desktop a partir de um único código-base com performance nativa. Perfeito para dashboards e apps de controle.', scores: { performance: 80, webBackend: 40, desktop: 85, embedded: 30 } },
    tauri: { name: 'Tauri Rust Desktop', color: 'rgba(255, 179, 0, 1)', bgColor: 'rgba(255, 179, 0, 0.2)', difficulty: 'Intermediário', description: '<strong>Desktop Leve e Seguro:</strong> Constrói aplicações desktop usando tecnologias web (HTML, JS) com um backend em Rust, resultando em apps extremamente leves, rápidos e seguros.', scores: { performance: 85, webBackend: 0, desktop: 95, embedded: 15 } },
    html: { name: 'HTML/CSS/JS/Tailwind/Bootstrap', color: 'rgba(239, 83, 80, 1)', bgColor: 'rgba(239, 83, 80, 0.2)', difficulty: 'Iniciante', description: '<strong>A Base da Web:</strong> O trio fundamental para qualquer site ou sistema web, oferecendo a estrutura, estilo e interatividade para todas as aplicações frontend.', scores: { performance: 50, webBackend: 20, desktop: 70, embedded: 5 } }
};
const chartLabels = ['Performance', 'Backend Web', 'Desktop GUI', 'Sist. Embarcados'];

// --- DADOS DO ROTEIRO (FORMATO MARKDOWN) ---
const markdownTasks = `
# Tarefas Gerais
- [x] 3 dashboards Streamlit - Asimov
- [x] Dashboard Desktop MUST - Refatoração Template
- [x] Estudos de ASP com Python
- [x] Bots e RPA com Python
- [x] Estudos de IA, ML, DL, Chatbots, N8N, AI agentes

# Estágio ONS
- [x] Relatório + Reunião Semanal
- [x] Dashboard MUST com PyPDF2 e camelot
- [x] Simulação Deck e Correção VD/VE (AnaREDE/AnaTEM)
- [x] Análise de Contingências com PandaPower e AnaREDE
- [x] Atividades Mensal PLC - VA,VB e politica energetica

# Eng. Elétrica UFF 2025
- [x] Matemática aplicada, Provas Antigas
- [ ] Circuitos digitais e elétricos com Arduino e ESP32
- [ ] Jedi Cyberpunk - Python com Métodos Numericos
- [ ] Modelagem de Circuitos Elétricos com Laplace
- [ ] IOT E ARDUINO COM WEBSOCKET E HTML
- [ ] Processamento Digital de Sinais

# Projetos Github
- [x] Backend: Charizard (Drogon), Pikachu (Flask), Raichu (FastAPI)
- [x] Frontend: HTML, React, Flutter, Astro, Pyside6, Streamlit
- [x] Electrical-System-Simulator
- [x] meu-react-app-template (Gohan, Quizz, Habits)
- [x] my-flutter-getx-app (Kyogre, SCRUM, Todo)
- [x] Gohan Treinamentos
- [x] Calistenia App + Goku IA trainer
`;

// --- FUNÇÃO PARA PARSE DO MARKDOWN ---
const parseMarkdownTasks = (md) => {
    const lines = md.trim().split('\n');
    const data = {};
    let currentCategory = null;
    let taskIdCounter = 0;
    const categoryStatusMap = {
        "Tarefas Gerais": "EM ANDAMENTO",
        "Estágio ONS": "CONCLUÍDO",
        "Eng. Elétrica UFF 2025": "EM ANDAMENTO",
        "Projetos Github": "A FAZER",
    };
    lines.forEach(line => {
        if (line.startsWith('# ')) {
            currentCategory = line.substring(2).trim();
            data[currentCategory] = {
                status: categoryStatusMap[currentCategory] || "A FAZER",
                tasks: []
            };
        } else if (line.startsWith('- [') && currentCategory) {
            const completed = line[3] === 'x';
            const text = line.substring(6).trim();
            data[currentCategory].tasks.push({
                id: `${currentCategory.replace(/\s+/g, '')}-${taskIdCounter++}`,
                text,
                completed
            });
        }
    });
    return data;
};

const initialRoteiroData = parseMarkdownTasks(markdownTasks);

// --- PALETAS DE CORES ---
const colorPalettes = {
    neutral: { name: 'Padrão', values: { '--bg-color': '#f8f9fa', '--text-color': '#343a40', '--primary-title-color': '#003366', '--card-bg-color': '#ffffff', '--nav-link-color': '#4a5568', '--nav-link-hover-color': '#0056b3', '--header-overlay-color': 'rgba(248, 249, 250, 0.85)' } },
    solar: { name: 'Solar', values: { '--bg-color': '#FFF8E1', '--text-color': '#4E342E', '--primary-title-color': '#E65100', '--card-bg-color': '#FFFAF0', '--nav-link-color': '#6D4C41', '--nav-link-hover-color': '#BF360C', '--header-overlay-color': 'rgba(255, 248, 225, 0.85)' } },
    oceanic: { name: 'Oceano', values: { '--bg-color': '#E0F7FA', '--text-color': '#004D40', '--primary-title-color': '#006064', '--card-bg-color': '#F0FEFF', '--nav-link-color': '#00796B', '--nav-link-hover-color': '#004D40', '--header-overlay-color': 'rgba(224, 247, 250, 0.85)' } },
    tricolor: { name: 'Tricolor', values: { '--bg-color': '#0B1C2E', '--text-color': '#FFFFFF', '--primary-title-color': '#7A243D', '--card-bg-color': 'rgba(255,255,255,0.05)', '--nav-link-color': '#0C553B', '--nav-link-hover-color': '#FFFFFF', '--header-overlay-color': 'rgba(11, 28, 46, 0.85)' } }
};

const chartLabelKeys = ['performance', 'webBackend', 'desktop', 'embedded'];
const radarChartData = chartLabels.map((label, index) => {
    const dataPoint = { axis: label };
    Object.keys(techStackData).forEach(techKey => {
        dataPoint[techKey] = techStackData[techKey].scores[chartLabelKeys[index]];
    });
    return dataPoint;
});

// --- COMPONENTES DA APLICAÇÃO ---

const LanguageSelector = ({ selectedTechs, onSelectTech }) => (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
        {Object.keys(techStackData).map(key => {
            const tech = techStackData[key];
            const isActive = selectedTechs.includes(key);
            const activeClasses = `text-white scale-105 shadow-lg`;
            const inactiveClasses = `border-gray-200 hover:shadow-md`;
            return (
                <button
                    key={key}
                    onClick={() => onSelectTech(key)}
                    className={`font-semibold py-2 px-4 rounded-lg shadow-sm border-2 transition-all duration-200 ${isActive ? activeClasses : inactiveClasses}`}
                    style={{
                        backgroundColor: isActive ? tech.color : 'var(--card-bg-color)',
                        borderColor: isActive ? tech.color : '#e2e8f0',
                        color: isActive ? 'white' : 'var(--text-color)'
                    }}
                >
                    {tech.name}
                </button>
            )
        })}
    </div>
);

const AppHeader = () => (<header className="header-parallax"><div className="header-overlay"></div><div className="relative text-center pt-16 pb-12"><h1 className="text-4xl md:text-5xl font-bold section-title mb-4">Meu Legado de Dev: Guia e Roteiro Pessoal</h1><p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-color)', opacity: 0.8 }}>Uma jornada pelas tecnologias, linguagens e estratégias para se tornar um desenvolvedor na área de redes elétricas inteligentes.</p></div></header>);

const ThemeSwitcher = ({ onThemeChange }) => (<div className="fixed top-4 right-4 z-50 flex space-x-2">{Object.keys(colorPalettes).map(key => (<button key={key} onClick={() => onThemeChange(key)} className="w-6 h-6 rounded-full border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" style={{ backgroundColor: colorPalettes[key].values['--primary-title-color'] }} title={colorPalettes[key].name}></button>))}</div>);

const Navigation = () => {
    const handleNavClick = (e) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) { targetElement.scrollIntoView({ behavior: 'smooth' }); }
    };
    return (<nav className="sticky top-0 z-40 w-full backdrop-blur-sm shadow-md" style={{ backgroundColor: 'var(--card-bg-color)' }}><div className="container mx-auto px-4 sm:px-6 lg:px-8"><div className="flex justify-center items-center h-16"><div className="flex space-x-6 md:space-x-10">
        <a href="#ecosystem" onClick={handleNavClick} className="font-semibold transition-colors duration-200" style={{ color: 'var(--nav-link-color)' }}>Ecossistema</a>
        <a href="#stack" onClick={handleNavClick} className="font-semibold transition-colors duration-200" style={{ color: 'var(--nav-link-color)' }}>Minha Stack</a>
        <a href="#roadmap" onClick={handleNavClick} className="font-semibold transition-colors duration-200" style={{ color: 'var(--nav-link-color)' }}>Plano de Ação</a>
        <a href="#roteiro" onClick={handleNavClick} className="font-semibold transition-colors duration-200" style={{ color: 'var(--nav-link-color)' }}>Meu Roteiro</a>
    </div></div></div></nav>);
};

const TechDetailsAside = ({ techKey }) => {
    if (!techKey) return (<aside className="lg:col-span-4 card p-6 sticky top-24 h-fit"><h3 className="text-xl font-bold section-title">Selecione uma Tecnologia</h3><p className="mt-2" style={{ color: 'var(--text-color)' }}>Clique em uma ou mais tecnologias para visualizá-las no gráfico e ver os detalhes da última selecionada aqui.</p></aside>);
    const tech = techStackData[techKey];
    const difficultyColors = { 'Iniciante': 'text-green-600', 'Intermediário': 'text-yellow-600', 'Avançado': 'text-red-600' };
    return (<aside className="lg:col-span-4 card p-6 sticky top-24 h-fit"><div className="flex justify-between items-start"><h3 className="text-2xl font-bold" style={{ color: tech.color }}>{tech.name}</h3><span className={`font-bold ${difficultyColors[tech.difficulty]}`}>{tech.difficulty}</span></div><p className="mt-2" style={{ color: 'var(--text-color)' }} dangerouslySetInnerHTML={{ __html: tech.description }}></p></aside>);
};

const TechChart = ({ selectedTechs }) => {
    return (
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={500}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="axis" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    {selectedTechs.map(techKey => {
                        const tech = techStackData[techKey];
                        return (
                            <Radar
                                key={techKey}
                                name={tech.name}
                                dataKey={techKey}
                                stroke={tech.color}
                                fill={tech.bgColor}
                                fillOpacity={0.6}
                            />
                        );
                    })}
                    <Legend />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

const RoadmapCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const contentRef = useRef(null);
    const slides = [{ icon: '🏗️', title: 'Passo 1: Fundamento Sólido', subtitle: 'Seja um Fullstack de Smart Grids', points: ['Foque 100% em Python e JavaScript.', 'Python: Domine Pandas, FastAPI e Pandapower.', 'JavaScript: Aprenda o básico e um framework como React ou Vue.'] }, { icon: '🎯', title: 'Passo 2: Especialização', subtitle: 'Aprofunde seu conhecimento', points: ['Dados/IA? Aprofunde-se em Machine Learning.', 'Hardware/Tempo Real? Mergulhe em C++ e/ou Rust.', 'Interfaces? Explore Dart/Flutter.'] }, { icon: '📂', title: 'Passo 3: Construção de Portfólio', subtitle: 'Aplique seu conhecimento em projetos práticos', points: ['Simulador de Redes Elétricas (Python + JS).', 'Ferramenta de Análise de Consumo (Python).', 'App de Garçom ou Controle de Estoque (JS/React).', 'Crie seu próprio site/portfólio.'] }, { icon: '✨', title: 'Passo 4: Código de Qualidade', subtitle: 'Escreva código como um profissional', points: ['Clean Code: Aprenda a escrever código legível e simples.', 'Arquitetura: Estude padrões como MVC para organizar projetos.', 'SOLID: Aplique os 5 princípios para criar sistemas robustos.'] }, { icon: '🧪', title: 'Passo 5: Testes e Validação', subtitle: 'Garanta a confiabilidade do seu software', points: ['Crie testes unitários para validar a lógica de negócio.', 'Implemente testes de integração entre componentes.', 'Explore testes E2E (End-to-End) para simular o usuário.'] }, { icon: '🚀', title: 'Passo 6: Divulgação e Legado', subtitle: 'Compartilhe e construa sua marca', points: ['YouTube: Grave vídeos demonstrando seus projetos.', 'GitHub: Mantenha um perfil ativo e bem documentado.', 'LinkedIn/Comunidades: Participe de discussões e conecte-se.'] }];

    useEffect(() => { if (contentRef.current) { contentRef.current.classList.remove('fade-in'); void contentRef.current.offsetWidth; contentRef.current.classList.add('fade-in'); } }, [currentSlide]);
    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

    return (<div className="relative w-full max-w-3xl mx-auto"> <div className="overflow-hidden rounded-lg shadow-lg" style={{ backgroundColor: 'var(--card-bg-color)' }}> <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}> {slides.map((slide, index) => (<div key={index} className="w-full flex-shrink-0 p-8 md:p-12 min-h-[350px]"> <div ref={currentSlide === index ? contentRef : null} className={currentSlide === index ? 'fade-in' : ''}> <div className="flex items-center mb-4"><div className="text-3xl mr-4">{slide.icon}</div><div><h3 className="text-2xl font-bold" style={{ color: 'var(--text-color)' }}>{slide.title}</h3><p style={{ color: 'var(--text-color)' }} className="opacity-70">{slide.subtitle}</p></div></div> <ul className="space-y-3 list-disc list-inside mt-6" style={{ color: 'var(--text-color)' }}>{slide.points.map((point, i) => <li key={i}>{point}</li>)}</ul> </div> </div>))} </div> </div> <button onClick={prevSlide} disabled={currentSlide === 0} className="carousel-button absolute top-1/2 -left-4 md:-left-6 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:hover:bg-transparent transition">&#x25C0;</button> <button onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="carousel-button absolute top-1/2 -right-4 md:-right-6 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:hover:bg-transparent transition">&#x25B6;</button> <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">{slides.map((_, index) => (<button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition ${currentSlide === index ? '' : 'bg-gray-300 hover:bg-gray-400'}`} style={{ backgroundColor: currentSlide === index ? 'var(--primary-title-color)' : '' }}></button>))}</div> </div>);
};

const RoteiroPessoalSection = () => {
    const [tasksData, setTasksData] = useState(initialRoteiroData);
    const handleToggleTask = (category, taskId) => { const newTasksData = JSON.parse(JSON.stringify(tasksData)); const task = newTasksData[category].tasks.find(t => t.id === taskId); if (task) { task.completed = !task.completed; setTasksData(newTasksData); } };
    return (<section id="roteiro" className="mb-20 scroll-mt-24"> <h2 className="text-3xl font-bold text-center section-title mb-4">4. Meu Roteiro Pessoal</h2> <p className="text-center max-w-3xl mx-auto mb-12" style={{ color: 'var(--text-color)', opacity: 0.8 }}>Dashboard pessoal de tarefas, estudos e projetos para organizar a jornada de aprendizado.</p> <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"> {Object.entries(tasksData).map(([category, data]) => { let statusColor = 'bg-yellow-100 text-yellow-800'; if (data.status === 'CONCLUÍDO') statusColor = 'bg-green-100 text-green-800'; if (data.status === 'A FAZER') statusColor = 'bg-blue-100 text-blue-800'; return (<div key={category} className="card p-6 flex flex-col"> <div className="flex justify-between items-start mb-4"> <h3 className="text-xl font-bold section-title">{category}</h3> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{data.status}</span> </div> <ul className="space-y-3 flex-grow"> {data.tasks.map((task) => (<li key={task.id} className="task-list-item text-sm"> <input type="checkbox" id={`${category}-${task.id}`} checked={task.completed} onChange={() => handleToggleTask(category, task.id)} className="form-checkbox h-4 w-4 text-blue-600 rounded" /> <label htmlFor={`${category}-${task.id}`} className="ml-2 cursor-pointer" style={{ color: 'var(--text-color)' }}>{task.text}</label> </li>))} </ul> </div>) })} </div> </section>);
};

const EcosystemSection = () => (
    <section id="ecosystem" className="mb-20 scroll-mt-24"> <h2 className="text-3xl font-bold text-center section-title mb-4">1. O Ecossistema de Desenvolvimento</h2> <p className="text-center max-w-3xl mx-auto mb-12" style={{ color: 'var(--text-color)', opacity: 0.8 }}>Uma visão geral das camadas que compõem sistemas modernos, desde o hardware até a interface do usuário.</p> <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> <div className="card p-6"><div className="text-3xl mb-3">🧠</div><h3 className="text-xl font-bold section-title mb-2">Backend & Análise</h3><p className="opacity-80" style={{ color: 'var(--text-color)' }}>O cérebro da operação. Processa dados para otimização, IA e lógica de negócios. <strong>Stack:</strong> Python, C++, Rust, Node.js.</p></div> <div className="card p-6"><div className="text-3xl mb-3">📊</div><h3 className="text-xl font-bold section-title mb-2">Frontend & Visualização</h3><p className="opacity-80" style={{ color: 'var(--text-color)' }}>A interface com o usuário. Apresenta dados em dashboards e painéis interativos. <strong>Stack:</strong> HTML/CSS/JS, Flutter, Tauri.</p></div> <div className="card p-6"><div className="text-3xl mb-3">💻</div><h3 className="text-xl font-bold section-title mb-2">Aplicações Desktop</h3><p className="opacity-80" style={{ color: 'var(--text-color)' }}>Ferramentas e simuladores que rodam nativamente no sistema operacional. <strong>Stack:</strong> PySide6, Tauri, Flutter.</p></div> <div className="card p-6"><div className="text-3xl mb-3">🛠️</div><h3 className="text-xl font-bold section-title mb-2">Automação & Controle</h3><p className="opacity-80" style={{ color: 'var(--text-color)' }}>A camada mais próxima do hardware, controlando dispositivos físicos e processos industriais. <strong>Stack:</strong> Arduino (C++), Ladder.</p></div> </div> </section>
);

const StackSection = ({ selectedTechs, onSelectTech }) => (
    <section id="stack" className="mb-20 scroll-mt-24"> <h2 className="text-3xl font-bold text-center section-title mb-4">2. Minha Stack de Tecnologias</h2> <p className="text-center max-w-3xl mx-auto mb-12" style={{ color: 'var(--text-color)', opacity: 0.8 }}>Cada ferramenta tem seu propósito. O gráfico compara as tecnologias em áreas-chave. Clique para ver detalhes.</p>
        <LanguageSelector selectedTechs={selectedTechs} onSelectTech={onSelectTech} />
        <TechChart selectedTechs={selectedTechs} />
    </section>
);

const RoadmapSection = () => (
    <section id="roadmap" className="mb-20 scroll-mt-24"> <h2 className="text-3xl font-bold text-center section-title mb-4">3. Plano de Ação</h2> <p className="text-center max-w-3xl mx-auto mb-12" style={{ color: 'var(--text-color)', opacity: 0.8 }}>Siga este plano para construir uma base sólida e depois se especializar.</p> <RoadmapCarousel /> </section>
);

const AppFooter = () => (<footer className="text-center mt-20 pt-8 border-t border-gray-200"><p className="opacity-70" style={{ color: 'var(--text-color)' }}>Este guia interativo foi criado para transformar conhecimento em ação. Construindo o legado, um commit de cada vez.</p></footer>);

// --- COMPONENTE PRINCIPAL ---
export default function PVRVWebDevPage({ theme: globalTheme }) { // Accept globalTheme prop
    const [selectedTechs, setSelectedTechs] = useState(['python']);
    const [internalTheme, setInternalTheme] = useState('neutral'); // Renamed state to avoid conflict with prop

    const handleThemeChange = (themeKey) => {
        setInternalTheme(themeKey);
    };

    useEffect(() => {
        // Set initial internal theme based on globalTheme
        if (globalTheme === 'dark') {
            handleThemeChange('tricolor'); // Use tricolor as the default dark theme
        } else {
            handleThemeChange('neutral');
        }
    }, [globalTheme]); // Re-run when globalTheme changes

    const handleSelectTech = (techKey) => {
        setSelectedTechs(prev => {
            const newSelection = prev.includes(techKey) ? prev.filter(t => t !== techKey) : [...prev, techKey];
            return newSelection;
        });
    };

    const themeValues = colorPalettes[internalTheme].values; // Use internalTheme
    return (
        <div style={themeValues}>
            <style jsx>{`
                :global(body) {
                    font-family: 'Inter', sans-serif;
                }
                .section-title {
                    color: var(--primary-title-color);
                }
                .card {
                    background-color: var(--card-bg-color);
                    border-radius: 0.75rem;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
                .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                }
                .chart-container {
                    position: relative;
                    width: 100%;
                    max-width: 600px;
                    margin-left: auto;
                    margin-right: auto;
                    height: 90vw;
                    max-height: 500px;
                }
                @media (min-width: 640px) {
                    .chart-container {
                        height: 450px;
                    }
                }
                .carousel-button {
                    background-color: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(4px);
                    border: 1px solid #e2e8f0;
                }
                .carousel-button:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .header-parallax {
                    background-image: url('https://www.transparenttextures.com/patterns/grid.png');
                    background-attachment: fixed;
                    background-position: center;
                    background-repeat: repeat;
                    background-size: auto;
                    position: relative;
                }
                .header-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--header-overlay-color);
                    transition: background-color 0.3s;
                }
                .task-list-item label {
                    transition: color 0.2s;
                }
                .task-list-item input:checked+label {
                    text-decoration: line-through;
                    color: #9ca3af;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .fade-in {
                    animation: fadeIn 0.5s ease-in-out forwards;
                }
            `}</style>
            <React.Fragment>
                <ThemeSwitcher onThemeChange={handleThemeChange} />
                <AppHeader />
                <Navigation />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
                        <main className="lg:col-span-8">
                            <EcosystemSection />
                            <StackSection selectedTechs={selectedTechs} onSelectTech={handleSelectTech} />
                            <RoadmapSection />
                            <RoteiroPessoalSection />
                        </main>
                        <TechDetailsAside techKey={selectedTechs.length > 0 ? selectedTechs[selectedTechs.length - 1] : null} />
                    </div>
                </div>
                <AppFooter />
            </React.Fragment>
        </div>
    );
};
