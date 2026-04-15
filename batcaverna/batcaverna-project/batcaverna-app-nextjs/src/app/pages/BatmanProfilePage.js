// ---------------------------------------------------------------------
// 2.3 BatmanProfileModel – Dados do perfil (notas, metas, missões)
// ---------------------------------------------------------------------
class BatmanProfileModel {
  constructor() {
    this.profileData = {
      basicInfo: {
        nomeVerdadeiro: "Pedro Victor Veras",
        ocupacao: "Estudante de Eng. Elétrica na UFF e Estagiário no ONS",
        base: "Niteroi/CG City, RJ",
        corOlhos: "Castanhos",
        corCabelo: "Preto",
        altura: "1,72 m",
        peso: "83 kg"
      },
      progress: {
        perfis: { current: 16, total: 32, percent: 50 },
        arquivosAudio: { current: 0, total: 29, percent: 0 }
      },
      notes: [
        { id: 1, text: "Monitorar atividades da região SP e SECO no ONS no Dashboard Tauri Desktop", date: "2025-03-27", category: "ons" },
        { id: 2, text: "Atualizar e Verificar Sistemas Kanban, SCRUM, Todo List, Planner diários", date: "2024-02-04", category: "tecnologia" },
        { id: 3, text: "Treinamento de força e hipertrofia", date: "2024-02-03", category: "treinamento" }
      ],
      goals: [
        { id: 1, name: "Ser aprovado com nota máxima em Circuitos Digitais", progress: 75, deadline: "2026-06-06" },
        { id: 2, name: "Se estabelecer na rotina do ONS - PLC com Engenharia Elétrica e Tecnologia", progress: 40, deadline: "2026-06-06" }
      ],
      stats: { forca: 70, agilidade: 80, inteligencia: 88, resistencia: 82, estrategia: 76, sigilo: 94 },
      missions: [
        { id: 1, name: "Patrulha noturna", status: "concluido" },
        { id: 2, name: "Uso de ferramentas Python, JS e Office (Word, Excel e PowerPoint)", status: "em_andamento" },
        { id: 3, name: "Estudos, Quizz Games e Provas antigas da UFF", status: "pendente" }
      ]
    };
  }

  getProfileData() { return this.profileData; }

  addNote(noteText) {
    const newNote = {
      id: Date.now(),
      text: noteText,
      date: new Date().toISOString().split('T')[0],
      category: "geral"
    };
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
