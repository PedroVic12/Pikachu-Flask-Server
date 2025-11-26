import * as XLSX from 'xlsx';
import storageController from './StorageController.js';

// ========== CONSTANTS ==========
export const CATEGORIES = {
  'ons': { emoji: '📂', label: 'Tarefas PLC ONS', color: 'bg-blue-100 text-green-800' },
  'uff': { emoji: '🧪', label: 'Estudos UFF - Eng. Elétrica', color: 'bg-purple-100 text-purple-800' },
  'python': { emoji: '⚙️', label: 'Projetos Python', color: 'bg-green-100 text-black-800' },
  'web': { emoji: '🚀', label: 'MVP de Aplicações Web', color: 'bg-orange-100 text-orange-800' },
  'spiritual': { emoji: '🧘‍♂️', label: 'TDAH + Alinhamento Espiritual', color: 'bg-pink-100 text-pink-800' },
  'pvrv':{ emoji: '🔥', label: 'PVRV', color: 'bg-red-100 text-blue-800' },
  'js': { emoji: '⚙️', label: 'Projetos Javascript', color: 'bg-green-100 text-black-800' },
  'data_science': { emoji: '⚙️', label: 'Projetos Data Science', color: 'bg-green-100 text-black-800' },

};

export const STATUS_COLUMNS = {
  'to do': { id: 'todo', title: 'Lista de Tarefas', emoji: '✏️' },
  'in progress': { id: 'progress', title: 'SPRINT Atual', emoji: '🔍' },
  'projetos parados': { id: 'paused', title: 'Projetos Parados', emoji: '⏸️' },
  'agentes (c3po, jarvis, groundon, lumina Aurora)': { id: 'agents', title: 'Agentes IA ', emoji: '🤖' },
  'uff - 2025': { id: 'uff2025', title: 'UFF 2025', emoji: '🎓' },
  'ONS - PLC - 2025': { id: 'plc', title: 'ONS PLC', emoji: '🔌' },
  'PVRV - Batcaverna': { id: 'batcaverna', title: 'PVRV', emoji: '🔥' },
  'coding': { id: 'coding', title: 'Programação Github', emoji: '💻' },
};

// ========== REPOSITORY CLASS ==========
class ProjectRepository {
  async loadProjects() {
    try {
      const response = await fetch('/api/excel/load');
      if (!response.ok) {
        // Se o arquivo não existir no backend, ele retorna um erro que podemos ignorar
        console.warn("Arquivo 'kanban_data.xlsx' não encontrado no backend, começando com um array vazio.");
        return [];
      }
      const data = await response.json();
      // Garante que as datas sejam objetos Date
      return data.map(p => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));
    } catch (error) {
      console.error("Erro ao carregar projetos da API do Excel:", error);
      return []; // Em caso de qualquer outro erro, retorna uma lista vazia
    }
  }

  async saveProjects(projects) {
    try {
      await fetch('/api/excel/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projects)
      });
    } catch (error) {
      console.error("Erro ao salvar projetos na API do Excel:", error);
    }
  }

  exportToExcel(projects) {
    const exportData = projects.map(item => ({
      'Título': item.title,
      'Status': item.status,
      'ID': item.id,
      'Categoria': item.category || '',
      'Criado em': item.createdAt.toLocaleDateString('pt-BR'),
      'Atualizado em': item.updatedAt.toLocaleDateString('pt-BR'),
      'Conteúdo': item.content || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projetos');
    XLSX.writeFile(wb, 'kanban-backup.xlsx');
  }

  importFromExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const importedProjects = jsonData.map(row => ({
            id: row['ID'] || Date.now().toString(),
            title: row['Título'] || 'Sem título',
            status: row['Status'] || 'to do',
            category: row['Categoria'] || 'ons',
            content: row['Conteúdo'] || '',
            createdAt: new Date(row['Criado em'] || Date.now()),
            updatedAt: new Date(row['Atualizado em'] || Date.now()),
            files: []
          }));

          resolve(importedProjects);
        } catch (error) {
          reject(new Error('Erro ao importar arquivo Excel'));
        }
      };

      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    });
  }
}

const projectRepository = new ProjectRepository();
export default projectRepository;