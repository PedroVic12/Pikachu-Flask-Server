// app/controllers/FileUploaderController.js

const FILES_STORAGE_KEY = 'kanbanPro_uploadedFiles';

/**
 * Controller to manage file uploads and persistence in localStorage.
 */
const FileUploaderController = {
  /**
   * Loads files from localStorage.
   * @returns {Array} The array of file objects or an empty array.
   */
  loadFiles: () => {
    try {
      const storedFiles = localStorage.getItem(FILES_STORAGE_KEY);
      if (storedFiles) {
        // Basic validation to ensure it's an array
        const parsed = JSON.parse(storedFiles);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error("Failed to load files from localStorage:", error);
      // If parsing fails, return an empty array to prevent app crash
      return [];
    }
    return [];
  },

  /**
   * Saves an array of file objects to localStorage.
   * @param {Array} files The array of file objects to save.
   */
  saveFiles: (files) => {
    try {
      if (!Array.isArray(files)) {
        throw new Error("Data to be saved must be an array.");
      }
      const filesToStore = JSON.stringify(files);
      localStorage.setItem(FILES_STORAGE_KEY, filesToStore);
    } catch (error) {
      console.error("Failed to save files to localStorage:", error);
    }
  },
};

export default FileUploaderController;
