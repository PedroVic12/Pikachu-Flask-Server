const { useState, useEffect } = React;
const { Button, TextField, Grid, Container, Paper, Typography } = window['MaterialUI'];
const { IonButton, IonIcon } = window.Ionic;

function App() {
    const [clientes, setClientes] = useState([]);
    const [formData, setFormData] = useState({
        RG: '',
        Nome: '',
        Sobrenome: '',
        Telefone: '',
        Rua: '',
        Numero: '',
        Bairro: ''
    });

    useEffect(() => {
        fetch('/clientes')
            .then(response => response.json())
            .then(data => setClientes(data));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('/add_cliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        }).then(response => response.json())
        .then(() => {
            setFormData({
                RG: '',
                Nome: '',
                Sobrenome: '',
                Telefone: '',
                Rua: '',
                Numero: '',
                Bairro: ''
            });
            fetch('/clientes')
                .then(response => response.json())
                .then(data => setClientes(data));
        });
    };

    const handleDelete = (id) => {
        fetch('/delete_cliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ID_Cliente: id })
        }).then(response => response.json())
        .then(() => {
            fetch('/clientes')
                .then(response => response.json())
                .then(data => setClientes(data));
        });
    };

    return (
        <Container>
            <Paper elevation={3} style={{ padding: '20px' }}>
                <Typography variant="h4" gutterBottom>
                    Clientes
                </Typography>
                <ul>
                    {clientes.map(cliente => (
                        <li key={cliente[0]}>
                            {cliente[2]} {cliente[3]}
                            <IonButton onClick={() => handleDelete(cliente[0])} color="danger" style={{ marginLeft: '10px' }}>
                                Delete
                            </IonButton>
                        </li>
                    ))}
                </ul>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="RG" 
                                name="RG" 
                                value={formData.RG} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Nome" 
                                name="Nome" 
                                value={formData.Nome} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Sobrenome" 
                                name="Sobrenome" 
                                value={formData.Sobrenome} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Telefone" 
                                name="Telefone" 
                                value={formData.Telefone} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Rua" 
                                name="Rua" 
                                value={formData.Rua} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Numero" 
                                name="Numero" 
                                value={formData.Numero} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                label="Bairro" 
                                name="Bairro" 
                                value={formData.Bairro} 
                                onChange={handleInputChange} 
                                fullWidth 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" fullWidth>
                                Adicionar Cliente
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}

ReactDOM.render(<App />, document.getElementById('app'));


from flask import Flask, request, jsonify

app = Flask(__name__)

tasks = []

@app.route('/tasks', methods=['GET'])
def get_tasks():
    print("Ola mundo!")

    # renderizar um html simples
    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])
def add_task():
    task = request.json
    tasks.append(task)
    return jsonify(task), 201

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    global tasks
    tasks = [t for t in tasks if t.get('id') != task_id]
    return '', 204

app.run()


projeto_apresentacao/

│

├── assets/

│   └── apresentacao.md         # Fonte única (slides/artigo IMRAD)

│

├── backend/

│   ├── app.py                  # Flask principal (POO + MVC)

│   ├── controllers/

│   │   └── converter_controller.py

│   ├── services/

│   │   ├── converter_service.py

│   │   └── video_service.py

│   └── run.py                  # Script CLI para rodar automações

│

├── frontend/

│   ├── index.astro             # Renderizador Astro

│   └── components/

│       ├── Slide.astro

│       └── Navbar.astro

│

└── main.py                     # Orquestrador principal (Design Pattern Facade)

from flask import Flask, request, jsonify

app = Flask(__name__)

tasks = []

@app.route('/tasks', methods=['GET'])

def get_tasks():

    print("Ola mundo!")

    # renderizar um html simples

    return jsonify(tasks)

@app.route('/tasks', methods=['POST'])

def add_task():

    task = request.json

    tasks.append(task)

    return jsonify(task), 201

@app.route('/tasks/<int:task_id>', methods=['DELETE'])

def delete_task(task_id):

    global tasks

    tasks = [t for t in tasks if t.get('id') != task_id]

    return '', 204

