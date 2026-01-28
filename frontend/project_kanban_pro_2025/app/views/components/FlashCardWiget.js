
    // <style>
    //     /* Estilos para a animação de virar o flashcard */
    //     .flashcard-scene {
    //         perspective: 1000px;
    //     }

    //     .flashcard {
    //         width: 100%;
    //         height: 100%;
    //         min-height: 200px;
    //         position: relative;
    //         transition: transform 0.6s;
    //         transform-style: preserve-3d;
    //     }

    //     .flashcard.is-flipped {
    //         transform: rotateY(180deg);
    //     }

    //     .flashcard-face {
    //         position: absolute;
    //         width: 100%;
    //         height: 100%;
    //         -webkit-backface-visibility: hidden;
    //         backface-visibility: hidden;
    //         display: flex;
    //         flex-direction: column;
    //         justify-content: center;
    //         align-items: center;
    //         padding: 1rem;
    //     }

    //     .flashcard-face--back {
    //         transform: rotateY(180deg);
    //     }
    // </style> 



let repository ={
                "flashcards": [
                { "ID": "ee1", "Frente": "O que é a Lei de Ohm?", "Verso": "V = I * R (Tensão = Corrente * Resistência)", "Anotacoes": "Fundamental para análise de circuitos. Descreve a relação entre tensão, corrente e resistência em um condutor." },
                { "ID": "ee2", "Frente": "Qual a função de um capacitor?", "Verso": "Armazenar energia em um campo elétrico.", "Anotacoes": "Usado em filtros, temporizadores e para suavizar fontes de tensão." },
                { "ID": "ee3", "Frente": "O que enuncia a Primeira Lei de Kirchhoff (Lei dos Nós)?", "Verso": "A soma das correntes que entram em um nó é igual à soma das correntes que saem.", "Anotacoes": "Baseada no princípio da conservação da carga elétrica." },
                { "ID": "ee4", "Frente": "Qual a diferença entre Corrente Contínua (CC) e Alternada (AC)?", "Verso": "CC tem fluxo constante em um sentido. AC inverte o sentido periodicamente.", "Anotacoes": "AC é usada para transmissão de energia a longas distâncias. CC é comum em baterias e eletrônicos." },
                { "ID": "ee5", "Frente": "O que é um transformador?", "Verso": "Dispositivo que aumenta ou diminui a tensão e a corrente em um circuito AC.", "Anotacoes": "Funciona pelo princípio da indução eletromagnética. Essencial para a rede elétrica." },
                { "ID": "ee6", "Frente": "Qual a função de um indutor?", "Verso": "Armazenar energia em um campo magnético quando uma corrente elétrica passa por ele.", "Anotacoes": "Opoe-se a variações de corrente. Usado em filtros e conversores de energia." },
                { "ID": "ee7", "Frente": "O que é um motor de indução trifásico?", "Verso": "Um tipo de motor elétrico AC cujo rotor gira a uma velocidade diferente do campo magnético do estator.", "Anotacoes": "É o motor mais utilizado na indústria devido à sua robustez, baixo custo e simplicidade de partida." }
            ],
}


