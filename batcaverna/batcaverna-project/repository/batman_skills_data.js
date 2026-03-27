const DEFAULT_SKILLS_DATA = {
            currentXP: 9311, totalXP: 45000, level: 7, improvementPoints: 1,
            unlockedSkills: [
                { id: 'combat1', name: 'Combate Corporal Básico', category: 'combat', description: 'Aumenta dano em 10%', level: 1, maxLevel: 5 },
                { id: 'stealth1', name: 'Camuflagem Noturna', category: 'stealth', description: 'Reduz detecção em 20%', level: 1, maxLevel: 3 },
            ],
            availableSkills: [
                { id: 'combat2', name: 'Contra-ataque Rápido', category: 'combat', description: 'Chance de contra-ataque', xpCost: 1500, requiredLevel: 8 },
                { id: 'stealth2', name: 'Movimento Silencioso', category: 'stealth', description: 'Reduz ruído em 30%', xpCost: 1200, requiredLevel: 7 },
                { id: 'aux1', name: 'Scanner Aprimorado', category: 'auxiliary', description: 'Detecta inimigos a 50m', xpCost: 1800, requiredLevel: 9 },
            ],
            objectives: [
                { id: 'obj1', name: 'Alcançar Nível 10', description: 'Suba para o nível 10', xpReward: 2000, completed: false },
                { id: 'obj2', name: 'Desbloquear 5 Habilidades', description: 'Desbloqueie 5 habilidades diferentes', xpReward: 1500, completed: false, current: 2, target: 5 },
                { id: 'obj3', name: 'Completar Rotina Diária 7x', description: 'Complete sua rotina diária 7 vezes', xpReward: 1000, completed: false, current: 3, target: 7 },
            ],
            dailyRoutines: [
                { id: 'morning', name: 'Rotina Matinal', time: '06:00-08:00', tasks: ['Acordar cedo', 'Meditação 15min', 'Planejar dia'], completed: true },
                { id: 'work', name: 'Trabalho Focado', time: '09:00-12:00', tasks: ['Código 3h', 'Revisar projetos'], completed: false },
                { id: 'study', name: 'Estudos Técnicos', time: '14:00-16:00', tasks: ['Sistemas de Potência', 'Programação React'], completed: false },
                { id: 'evening', name: 'Rotina Noturna', time: '20:00-22:00', tasks: ['Revisar dia', 'Planejar amanhã', 'Leitura'], completed: false },
            ],
            skillCategories: [
                { id: 'combat', name: 'Combate Corporal', total: 21, unlocked: 4 },
                { id: 'stealth', name: 'Predador Invisível', total: 23, unlocked: 3 },
                { id: 'auxiliary', name: 'Auxiliares', total: 15, unlocked: 2 },
            ]
        };


class BatmanProfileModel {
            constructor() {
                this.profileData = {
                    basicInfo: { nomeVerdadeiro: "Bruce Wayne", ocupacao: "Vigilante", base: "Gotham City", corOlhos: "Azuis", corCabelo: "Preto", altura: "1,88 m", peso: "91 kg" },
                    progress: { perfis: { current: 16, total: 32, percent: 50 }, arquivosAudio: { current: 0, total: 29, percent: 0 } },
                    notes: [
                        { id: 1, text: "Monitorar atividade do Coringa no Asilo Arkham", date: "2024-02-05", category: "urgente" },
                        { id: 2, text: "Atualizar sistema de defesa da Batcaverna", date: "2024-02-04", category: "tecnologia" },
                        { id: 3, text: "Treinamento noturno com Tim Drake", date: "2024-02-03", category: "treinamento" }
                    ],
                    goals: [
                        { id: 1, name: "Desvendar caso do Charada", progress: 75, deadline: "2024-03-01" },
                        { id: 2, name: "Aprimorar Batmóvel", progress: 40, deadline: "2024-02-20" }
                    ],
                    stats: { forca: 95, agilidade: 90, inteligencia: 98, resistencia: 92, estrategia: 96, sigilo: 94 },
                    missions: [
                        { id: 1, name: "Patrulha noturna", status: "concluido" },
                        { id: 2, name: "Análise forense", status: "em_andamento" },
                        { id: 3, name: "Monitoramento GCPD", status: "pendente" }
                    ]
                };
            }
            getProfileData() { return this.profileData; }
            addNote(noteText) {
                const newNote = { id: Date.now(), text: noteText, date: new Date().toISOString().split('T')[0], category: "geral" };
                this.profileData.notes.unshift(newNote);
                return this.profileData.notes;
            }
            deleteNote(noteId) {
                this.profileData.notes = this.profileData.notes.filter(note => note.id !== noteId);
                return this.profileData.notes;
            }
            updateGoalProgress(goalId, newProgress) {
                const goal = this.profileData.goals.find(g => g.id === goalId);
                if (goal) goal.progress = Math.min(100, Math.max(0, newProgress));
                return this.profileData.goals;
            }
}

     
     
        
