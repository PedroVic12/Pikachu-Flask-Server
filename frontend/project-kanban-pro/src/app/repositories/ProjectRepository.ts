import { ProjectItem, INITIAL_DATA } from '../models/Project';

const STORAGE_KEY = 'kanban-projects';

export class ProjectRepository {
  private projects: ProjectItem[] = [];
  private static instance: ProjectRepository;

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): ProjectRepository {
    if (!ProjectRepository.instance) {
      ProjectRepository.instance = new ProjectRepository();
    }
    return ProjectRepository.instance;
  }

  private loadFromStorage(): void {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        this.projects = parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          files: item.files || []
        }));
      } catch (error) {
        console.error('Error parsing saved projects', error);
        this.initializeWithDefaultData();
      }
    } else {
      this.initializeWithDefaultData();
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.projects));
  }

  private initializeWithDefaultData(): void {
    this.projects = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveToStorage();
  }

  public getAllProjects(): ProjectItem[] {
    return [...this.projects];
  }

  public getProjectById(id: string): ProjectItem | undefined {
    return this.projects.find(project => project.id === id);
  }

  public createProject(project: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>): ProjectItem {
    const newProject: ProjectItem = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      files: project.files || []
    };
    
    this.projects.push(newProject);
    this.saveToStorage();
    return { ...newProject };
  }

  public updateProject(id: string, updates: Partial<ProjectItem>): ProjectItem | null {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProject = {
      ...this.projects[index],
      ...updates,
      updatedAt: new Date(),
      id // Ensure ID doesn't get changed
    };

    this.projects[index] = updatedProject;
    this.saveToStorage();
    return { ...updatedProject };
  }

  public deleteProject(id: string): boolean {
    const initialLength = this.projects.length;
    this.projects = this.projects.filter(project => project.id !== id);
    const changed = initialLength !== this.projects.length;
    if (changed) this.saveToStorage();
    return changed;
  }

  public exportToExcel(): void {
    // This would be implemented to export data to Excel
    // You can use a library like xlsx
    console.log('Exporting to Excel...');
  }

  public importFromExcel(data: any[]): void {
    // This would be implemented to import data from Excel
    console.log('Importing from Excel...');
  }

  public searchProjects(term: string, category?: string): ProjectItem[] {
    return this.projects.filter(project => {
      const matchesSearch = !term || 
        project.title.toLowerCase().includes(term.toLowerCase()) ||
        (project.content && project.content.toLowerCase().includes(term.toLowerCase()));
      
      const matchesCategory = !category || project.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }
}

export const projectRepository = ProjectRepository.getInstance();
