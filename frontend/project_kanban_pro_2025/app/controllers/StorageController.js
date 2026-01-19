// app/controllers/StorageController.js

const PROJECTS_STORAGE_KEY = 'kanbanPro_projects';

/**
 * Controller to manage project data persistence in localStorage.
 */
const storageController = {
  /**
   * Loads projects from localStorage.
   * @returns {Array} The array of project objects or an empty array.
   */
  loadProjects: () => {
    try {
      const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedProjects) {
        const parsed = JSON.parse(storedProjects);
        // Ensure dates are converted back to Date objects
        return parsed.map(p => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
      }
    } catch (error) {
      console.error("Failed to load projects from localStorage:", error);
      return [];
    }
    return [];
  },

  /**
   * Saves an array of project objects to localStorage.
   * @param {Array} projects The array of project objects to save.
   */
  saveProjects: (projects) => {
    try {
      if (!Array.isArray(projects)) {
        throw new Error("Data to be saved must be an array.");
      }
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error("Failed to save projects to localStorage:", error);
    }
  },
};

export default storageController;