import { ProjectItem } from '../models/Project';
import { projectRepository } from '../repositories/ProjectRepository';
import * as XLSX from 'xlsx';

export class ProjectController {
  private static instance: ProjectController;

  private constructor() {}

  public static getInstance(): ProjectController {
    if (!ProjectController.instance) {
      ProjectController.instance = new ProjectController();
    }
    return ProjectController.instance;
  }

  public getAllProjects(): ProjectItem[] {
    return projectRepository.getAllProjects();
  }

  public getProjectById(id: string): ProjectItem | undefined {
    return projectRepository.getProjectById(id);
  }

  public createProject(projectData: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>): ProjectItem {
    return projectRepository.createProject(projectData);
  }

  public updateProject(id: string, updates: Partial<ProjectItem>): ProjectItem | null {
    return projectRepository.updateProject(id, updates);
  }

  public deleteProject(id: string): boolean {
    return projectRepository.deleteProject(id);
  }

  public searchProjects(term: string, category?: string): ProjectItem[] {
    return projectRepository.searchProjects(term, category);
  }

  public exportToExcel(): void {
    const projects = this.getAllProjects();
    const exportData = projects.map(project => ({
      'ID': project.id,
      'Título': project.title,
      'Status': project.status,
      'Categoria': project.category || '',
      'Criado em': project.createdAt.toLocaleDateString('pt-BR'),
      'Atualizado em': project.updatedAt.toLocaleDateString('pt-BR'),
      'Conteúdo': project.content || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projetos');
    XLSX.writeFile(wb, 'kanban-export.xlsx');
  }

  public importFromExcel(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const importedProjects = jsonData.map((row: any) => ({
            id: row['ID'] || Date.now().toString(),
            title: row['Título'] || 'Sem título',
            status: row['Status'] || 'to do',
            category: row['Categoria'] || 'ons',
            content: row['Conteúdo'] || '',
            createdAt: new Date(row['Criado em'] || Date.now()),
            updatedAt: new Date(row['Atualizado em'] || Date.now()),
            files: []
          }));

          // Clear existing projects and add imported ones
          projectRepository.getAllProjects().forEach(project => {
            projectRepository.deleteProject(project.id);
          });

          importedProjects.forEach((project: any) => {
            projectRepository.createProject(project);
          });

          resolve();
        } catch (error) {
          console.error('Error importing Excel file:', error);
          reject(new Error('Erro ao importar o arquivo Excel'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };

      reader.readAsArrayBuffer(file);
    });
  }
}

export const projectController = ProjectController.getInstance();