app.run()

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Raichu WebServer - Dashboard</title>
    
    <!-- Tailwind CSS via CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- React via CDN -->
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <!-- SheetJS (xlsx) para exportação para Excel -->
    <script src="https://cdn.jsdelivr.net/npm/sheetjs-style@0.15.8/xlsx.full.min.js"></script>

    <!-- Babel para transpilar JSX no navegador -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <style>
        /* Estilo customizado para a barra de rolagem e fontes */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f0f2f5;
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }

        /* Animações */
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .fade-in-delay-1 { animation: fadeIn 0.5s ease-out 0.2s forwards; opacity: 0; }
        .fade-in-delay-2 { animation: fadeIn 0.5s ease-out 0.4s forwards; opacity: 0; }
        .fade-in-delay-3 { animation: fadeIn 0.5s ease-out 0.6s forwards; opacity: 0; }
        
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
            display: inline-block;
            width: 1rem;
            height: 1rem;
            border: 2px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        .spinner-dark {
             border: 2px solid rgba(0,0,0,.1);
             border-top-color: #333;
        }
    </style>
</head>
<body class="antialiased">
    <div id="root"></div>

    <script type="text/babel">
        function initializeApp() {
            const { useState, useEffect, useCallback, useMemo, createContext, useContext } = React;

            // --- LÓGICA DA API GEMINI ---
            const GEMINI_API_KEY = ""; // Esta chave é fornecida pelo ambiente de execução.

            async function generateWithGemini(prompt, retries = 3, delay = 1000) {
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
                
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                    });

                    if (!response.ok) {
                        if (response.status === 429 && retries > 0) { // Throttling
                           await new Promise(res => setTimeout(res, delay));
                           return generateWithGemini(prompt, retries - 1, delay * 2); // Exponential backoff
                        }
                        throw new Error(`API call failed with status: ${response.status}`);
                    }

                    const result = await response.json();
                    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                    
                    if (!text) {
                        throw new Error("No content generated in API response.");
                    }
                    return text;
                } catch (error) {
                    console.error("Gemini API Error:", error);
                    return null; 
                }
            }

            // --- ÍCONES SVG COMO COMPONENTES ---
            const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
            const ListTodoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>;
            const CheckSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
            const LogInIcon = ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
            const ArrowRightIcon = ({ size = 20 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
            const MenuIcon = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
            const CheckIcon = ({ size = 14 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
            const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
            const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
            const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
            const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
            const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

            // --- CONTROLLER DE ESTADO DA UI ---
            class UiStateController {
                constructor(initialPage = 'landing') { this.page = initialPage; this.listeners = new Set(); this.isSidebarOpen = true; }
                subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
                notify() { for (const listener of this.listeners) { listener(); } }
                setPage(page) { this.page = page; this.notify(); }
                toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; this.notify(); }
            }

            // --- DADOS E SERVIÇOS ---
            class Task { constructor(id, text, categoryId, completed = false, createdAt = new Date()) { this.id = id; this.text = text; this.categoryId = categoryId; this.completed = completed; this.createdAt = createdAt; } }
            class Category { constructor(id, name) { this.id = id; this.name = name; } }
            const LocalStorageService = {
                getKey: (storageKey, type) => `raichuApp_${storageKey}_${type}`,
                getData: (storageKey, type) => { try { const d = localStorage.getItem(LocalStorageService.getKey(storageKey, type)); return d ? JSON.parse(d) : []; } catch (e) { console.error(e); return []; } },
                saveData: (storageKey, type, data) => { try { localStorage.setItem(LocalStorageService.getKey(storageKey, type), JSON.stringify(data)); } catch (e) { console.error(e); } }
            };

            // --- COMPONENTES DA LANDING PAGE ---
            function LandingHeader({ uiController }) {
                 return (
                    <header className="absolute top-0 left-0 right-0 z-10 p-4 bg-transparent">
                        <div className="container mx-auto flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                <span className="text-xl font-bold text-gray-800">Raichu WebServer</span>
                            </div>
                            <button onClick={() => uiController.setPage('dashboard')} className="flex items-center gap-2 bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors">
                                Acessar o Painel <LogInIcon />
                            </button>
                        </div>
                    </header>
                );
            }
            function HeroSection({ uiController }) {
                return (
                    <section className="relative h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
                        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(to_bottom,white_0%,transparent_100%)]"></div>
                        <div className="container mx-auto text-center z-10 px-4">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-4 fade-in">Construa e Gerencie com Facilidade</h1>
                            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 fade-in-delay-1">Raichu WebServer é a sua plataforma completa para gerenciar projetos, tarefas e checklists de forma intuitiva e eficiente.</p>
                            <button onClick={() => uiController.setPage('dashboard')} className="fade-in-delay-2 flex items-center gap-2 mx-auto bg-gray-800 text-white font-bold px-8 py-4 rounded-lg hover:bg-gray-900 transition-transform hover:scale-105">
                                Comece a Organizar Agora <ArrowRightIcon />
                            </button>
                        </div>
                    </section>
                );
            }
            function LandingFooter() {
                 return (
                    <footer className="bg-gray-800 text-white py-6">
                        <div className="container mx-auto text-center text-gray-400">
                            <p>&copy; {new Date().getFullYear()} Raichu WebServer. Todos os direitos reservados.</p>
                        </div>
                    </footer>
                );
            }
            function LandingPage({ uiController }) { return <div className="bg-white"><LandingHeader uiController={uiController} /><main><HeroSection uiController={uiController} /></main><LandingFooter /></div>; }

            // --- COMPONENTES DO DASHBOARD ---
            const SidebarContext = createContext();
            function Sidebar({ uiController, currentPage }) {
                 const { isOpen } = useContext(SidebarContext);
                return (
                    <aside className={`h-screen bg-white shadow-lg transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
                        <nav className="h-full flex flex-col">
                            <div className="p-4 pb-2 border-b h-16 flex items-center justify-between">
                                <div className={`flex items-center gap-2 overflow-hidden transition-opacity ${!isOpen && 'opacity-0'}`}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    <span className="text-lg font-bold text-gray-800 whitespace-nowrap">Raichu</span>
                                </div>
                            </div>
                            <ul className="flex-grow p-2">
                                <SidebarItem icon={<HomeIcon />} text="Painel Principal" active={currentPage === 'dashboard'} onClick={() => uiController.setPage('dashboard')} />
                                <SidebarItem icon={<ListTodoIcon />} text="Projetos To-Do" active={currentPage.startsWith('todo-')} onClick={() => uiController.setPage('dashboard')} />
                                <SidebarItem icon={<CheckSquareIcon />} text="Checklists" active={currentPage === 'checklists'} onClick={() => uiController.setPage('checklists')} />
                            </ul>
                        </nav>
                    </aside>
                );
            }
            function SidebarItem({ icon, text, active, onClick }) {
                 const { isOpen } = useContext(SidebarContext);
                return (
                    <li onClick={onClick} className={`relative flex items-center py-2.5 px-4 my-1 font-medium rounded-md cursor-pointer transition-colors group ${ active ? 'bg-gradient-to-tr from-amber-200 to-amber-100 text-amber-800' : 'hover:bg-gray-100 text-gray-600' }`}>
                        {icon} <span className={`overflow-hidden transition-all ${isOpen ? 'w-52 ml-3' : 'w-0'}`}>{text}</span>
                        {!isOpen && <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-amber-100 text-amber-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>{text}</div>}
                    </li>
                );
            }
            function DashboardHeader() {
                const { toggleSidebar } = useContext(SidebarContext);
                return (
                    <header className="p-4 bg-white border-b lg:hidden">
                        <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-800"><MenuIcon /></button>
                    </header>
                );
            }
            
            // --- COMPONENTES REUTILIZÁVEIS ---
            function Modal({ isOpen, onClose, title, children }) {
                if (!isOpen) return null;
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in" style={{animation: 'fadeIn 0.2s ease-out forwards', animationDelay: '0.1s', transform: 'scale(1)', opacity: '1'}}>
                            <div className="p-4 border-b"><h3 className="text-lg font-semibold text-gray-800">{title}</h3></div>
                            <div className="p-6">{children}</div>
                        </div>
                    </div>
                );
            }
            function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
                if (!isOpen) return null;
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm m-4 p-6 text-center transform transition-all duration-300 scale-95 opacity-0 animate-fade-in" style={{animation: 'fadeIn 0.2s ease-out forwards', transform: 'scale(1)', opacity: '1'}}>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <AlertTriangleIcon />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500 mt-2 mb-6">{message}</p>
                            <div className="flex justify-center gap-4">
                                <button onClick={onClose} className="px-6 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 font-semibold">Cancelar</button>
                                <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">Excluir</button>
                            </div>
                        </div>
                    </div>
                );
            }

            // --- PÁGINA DE CHECKLISTS ---
            function ChecklistPage() {
                const [isAiLoading, setIsAiLoading] = useState(false);
                const [newChecklistTopic, setNewChecklistTopic] = useState('');
                const [checklistsData, setChecklistsData] = useState(() => {
                    const saved = LocalStorageService.getData('checklists', 'tabs');
                    return saved.length > 0 ? saved : [
                        { id: 'deploy-checklist', title: 'Deploy de Aplicação', content: `- [ ] Configurar ambiente de produção\n- [x] Rodar testes de integração\n- [ ] Fazer backup do banco de dados\n- [ ] Atualizar o servidor com o novo código\n- [ ] Verificar logs após o deploy\n- [ ] Enviar notificação para a equipe`},
                        { id: 'onboarding-checklist', title: 'Onboarding de Cliente', content: `- [x] Reunião de Kick-off\n- [x] Coletar requisitos e acessos\n- [ ] Configurar conta no sistema\n- [ ] Agendar treinamento inicial\n- [ ] Enviar documentação de boas-vindas`}
                    ];
                });
                const [activeTab, setActiveTab] = useState(0);
                const [checklists, setChecklists] = useState(() => {
                    const savedData = LocalStorageService.getData('checklists', 'all');
                    if (savedData && Object.keys(savedData).length > 0) return savedData;
                    const initialData = {};
                    checklistsData.forEach(list => {
                        initialData[list.id] = list.content.trim().split('\n').map((line, index) => ({ id: index, checked: line.includes('- [x]'), text: line.replace(/- \[[x ]\] /, '') }));
                    });
                    return initialData;
                });

                useEffect(() => { LocalStorageService.saveData('checklists', 'all', checklists); }, [checklists]);
                useEffect(() => { LocalStorageService.saveData('checklists', 'tabs', checklistsData); }, [checklistsData]);

                const toggleItem = (listId, itemId) => setChecklists(prev => ({ ...prev, [listId]: prev[listId].map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)}));

                const handleGenerateChecklist = async (e) => {
                    e.preventDefault();
                    if (!newChecklistTopic.trim()) { alert("Por favor, digite um tópico para o checklist."); return; }
                    setIsAiLoading(true);
                    const prompt = `Crie um checklist prático com 5 a 8 itens para o seguinte tópico. Responda apenas com os itens, um por linha, sem marcadores como '*' ou '-':\n\nTópico: "${newChecklistTopic}"`;
                    
                    const result = await generateWithGemini(prompt);
                    setIsAiLoading(false);

                    if (result) {
                        const newItems = result.split('\n').filter(line => line.trim() !== '').map((line, index) => ({ id: index, checked: false, text: line.trim() }));
                        const newChecklistId = `ai-${crypto.randomUUID()}`;
                        const newChecklist = { id: newChecklistId, title: newChecklistTopic };
                        
                        setChecklistsData(prevData => [...prevData, newChecklist]);
                        setChecklists(prevContent => ({ ...prevContent, [newChecklistId]: newItems }));
                        setActiveTab(checklistsData.length);
                        setNewChecklistTopic('');
                    } else {
                        alert("Não foi possível gerar o checklist. Tente novamente.");
                    }
                };

                return (
                    <div className="p-6 md:p-8 h-full bg-white">
                         <h1 className="text-3xl font-bold text-gray-800 mb-6">Checklists</h1>
                         <form onSubmit={handleGenerateChecklist} className="mb-6 p-4 border rounded-lg bg-gray-50 flex items-center gap-4">
                            <input type="text" value={newChecklistTopic} onChange={e => setNewChecklistTopic(e.target.value)} placeholder="Digite um tópico (ex: Viajar para a praia)" className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"/>
                            <button type="submit" disabled={isAiLoading} className="bg-amber-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-amber-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                                {isAiLoading ? <span className="spinner"></span> : '✨ Gerar'}
                            </button>
                         </form>
                         <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                                {checklistsData.map((tab, index) => <button key={tab.id} onClick={() => setActiveTab(index)} className={`flex-shrink-0 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${ activeTab === index ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300' }`}>{tab.title}</button>)}
                            </nav>
                         </div>
                         <div className="pt-6">
                            {checklistsData.map((list, index) => (
                                <div key={list.id} className={activeTab === index ? 'block' : 'hidden'}>
                                    <ul className="space-y-3">{checklists[list.id] && checklists[list.id].map(item => (<li key={item.id} onClick={() => toggleItem(list.id, item.id)} className="flex items-center p-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"><div className={`w-5 h-5 rounded mr-4 flex items-center justify-center border-2 transition-all ${item.checked ? 'bg-amber-500 border-amber-500' : 'border-gray-300'}`}>{item.checked && <CheckIcon />}</div><span className={`text-gray-700 ${item.checked ? 'line-through text-gray-400' : ''}`}>{item.text}</span></li>))}</ul>
                                </div>
                            ))}
                         </div>
                    </div>
                );
            }

            // --- APLICAÇÃO TO-DO INTEGRADA ---
            function TodoApp({ title, primaryColor, storageKey }) {
                const [tasks, setTasks] = useState([]);
                const [categories, setCategories] = useState([]);
                const [selectedCategoryId, setSelectedCategoryId] = useState('all');
                const [isTaskModalOpen, setTaskModalOpen] = useState(false);
                const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
                const [taskText, setTaskText] = useState('');
                const [taskCategory, setTaskCategory] = useState('');
                const [editingTask, setEditingTask] = useState(null);
                const [newCategoryName, setNewCategoryName] = useState('');
                const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
                const [taskToDelete, setTaskToDelete] = useState(null);
                const [isAiLoading, setIsAiLoading] = useState(false);

                useEffect(() => {
                    setTasks(LocalStorageService.getData(storageKey, 'tasks'));
                    const storedCategories = LocalStorageService.getData(storageKey, 'categories');
                    if (storedCategories.length === 0) {
                        const defaultCategories = [new Category('1', 'Trabalho'), new Category('2', 'Pessoal')];
                        setCategories(defaultCategories);
                        LocalStorageService.saveData(storageKey, 'categories', defaultCategories);
                    } else { setCategories(storedCategories); }
                }, [storageKey]);
                useEffect(() => { LocalStorageService.saveData(storageKey, 'tasks', tasks); }, [tasks, storageKey]);
                useEffect(() => { LocalStorageService.saveData(storageKey, 'categories', categories); }, [categories, storageKey]);
                
                const openAddTaskModal = () => { setEditingTask(null); setTaskText(''); setTaskCategory(categories[0]?.id || ''); setTaskModalOpen(true); };
                const openEditTaskModal = (task) => { setEditingTask(task); setTaskText(task.text); setTaskCategory(task.categoryId); setTaskModalOpen(true); };
                const handleTaskSubmit = (e) => { e.preventDefault(); if (!taskText.trim() || !taskCategory) return; if (editingTask) { setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, text: taskText, categoryId: taskCategory } : t)); } else { const newTask = new Task(crypto.randomUUID(), taskText, taskCategory); setTasks([...tasks, newTask]); } setTaskModalOpen(false); setTaskText(''); };
                const toggleTaskCompletion = (taskId) => { setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)); };
                
                const requestDeleteTask = (taskId) => { setTaskToDelete(taskId); setShowDeleteConfirm(true); };
                const confirmDeleteTask = () => { setTasks(tasks.filter(t => t.id !== taskToDelete)); setShowDeleteConfirm(false); setTaskToDelete(null); };
                
                const handleCategorySubmit = (e) => { e.preventDefault(); if (!newCategoryName.trim()) return; const newCategory = new Category(crypto.randomUUID(), newCategoryName); setCategories([...categories, newCategory]); setNewCategoryName(''); setCategoryModalOpen(false); };
                const getCategoryNameById = useCallback((categoryId) => { const cat = categories.find(c => c.id === categoryId); return cat ? cat.name : 'Sem Categoria'; }, [categories]);
                const filteredTasks = selectedCategoryId === 'all' ? tasks : tasks.filter(task => task.categoryId === selectedCategoryId);
                const handleExportToExcel = () => { /* ... (Lógica de exportação) ... */ };

                const handleAiTaskBreakdown = async () => {
                    if (!taskText.trim()) { alert("Por favor, digite uma tarefa para a IA detalhar."); return; }
                    setIsAiLoading(true);
                    const prompt = `Você é um assistente de produtividade. Quebre a seguinte tarefa complexa em uma lista de 3 a 5 sub-tarefas simples e acionáveis. Responda apenas com a lista, cada item em uma nova linha, sem marcadores como '*' ou '-':\n\nTarefa: "${taskText}"`;
                    
                    const result = await generateWithGemini(prompt);
                    setIsAiLoading(false);

                    if (result) {
                        const subTasks = result.split('\n').filter(line => line.trim() !== '');
                        const newTasks = subTasks.map(subTaskText => new Task(crypto.randomUUID(), subTaskText.trim(), taskCategory));
                        setTasks(prevTasks => [...prevTasks, ...newTasks]);
                        setTaskModalOpen(false);
                        setTaskText('');
                    } else {
                        alert("Não foi possível gerar as sub-tarefas. Tente novamente.");
                    }
                };
                
                return (
                    <div className="h-full flex flex-col bg-gray-50">
                        <header className={`flex-shrink-0 ${primaryColor} text-white shadow-md`}>
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                                <h1 className="text-2xl font-bold">{title}</h1>
                                <button onClick={openAddTaskModal} className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"><PlusIcon /> <span className="hidden sm:inline">Nova Tarefa</span></button>
                            </div>
                        </header>
                        <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-gray-600 mr-2">Filtrar:</span>
                                        <button onClick={() => setSelectedCategoryId('all')} className={`px-3 py-1 text-sm rounded-full transition ${selectedCategoryId === 'all' ? primaryColor.replace('bg-','bg-opacity-100 ') + ' text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Todas</button>
                                        {categories.map(cat => ( <button key={cat.id} onClick={() => setSelectedCategoryId(cat.id)} className={`px-3 py-1 text-sm rounded-full transition ${selectedCategoryId === cat.id ? primaryColor.replace('bg-','bg-opacity-100 ') + ' text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{cat.name}</button> ))}
                                        <button onClick={() => setCategoryModalOpen(true)} className="px-3 py-1 text-sm rounded-full transition bg-green-100 text-green-800 hover:bg-green-200">+</button>
                                    </div>
                                    <button onClick={handleExportToExcel} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm"><DownloadIcon /> Exportar para Excel</button>
                                </div>
                                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-100"><tr><th className="p-4 w-12"></th><th className="p-4 text-sm font-semibold text-gray-600">Tarefa</th><th className="p-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Categoria</th><th className="p-4 text-sm font-semibold text-gray-600 hidden sm:table-cell">Data</th><th className="p-4 text-sm font-semibold text-gray-600 text-right">Ações</th></tr></thead>
                                            <tbody>{filteredTasks.length > 0 ? (filteredTasks.map(task => (<tr key={task.id} className={`border-t ${task.completed ? 'bg-gray-50 text-gray-400' : ''}`}><td className="p-4"><input type="checkbox" checked={task.completed} onChange={() => toggleTaskCompletion(task.id)} className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer" /></td><td className={`p-4 font-medium ${task.completed ? 'line-through' : 'text-gray-800'}`}>{task.text}</td><td className="p-4 text-sm text-gray-500 hidden md:table-cell"><span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full">{getCategoryNameById(task.categoryId)}</span></td><td className="p-4 text-sm text-gray-500 hidden sm:table-cell">{new Date(task.createdAt).toLocaleDateString('pt-BR')}</td><td className="p-4 text-right"><div className="flex justify-end items-center gap-3"><button onClick={() => openEditTaskModal(task)} className="text-blue-500 hover:text-blue-700 transition-colors"><EditIcon /></button><button onClick={() => requestDeleteTask(task.id)} className="text-red-500 hover:text-red-700 transition-colors"><TrashIcon /></button></div></td></tr>))) : (<tr><td colSpan="5" className="text-center p-8 text-gray-500">Nenhuma tarefa encontrada.</td></tr>)}</tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </main>
                        <Modal isOpen={isTaskModalOpen} onClose={() => setTaskModalOpen(false)} title={editingTask ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}>
                            <form onSubmit={handleTaskSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="taskText" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                    <input type="text" id="taskText" value={taskText} onChange={e => setTaskText(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" required />
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="taskCategory" className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                    <select id="taskCategory" value={taskCategory} onChange={e => setTaskCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" required>
                                        <option value="" disabled>Selecione</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setTaskModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" disabled={isAiLoading}>Cancelar</button>
                                    <button type="button" onClick={handleAiTaskBreakdown} className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 flex items-center gap-2 disabled:bg-gray-400" disabled={isAiLoading}>
                                        {isAiLoading ? <span className="spinner"></span> : '✨ Detalhar com IA'}
                                    </button>
                                    <button type="submit" className={`px-4 py-2 ${primaryColor} text-white rounded-md hover:opacity-90`} disabled={isAiLoading}>
                                        {editingTask ? 'Salvar' : 'Adicionar'}
                                    </button>
                                </div>
                            </form>
                        </Modal>
                        <Modal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} title="Adicionar Categoria"><form onSubmit={handleCategorySubmit}><div className="mb-6"><label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700 mb-1">Nome da Categoria</label><input type="text" id="newCategoryName" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500" required /></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setCategoryModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button><button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Salvar</button></div></form></Modal>
                        <ConfirmationModal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} onConfirm={confirmDeleteTask} title="Confirmar Exclusão" message="Você tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."/>
                    </div>
                );
            }

            // --- DASHBOARD HOME ---
            function DashboardHome({ uiController }) {
                const frameworks = [
                    { id: 'todo-vite-tailwind', name: 'Vite + Tailwind', desc: 'Performance e estilização moderna.', color: 'bg-blue-600' },
                    { id: 'todo-vite-bootstrap', name: 'Vite + Bootstrap', desc: 'Rapidez com um framework robusto.', color: 'bg-purple-600' },
                    { id: 'todo-next-tailwind', name: 'Next.js + Tailwind', desc: 'SSR/SSG com estilização utilitária.', color: 'bg-gray-800' },
                    { id: 'todo-next-mui', name: 'Next.js + Material UI', desc: 'Componentes React prontos para produção.', color: 'bg-sky-600' }
                ];
                return (
                    <div className="p-6 md:p-8 bg-white h-full">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Painel de Projetos</h1>
                        <p className="text-gray-600 mb-8">Selecione um template de To-Do List para começar.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {frameworks.map(fw => (
                                <div key={fw.id} onClick={() => uiController.setPage(fw.id)} className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-xl hover:border-amber-500 transition-all cursor-pointer transform hover:-translate-y-1">
                                    <div className={`w-12 h-12 ${fw.color} rounded-lg mb-4`}></div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{fw.name}</h2>
                                    <p className="text-gray-500">{fw.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            // --- COMPONENTE PRINCIPAL (ROTEADOR) ---
            function App() {
                const uiController = useMemo(() => new UiStateController(), []);
                const [appState, setAppState] = useState({ page: uiController.page, isSidebarOpen: uiController.isSidebarOpen });
                useEffect(() => { const unsubscribe = uiController.subscribe(() => { setAppState({ page: uiController.page, isSidebarOpen: uiController.isSidebarOpen }); }); return unsubscribe; }, [uiController]);
                const renderDashboardPage = () => {
                    if (appState.page.startsWith('todo-')) {
                        const frameworkProps = {
                            'todo-vite-tailwind': { title: 'To-Do: Vite + Tailwind', primaryColor: 'bg-blue-600', storageKey: 'vite_tailwind' },
                            'todo-vite-bootstrap': { title: 'To-Do: Vite + Bootstrap', primaryColor: 'bg-purple-600', storageKey: 'vite_bootstrap' },
                            'todo-next-tailwind': { title: 'To-Do: Next.js + Tailwind', primaryColor: 'bg-gray-800', storageKey: 'next_tailwind' },
                            'todo-next-mui': { title: 'To-Do: Next.js + Material UI', primaryColor: 'bg-sky-600', storageKey: 'next_mui' }
                        };
                        return <TodoApp {...frameworkProps[appState.page]} />;
                    }
                    switch (appState.page) {
                        case 'dashboard': return <DashboardHome uiController={uiController} />;
                        case 'checklists': return <ChecklistPage />;
                        default: return <DashboardHome uiController={uiController} />;
                    }
                };
                if (appState.page === 'landing') { return <LandingPage uiController={uiController} /> }
                return (<SidebarContext.Provider value={{ isOpen: appState.isSidebarOpen, toggleSidebar: () => uiController.toggleSidebar() }}><div className="flex h-screen bg-gray-100"><div className="hidden lg:block"><Sidebar uiController={uiController} currentPage={appState.page} /></div><div className="flex-1 flex flex-col overflow-hidden"><DashboardHeader /><main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">{renderDashboardPage()}</main></div></div></SidebarContext.Provider>);
            }

            const container = document.getElementById('root');
            const root = ReactDOM.createRoot(container);
            root.render(<App />);
        }
        
        initializeApp();
    </script>
</body>
</html>

#########

quero fazer um shell script que crie arquivos e pastas de um projeto flask server + api rest com requests do servidor com frontend com html e bootstrap em compeonts. Somente o arquivo main.py e index.html com requirements.txt no mesmo .zip.

O shell script cria pastas e cria arquivos tempalte com cat. Isso é importante tem que ter um arquivo cli.py que eu consigo criar controllers e models como eu mostrei ai no codigo 

