import * as XLSX from 'xlsx';
import storageController from './StorageController.js';

// ========== CONSTANTS ==========
export const CATEGORIES = {
  'ons': { emoji: '📂', label: 'Tarefas PLC ONS', color: 'bg-green-200 text-green-800' },
  'uff': { emoji: '🧪', label: 'Estudos UFF - Eng. Elétrica', color: 'bg-yellow-300 text-purple-800' },
  'python': { emoji: '⚙️', label: 'Projetos Python', color: 'bg-blue-100 text-black-800' },
  'web': { emoji: '🚀', label: 'MVP de Aplicações Web', color: 'bg-orange-200 text-orange-800' },
  'spiritual': { emoji: '🧘‍♂️', label: 'TDAH + Alinhamento Espiritual', color: 'bg-blue-400 text-blue-800' },
  'pvrv':{ emoji: '🔥', label: 'PVRV', color: 'bg-red-100 text-red-800' },
  'js': { emoji: '⚙️', label: 'Projetos Javascript', color: 'bg-yellow-100 text-black-800' },
  'data_science': { emoji: '⚙️', label: 'Projetos Data Science', color: 'bg-green-900 text-black-800' },
   'iot': { emoji: '⚙️', label: 'IoT e Sistemas Embarcados', color: 'bg-blue-900 text-black-800' },

};

export const STATUS_COLUMNS = {
  'to do': { id: 'todo', title: 'BACKLOG', emoji: '✏️' },
  'in progress': { id: 'progress', title: 'SPRINT Atual', emoji: '🔍' },
  'projetos parados': { id: 'paused', title: 'Projetos Parados', emoji: '⏸️' },
  'agentes (c3po, jarvis, groundon, lumina Aurora)': { id: 'agents', title: 'Agentes IA ', emoji: '🤖' },
  'uff - 2026': { id: 'uff2026', title: 'UFF 2026', emoji: '🎓' },
  'ONS - PLC - 2025': { id: 'plc', title: 'ONS PLC', emoji: '🔌' },
  'PVRV - Batcaverna': { id: 'batcaverna', title: 'PVRV', emoji: '🔥' },
  'coding': { id: 'coding', title: 'Programação Github', emoji: '💻' },
  "completed": {id:"completed", title: "Finalizado", emoji: "✅" }
};

const parseDateForExcel = (dateValue) => {
    if (dateValue instanceof Date && !isNaN(dateValue)) return dateValue;
    if (typeof dateValue === 'string') {
        const brazilianDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/;
        const match = dateValue.match(brazilianDateRegex);
        if (match) {
            const date = new Date(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10));
            if (!isNaN(date.getTime())) return date;
        }
        const parsedDate = new Date(dateValue);
        if (!isNaN(parsedDate.getTime())) return parsedDate;
    }
    if (typeof dateValue === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
        if (!isNaN(date.getTime())) return date;
    }
    return new Date();
};

class ProjectRepository {
  async loadProjects() {
    return storageController.loadProjects();
  }

  async saveProjects(projects) {
    storageController.saveProjects(projects);
  }

  exportToExcel(projects) {
    const exportData = projects.map(item => {
        const createdAt = item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt);
        const updatedAt = item.updatedAt instanceof Date ? item.updatedAt : new Date(item.updatedAt);
        return {
            'Título': item.title,
            'Status': item.status,
            'ID': item.id,
            'Categoria': item.category || '',
            'Criado em': !isNaN(createdAt) ? createdAt.toLocaleDateString('pt-BR') : '',
            'Atualizado em': !isNaN(updatedAt) ? updatedAt.toLocaleDateString('pt-BR') : '',
            'Conteúdo': item.content || ''
        };
    });

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
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log("--- DEBUG: Raw data from Excel ---", jsonData);

          const importedProjects = jsonData.map(row => ({
            id: row['ID']?.toString() || Date.now().toString(),
            title: row['Título'] || 'Sem título',
            status: row['Status'] || 'to do',
            category: row['Categoria'] || 'ons',
            content: row['Conteúdo'] || '',
            createdAt: parseDateForExcel(row['Criado em']),
            updatedAt: parseDateForExcel(row['Atualizado em']),
            files: []
          }));
          resolve(importedProjects);
        } catch (error) {
          reject(new Error('Erro ao importar arquivo Excel: ' + error.message));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    });
  }
}

const projectRepository = new ProjectRepository();
export default projectRepository;