function StudyPage({ flashcards, onSave }) {
            const [currentIndex, setCurrentIndex] = useState(0); const [isFlipped, setIsFlipped] = useState(false); const [formState, setFormState] = useState({ Frente: '', Verso: '', Anotacoes: '' });
            const currentCard = flashcards.length > 0 ? flashcards[currentIndex] : null;
            const handleNext = () => { if (flashcards.length === 0) return; setIsFlipped(false); setCurrentIndex((prev) => (prev + 1) % flashcards.length); };
            const handleChange = (e) => setFormState({ ...formState, [e.target.name]: e.target.value });
            const handleSubmit = (e) => { e.preventDefault(); if (!formState.Frente || !formState.Verso) return; onSave(formState); setFormState({ Frente: '', Verso: '', Anotacoes: '' }); };
            return (
                <PageContainer title="🧠 Flashcards">
                    <div className="flashcard-scene" onClick={() => setIsFlipped(!isFlipped)}>
                        <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
                            <Paper elevation={4} className="flashcard-face flashcard-face--front"><Typography variant="h5" align="center">{currentCard ? currentCard.Frente : "Adicione um card!"}</Typography></Paper>
                            <Paper elevation={4} className="flashcard-face flashcard-face--back"><CardContent><Typography variant="h5" align="center" gutterBottom>{currentCard?.Verso}</Typography>{currentCard?.Anotacoes && <Divider sx={{ my: 2 }} />}<Typography variant="body1">{currentCard?.Anotacoes}</Typography></CardContent></Paper>
                        </div>
                    </div>
                    {flashcards.length > 0 && <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}><Button variant="outlined" onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}>Virar</Button><Button variant="contained" onClick={(e) => { e.stopPropagation(); handleNext(); }}>Próximo</Button></Box>}
                    <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
                        <Typography variant="h6" gutterBottom>Criar Novo Flashcard</Typography>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <TextField name="Frente" label="Frente" value={formState.Frente} onChange={handleChange} fullWidth required />
                            <TextField name="Verso" label="Verso" value={formState.Verso} onChange={handleChange} fullWidth required />
                            <TextField name="Anotacoes" label="Anotações" value={formState.Anotacoes} onChange={handleChange} fullWidth multiline rows={2} />
                            <Button type="submit" variant="contained">Adicionar Card</Button>
                        </form>
                    </Paper>
                </PageContainer>
            );
        }


        function PomodoroPage({ tasks, logSession, settings, updateSettings }) {
            const [time, setTime] = useState(settings.pomodoroDuration * 60);
            const [running, setRunning] = useState(false);
            const [mode, setMode] = useState('pomodoro');
            const [selectedTaskId, setSelectedTaskId] = useState('');

            useEffect(() => {
                setTime(settings.pomodoroDuration * 60);
                setRunning(false);
            }, [settings.pomodoroDuration]);

            useEffect(() => { if ('Notification' in window && Notification.permission !== 'granted') Notification.requestPermission(); }, []);

            const playNotificationSound = () => { try { const audioContext = new (window.AudioContext || window.webkitAudioContext)(); const o = audioContext.createOscillator(); const g = audioContext.createGain(); o.connect(g); g.connect(audioContext.destination); o.type = 'sine'; o.frequency.setValueAtTime(600, audioContext.currentTime); o.start(); o.stop(audioContext.currentTime + 0.4); } catch (e) { console.error(e); } };
            const showNotification = (title, body) => { if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body }); };

            useEffect(() => {
                let interval;
                if (running && time > 0) { document.title = `${formatTime(time)} - Foco`; interval = setInterval(() => setTime(t => t - 1), 1000); }
                else if (running && time === 0) {
                    setRunning(false); document.title = "Produtividade"; playNotificationSound();
                    if (mode === 'pomodoro' && selectedTaskId) { logSession(settings.pomodoroDuration * 60, selectedTaskId); const task = tasks.find(t => t.id === selectedTaskId); showNotification('Pomodoro Finalizado!', `Foco em "${task?.item || 'tarefa'}" concluído.`); setSelectedTaskId(''); }
                    else { showNotification('Pausa Finalizada!', 'Hora de voltar ao foco!'); }
                }
                return () => { clearInterval(interval); document.title = "Produtividade"; };
            }, [running, time]);

            const selectMode = (newMode) => { setMode(newMode); setRunning(false); setTime(newMode === 'pomodoro' ? settings.pomodoroDuration * 60 : settings.shortBreakDuration * 60); };
            const startPause = () => setRunning(!running);
            const formatTime = (t) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

            const handleDurationChange = (duration) => {
                updateSettings('pomodoroDuration', duration);
            };

            return (
                <PageContainer title="⏱️ Pomodoro Timer">
                    <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                        <Paper elevation={3} sx={{ p: 3, textAlign: 'center', transition: 'background-color 0.3s', bgcolor: (running && mode === 'pomodoro') ? 'error.light' : 'background.paper' }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="overline">Duração do Foco</Typography>
                                <ButtonGroup variant="outlined" fullWidth>
                                    <Button onClick={() => handleDurationChange(15)} variant={settings.pomodoroDuration === 15 ? 'contained' : 'outlined'}>15 min</Button>
                                    <Button onClick={() => handleDurationChange(25)} variant={settings.pomodoroDuration === 25 ? 'contained' : 'outlined'}>25 min</Button>
                                    <Button onClick={() => handleDurationChange(50)} variant={settings.pomodoroDuration === 50 ? 'contained' : 'outlined'}>50 min</Button>
                                </ButtonGroup>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ mb: 3 }}><Button onClick={() => selectMode('pomodoro')} variant={mode === 'pomodoro' ? 'contained' : 'outlined'}>Pomodoro</Button> <Button onClick={() => selectMode('short')} variant={mode === 'short' ? 'contained' : 'outlined'}>Pausa Curta</Button></Box>
                            <Typography variant="h2" component="div" sx={{ fontFamily: 'monospace', my: 3 }}>{formatTime(time)}</Typography>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Selecione uma Tarefa para Focar</InputLabel>
                                <Select value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)} label="Selecione uma Tarefa para Focar">
                                    {tasks.filter(t => !t.done).map(t => <MenuItem key={t.id} value={t.id}>{t.item}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <Button variant="contained" size="large" onClick={startPause} disabled={mode === 'pomodoro' && !selectedTaskId}>{running ? 'Pausar' : 'Iniciar'}</Button>
                        </Paper>
                    </Box>
                </PageContainer>
            );
        }
